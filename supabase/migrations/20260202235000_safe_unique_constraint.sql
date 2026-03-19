-- ==========================================
-- BENZERSİZ KANAL LİNKİ KORUMASI
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'channels_join_link_key'
    ) THEN
        ALTER TABLE public.channels 
        ADD CONSTRAINT channels_join_link_key UNIQUE (join_link);
    END IF;
END $$;
