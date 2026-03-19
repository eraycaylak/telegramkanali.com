-- pg_cron ile Edge Function çağırma
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- 1. Mevcut cron job'u kaldır (varsa)
SELECT cron.unschedule('update-member-counts');

-- 2. Yeni cron job: Her gece 04:00'te Edge Function'ı çağır
SELECT cron.schedule(
    'update-member-counts',
    '0 4 * * *',
    $$
    SELECT net.http_post(
        url := 'https://bzitsygzrfkdqmuiolbe.supabase.co/functions/v1/update-member-counts',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer sb_publishable_MI-KsM_qHhNTJ4s1DPfEjA_ailjWmRp'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- 3. Cron job'ları görüntüle
SELECT * FROM cron.job;

-- 4. Manuel test için:
-- SELECT net.http_post(
--     url := 'https://bzitsygzrfkdqmuiolbe.supabase.co/functions/v1/update-member-counts',
--     headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer sb_publishable_MI-KsM_qHhNTJ4s1DPfEjA_ailjWmRp'
--     ),
--     body := '{}'::jsonb
-- );
