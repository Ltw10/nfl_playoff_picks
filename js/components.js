// ============================================
// REACT COMPONENTS
// ============================================
// Note: Using React.useState directly to avoid redeclaration errors
// when multiple files destructure from React

// Sign Up Component
const SignUp = ({ onSignUp }) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, check if a user with this name already exists
      const existingUser = await findUserByName(firstName, lastName);

      if (existingUser) {
        // User exists, log them in
        storeUser(existingUser);
        onSignUp(existingUser);
      } else {
        // User doesn't exist, create a new account
        const user = await createUser(firstName, lastName);
        storeUser(user);
        onSignUp(user);
      }
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Williams NFL Playoff Picks
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sign in or join the family competition!
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
            {loading ? "Signing in..." : "Sign In / Join"}
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
  const isCorrect = game.status === "completed" && userPicked === game.winner;
  const isIncorrect =
    game.status === "completed" && userPicked && userPicked !== game.winner;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Away Team */}
            <div className="flex items-center gap-2">
              {game.away_logo && (
                <img
                  src={game.away_logo}
                  alt={game.away_team}
                  className="w-10 h-10 object-contain"
                />
              )}
              <div>
                <div className="font-semibold text-gray-800">
                  {game.away_team}
                </div>
                {game.away_record && (
                  <div className="text-xs text-gray-500">
                    {game.away_record}
                  </div>
                )}
              </div>
            </div>
            <span className="text-gray-400">@</span>
            {/* Home Team */}
            <div className="flex items-center gap-2">
              {game.home_logo && (
                <img
                  src={game.home_logo}
                  alt={game.home_team}
                  className="w-10 h-10 object-contain"
                />
              )}
              <div>
                <div className="font-semibold text-gray-800">
                  {game.home_team}
                </div>
                {game.home_record && (
                  <div className="text-xs text-gray-500">
                    {game.home_record}
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatDateTime(game.game_time)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{game.location}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            game.status === "completed"
              ? "bg-green-100 text-green-800"
              : game.status === "in_progress"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {game.status === "completed"
            ? "Final"
            : game.status === "in_progress"
            ? "Live"
            : "Scheduled"}
        </span>
      </div>

      {/* Score Display */}
      {(game.status === "in_progress" || game.status === "completed") && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {game.away_logo && (
                <img
                  src={game.away_logo}
                  alt={game.away_team}
                  className="w-8 h-8 object-contain"
                />
              )}
              <span className="font-semibold">{game.away_team}</span>
            </div>
            <span className="text-2xl font-bold">{game.away_score}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              {game.home_logo && (
                <img
                  src={game.home_logo}
                  alt={game.home_team}
                  className="w-8 h-8 object-contain"
                />
              )}
              <span className="font-semibold">{game.home_team}</span>
            </div>
            <span className="text-2xl font-bold">{game.home_score}</span>
          </div>
        </div>
      )}

      {/* Pick Buttons or Results */}
      {game.status === "scheduled" && !gameStarted && (
        <div className="flex gap-2">
          <button
            onClick={() => onPick(game.id, game.away_team)}
            className={`flex-1 py-3 px-4 rounded font-semibold transition flex items-center justify-center gap-2 ${
              userPicked === game.away_team
                ? "bg-green-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {game.away_logo && (
              <img
                src={game.away_logo}
                alt={game.away_team}
                className="w-6 h-6 object-contain"
              />
            )}
            <span>Pick {game.away_team}</span>
            {game.away_record && (
              <span className="text-xs opacity-75">({game.away_record})</span>
            )}
          </button>
          <button
            onClick={() => onPick(game.id, game.home_team)}
            className={`flex-1 py-3 px-4 rounded font-semibold transition flex items-center justify-center gap-2 ${
              userPicked === game.home_team
                ? "bg-green-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {game.home_logo && (
              <img
                src={game.home_logo}
                alt={game.home_team}
                className="w-6 h-6 object-contain"
              />
            )}
            <span>Pick {game.home_team}</span>
            {game.home_record && (
              <span className="text-xs opacity-75">({game.home_record})</span>
            )}
          </button>
        </div>
      )}

      {game.status === "scheduled" && gameStarted && (
        <div className="text-center py-2 text-gray-600">
          Game Starting Soon - Picks Locked
        </div>
      )}

      {game.status === "in_progress" && userPicked && (
        <div className="text-center py-2">
          <span className="text-gray-700">
            Your pick: <strong>{userPicked}</strong>
          </span>
          <span className="ml-2 text-yellow-600">⏳ Waiting for result...</span>
        </div>
      )}

      {game.status === "completed" && userPicked && (
        <div className="text-center py-2">
          <span className="text-gray-700">
            Your pick: <strong>{userPicked}</strong>
          </span>
          {isCorrect && (
            <span className="ml-2 text-green-600 text-lg">✅ Correct!</span>
          )}
          {isIncorrect && (
            <span className="ml-2 text-red-600 text-lg">❌ Incorrect</span>
          )}
        </div>
      )}

      {game.status === "completed" && !userPicked && (
        <div className="text-center py-2 text-gray-500">No pick submitted</div>
      )}
    </div>
  );
};

// Games List Component
const GamesList = ({
  games,
  picks,
  currentUser,
  onPick,
  onSaveRound,
  loading,
}) => {
  // Track unsaved picks locally
  const [unsavedPicks, setUnsavedPicks] = React.useState(new Map());
  const [savingRounds, setSavingRounds] = React.useState(new Set());

  // Merge saved picks with unsaved picks for display
  const userPicksMap = new Map(
    picks.filter((p) => p.user_id === currentUser.id).map((p) => [p.game_id, p])
  );

  // Combine saved and unsaved picks for display
  const allPicksMap = new Map(userPicksMap);
  unsavedPicks.forEach((pickedTeam, gameId) => {
    allPicksMap.set(gameId, { picked_team: pickedTeam });
  });

  // Handle pick selection (store locally, don't save yet)
  const handlePick = (gameId, pickedTeam) => {
    setUnsavedPicks((prev) => {
      const newMap = new Map(prev);
      newMap.set(gameId, pickedTeam);
      return newMap;
    });
  };

  // Handle saving picks for a specific round
  const handleSaveRound = async (round, roundGames) => {
    setSavingRounds((prev) => new Set(prev).add(round));

    try {
      // Get all unsaved picks for games in this round
      const picksToSave = [];
      roundGames.forEach((game) => {
        const pickedTeam = unsavedPicks.get(game.id);
        if (pickedTeam) {
          picksToSave.push({ gameId: game.id, pickedTeam });
        }
      });

      if (picksToSave.length === 0) {
        alert("No picks to save for this round.");
        return;
      }

      // Save all picks for this round
      await onSaveRound(picksToSave);

      // Remove saved picks from unsaved picks
      setUnsavedPicks((prev) => {
        const newMap = new Map(prev);
        picksToSave.forEach(({ gameId }) => {
          newMap.delete(gameId);
        });
        return newMap;
      });
    } catch (error) {
      console.error("Error saving picks:", error);
      alert("Failed to save picks. Please try again.");
    } finally {
      setSavingRounds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(round);
        return newSet;
      });
    }
  };

  // Filter to only show playoff games (exclude 'other' round)
  const playoffGames = games.filter((game) => {
    const round = game.playoff_round || "other";
    return round !== "other";
  });

  // Group games by playoff round
  const gamesByRound = playoffGames.reduce((acc, game) => {
    const round = game.playoff_round || "wild_card";
    if (!acc[round]) acc[round] = [];
    acc[round].push(game);
    return acc;
  }, {});

  const roundLabels = {
    wild_card: "Wild Card Round",
    divisional: "Divisional Round",
    conference: "Conference Championships",
    super_bowl: "Super Bowl",
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading games...</p>
      </div>
    );
  }

  if (playoffGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          No playoff games available yet. Check back during playoff season!
        </p>
        {games.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            (Found {games.length} regular season game(s) - only playoff games
            are shown)
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {Object.entries(gamesByRound).map(([round, roundGames]) => {
        // Count unsaved picks for this round
        const unsavedCount = roundGames.filter((game) =>
          unsavedPicks.has(game.id)
        ).length;
        const isSaving = savingRounds.has(round);

        return (
          <div key={round} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {roundLabels[round] || round}
            </h2>
            {roundGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                userPick={allPicksMap.get(game.id)}
                currentUser={currentUser}
                onPick={handlePick}
              />
            ))}
            {/* Save button for this round */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleSaveRound(round, roundGames)}
                disabled={isSaving || unsavedCount === 0}
                className={`px-6 py-2 rounded font-semibold transition ${
                  isSaving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : unsavedCount === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : unsavedCount > 0 ? (
                  `💾 Save ${unsavedCount} Pick${unsavedCount !== 1 ? "s" : ""}`
                ) : (
                  "✓ All Picks Saved"
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Leaderboard Grid View Component - Shows games with players and their picks
const LeaderboardGridView = ({ users, games, picks, currentUser }) => {
  // Filter to only show playoff games (exclude 'other' round)
  const playoffGames = games.filter((game) => {
    const round = game.playoff_round || "other";
    return round !== "other";
  });

  // Show all playoff games (not just started ones)
  // Group games by playoff round
  const gamesByRound = playoffGames.reduce((acc, game) => {
    const round = game.playoff_round || "wild_card";
    if (!acc[round]) acc[round] = [];
    acc[round].push(game);
    return acc;
  }, {});

  const roundLabels = {
    wild_card: "Wild Card Round",
    divisional: "Divisional Round",
    conference: "Conference Championships",
    super_bowl: "Super Bowl",
  };

  // Get pick for a user in a game
  const getUserPick = (userId, gameId) => {
    return picks.find((p) => p.user_id === userId && p.game_id === gameId);
  };

  // Get team logo for a pick
  const getTeamLogo = (game, teamAbbreviation) => {
    if (game.home_team === teamAbbreviation) return game.home_logo;
    if (game.away_team === teamAbbreviation) return game.away_logo;
    return null;
  };

  // Check if a game is locked (hasn't started yet)
  const isGameLocked = (game) => {
    return game.status === "scheduled" && !hasGameStarted(game.game_time);
  };

  if (playoffGames.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No playoff games available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(gamesByRound).map(([round, roundGames]) => (
        <div
          key={round}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-xl font-bold text-gray-800">
              {roundLabels[round] || round}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-6">
              {roundGames.map((game) => {
                const gameLocked = isGameLocked(game);
                const gamePicks = users.map((user) => {
                  const pick = getUserPick(user.id, game.id);
                  return {
                    user,
                    pick: pick?.picked_team || null,
                    logo: pick ? getTeamLogo(game, pick.picked_team) : null,
                    isCorrect:
                      game.status === "completed" &&
                      pick &&
                      pick.picked_team === game.winner,
                    isIncorrect:
                      game.status === "completed" &&
                      pick &&
                      pick.picked_team !== game.winner,
                    hasPick: !!pick,
                  };
                });

                return (
                  <div
                    key={game.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {/* Game Header */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {game.away_logo && (
                            <img
                              src={game.away_logo}
                              alt={game.away_team}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                          <span className="font-semibold text-gray-800">
                            {game.away_team}
                          </span>
                          <span className="text-gray-400">@</span>
                          {game.home_logo && (
                            <img
                              src={game.home_logo}
                              alt={game.home_team}
                              className="w-8 h-8 object-contain"
                            />
                          )}
                          <span className="font-semibold text-gray-800">
                            {game.home_team}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            game.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : game.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {game.status === "completed"
                            ? "Final"
                            : game.status === "in_progress"
                            ? "Live"
                            : "Scheduled"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(game.game_time)}
                      </p>
                    </div>

                    {/* Players Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {gamePicks.map(
                        ({
                          user,
                          pick,
                          logo,
                          isCorrect,
                          isIncorrect,
                          hasPick,
                        }) => (
                          <div
                            key={user.id}
                            className={`p-3 rounded border ${
                              user.id === currentUser.id
                                ? "bg-blue-50 border-blue-300"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-sm font-medium ${
                                  user.id === currentUser.id
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {user.first_name} {user.last_name}
                                {user.id === currentUser.id && (
                                  <span className="ml-1 text-blue-600">
                                    (You)
                                  </span>
                                )}
                              </span>
                            </div>
                            {gameLocked ? (
                              // Game is locked - show lock icon if pick exists, blank if no pick
                              hasPick ? (
                                <div className="flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                // No pick - leave blank
                                <div className="h-8"></div>
                              )
                            ) : // Game is unlocked - show pick with logo
                            pick ? (
                              <div className="flex items-center gap-2">
                                {logo ? (
                                  <img
                                    src={logo}
                                    alt={pick}
                                    className="w-8 h-8 object-contain"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-600">
                                    {pick}
                                  </span>
                                )}
                                {game.status === "completed" && (
                                  <span className="text-sm">
                                    {isCorrect && "✅"}
                                    {isIncorrect && "❌"}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No pick
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Leaderboard Component
const Leaderboard = ({ users, games, picks, currentUser, onViewUser }) => {
  const [viewMode, setViewMode] = React.useState("table"); // 'table' or 'grid'

  // Calculate stats for each user
  const userStats = users.map((user) => {
    const userPicks = picks.filter((p) => p.user_id === user.id);
    const completedGames = games.filter((g) => g.status === "completed");

    let wins = 0;
    let losses = 0;

    userPicks.forEach((pick) => {
      const game = completedGames.find((g) => g.id === pick.game_id);
      if (game && game.winner) {
        if (pick.picked_team === game.winner) {
          wins++;
        } else {
          losses++;
        }
      }
    });

    const totalPicks = wins + losses;
    const picksSubmitted = userPicks.length; // Total picks submitted (all games)
    const winPercentage =
      totalPicks > 0 ? ((wins / totalPicks) * 100).toFixed(1) : 0;

    return {
      ...user,
      wins,
      losses,
      totalPicks,
      picksSubmitted,
      winPercentage: parseFloat(winPercentage),
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
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded font-semibold transition ${
              viewMode === "table"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded font-semibold transition ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Grid View
          </button>
        </div>
      </div>
      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wins
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Losses
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Picks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Picks Submitted
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userStats.map((user, index) => (
                <tr
                  key={user.id}
                  className={
                    user.id === currentUser.id ? "bg-blue-50 font-semibold" : ""
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id === currentUser.id ? (
                      <span className="text-blue-600 font-semibold">
                        {user.first_name} {user.last_name}
                        <span className="ml-2 text-blue-600">(You)</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onViewUser(user.id)}
                        className="text-left text-blue-500 hover:text-blue-700 hover:underline"
                      >
                        {user.first_name} {user.last_name}
                      </button>
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
                    {user.picksSubmitted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {user.winPercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6">
          <LeaderboardGridView
            users={users}
            games={games}
            picks={picks}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
};

// User Picks View Component - Shows another user's picks for started/completed games
const UserPicksView = ({ userId, users, games, picks, onBack }) => {
  const user = users.find((u) => u.id === userId);
  const userPicks = picks.filter((p) => p.user_id === userId);
  const userPicksMap = new Map(userPicks.map((p) => [p.game_id, p]));

  // Filter to only show playoff games (exclude 'other' round)
  const playoffGames = games.filter((game) => {
    const round = game.playoff_round || "other";
    return round !== "other";
  });

  // Filter games to only show those that have started or are completed
  // Hide games that haven't started yet
  const visibleGames = playoffGames.filter((game) => {
    const gameStarted = hasGameStarted(game.game_time);
    return game.status !== "scheduled" || gameStarted;
  });

  // Group games by playoff round
  const gamesByRound = visibleGames.reduce((acc, game) => {
    const round = game.playoff_round || "wild_card";
    if (!acc[round]) acc[round] = [];
    acc[round].push(game);
    return acc;
  }, {});

  const roundLabels = {
    wild_card: "Wild Card Round",
    divisional: "Divisional Round",
    conference: "Conference Championships",
    super_bowl: "Super Bowl",
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {user.first_name} {user.last_name}'s Picks
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing picks for games that have started or finished
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded font-semibold hover:bg-gray-600 transition"
        >
          ← Back to Leaderboard
        </button>
      </div>

      {Object.keys(gamesByRound).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            No games have started yet. Picks will be visible once games begin.
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(gamesByRound).map(([round, roundGames]) => (
            <div key={round} className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {roundLabels[round] || round}
              </h3>
              {roundGames.map((game) => {
                const userPick = userPicksMap.get(game.id);
                const userPicked = userPick?.picked_team;
                const isCorrect =
                  game.status === "completed" && userPicked === game.winner;
                const isIncorrect =
                  game.status === "completed" &&
                  userPicked &&
                  userPicked !== game.winner;

                return (
                  <div
                    key={game.id}
                    className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-blue-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Away Team */}
                          <div className="flex items-center gap-2">
                            {game.away_logo && (
                              <img
                                src={game.away_logo}
                                alt={game.away_team}
                                className="w-10 h-10 object-contain"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-800">
                                {game.away_team}
                              </div>
                              {game.away_record && (
                                <div className="text-xs text-gray-500">
                                  {game.away_record}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-400">@</span>
                          {/* Home Team */}
                          <div className="flex items-center gap-2">
                            {game.home_logo && (
                              <img
                                src={game.home_logo}
                                alt={game.home_team}
                                className="w-10 h-10 object-contain"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-800">
                                {game.home_team}
                              </div>
                              {game.home_record && (
                                <div className="text-xs text-gray-500">
                                  {game.home_record}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {formatDateTime(game.game_time)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {game.location}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          game.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : game.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {game.status === "completed"
                          ? "Final"
                          : game.status === "in_progress"
                          ? "Live"
                          : "Scheduled"}
                      </span>
                    </div>

                    {/* Score Display */}
                    {(game.status === "in_progress" ||
                      game.status === "completed") && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {game.away_logo && (
                              <img
                                src={game.away_logo}
                                alt={game.away_team}
                                className="w-8 h-8 object-contain"
                              />
                            )}
                            <span className="font-semibold">
                              {game.away_team}
                            </span>
                          </div>
                          <span className="text-2xl font-bold">
                            {game.away_score}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            {game.home_logo && (
                              <img
                                src={game.home_logo}
                                alt={game.home_team}
                                className="w-8 h-8 object-contain"
                              />
                            )}
                            <span className="font-semibold">
                              {game.home_team}
                            </span>
                          </div>
                          <span className="text-2xl font-bold">
                            {game.home_score}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pick Display */}
                    {userPicked ? (
                      <div className="text-center py-2">
                        <span className="text-gray-700">
                          <strong>{user.first_name}</strong> picked:{" "}
                          <strong>{userPicked}</strong>
                        </span>
                        {game.status === "completed" && (
                          <>
                            {isCorrect && (
                              <span className="ml-2 text-green-600 text-lg">
                                ✅ Correct!
                              </span>
                            )}
                            {isIncorrect && (
                              <span className="ml-2 text-red-600 text-lg">
                                ❌ Incorrect
                              </span>
                            )}
                          </>
                        )}
                        {game.status === "in_progress" && (
                          <span className="ml-2 text-yellow-600">
                            ⏳ Waiting for result...
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500">
                        No pick submitted for this game
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
