-- PriceGuard database schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_price numeric not null,
  target_price numeric not null,
  current_price numeric not null,
  alert_email text not null,
  created_at timestamptz not null default now()
);

create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  price numeric not null,
  checked_at timestamptz not null default now()
);

create table if not exists alerts_sent (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  price numeric not null,
  sent_at timestamptz not null default now()
);

create index if not exists idx_price_history_product_id on price_history(product_id);
