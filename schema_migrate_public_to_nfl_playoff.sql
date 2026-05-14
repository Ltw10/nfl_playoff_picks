-- Move NFL Playoff Picks objects from public → schema nfl_playoff (data is preserved).
-- Run once in Supabase SQL Editor when upgrading an existing database.
--
-- WHAT MOVES (everything the app stores in Postgres today):
--   • Any table in public whose name starts with nfl_playoff_ (games, users, picks,
--     and any future table you add with that prefix)
--   Attached to those tables automatically (same ALTER … SET SCHEMA):
--     indexes, primary/unique/foreign keys, check constraints, table triggers,
--     RLS policies, table-level comments
--
-- WHAT THIS SCRIPT DOES NOT MOVE (this repo does not define any of these; only if
-- you added them manually in public would you need to handle them separately):
--   • Standalone functions, procedures, aggregate types, or domains
--   • Views or materialized views (use ALTER … SET SCHEMA on each, or recreate
--     under nfl_playoff)
--   • Sequences not owned by a column on these tables (these tables use text PK /
--     gen_random_uuid(), so there are typically no loose sequences)
--
-- PREREQUISITES (do in order):
-- 1) Dashboard → Settings → API → Exposed schemas → add "nfl_playoff", save.
-- 2) Optional: take a backup (Database → Backups or pg_dump).
-- 3) Run this entire script.
-- 4) Deploy app code that sets supabase-js default schema to "nfl_playoff" (see js/config.js).
--
-- Safe to re-run: only moves tables still in public; grants are idempotent.

begin;

create schema if not exists nfl_playoff;

grant usage on schema nfl_playoff to anon, authenticated, service_role;

-- Move every project table still in public (regex = literal prefix nfl_playoff_)
do $$
declare
  t text;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname ~ '^nfl_playoff_'
    order by c.relname
  loop
    execute format('alter table public.%I set schema nfl_playoff', t);
  end loop;
end $$;

-- Data API: all current tables in this schema (includes any nfl_playoff_* you moved above)
grant select, insert, update, delete on all tables in schema nfl_playoff to anon, authenticated, service_role;

commit;
