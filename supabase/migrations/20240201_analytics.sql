-- Analytics Tables

-- 1. Site Genel İstatistikleri (Günlük Ziyaretçi ve Sayfa Görüntüleme)
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    path TEXT NOT NULL DEFAULT '/',
    page_views INTEGER DEFAULT 0,
    visitors INTEGER DEFAULT 0,
    UNIQUE(date, path)
);

-- 2. Kanal İstatistikleri (Günlük Tıklama ve Görüntüleme)
-- Channels tablosuna clicks kolonu ekle (toplam sayaç için)
ALTER TABLE channels ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;

-- Günlük detaylı takip için
CREATE TABLE IF NOT EXISTS channel_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clicks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0, -- Kanal detay görüntüleme
    UNIQUE(channel_id, date)
);

-- RLS (Row Level Security) Policies
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_stats ENABLE ROW LEVEL SECURITY;

-- Herkes istatistik yazabilsin (Anonim ziyaretçiler için)
CREATE POLICY "Allow anonymous insert/update on site_analytics"
ON site_analytics FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anonymous insert/update on channel_stats"
ON channel_stats FOR ALL
USING (true)
WITH CHECK (true);

-- Functions to increment counters atomically

-- Increment Site Views
CREATE OR REPLACE FUNCTION increment_page_view(p_path TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO site_analytics (date, path, page_views, visitors)
    VALUES (CURRENT_DATE, p_path, 1, 1) -- Visitors basitçe 1 artıyor, IP takibi yok
    ON CONFLICT (date, path)
    DO UPDATE SET page_views = site_analytics.page_views + 1;
END;
$$ LANGUAGE plpgsql;

-- Increment Channel Clicks
CREATE OR REPLACE FUNCTION increment_channel_click(p_channel_id UUID)
RETURNS void AS $$
BEGIN
    -- 1. Ana tablodaki toplam sayacı artır
    UPDATE channels SET clicks = clicks + 1 WHERE id = p_channel_id;

    -- 2. Günlük istatistik tablosunu güncelle
    INSERT INTO channel_stats (date, channel_id, clicks)
    VALUES (CURRENT_DATE, p_channel_id, 1)
    ON CONFLICT (channel_id, date)
    DO UPDATE SET clicks = channel_stats.clicks + 1;
END;
$$ LANGUAGE plpgsql;
