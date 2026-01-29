-- Create votes table for tracking unique votes per device
CREATE TABLE IF NOT EXISTS public.votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
    fingerprint text NOT NULL,
    vote_type integer NOT NULL CHECK (vote_type IN (1, -1)),
    created_at timestamptz DEFAULT now(),
    UNIQUE(channel_id, fingerprint)
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role
CREATE POLICY "Enable all for votes" ON public.votes FOR ALL USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_votes_channel_fingerprint ON public.votes(channel_id, fingerprint);
