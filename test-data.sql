-- Test Data for Local Development
-- Run this in Supabase SQL Editor after creating the schema
-- This creates sample users and games for testing

-- Insert test users
insert into nfl_playoff.nfl_playoff_users (id, first_name, last_name) values
  ('00000000-0000-0000-0000-000000000001', 'John', 'Doe'),
  ('00000000-0000-0000-0000-000000000002', 'Jane', 'Smith'),
  ('00000000-0000-0000-0000-000000000003', 'Bob', 'Johnson')
on conflict (id) do nothing;

-- Insert test games (example playoff games)
-- Adjust dates to be in the future for testing
insert into nfl_playoff.nfl_playoff_games (id, home_team, away_team, game_time, location, status, home_score, away_score, winner, playoff_round) values
  ('test-game-1', 'KC', 'BUF', now() + interval '2 days', 'Arrowhead Stadium', 'scheduled', 0, 0, null, 'wild_card'),
  ('test-game-2', 'SF', 'GB', now() + interval '3 days', 'Levi''s Stadium', 'scheduled', 0, 0, null, 'wild_card'),
  ('test-game-3', 'BAL', 'HOU', now() + interval '1 day', 'M&T Bank Stadium', 'scheduled', 0, 0, null, 'divisional'),
  ('test-game-4', 'DAL', 'TB', now() - interval '1 day', 'AT&T Stadium', 'completed', 24, 21, 'DAL', 'wild_card'),
  ('test-game-5', 'PHI', 'NYG', now() - interval '2 days', 'Lincoln Financial Field', 'completed', 31, 7, 'PHI', 'wild_card')
on conflict (id) do update set
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  game_time = excluded.game_time,
  status = excluded.status,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  winner = excluded.winner;

-- Insert test picks
insert into nfl_playoff.nfl_playoff_picks (user_id, game_id, picked_team) values
  ('00000000-0000-0000-0000-000000000001', 'test-game-1', 'KC'),
  ('00000000-0000-0000-0000-000000000001', 'test-game-2', 'SF'),
  ('00000000-0000-0000-0000-000000000001', 'test-game-4', 'DAL'),
  ('00000000-0000-0000-0000-000000000001', 'test-game-5', 'PHI'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-1', 'BUF'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-2', 'GB'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-4', 'TB'),
  ('00000000-0000-0000-0000-000000000002', 'test-game-5', 'PHI')
on conflict (user_id, game_id) do nothing;
