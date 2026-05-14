-- NFL Playoff Picks App - Database Schema
-- Run this in your Supabase SQL Editor
--
-- Objects live in schema "nfl_playoff" (not public) so this app is isolated
-- from other projects in the same database.
--
-- If you already have nfl_playoff_* tables in public with data, do NOT run this
-- whole file first—use schema_migrate_public_to_nfl_playoff.sql to move them,
-- then use this file only for reference or for brand-new databases.
--
-- BEFORE running: Dashboard → Settings → API → Exposed schemas → add "nfl_playoff"
-- (Required for supabase-js / PostgREST to see these tables.)
--
-- Table names keep the nfl_playoff_ prefix for clarity inside the schema.

-- ============================================
-- SCHEMA
-- ============================================

create schema if not exists nfl_playoff;

grant usage on schema nfl_playoff to anon, authenticated, service_role;

-- ============================================
-- TABLES
-- ============================================

-- Stores NFL playoff game information from ESPN API
create table nfl_playoff.nfl_playoff_games (
  id text primary key,              -- ESPN game ID
  home_team text not null,
  away_team text not null,
  game_time timestamp not null,
  location text,
  status text not null,             -- 'scheduled', 'in_progress', 'completed'
  home_score integer default 0,
  away_score integer default 0,
  winner text,                      -- NULL until game completes
  playoff_round text,               -- 'wild_card', 'divisional', 'conference', 'super_bowl'
  home_logo text,                   -- URL to home team logo
  away_logo text,                   -- URL to away team logo
  home_record text,                 -- Home team record (e.g., '12-5')
  away_record text,                 -- Away team record (e.g., '11-6')
  status_detail text,               -- Game status detail (e.g., '12:16 - 2nd Quarter')
  status_short_detail text,          -- Short status detail (e.g., '12:16 - 2nd')
  home_win_probability numeric(5,4), -- Home team win probability (0.0000 to 1.0000)
  away_win_probability numeric(5,4), -- Away team win probability (0.0000 to 1.0000)
  display_clock text,               -- Time remaining in current period (e.g., '12:16')
  period integer,                   -- Quarter/period number (1-4 for quarters, 5+ for overtime)
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Stores user accounts for the NFL Playoff Picks competition
create table nfl_playoff.nfl_playoff_users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  super_bowl_total_points integer,  -- Tiebreaker: predicted total points in Super Bowl (closest wins)
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Stores user picks for each playoff game
create table nfl_playoff.nfl_playoff_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references nfl_playoff.nfl_playoff_users(id) on delete cascade,
  game_id text references nfl_playoff.nfl_playoff_games(id) on delete cascade,
  picked_team text not null,
  picked_at timestamp default now(),
  unique(user_id, game_id)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_nfl_playoff_picks_user_id on nfl_playoff.nfl_playoff_picks(user_id);
create index idx_nfl_playoff_picks_game_id on nfl_playoff.nfl_playoff_picks(game_id);
create index idx_nfl_playoff_games_status on nfl_playoff.nfl_playoff_games(status);
create index idx_nfl_playoff_games_game_time on nfl_playoff.nfl_playoff_games(game_time);
create index idx_nfl_playoff_games_playoff_round on nfl_playoff.nfl_playoff_games(playoff_round);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Option 1: Disable RLS for family-only use (Simplest)
-- Uncomment the lines below if you want to disable RLS entirely
-- alter table nfl_playoff.nfl_playoff_games disable row level security;
-- alter table nfl_playoff.nfl_playoff_users disable row level security;
-- alter table nfl_playoff.nfl_playoff_picks disable row level security;

-- Option 2: Enable RLS with permissive policies (Recommended for multi-project databases)
create policy "nfl_playoff_games_allow_all" on nfl_playoff.nfl_playoff_games
  for all using (true) with check (true);

create policy "nfl_playoff_users_allow_all" on nfl_playoff.nfl_playoff_users
  for all using (true) with check (true);

create policy "nfl_playoff_picks_allow_all" on nfl_playoff.nfl_playoff_picks
  for all using (true) with check (true);

alter table nfl_playoff.nfl_playoff_games enable row level security;
alter table nfl_playoff.nfl_playoff_users enable row level security;
alter table nfl_playoff.nfl_playoff_picks enable row level security;

-- ============================================
-- DATA API (PostgREST / supabase-js) GRANTS
-- ============================================
-- Explicit grants for anon (browser client), authenticated, and service_role.

grant select, insert, update, delete on nfl_playoff.nfl_playoff_games to anon, authenticated;
grant select, insert, update, delete on nfl_playoff.nfl_playoff_users to anon, authenticated;
grant select, insert, update, delete on nfl_playoff.nfl_playoff_picks to anon, authenticated;

grant select, insert, update, delete on nfl_playoff.nfl_playoff_games to service_role;
grant select, insert, update, delete on nfl_playoff.nfl_playoff_users to service_role;
grant select, insert, update, delete on nfl_playoff.nfl_playoff_picks to service_role;

-- ============================================
-- OPTIONAL: default privileges for future tables in this schema
-- ============================================
-- alter default privileges in schema nfl_playoff grant select, insert, update, delete on tables to anon, authenticated;
-- alter default privileges in schema nfl_playoff grant select, insert, update, delete on tables to service_role;

-- ============================================
-- MIGRATION: Add Super Bowl total points (tiebreaker)
-- Run this if you already have nfl_playoff_users and need to add the column:
-- alter table nfl_playoff.nfl_playoff_users add column if not exists super_bowl_total_points integer;
-- alter table nfl_playoff.nfl_playoff_users add column if not exists updated_at timestamp default now();
