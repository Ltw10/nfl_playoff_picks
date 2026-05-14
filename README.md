# NFL Playoff Picks App

A simple family competition website where you can pick NFL playoff game winners and track who has the best record.

## Features

- 🏈 Pick winners for NFL playoff games
- 📊 Real-time leaderboard tracking
- ⚡ Smart data fetching (only updates live games)
- 📱 Responsive design
- 💾 LocalStorage-based user sessions (no passwords needed)

## Tech Stack

- **Frontend**: React (via CDN), Tailwind CSS (via CDN)
- **Backend**: Supabase (PostgreSQL)
- **External API**: ESPN API (free, no key required)
- **Hosting**: GitHub Pages

## Quick Start (Local Testing)

1. **Set up Supabase** (see detailed instructions below)
2. **Run local server**:
   ```bash
   python3 -m http.server 8000
   ```
3. **Open browser**: `http://localhost:8000`
4. **Add test data** (optional): Run `test-data.sql` in Supabase SQL Editor

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up

### 2. Set Up Database Schema

1. In Supabase, go to **Settings** → **API** → **Exposed schemas** and add **`nfl_playoff`**, then save. (PostgREST only serves schemas listed here.)
2. Open the **SQL Editor**
3. Run `schema.sql` (creates schema `nfl_playoff` and all tables there—not in `public`)

**Note:** All app tables live in the **`nfl_playoff`** Postgres schema and are named with an `nfl_playoff_` prefix:

- `nfl_playoff.nfl_playoff_games` — NFL playoff game information (logos, records, status)
- `nfl_playoff.nfl_playoff_users` — competition participants
- `nfl_playoff.nfl_playoff_picks` — picks per user and game

The script includes indexes, Row Level Security (RLS) policies, and explicit grants for the Data API.

**If you already have these tables in `public` (existing data):**

1. Add **`nfl_playoff`** to **Exposed schemas** (step 1 above).
2. Run **`schema_migrate_public_to_nfl_playoff.sql`** once. This moves the three tables into `nfl_playoff` in place; rows, indexes, foreign keys, and RLS policies stay attached—no data copy.
3. Ensure `js/config.js` uses the default schema (see below); deploy after the migration.

**Optional - Add Test Data:**
- Run `test-data.sql` in the SQL Editor to add sample users and games for local testing
- This is helpful when testing outside of NFL playoff season

### 3. Configure Supabase

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Open `js/config.js` in a text editor
4. Set `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY` to your project values
5. Keep `window.SUPABASE_DB_SCHEMA` as `'nfl_playoff'` unless you rename the Postgres schema. The client passes `db: { schema: ... }` to `createClient` so all `.from(...)` calls use that schema

### 4. Row Level Security (RLS)

The schema includes two options for RLS. The default (Option 2) is recommended for multi-project databases:

**Option 1: Disable RLS (Simplest for single-project databases)**
- Uncomment the `ALTER TABLE nfl_playoff.nfl_playoff_* ... DISABLE ROW LEVEL SECURITY` lines in `schema.sql`

**Option 2: Enable RLS with Permissive Policies (Default - Recommended)**
- Uses descriptive policy names: `nfl_playoff_games_allow_all`, `nfl_playoff_users_allow_all`, `nfl_playoff_picks_allow_all`
- Keeps RLS enabled for future security enhancements
- Better for databases shared with other projects

### 5. Configure CORS (for GitHub Pages)

1. In Supabase, go to **Settings** → **API**
2. Under **CORS**, add your GitHub Pages URL:
   - `https://yourusername.github.io`
   - Or `http://localhost:8000` for local testing

### 6. Deploy to GitHub Pages

**Option A: Simple HTML File (Recommended)**

1. Create a new GitHub repository
2. Push `index.html` to the repository
3. Go to **Settings** → **Pages**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be available at `https://yourusername.github.io/repo-name`

**Option B: Using gh-pages**

```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
gh-pages -d .
```

### 7. Local Testing

Before testing locally, make sure you've completed:
1. ✅ Created Supabase project
2. ✅ Added **`nfl_playoff`** under **Settings → API → Exposed schemas**
3. ✅ Run the `schema.sql` script (or the migrate script if upgrading from `public`)
4. ✅ Updated `js/config.js` with your Supabase credentials (URL, anon key; keep `SUPABASE_DB_SCHEMA` as `nfl_playoff` unless you changed the schema name)

#### Option 1: Quick Start Script (Easiest)

```bash
# Make script executable (first time only)
chmod +x start-local.sh

# Run the script
./start-local.sh

# Or specify a custom port
./start-local.sh 3000
```

#### Option 2: Python HTTP Server (Manual)

```bash
# Navigate to the project directory
cd /path/to/nfl_playoff_picks_app

# Python 3
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

#### Option 3: Node.js HTTP Server

If you have Node.js installed:

```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
http-server -p 8000
```

#### Option 4: VS Code Live Server

If you use VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 5: PHP Built-in Server

If you have PHP installed:

```bash
php -S localhost:8000
```

#### Testing Checklist

1. **Open the app**: Navigate to `http://localhost:8000`
2. **Check console**: Open browser DevTools (F12) and check for errors
3. **Create a user**: Fill out the sign-up form with your name
4. **Verify Supabase connection**: Check that the user appears in table **`nfl_playoff.nfl_playoff_users`** (Table Editor → schema **nfl_playoff**)
5. **Test game sync**: If it's playoff season, games should load. Otherwise, you'll see "No games available"
6. **Test picks**: Try making a pick (if games are available)
7. **Test leaderboard**: Switch to the leaderboard view

#### Common Local Testing Issues

**CORS Errors:**
- Make sure you've added `http://localhost:8000` to Supabase CORS settings (Settings → API → CORS)

**Script Loading Errors:**
- Check that all files in the `js/` folder are present
- Verify the file paths in `js/loader.js` are correct
- Check browser console for 404 errors

**Supabase Connection Errors:**
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `js/config.js`
- Check that RLS policies are set up correctly
- Ensure the three tables exist under schema **`nfl_playoff`** with the `nfl_playoff_` table prefix

**No Games Showing:**
- This is normal if it's not NFL playoff season
- ESPN API only returns games during the season
- You can manually insert test games into **`nfl_playoff.nfl_playoff_games`** for testing

## How It Works

### Smart Data Fetching

The app uses a smart caching strategy:

1. **On page load**: Fetches all games from Supabase
2. **For each game**:
   - If status is `in_progress`: Fetches fresh data from ESPN API and updates Supabase
   - Otherwise: Uses cached data from Supabase (no API call)
3. This means:
   - ✅ Only 0-4 API calls per page load (only for live games)
   - ✅ Completed games cached forever
   - ✅ Fast page loads

### Pick Rules

- ✅ Can pick anytime before game starts
- ✅ Can change pick before game starts
- ❌ Cannot pick once game time has passed
- ❌ Cannot pick during or after game

### Score Calculation

- Only completed games count toward record
- In-progress games show as "pending"
- Correct pick = winner matches picked team
- Computed in real-time on page load

## Project Structure

```
nfl_playoff_picks_app/
├── index.html          # Main HTML file
├── js/
│   ├── config.js       # Supabase configuration
│   ├── utils.js         # Utility functions
│   ├── supabase.js      # Supabase database functions
│   ├── espn.js          # ESPN API integration
│   ├── components.js    # React components
│   ├── app.js           # Main App component
│   └── loader.js        # Script loader (transpiles JSX)
├── schema.sql          # Database schema (schema nfl_playoff)
├── schema_migrate_public_to_nfl_playoff.sql  # Move existing public tables → nfl_playoff (keeps data)
├── test-data.sql       # Sample data for local testing
├── start-local.sh      # Quick start script for local testing
└── README.md           # This file
```

## Troubleshooting

### "Failed to fetch" errors

- Check that your Supabase URL and key are correct
- Verify CORS settings in Supabase include your domain
- Check browser console for specific error messages

### Games not showing up

- Make sure you're testing during NFL playoff season
- Check ESPN API directly: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- Verify the `syncGames` function is working (check browser console)

### Picks not saving

- Verify Supabase RLS policies allow inserts/updates
- Check that **`nfl_playoff.nfl_playoff_picks`** has the correct foreign key constraints
- Ensure the client default schema is **`nfl_playoff`** in `js/config.js` and that **Exposed schemas** includes `nfl_playoff`
- Look for errors in browser console

## Future Enhancements

- 📧 Email reminders before game deadlines
- 🏆 Historical tracking (multiple seasons)
- 💯 Confidence points system
- 📱 PWA for mobile home screen
- 🔔 Browser notifications for game results
- 📊 User stats page (best round, upset picks, etc.)

## License

MIT

