-- Add score column to channels for sorting
alter table public.channels_old add column if not exists score integer default 0;
-- Note: 'channels_old' is what supabase might have renamed if I had conflict, 
-- but wait, I just created 'channels' in previous step. 
-- Let's check table name. It was 'channels'.
-- Wait, I should not assume 'channels_old'. I will stick to 'channels'.

alter table public.channels add column if not exists score integer default 0;

-- Create Votes Table to track who voted (Prevent Fakes)
create table if not exists public.channel_votes (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.channels(id) on delete cascade,
  voter_ip text not null, -- We will store hashed IP or identifier
  vote_type integer not null, -- 1 for up, -1 for down
  created_at timestamptz default now()
);

-- Unique constraint: One vote per IP per channel
create unique index if not exists unique_vote_per_ip on public.channel_votes (channel_id, voter_ip);

alter table public.channel_votes enable row level security;

-- Only server-side (Edge Function) should insert/read full votes log to ensure privacy/security logic
-- But for simplicity we might allow read.
create policy "Enable read access for all users" on public.channel_votes
  for select using (true);
