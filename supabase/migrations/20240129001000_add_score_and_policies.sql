-- Add score column to channels table for voting
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS score integer DEFAULT 0;

-- Create index for faster sorting by score
CREATE INDEX IF NOT EXISTS idx_channels_score ON public.channels(score DESC);

-- Allow insert/update/delete for all users (for admin actions via service role)
-- Note: In production, you'd want more restrictive policies
CREATE POLICY IF NOT EXISTS "Enable insert for service role" ON public.channels
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable update for service role" ON public.channels
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable delete for service role" ON public.channels
  FOR DELETE USING (true);

-- Same for categories
CREATE POLICY IF NOT EXISTS "Enable insert for service role" ON public.categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable update for service role" ON public.categories
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable delete for service role" ON public.categories
  FOR DELETE USING (true);
