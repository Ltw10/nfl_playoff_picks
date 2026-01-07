// ============================================
// CONFIGURATION
// ============================================
// SETUP INSTRUCTIONS:
// 1. Create a free Supabase account at https://supabase.com
// 2. Create a new project
// 3. Run the schema.sql file in Supabase SQL Editor
// 4. Go to Settings → API in Supabase
// 5. Copy your Project URL and anon/public key
// 6. Replace the values below:

// Configuration - using window object to ensure global scope
// and avoid redeclaration errors
if (typeof window.SUPABASE_URL === "undefined") {
  window.SUPABASE_URL = "https://jvfcsemgypiexqeiuqax.supabase.co"; // e.g., 'https://xxxxx.supabase.co'
}
if (typeof window.SUPABASE_ANON_KEY === "undefined") {
  window.SUPABASE_ANON_KEY = "sb_publishable_Led1z5rXySTKSamM5QHnFA_DOVxdT3x"; // Your anon/public key
}
if (typeof window.ESPN_API_BASE_URL === "undefined") {
  window.ESPN_API_BASE_URL =
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
}
// Get current year for playoff games
const currentYear = new Date().getFullYear();
// Playoff season type is 3, week 1 = wild card, week 2 = divisional, week 3 = conference, week 5 = super bowl
if (typeof window.ESPN_API_URL === "undefined") {
  window.ESPN_API_URL = `${window.ESPN_API_BASE_URL}?year=${currentYear}&seasontype=3&week=1`;
}

// Create aliases for easier access (backward compatibility)
var SUPABASE_URL = window.SUPABASE_URL;
var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
var ESPN_API_URL = window.ESPN_API_URL;

// Initialize Supabase client
// Check if already exists to avoid redeclaration errors
if (typeof window.supabaseClient === "undefined") {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
var supabase = window.supabaseClient;
