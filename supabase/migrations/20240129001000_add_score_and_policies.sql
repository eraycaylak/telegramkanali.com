-- Add score column to channels table for voting
-- ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS score integer DEFAULT 0;

-- Create index for faster sorting by score
CREATE INDEX IF NOT EXISTS idx_channels_score ON public.channels(score DESC);

-- Allow insert/update/delete for all users (for admin actions via service role)
-- Note: In production, you'd want more restrictive policies

DROP POLICY IF EXISTS "Enable insert for service role" ON public.channels;
CREATE POLICY "Enable insert for service role" ON public.channels
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for service role" ON public.channels;
CREATE POLICY "Enable update for service role" ON public.channels
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for service role" ON public.channels;
CREATE POLICY "Enable delete for service role" ON public.channels
  FOR DELETE USING (true);

-- Same for categories
DROP POLICY IF EXISTS "Enable insert for service role" ON public.categories;
CREATE POLICY "Enable insert for service role" ON public.categories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for service role" ON public.categories;
CREATE POLICY "Enable update for service role" ON public.categories
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for service role" ON public.categories;
CREATE POLICY "Enable delete for service role" ON public.categories
  FOR DELETE USING (true);
