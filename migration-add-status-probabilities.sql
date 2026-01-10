-- Migration: Add status details, win probabilities, and game clock to nfl_playoff_games table
-- Run this in your Supabase SQL Editor to add the new columns

ALTER TABLE nfl_playoff_games 
ADD COLUMN IF NOT EXISTS status_detail TEXT,
ADD COLUMN IF NOT EXISTS status_short_detail TEXT,
ADD COLUMN IF NOT EXISTS home_win_probability NUMERIC(5,4),
ADD COLUMN IF NOT EXISTS away_win_probability NUMERIC(5,4),
ADD COLUMN IF NOT EXISTS display_clock TEXT,
ADD COLUMN IF NOT EXISTS period INTEGER;

-- Note: NUMERIC(5,4) allows values like 0.8476 (4 decimal places, up to 1.0000)
-- display_clock: Time remaining in current period (e.g., "9:49")
-- period: Quarter/period number (1-4 for quarters, 5+ for overtime)

