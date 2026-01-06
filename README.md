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

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up

### 2. Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Run the SQL script from `schema.sql`

**Note:** Tables are prefixed with `nfl_playoff_` to distinguish from other projects in the same database:
- `nfl_playoff_games` - Stores NFL playoff game information
- `nfl_playoff_users` - Stores user accounts for the competition
- `nfl_playoff_picks` - Stores user picks for each game

The schema includes:
- All three tables with proper foreign key relationships
- Indexes for optimal query performance
- Row Level Security (RLS) policies with descriptive names

### 3. Configure Supabase

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Open `js/config.js` in a text editor
4. Find these lines:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
5. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 4. Row Level Security (RLS)

The schema includes two options for RLS. The default (Option 2) is recommended for multi-project databases:

**Option 1: Disable RLS (Simplest for single-project databases)**
- Uncomment the `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` lines in `schema.sql`

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

You can test locally using Python's HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

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
├── schema.sql          # Database schema
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
- Check that the `nfl_playoff_picks` table has the correct foreign key constraints
- Ensure table names match (should be `nfl_playoff_*` prefixed)
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

