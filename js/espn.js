// ============================================
// ESPN API FUNCTIONS
// ============================================

// Fetch games from ESPN API
const fetchESPNGames = async () => {
    try {
        const response = await fetch(ESPN_API_URL);
        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
        return [];
    }
};

// Parse ESPN game data to our schema
const parseESPNGame = (espnGame) => {
    const homeTeam = espnGame.competitions[0]?.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = espnGame.competitions[0]?.competitors?.find(c => c.homeAway === 'away');
    
    const gameTime = espnGame.date;
    const status = espnGame.status?.type?.name || 'scheduled';
    
    let gameStatus = 'scheduled';
    if (status === 'STATUS_IN_PROGRESS' || status === 'STATUS_HALFTIME') {
        gameStatus = 'in_progress';
    } else if (status === 'STATUS_FINAL' || status === 'STATUS_FINAL_OVERTIME') {
        gameStatus = 'completed';
    }

    const homeScore = parseInt(homeTeam?.score || '0');
    const awayScore = parseInt(awayTeam?.score || '0');
    
    let winner = null;
    if (gameStatus === 'completed') {
        winner = homeScore > awayScore ? homeTeam?.team?.abbreviation : awayTeam?.team?.abbreviation;
    }

    return {
        id: espnGame.id,
        home_team: homeTeam?.team?.abbreviation || homeTeam?.team?.displayName || 'TBD',
        away_team: awayTeam?.team?.abbreviation || awayTeam?.team?.displayName || 'TBD',
        game_time: gameTime,
        location: espnGame.competitions[0]?.venue?.fullName || 'TBD',
        status: gameStatus,
        home_score: homeScore,
        away_score: awayScore,
        winner: winner,
        playoff_round: mapPlayoffRound(espnGame)
    };
};

// Sync games: fetch from ESPN and update Supabase
const syncGames = async (existingGames) => {
    const espnGames = await fetchESPNGames();
    const gameMap = new Map(existingGames.map(g => [g.id, g]));
    
    for (const espnGame of espnGames) {
        const parsedGame = parseESPNGame(espnGame);
        const existingGame = gameMap.get(parsedGame.id);
        
        // Update if:
        // 1. New game (doesn't exist in DB)
        // 2. Game is currently in progress
        // 3. Game status changed (scheduled -> in_progress, in_progress -> completed)
        // 4. Game is completed (to get final scores and winner)
        const shouldUpdate = !existingGame || 
                            parsedGame.status === 'in_progress' ||
                            existingGame.status !== parsedGame.status ||
                            parsedGame.status === 'completed';
        
        if (shouldUpdate) {
            await upsertGame(parsedGame);
        }
    }
};

