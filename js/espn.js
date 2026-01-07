// ============================================
// ESPN API FUNCTIONS
// ============================================

// Fetch games from ESPN API for all playoff weeks
const fetchESPNGames = async () => {
    try {
        const currentYear = new Date().getFullYear();
        const baseUrl = window.ESPN_API_BASE_URL || 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
        
        // Fetch all playoff weeks: 1 (Wild Card), 2 (Divisional), 3 (Conference), 5 (Super Bowl)
        const weeks = [1, 2, 3, 5];
        const allGames = [];
        
        for (const week of weeks) {
            const url = `${baseUrl}?year=${currentYear}&seasontype=3&week=${week}`;
            console.log(`Fetching playoff week ${week} from:`, url);
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                const events = data.events || [];
                console.log(`Week ${week}: Found ${events.length} games`);
                allGames.push(...events);
            } catch (error) {
                console.warn(`Error fetching week ${week}:`, error);
            }
        }
        
        console.log(`Total playoff games found: ${allGames.length}`);
        return allGames;
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

    // Get team records
    const homeRecord = homeTeam?.records?.find(r => r.name === 'overall')?.summary || '';
    const awayRecord = awayTeam?.records?.find(r => r.name === 'overall')?.summary || '';
    
    // Get team logos
    const homeLogo = homeTeam?.team?.logo || '';
    const awayLogo = awayTeam?.team?.logo || '';

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
        playoff_round: mapPlayoffRound(espnGame),
        // Additional data for display (stored as JSON string in DB or passed through)
        home_logo: homeLogo,
        away_logo: awayLogo,
        home_record: homeRecord,
        away_record: awayRecord
    };
};

// Sync games: fetch from ESPN and update Supabase
const syncGames = async (existingGames) => {
    const espnGames = await fetchESPNGames();
    const gameMap = new Map(existingGames.map(g => [g.id, g]));
    
    // Filter to only playoff games
    const playoffGames = espnGames.filter(game => isPlayoffGame(game));
    
    console.log(`Found ${espnGames.length} total games, ${playoffGames.length} playoff games`);
    
    for (const espnGame of playoffGames) {
        const parsedGame = parseESPNGame(espnGame);
        const existingGame = gameMap.get(parsedGame.id);
        
        // Only process if it's actually a playoff game (not 'other')
        if (parsedGame.playoff_round === 'other') {
            console.log(`Skipping non-playoff game: ${parsedGame.away_team} @ ${parsedGame.home_team}`);
            continue;
        }
        
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

