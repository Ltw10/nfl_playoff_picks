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
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    const events = data.events || [];
                    allGames.push(...events);
                } catch (error) {
                    console.warn(`Error fetching week ${week}:`, error);
                }
            }
        return allGames;
    } catch (error) {
        console.error('Error fetching ESPN data:', error);
        return [];
    }
};

// Parse ESPN game data to our schema
const parseESPNGame = (espnGame) => {
    const competition = espnGame.competitions?.[0];
    const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
    const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');
    
    const gameTime = espnGame.date;
    const status = competition?.status?.type?.name || espnGame.status?.type?.name || 'scheduled';
    
    let gameStatus = 'scheduled';
    if (status === 'STATUS_IN_PROGRESS' || status === 'STATUS_HALFTIME') {
        gameStatus = 'in_progress';
    } else if (status === 'STATUS_FINAL' || status === 'STATUS_FINAL_OVERTIME') {
        gameStatus = 'completed';
    }

    // Get scores from competitors.score (string format)
    // Handle both string and number formats, default to 0 if invalid
    const homeScoreValue = homeTeam?.score ?? '0';
    const awayScoreValue = awayTeam?.score ?? '0';
    const homeScore = isNaN(parseInt(homeScoreValue, 10)) ? 0 : parseInt(homeScoreValue, 10);
    const awayScore = isNaN(parseInt(awayScoreValue, 10)) ? 0 : parseInt(awayScoreValue, 10);
    
    let winner = null;
    if (gameStatus === 'completed') {
        winner = homeScore > awayScore ? homeTeam?.team?.abbreviation : awayTeam?.team?.abbreviation;
    }

    // Get game status detail (quarter and time) for in-progress games
    const statusDetail = competition?.status?.type?.detail || competition?.status?.type?.shortDetail || '';
    const statusShortDetail = competition?.status?.type?.shortDetail || '';
    
    // Get clock time and period for in-progress games
    const displayClock = competition?.status?.displayClock || null; // e.g., "9:49"
    const period = competition?.status?.period || null; // e.g., 1, 2, 3, 4

    // Get win probabilities from situation.lastPlay.probability
    const homeWinProbability = competition?.situation?.lastPlay?.probability?.homeWinPercentage || null;
    const awayWinProbability = competition?.situation?.lastPlay?.probability?.awayWinPercentage || null;

    // Get team records
    const homeRecord = homeTeam?.records?.find(r => r.name === 'overall')?.summary || '';
    const awayRecord = awayTeam?.records?.find(r => r.name === 'overall')?.summary || '';
    
    // Get team logos
    const homeLogo = homeTeam?.team?.logo || '';
    const awayLogo = awayTeam?.team?.logo || '';

    // Build game object - include all fields (migration must be run first)
    // If migration hasn't been run, these fields will cause an error
    // See migration-add-status-probabilities.sql
    const gameData = {
        id: espnGame.id,
        home_team: homeTeam?.team?.abbreviation || homeTeam?.team?.displayName || 'TBD',
        away_team: awayTeam?.team?.abbreviation || awayTeam?.team?.displayName || 'TBD',
        game_time: gameTime,
        location: competition?.venue?.fullName || 'TBD',
        status: gameStatus,
        home_score: homeScore,
        away_score: awayScore,
        winner: winner,
        playoff_round: mapPlayoffRound(espnGame),
        // Additional data for display
        home_logo: homeLogo,
        away_logo: awayLogo,
        home_record: homeRecord,
        away_record: awayRecord,
        // Game status details for in-progress games (requires migration)
        status_detail: statusDetail || null,
        status_short_detail: statusShortDetail || null,
        display_clock: displayClock, // Time remaining (e.g., "9:49")
        period: period, // Quarter/period number (1-4)
        // Win probabilities (requires migration)
        home_win_probability: homeWinProbability,
        away_win_probability: awayWinProbability
    };
    
    return gameData;
};

// Sync games: fetch from ESPN and update Supabase
const syncGames = async (existingGames) => {
    const espnGames = await fetchESPNGames();
    const gameMap = new Map(existingGames.map(g => [g.id, g]));
    
    // Filter to only playoff games
    const playoffGames = espnGames.filter(game => isPlayoffGame(game));
    
    for (const espnGame of playoffGames) {
        const parsedGame = parseESPNGame(espnGame);
        const existingGame = gameMap.get(parsedGame.id);
        
        // Only process if it's actually a playoff game (not 'other')
        if (parsedGame.playoff_round === 'other') {
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

