// ============================================
// MAIN APP COMPONENT
// ============================================

const { useState, useEffect, useCallback } = React;

// Main App Component
const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [view, setView] = useState('picks'); // 'picks' or 'leaderboard'
    const [games, setGames] = useState([]);
    const [users, setUsers] = useState([]);
    const [picks, setPicks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setCurrentUser(storedUser);
        }
    }, []);

    // Fetch all data
    const fetchAllData = useCallback(async () => {
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
            const inProgressGames = gamesData.filter(g => g.status === 'in_progress');
            const scheduledGames = gamesData.filter(g => g.status === 'scheduled' && hasGameStarted(g.game_time));
            
            if (gamesData.length === 0 || inProgressGames.length > 0 || scheduledGames.length > 0) {
                // Sync games (will only update games that need updating)
                await syncGames(gamesData);
                
                // Refetch games after sync
                const updatedGames = await getAllGames();
                setGames(updatedGames);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Fetch data when user is set
    useEffect(() => {
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
        if (!currentUser) return;

        try {
            await upsertPick(currentUser.id, gameId, pickedTeam);
            // Refresh picks
            const updatedPicks = await getAllPicks();
            setPicks(updatedPicks);
        } catch (error) {
            console.error('Error submitting pick:', error);
            alert('Failed to submit pick. Please try again.');
        }
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
                        loading={loading}
                    />
                ) : (
                    <Leaderboard
                        users={users}
                        games={games}
                        picks={picks}
                        currentUser={currentUser}
                    />
                )}
            </main>
        </div>
    );
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
});

