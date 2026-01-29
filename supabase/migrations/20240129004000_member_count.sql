-- Add member_count column to channels if not exists
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS member_count integer DEFAULT 0;

-- Add updated_at column for tracking last update
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_channels_member_count ON public.channels(member_count DESC);

-- Add username column for Telegram username (needed for API calls)
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS username text;

-- Comment explaining the columns
COMMENT ON COLUMN public.channels.member_count IS 'Number of members in the Telegram channel/group, updated daily';
COMMENT ON COLUMN public.channels.username IS 'Telegram username without @ symbol, used for API calls';
