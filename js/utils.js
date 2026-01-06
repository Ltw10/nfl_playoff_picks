// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get user from localStorage
const getStoredUser = () => {
    const stored = localStorage.getItem('nfl_picks_user');
    return stored ? JSON.parse(stored) : null;
};

// Store user in localStorage
const storeUser = (user) => {
    localStorage.setItem('nfl_picks_user', JSON.stringify(user));
};

// Clear user from localStorage
const clearStoredUser = () => {
    localStorage.removeItem('nfl_picks_user');
};

// Format date/time
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

// Check if game has started
const hasGameStarted = (gameTime) => {
    return new Date(gameTime) < new Date();
};

// Map ESPN playoff round to our format
const mapPlayoffRound = (espnData) => {
    // ESPN uses different naming, we'll need to infer from date/context
    // Check for round information in various places
    const league = espnData.league?.slug;
    const type = espnData.type?.slug;
    const week = espnData.week;
    const name = espnData.name?.toLowerCase() || '';
    
    // If it's not postseason, return other
    if (type !== 'postseason' && type !== '3') {
        return 'other';
    }
    
    // Try to detect round from name or week
    if (name.includes('super bowl') || name.includes('superbowl')) {
        return 'super_bowl';
    }
    if (name.includes('conference') || name.includes('championship')) {
        return 'conference';
    }
    if (name.includes('divisional') || name.includes('division')) {
        return 'divisional';
    }
    if (name.includes('wild card') || name.includes('wildcard')) {
        return 'wild_card';
    }
    
    // Fallback: use week number if available
    // NFL playoffs typically: Wild Card (week 18-19), Divisional (week 19-20), 
    // Conference (week 20-21), Super Bowl (week 21-22)
    if (week) {
        if (week.number >= 21) return 'super_bowl';
        if (week.number >= 20) return 'conference';
        if (week.number >= 19) return 'divisional';
        return 'wild_card';
    }
    
    // Default to wild_card for postseason games
    return 'wild_card';
};

