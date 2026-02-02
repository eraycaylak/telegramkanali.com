-- Add status column to channels table
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

-- Optional: Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_channels_status ON public.channels(status);
