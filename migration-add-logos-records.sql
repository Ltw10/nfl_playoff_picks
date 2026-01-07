-- Migration: Add team logos and records to nfl_playoff_games table
-- Run this if you already have the games table created

ALTER TABLE nfl_playoff_games 
ADD COLUMN IF NOT EXISTS home_logo TEXT,
ADD COLUMN IF NOT EXISTS away_logo TEXT,
ADD COLUMN IF NOT EXISTS home_record TEXT,
ADD COLUMN IF NOT EXISTS away_record TEXT;

