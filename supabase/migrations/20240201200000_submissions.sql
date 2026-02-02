-- Add status and contact_info to channels table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channel_status') THEN
        CREATE TYPE public.channel_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS status channel_status DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS contact_info text;

-- Update existing channels to approved if status column was just added
UPDATE public.channels SET status = 'approved' WHERE status IS NULL;
