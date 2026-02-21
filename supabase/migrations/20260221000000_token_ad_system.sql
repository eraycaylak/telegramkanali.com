-- =============================================
-- TOKEN-BASED VIEW AD SYSTEM
-- grupbul.com stilinde jeton bazlı reklam sistemi
-- =============================================

-- 1. Token Packages (Jeton Paketleri)
-- Kullanıcının satın alabileceği jeton paketleri
CREATE TABLE IF NOT EXISTS public.token_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tokens integer NOT NULL,            -- Jeton miktarı (50, 100, 250, 500, vb.)
  price_tl numeric NOT NULL,          -- TL fiyat
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read token packages"
  ON public.token_packages FOR SELECT USING (true);

CREATE POLICY "Admin manage token packages"
  ON public.token_packages FOR ALL
  USING (public.is_admin());

-- Seed: grupbul.com fiyat listesine göre
INSERT INTO public.token_packages (tokens, price_tl, sort_order) VALUES
  (50,    127.89,  1),
  (100,   243.60,  2),
  (250,   567.99,  3),
  (500,   1217.59, 4),
  (800,   1798.99, 5),
  (1000,  2029.59, 6),
  (1500,  3044.59, 7),
  (2000,  3775.39, 8),
  (3000,  5277.59, 9),
  (4000,  6901.59, 10),
  (5000,  8038.39, 11),
  (10000, 15021.59, 12),
  (20000, 28419.59, 13),
  (30000, 41411.59, 14);

-- 2. Ad Pricing (Reklam Fiyatlandırma - gösterim bazlı)
-- Her reklam tipi için gösterim başına jeton fiyatı
CREATE TABLE IF NOT EXISTS public.ad_pricing (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_type text NOT NULL CHECK (ad_type IN ('featured', 'banner', 'story')),
  views integer NOT NULL,              -- Gösterim sayısı (5000, 10000, vb.)
  tokens_required integer NOT NULL,    -- Gereken jeton
  price_tl numeric NOT NULL,           -- TL karşılığı (referans)
  label text,                          -- "5.000 kişi gösterim" gibi
  note text,                           -- "+18 kategorisi hariç" gibi
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ad pricing"
  ON public.ad_pricing FOR SELECT USING (true);

CREATE POLICY "Admin manage ad pricing"
  ON public.ad_pricing FOR ALL
  USING (public.is_admin());

-- Seed: Öne Çıkarma fiyatları
INSERT INTO public.ad_pricing (ad_type, views, tokens_required, price_tl, label, sort_order) VALUES
  ('featured', 5000,    50,    127.89,  '5.000 kişi gösterim',       1),
  ('featured', 10000,   100,   243.60,  '10.000 kişi gösterim',      2),
  ('featured', 25000,   250,   567.99,  '25.000 kişi gösterim',      3),
  ('featured', 50000,   500,   1217.59, '50.000 kişi gösterim',      4),
  ('featured', 80000,   800,   1798.99, '80.000 kişi gösterim',      5),
  ('featured', 100000,  1000,  2029.59, '100.000 kişi gösterim',     6),
  ('featured', 150000,  1500,  3044.59, '150.000 kişi gösterim',     7),
  ('featured', 200000,  2000,  3775.39, '200.000 kişi gösterim',     8),
  ('featured', 300000,  3000,  5277.59, '300.000 kişi gösterim',     9),
  ('featured', 400000,  4000,  6901.59, '400.000 kişi gösterim',    10),
  ('featured', 500000,  5000,  8038.39, '500.000 kişi gösterim',    11),
  ('featured', 1000000, 10000, 15021.59,'1.000.000 kişi gösterim',  12),
  ('featured', 2000000, 20000, 28419.59,'2.000.000 kişi gösterim',  13),
  ('featured', 3000000, 30000, 41411.59,'3.000.000 kişi gösterim',  14);

-- Seed: Banner fiyatları (+18 kategorisi hariç notu ile)
INSERT INTO public.ad_pricing (ad_type, views, tokens_required, price_tl, label, note, sort_order) VALUES
  ('banner', 5000,    50,    127.89,  '5.000 kişi gösterim',    '+18 kategorisi hariç', 1),
  ('banner', 10000,   100,   243.60,  '10.000 kişi gösterim',   '+18 kategorisi hariç', 2),
  ('banner', 25000,   250,   567.99,  '25.000 kişi gösterim',   '+18 kategorisi hariç', 3),
  ('banner', 50000,   500,   1217.59, '50.000 kişi gösterim',   '+18 kategorisi hariç', 4),
  ('banner', 80000,   800,   1798.99, '80.000 kişi gösterim',   '+18 kategorisi hariç', 5),
  ('banner', 100000,  1000,  2029.59, '100.000 kişi gösterim',  '+18 kategorisi hariç', 6),
  ('banner', 150000,  1500,  3044.59, '150.000 kişi gösterim',  '+18 kategorisi hariç', 7),
  ('banner', 200000,  2000,  3775.39, '200.000 kişi gösterim',  '+18 kategorisi hariç', 8),
  ('banner', 300000,  3000,  5277.59, '300.000 kişi gösterim',  '+18 kategorisi hariç', 9),
  ('banner', 400000,  4000,  6901.59, '400.000 kişi gösterim',  '+18 kategorisi hariç', 10),
  ('banner', 500000,  5000,  8038.39, '500.000 kişi gösterim',  '+18 kategorisi hariç', 11),
  ('banner', 1000000, 10000, 15021.59,'1.000.000 kişi gösterim','+18 kategorisi hariç', 12),
  ('banner', 2000000, 20000, 28419.59,'2.000.000 kişi gösterim','+18 kategorisi hariç', 13),
  ('banner', 3000000, 30000, 41411.59,'3.000.000 kişi gösterim','+18 kategorisi hariç', 14);

-- Seed: Hikaye fiyatları (süre bazlı - 1 gün = 10 jeton)
INSERT INTO public.ad_pricing (ad_type, views, tokens_required, price_tl, label, sort_order) VALUES
  ('story', 0, 10, 0, '1 gün', 1);

-- 3. Ad Campaigns (Reklam Kampanyaları)
-- Kullanıcıların oluşturduğu gösterim bazlı reklam kampanyaları
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  ad_type text NOT NULL CHECK (ad_type IN ('featured', 'banner', 'story')),
  
  -- Gösterim takibi
  total_views integer NOT NULL DEFAULT 0,      -- Hedef gösterim
  current_views integer NOT NULL DEFAULT 0,    -- Mevcut gösterim
  
  -- Jeton bilgisi
  tokens_spent integer NOT NULL DEFAULT 0,     -- Harcanan jeton
  
  -- Durum
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  
  -- Hikaye için bitiş tarihi
  expires_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi reklamlarını görebilir
CREATE POLICY "Users can view own campaigns"
  ON public.ad_campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcı kendi reklamlarını oluşturabilir
CREATE POLICY "Users can create own campaigns"
  ON public.ad_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin tüm kampanyaları görebilir
CREATE POLICY "Admin view all campaigns"
  ON public.ad_campaigns FOR SELECT
  USING (public.is_admin());

-- Service role update (for view tracking)
CREATE POLICY "Service update campaigns"
  ON public.ad_campaigns FOR UPDATE
  USING (true);

-- 4. Token Transactions (Jeton İşlem Geçmişi)
-- Tüm jeton hareketlerinin kaydı
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'admin_grant')),
  amount integer NOT NULL,              -- + veya - jeton miktarı
  description text,                     -- "500 Jeton Satın Alma", "Banner Reklam - 250 Jeton"
  reference_id uuid,                    -- İlgili kampanya veya ödeme ID'si
  balance_after integer NOT NULL,       -- İşlem sonrası bakiye
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service insert transactions"
  ON public.token_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin view all transactions"
  ON public.token_transactions FOR SELECT
  USING (public.is_admin());

-- 5. Profiles tablosuna token_balance kolonu ekle (balance yerine daha açık isim)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS token_balance integer DEFAULT 0;

-- 6. Aktif kampanyaları bulmak için index
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active 
  ON public.ad_campaigns(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user 
  ON public.ad_campaigns(user_id);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user 
  ON public.token_transactions(user_id);
