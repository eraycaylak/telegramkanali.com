-- Reklam yönetimi için gerekli sütunları ekle
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS ad_start_date timestamptz,
ADD COLUMN IF NOT EXISTS ad_end_date timestamptz,
ADD COLUMN IF NOT EXISTS ad_type text,
ADD COLUMN IF NOT EXISTS ad_notes text;

COMMENT ON COLUMN public.channels.ad_start_date IS 'Reklamın başlangıç tarihi';
COMMENT ON COLUMN public.channels.ad_end_date IS 'Reklamın bitiş tarihi';
COMMENT ON COLUMN public.channels.ad_type IS 'Reklam türü (featured, banner, story, vip_sponsor vb.)';
COMMENT ON COLUMN public.channels.ad_notes IS 'Reklamla ilgili özel notlar';
