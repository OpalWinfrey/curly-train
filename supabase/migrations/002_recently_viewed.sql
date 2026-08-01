-- Add recently_viewed column to user_preferences
-- Stores up to 20 product IDs as a JSON array, persisted across sessions.
alter table public.user_preferences
  add column if not exists recently_viewed jsonb default '[]'::jsonb;
