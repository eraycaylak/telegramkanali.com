-- 1. ANALIZ TABLOSU (Eğer Yoksa Oluşturur)
CREATE TABLE IF NOT EXISTS bot_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    joins INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    UNIQUE(channel_id, date)
);

-- RLS (Tablo Güvenliği) Açma
ALTER TABLE bot_analytics ENABLE ROW LEVEL SECURITY;

-- 2. GÜVENLİK POLİTİKALARI (Adminlerin her şeyi görmesi için)
-- Önce eski hatalı politikaları temizleyelim (Varsa hata vermez)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public read of bot_analytics" ON bot_analytics;
DROP POLICY IF EXISTS "Allow service_role insert/update" ON bot_analytics;

-- Yeni Politikalar
-- Admin herkesi görebilsin
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Kullanıcı sadece kendini görebilsin
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id
);

-- Bot analizleri herkese açık (okuma)
CREATE POLICY "Allow public read of bot_analytics"
ON bot_analytics FOR SELECT
USING (true);

-- Bot yazma izni (servis rolü için)
CREATE POLICY "Allow service_role insert/update"
ON bot_analytics FOR ALL
USING (true)
WITH CHECK (true);

-- 3. SİZİ ADMIN YAPMA KOMUTU (E-POSTANIZI YAZIN)
-- Aşağıdaki e-posta adresini kendi mail adresinizle değiştirin
UPDATE profiles
SET role = 'admin', balance = 9999
WHERE email = 'eray@example.com'; -- <-- BURAYA KENDİ MAİLİNİZİ YAZIN
