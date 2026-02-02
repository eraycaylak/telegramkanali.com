-- ==========================================
-- BOT TOKEN OLUŞTURMA HATASI ÇÖZÜMÜ
-- ==========================================

-- 1. BOT TOKEN SÜTUNUNU GARANTİLE
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS bot_token text,
ADD COLUMN IF NOT EXISTS bot_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS telegram_chat_id text;

-- 2. GÜNCELLEME İZNİNİ (UPDATE POLICY) GÜÇLENDİR
-- Sadece owner_id'si eşleşenler güncelleyebilir AMA tüm sütunları değil.
-- Güvenlik için sadece belirli sütunlara izin verebiliriz ama şimdilik genel izin verelim.

DROP POLICY IF EXISTS "Users can update own channels" ON public.channels;

CREATE POLICY "Users can update own channels"
ON public.channels
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 3. HATA VEREN DİĞER OLASILIKLAR
-- Eğer 'bot_token' unique constraint varsa ve null değerlerle çakışıyorsa:
-- (Opsiyonel: Eğer hata devam ederse burayı açın)
-- ALTER TABLE public.channels DROP CONSTRAINT IF EXISTS channels_bot_token_key;
-- ALTER TABLE public.channels ADD CONSTRAINT channels_bot_token_key UNIQUE (bot_token);
