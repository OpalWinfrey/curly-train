-- Daily price snapshot table: one row per product per day
-- Prices are global market data, not user-specific.
create table public.price_snapshots (
  product_id   text not null,
  price        numeric not null,
  recorded_at  date not null default current_date,
  primary key (product_id, recorded_at)
);

alter table public.price_snapshots enable row level security;

-- Anyone can read market price history
create policy "Price snapshots publicly readable"
  on public.price_snapshots for select
  using (true);

-- Authenticated users can insert snapshots (all write the same public market data)
create policy "Authenticated users can insert price snapshots"
  on public.price_snapshots for insert
  with check (auth.role() = 'authenticated');

-- Allow upsert conflict resolution
create policy "Authenticated users can update price snapshots"
  on public.price_snapshots for update
  using (auth.role() = 'authenticated');
