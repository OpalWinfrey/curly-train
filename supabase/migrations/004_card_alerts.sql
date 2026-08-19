-- Run this in your Supabase project > SQL Editor

-- Card price alerts (singles): notify when a specific Manapool single
-- is listed at or below a target price. Checked client-side for now.
create table public.card_alerts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users on delete cascade not null,
  scryfall_id        text not null,
  card_name          text not null,
  set_code           text not null,
  collector_number   text not null,
  finish             text not null default 'nonfoil',
  target_price_cents int not null,
  date_added         text,
  created_at         timestamptz default now()
);

alter table public.card_alerts enable row level security;

create policy "Users manage their own card alerts"
  on public.card_alerts for all
  using (auth.uid() = user_id);
