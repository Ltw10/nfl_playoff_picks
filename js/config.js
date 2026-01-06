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

const SUPABASE_URL = 'YOUR_SUPABASE_URL';  // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';  // Your anon/public key
const ESPN_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

