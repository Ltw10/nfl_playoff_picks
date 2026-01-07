-- Test Data for Local Development
-- Run this in Supabase SQL Editor after creating the schema
-- This creates sample users and games for testing

-- Insert test users
INSERT INTO nfl_playoff_users (id, first_name, last_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John', 'Doe'),
  ('00000000-0000-0000-0000-000000000002', 'Jane', 'Smith'),
  ('00000000-0000-0000-0000-000000000003', 'Bob', 'Johnson')
ON CONFLICT (id) DO NOTHING;

-- Insert test games (example playoff games)
-- Adjust dates to be in the future for testing
INSERT INTO nfl_playoff_games (id, home_team, away_team, game_time, location, status, home_score, away_score, winner, playoff_round) VALUES
  ('test-game-1', 'KC', 'BUF', NOW() + INTERVAL '2 days', 'Arrowhead Stadium', 'scheduled', 0, 0, NULL, 'wild_card'),
  ('test-game-2', 'SF', 'GB', NOW() + INTERVAL '3 days', 'Levi''s Stadium', 'scheduled', 0, 0, NULL, 'wild_card'),
  ('test-game-3', 'BAL', 'HOU', NOW() + INTERVAL '1 day', 'M&T Bank Stadium', 'scheduled', 0, 0, NULL, 'divisional'),
  ('test-game-4', 'DAL', 'TB', NOW() - INTERVAL '1 day', 'AT&T Stadium', 'completed', 24, 21, 'DAL', 'wild_card'),
  ('test-game-5', 'PHI', 'NYG', NOW() - INTERVAL '2 days', 'Lincoln Financial Field', 'completed', 31, 7, 'PHI', 'wild_card')
ON CONFLICT (id) DO UPDATE SET
  home_team = EXCLUDED.home_team,
  away_team = EXCLUDED.away_team,
  game_time = EXCLUDED.game_time,
  status = EXCLUDED.status,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  winner = EXCLUDED.winner;

-- Insert test picks
INSERT INTO nfl_playoff_picks (user_id, game_id, picked_team) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test-game-1', 'KC'),
  ('00000000-0000-0000-0000-000000000001', 'test-game-2', 'SF'),
  ('00000000-0000-0000-0000-000000000001', 'test-game-4', 'DAL'),
  ('00000000-0000-0000-0000-000000000001', 'test-game-5', 'PHI'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-1', 'BUF'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-2', 'GB'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-4', 'TB'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-5', 'PHI')
ON CONFLICT (user_id, game_id) DO NOTHING;

