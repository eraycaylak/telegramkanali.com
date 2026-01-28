-- Create Categories Table
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null,
  description text,
  icon text,
  subcategories text[]
);

alter table public.categories enable row level security;

create policy "Enable read access for all users" on public.categories
  for select using (true);

-- Create Channels Table
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id text references public.categories(id),
  subcategories text[],
  join_link text,
  stats jsonb default '{}'::jsonb,
  image text,
  tags text[],
  verified boolean default false,
  featured boolean default false,
  language text default 'tr',
  rating integer default 0,
  created_at timestamptz default now()
);

alter table public.channels enable row level security;

create policy "Enable read access for all users" on public.channels
  for select using (true);
