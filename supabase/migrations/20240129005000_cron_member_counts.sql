-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Store bot token in secrets (run this manually in Supabase SQL Editor with your actual token)
-- INSERT INTO vault.secrets (name, secret) VALUES ('telegram_bot_token', '8464772960:AAEKpc_0-LC6O7IGm-y9PrM5I4t6HfbfWNA');

-- Function to update member count for a single channel
CREATE OR REPLACE FUNCTION update_channel_member_count(channel_id uuid, telegram_username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bot_token text;
    api_response jsonb;
BEGIN
    -- Get bot token from vault
    SELECT decrypted_secret INTO bot_token 
    FROM vault.decrypted_secrets 
    WHERE name = 'telegram_bot_token';
    
    IF bot_token IS NULL THEN
        RAISE NOTICE 'Bot token not found in vault';
        RETURN;
    END IF;
    
    -- Make API call using pg_net
    PERFORM net.http_get(
        url := 'https://api.telegram.org/bot' || bot_token || '/getChatMemberCount?chat_id=@' || telegram_username
    );
    
END;
$$;

-- Function to process all channels (called by cron)
CREATE OR REPLACE FUNCTION process_all_channel_member_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    channel_record RECORD;
    clean_username text;
    bot_token text;
    request_id bigint;
BEGIN
    -- Get bot token
    SELECT decrypted_secret INTO bot_token 
    FROM vault.decrypted_secrets 
    WHERE name = 'telegram_bot_token';
    
    IF bot_token IS NULL THEN
        RAISE NOTICE 'Bot token not found';
        RETURN;
    END IF;

    -- Loop through all channels
    FOR channel_record IN 
        SELECT id, name, link FROM public.channels WHERE link IS NOT NULL
    LOOP
        -- Extract username from link
        clean_username := REPLACE(REPLACE(REPLACE(channel_record.link, 'https://t.me/', ''), 'http://t.me/', ''), '@', '');
        
        IF clean_username IS NOT NULL AND clean_username != '' THEN
            -- Make async HTTP request
            SELECT net.http_get(
                url := 'https://api.telegram.org/bot' || bot_token || '/getChatMemberCount?chat_id=@' || clean_username,
                headers := jsonb_build_object('Content-Type', 'application/json')
            ) INTO request_id;
            
            RAISE NOTICE 'Requested member count for %: request_id=%', channel_record.name, request_id;
        END IF;
        
        -- Small delay to avoid rate limiting
        PERFORM pg_sleep(0.5);
    END LOOP;
END;
$$;

-- Schedule the cron job to run daily at 4:00 AM
SELECT cron.schedule(
    'update-member-counts',
    '0 4 * * *',  -- Every day at 04:00
    'SELECT process_all_channel_member_counts()'
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_all_channel_member_counts TO service_role;

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- To manually trigger:
-- SELECT process_all_channel_member_counts();

-- To unschedule:
-- SELECT cron.unschedule('update-member-counts');
