-- NFL Playoff Picks App - Database Schema
-- Run this in your Supabase SQL Editor
-- 
-- NOTE: Tables are prefixed with 'nfl_playoff_' to distinguish from other projects
-- in the same database. All policies are also prefixed for clarity.

-- ============================================
-- TABLES
-- ============================================

-- Create nfl_playoff_games table
-- Stores NFL playoff game information from ESPN API
CREATE TABLE nfl_playoff_games (
  id TEXT PRIMARY KEY,              -- ESPN game ID
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  game_time TIMESTAMP NOT NULL,
  location TEXT,
  status TEXT NOT NULL,             -- 'scheduled', 'in_progress', 'completed'
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  winner TEXT,                      -- NULL until game completes
  playoff_round TEXT,               -- 'wild_card', 'divisional', 'conference', 'super_bowl'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create nfl_playoff_users table
-- Stores user accounts for the NFL Playoff Picks competition
CREATE TABLE nfl_playoff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create nfl_playoff_picks table
-- Stores user picks for each playoff game
CREATE TABLE nfl_playoff_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES nfl_playoff_users(id) ON DELETE CASCADE,
  game_id TEXT REFERENCES nfl_playoff_games(id) ON DELETE CASCADE,
  picked_team TEXT NOT NULL,
  picked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Create indexes for better query performance
CREATE INDEX idx_nfl_playoff_picks_user_id ON nfl_playoff_picks(user_id);
CREATE INDEX idx_nfl_playoff_picks_game_id ON nfl_playoff_picks(game_id);
CREATE INDEX idx_nfl_playoff_games_status ON nfl_playoff_games(status);
CREATE INDEX idx_nfl_playoff_games_game_time ON nfl_playoff_games(game_time);
CREATE INDEX idx_nfl_playoff_games_playoff_round ON nfl_playoff_games(playoff_round);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Option 1: Disable RLS for family-only use (Simplest)
-- Uncomment the lines below if you want to disable RLS entirely
-- ALTER TABLE nfl_playoff_games DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE nfl_playoff_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE nfl_playoff_picks DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with permissive policies (Recommended for multi-project databases)
-- This allows all operations but keeps RLS enabled for future security enhancements
CREATE POLICY "nfl_playoff_games_allow_all" ON nfl_playoff_games 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "nfl_playoff_users_allow_all" ON nfl_playoff_users 
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "nfl_playoff_picks_allow_all" ON nfl_playoff_picks 
  FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on all tables
ALTER TABLE nfl_playoff_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfl_playoff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfl_playoff_picks ENABLE ROW LEVEL SECURITY;

