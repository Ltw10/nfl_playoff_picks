// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get user from localStorage
const getStoredUser = () => {
  const stored = localStorage.getItem("nfl_picks_user");
  return stored ? JSON.parse(stored) : null;
};

// Store user in localStorage
const storeUser = (user) => {
  localStorage.setItem("nfl_picks_user", JSON.stringify(user));
};

// Clear user from localStorage
const clearStoredUser = () => {
  localStorage.removeItem("nfl_picks_user");
};

// Format date/time in Eastern timezone
// ESPN API returns dates in GMT/UTC, so we ensure proper conversion
const formatDateTime = (dateString) => {
  if (!dateString) return "";

  // Ensure the date string is treated as UTC
  // If it doesn't end with 'Z' (UTC indicator) and has no timezone offset, append 'Z'
  let dateStr = dateString;
  if (!dateStr.endsWith("Z") && !dateStr.match(/[+-]\d{2}:?\d{2}$/)) {
    // No timezone info, assume UTC
    dateStr = dateStr + "Z";
  }

  const date = new Date(dateStr);

  // Convert to Eastern timezone
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
};

// Check if game has started
// ESPN API returns dates in GMT/UTC
const hasGameStarted = (gameTime) => {
  if (!gameTime) return false;

  // Ensure the date string is treated as UTC
  let dateStr = gameTime;
  if (!dateStr.endsWith("Z") && !dateStr.match(/[+-]\d{2}:?\d{2}$/)) {
    // No timezone info, assume UTC
    dateStr = dateStr + "Z";
  }

  const gameDate = new Date(dateStr);
  const now = new Date();
  return gameDate < now;
};

// Check if a game is a playoff/postseason game
const isPlayoffGame = (espnData) => {
  const type = espnData.type?.slug;
  const seasonType = espnData.season?.type;
  const week = espnData.week;
  const name = espnData.name?.toLowerCase() || "";

  // Check if it's postseason type
  if (type === "postseason" || type === "3") {
    return true;
  }

  // Check season type
  // Handle both number and string formats, and check both espnData.season?.type and espnData.seasonType
  const seasonTypeValue = seasonType || espnData.seasonType;
  if (seasonTypeValue === 3 || seasonTypeValue === "3") {
    return true;
  }

  // Check week number (playoffs are typically weeks 18+)
  if (week && week.number >= 18) {
    // Double check it's not just a late regular season game
    // Playoff games usually have specific naming
    if (
      name.includes("wild card") ||
      name.includes("wildcard") ||
      name.includes("divisional") ||
      name.includes("division") ||
      name.includes("conference") ||
      name.includes("championship") ||
      name.includes("super bowl") ||
      name.includes("superbowl") ||
      name.includes("playoff")
    ) {
      return true;
    }
  }

  // Check name for playoff indicators
  if (
    name.includes("wild card") ||
    name.includes("wildcard") ||
    name.includes("divisional") ||
    name.includes("division") ||
    name.includes("conference") ||
    name.includes("championship") ||
    name.includes("super bowl") ||
    name.includes("superbowl") ||
    name.includes("playoff")
  ) {
    return true;
  }

  return false;
};

// Map ESPN playoff round to our format
const mapPlayoffRound = (espnData) => {
  const week = espnData.week?.number;
  const seasonType = espnData.season?.type;
  
  // Check notes/headline first (most reliable)
  const notes = espnData.competitions?.[0]?.notes || [];
  const headline = notes.find((n) => n.type === "event")?.headline || "";
  const headlineLower = headline.toLowerCase();

  if (headlineLower.includes("super bowl")) {
    return "super_bowl";
  }
  if (headlineLower.includes("conference championship")) {
    return "conference";
  }
  if (headlineLower.includes("divisional")) {
    return "divisional";
  }
  if (headlineLower.includes("wild card")) {
    return "wild_card";
  }

  // Fallback: use week number
  // Week 1 = Wild Card, Week 2 = Divisional, Week 3 = Conference, Week 5 = Super Bowl
  if (week) {
    if (week === 5) return "super_bowl";
    if (week === 3) return "conference";
    if (week === 2) return "divisional";
    if (week === 1) return "wild_card";
  }

  // Check season type
  if (seasonType !== 3) {
    return "other";
  }

  // Default to wild_card for postseason games
  return "wild_card";
};
