// ============================================
// REACT COMPONENTS
// ============================================

const { useState } = React;

// Sign Up Component
const SignUp = ({ onSignUp }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await createUser(firstName, lastName);
            storeUser(user);
            onSignUp(user);
        } catch (err) {
            setError(err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    NFL Playoff Picks
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Join the family competition!
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your last name"
                        />
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Join Competition'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Game Card Component
const GameCard = ({ game, userPick, currentUser, onPick }) => {
    const gameStarted = hasGameStarted(game.game_time);
    const userPicked = userPick?.picked_team;
    const isCorrect = game.status === 'completed' && userPicked === game.winner;
    const isIncorrect = game.status === 'completed' && userPicked && userPicked !== game.winner;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        {game.away_team} @ {game.home_team}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {formatDateTime(game.game_time)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {game.location}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    game.status === 'completed' ? 'bg-green-100 text-green-800' :
                    game.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {game.status === 'completed' ? 'Final' :
                     game.status === 'in_progress' ? 'Live' :
                     'Scheduled'}
                </span>
            </div>

            {/* Score Display */}
            {(game.status === 'in_progress' || game.status === 'completed') && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{game.away_team}</span>
                        <span className="text-2xl font-bold">{game.away_score}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">{game.home_team}</span>
                        <span className="text-2xl font-bold">{game.home_score}</span>
                    </div>
                </div>
            )}

            {/* Pick Buttons or Results */}
            {game.status === 'scheduled' && !gameStarted && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onPick(game.id, game.away_team)}
                        className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                            userPicked === game.away_team
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                    >
                        Pick {game.away_team}
                    </button>
                    <button
                        onClick={() => onPick(game.id, game.home_team)}
                        className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                            userPicked === game.home_team
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                    >
                        Pick {game.home_team}
                    </button>
                </div>
            )}

            {game.status === 'scheduled' && gameStarted && (
                <div className="text-center py-2 text-gray-600">
                    Game Starting Soon - Picks Locked
                </div>
            )}

            {game.status === 'in_progress' && userPicked && (
                <div className="text-center py-2">
                    <span className="text-gray-700">Your pick: <strong>{userPicked}</strong></span>
                    <span className="ml-2 text-yellow-600">⏳ Waiting for result...</span>
                </div>
            )}

            {game.status === 'completed' && userPicked && (
                <div className="text-center py-2">
                    <span className="text-gray-700">Your pick: <strong>{userPicked}</strong></span>
                    {isCorrect && (
                        <span className="ml-2 text-green-600 text-lg">✅ Correct!</span>
                    )}
                    {isIncorrect && (
                        <span className="ml-2 text-red-600 text-lg">❌ Incorrect</span>
                    )}
                </div>
            )}

            {game.status === 'completed' && !userPicked && (
                <div className="text-center py-2 text-gray-500">
                    No pick submitted
                </div>
            )}
        </div>
    );
};

// Games List Component
const GamesList = ({ games, picks, currentUser, onPick, loading }) => {
    const userPicksMap = new Map(
        picks.filter(p => p.user_id === currentUser.id).map(p => [p.game_id, p])
    );

    // Group games by playoff round
    const gamesByRound = games.reduce((acc, game) => {
        const round = game.playoff_round || 'other';
        if (!acc[round]) acc[round] = [];
        acc[round].push(game);
        return acc;
    }, {});

    const roundLabels = {
        'wild_card': 'Wild Card Round',
        'divisional': 'Divisional Round',
        'conference': 'Conference Championships',
        'super_bowl': 'Super Bowl',
        'other': 'Other Games'
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading games...</p>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No games available yet. Check back during playoff season!</p>
            </div>
        );
    }

    return (
        <div>
            {Object.entries(gamesByRound).map(([round, roundGames]) => (
                <div key={round} className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {roundLabels[round] || round}
                    </h2>
                    {roundGames.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            userPick={userPicksMap.get(game.id)}
                            currentUser={currentUser}
                            onPick={onPick}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

// Leaderboard Component
const Leaderboard = ({ users, games, picks, currentUser }) => {
    // Calculate stats for each user
    const userStats = users.map(user => {
        const userPicks = picks.filter(p => p.user_id === user.id);
        const completedGames = games.filter(g => g.status === 'completed');
        
        let wins = 0;
        let losses = 0;
        
        userPicks.forEach(pick => {
            const game = completedGames.find(g => g.id === pick.game_id);
            if (game && game.winner) {
                if (pick.picked_team === game.winner) {
                    wins++;
                } else {
                    losses++;
                }
            }
        });
        
        const totalPicks = wins + losses;
        const winPercentage = totalPicks > 0 ? (wins / totalPicks * 100).toFixed(1) : 0;
        
        return {
            ...user,
            wins,
            losses,
            totalPicks,
            winPercentage: parseFloat(winPercentage)
        };
    });

    // Sort by win percentage (desc), then total picks (desc)
    userStats.sort((a, b) => {
        if (b.winPercentage !== a.winPercentage) {
            return b.winPercentage - a.winPercentage;
        }
        return b.totalPicks - a.totalPicks;
    });

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Losses</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Picks</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Win %</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {userStats.map((user, index) => (
                            <tr
                                key={user.id}
                                className={user.id === currentUser.id ? 'bg-blue-50 font-semibold' : ''}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.first_name} {user.last_name}
                                    {user.id === currentUser.id && (
                                        <span className="ml-2 text-blue-600">(You)</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {user.wins}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {user.losses}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {user.totalPicks}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {user.winPercentage}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

