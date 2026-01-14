// ============================================
// SUPABASE FUNCTIONS
// ============================================
// Note: All table names are prefixed with 'nfl_playoff_' to distinguish
// from other projects in the same database

// Create a new user
const createUser = async (firstName, lastName) => {
    const { data, error } = await supabase
        .from('nfl_playoff_users')
        .insert([{ first_name: firstName, last_name: lastName }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Get all users
const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('nfl_playoff_users')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
};

// Find user by first and last name
const findUserByName = async (firstName, lastName) => {
    const { data, error } = await supabase
        .from('nfl_playoff_users')
        .select('*')
        .eq('first_name', firstName)
        .eq('last_name', lastName)
        .maybeSingle();
    
    if (error) throw error;
    return data;
};

// Get all games
const getAllGames = async () => {
    const { data, error } = await supabase
        .from('nfl_playoff_games')
        .select('*')
        .order('game_time', { ascending: true });
    
    if (error) throw error;
    return data;
};

// Get all picks
const getAllPicks = async () => {
    const { data, error } = await supabase
        .from('nfl_playoff_picks')
        .select('*');
    
    if (error) throw error;
    return data;
};

// Create or update a pick
const upsertPick = async (userId, gameId, pickedTeam) => {
    const { data, error } = await supabase
        .from('nfl_playoff_picks')
        .upsert(
            { user_id: userId, game_id: gameId, picked_team: pickedTeam },
            { onConflict: 'user_id,game_id' }
        )
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

// Insert or update a game
const upsertGame = async (gameData) => {
    const { data, error } = await supabase
        .from('nfl_playoff_games')
        .upsert(gameData, { onConflict: 'id' })
        .select()
        .single();
    
    if (error) {
        console.error(`Error updating database for game ${gameData.id}:`, error);
        throw error;
    }
    
    return data;
};

