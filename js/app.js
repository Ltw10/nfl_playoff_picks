// ============================================
// MAIN APP COMPONENT
// ============================================
// Using React hooks directly to avoid redeclaration errors
// when scripts are loaded multiple times

// Main App Component
const App = () => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [view, setView] = React.useState('picks'); // 'picks', 'leaderboard', or 'userPicks'
    const [viewingUserId, setViewingUserId] = React.useState(null);
    const [games, setGames] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [picks, setPicks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Load user from localStorage on mount
    React.useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setCurrentUser(storedUser);
        }
    }, []);

    // Fetch all data
    const fetchAllData = React.useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            // Fetch from Supabase
            const [gamesData, usersData, picksData] = await Promise.all([
                getAllGames(),
                getAllUsers(),
                getAllPicks()
            ]);

            setGames(gamesData);
            setUsers(usersData);
            setPicks(picksData);

            // Smart sync: fetch ESPN if:
            // 1. No games in DB (initial setup)
            // 2. There are in-progress games (need live scores)
            // 3. There are scheduled games that might have started
            // 4. Always sync on first load to get all playoff weeks
            const inProgressGames = gamesData.filter(g => g.status === 'in_progress');
            const scheduledGames = gamesData.filter(g => g.status === 'scheduled' && hasGameStarted(g.game_time));
            
            // Always sync to get all playoff weeks (Wild Card, Divisional, Conference, Super Bowl)
            // The sync function will only update games that need updating
            await syncGames(gamesData);
            
            // Refetch games after sync
            const updatedGames = await getAllGames();
            setGames(updatedGames);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Fetch data when user is set
    React.useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleSignUp = (user) => {
        setCurrentUser(user);
    };

    const handleSignOut = () => {
        clearStoredUser();
        setCurrentUser(null);
        setGames([]);
        setUsers([]);
        setPicks([]);
    };

    const handlePick = async (gameId, pickedTeam) => {
        // This is now handled locally in GamesList component
        // Picks are saved via handleSaveRound
    };

    const handleSaveRound = async (picksToSave) => {
        if (!currentUser) return;

        try {
            // Save all picks for this round
            await Promise.all(
                picksToSave.map(({ gameId, pickedTeam }) =>
                    upsertPick(currentUser.id, gameId, pickedTeam)
                )
            );
            
            // Refresh picks after saving
            const updatedPicks = await getAllPicks();
            setPicks(updatedPicks);
        } catch (error) {
            console.error('Error saving picks:', error);
            throw error; // Re-throw so GamesList can handle it
        }
    };

    const handleViewUser = (userId) => {
        setViewingUserId(userId);
        setView('userPicks');
    };

    const handleBackToLeaderboard = () => {
        setViewingUserId(null);
        setView('leaderboard');
    };

    if (!currentUser) {
        return <SignUp onSignUp={handleSignUp} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-800">NFL Playoff Picks</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">
                                {currentUser.first_name} {currentUser.last_name}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setView('picks')}
                                    className={`px-4 py-2 rounded font-semibold transition ${
                                        view === 'picks'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Make Picks
                                </button>
                                <button
                                    onClick={() => setView('leaderboard')}
                                    className={`px-4 py-2 rounded font-semibold transition ${
                                        view === 'leaderboard'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Leaderboard
                                </button>
                                <button
                                    onClick={fetchAllData}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-500 text-white rounded font-semibold hover:bg-green-600 transition disabled:opacity-50"
                                    title="Refresh data"
                                >
                                    {loading ? '⏳' : '🔄'} Refresh
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {view === 'picks' ? (
                    <GamesList
                        games={games}
                        picks={picks}
                        currentUser={currentUser}
                        onPick={handlePick}
                        onSaveRound={handleSaveRound}
                        loading={loading}
                    />
                ) : view === 'userPicks' ? (
                    <UserPicksView
                        userId={viewingUserId}
                        users={users}
                        games={games}
                        picks={picks}
                        onBack={handleBackToLeaderboard}
                    />
                ) : (
                    <Leaderboard
                        users={users}
                        games={games}
                        picks={picks}
                        currentUser={currentUser}
                        onViewUser={handleViewUser}
                    />
                )}
            </main>
        </div>
    );
};

// Initialize the app
// Since scripts load asynchronously, DOM is likely already ready
// But we'll check to be safe
function initApp() {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.error('Root element not found!');
        return;
    }
    
    try {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<App />);
        console.log('✅ App rendered successfully!');
    } catch (error) {
        console.error('❌ Error rendering app:', error);
        rootElement.innerHTML = 
            '<div style="padding: 20px; text-align: center; color: red;">' +
            '<h2>Error Rendering App</h2>' +
            '<p>' + error.message + '</p>' +
            '</div>';
    }
}

// Try to initialize immediately, or wait for DOM if needed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already ready
    initApp();
}

