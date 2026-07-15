-- Run this in your Supabase project > SQL Editor

-- Profiles (auto-created on signup via trigger)
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique,
  display_name  text,
  bio           text,
  avatar_url    text,
  is_public     boolean default true,
  item_count    int default 0,
  created_at    timestamptz default now()
);

-- Collection items
create table public.collection_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users on delete cascade not null,
  product_id     text not null,
  quantity       int default 1,
  purchase_price numeric,
  purchase_date  text,
  condition      text,
  notes          text,
  created_at     timestamptz default now()
);

-- Watchlist items
create table public.watchlist_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  product_id   text not null,
  target_price numeric,
  date_added   text,
  notes        text,
  created_at   timestamptz default now()
);

-- User preferences
create table public.user_preferences (
  user_id         uuid primary key references auth.users on delete cascade,
  currency        text default 'USD',
  marketplace     text default 'TCGPlayer',
  selling_fee_pct numeric default 12.9,
  tax_rate_pct    numeric default 0,
  updated_at      timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.collection_items enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.user_preferences enable row level security;

-- Profiles policies
create policy "Public profiles viewable by anyone"
  on public.profiles for select
  using (is_public = true or auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Collection policies
create policy "Users manage their own collection"
  on public.collection_items for all
  using (auth.uid() = user_id);

-- Watchlist policies
create policy "Users manage their own watchlist"
  on public.watchlist_items for all
  using (auth.uid() = user_id);

-- Preferences policies
create policy "Users manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Collector'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep item_count in sync
create or replace function public.update_item_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set item_count = item_count + 1 where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set item_count = greatest(0, item_count - 1) where id = OLD.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger collection_count_trigger
  after insert or delete on public.collection_items
  for each row execute function public.update_item_count();
