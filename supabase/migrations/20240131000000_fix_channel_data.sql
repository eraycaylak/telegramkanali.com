-- ═══════════════════════════════════════════════════════════════════════════
-- SUPABASE KANAL VERİ DÜZELTME SCRIPTI
-- ═══════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ ADIM 1: SORUNLU KANALLARI TESPİT ET (SADECE GÖRÜNTÜLEME)               │
-- │ Önce bu sorguları çalıştırıp sonuçları kontrol et                      │
-- └─────────────────────────────────────────────────────────────────────────┘

-- image alanı boş veya null olan kanalları bul
SELECT id, name, slug, image, member_count, stats
FROM channels
WHERE image IS NULL OR image = '' OR image = '/images/logo.png'
LIMIT 20;

-- member_count ve stats.subscribers boş olan kanalları bul
SELECT id, name, slug, member_count, stats
FROM channels
WHERE (member_count IS NULL OR member_count = 0)
  AND (stats IS NULL OR stats->>'subscribers' IS NULL OR stats->>'subscribers' = '')
LIMIT 20;

-- Toplam etkilenen kanal sayısı
SELECT 
  COUNT(*) FILTER (WHERE image IS NULL OR image = '' OR image = '/images/logo.png') as eksik_fotograf,
  COUNT(*) FILTER (WHERE member_count IS NULL OR member_count = 0) as eksik_uye_sayisi,
  COUNT(*) as toplam_kanal
FROM channels;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ ADIM 2: VARSAYILAN DEĞERLER İLE DÜZELT                                 │
-- │ Yukarıdaki sonuçları gördükten sonra bu UPDATE'leri çalıştır           │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Boş image alanlarını varsayılan placeholder ile doldur
-- (Bu sayede en azından bir şey görünür)
UPDATE channels
SET image = '/images/channel-placeholder.png'
WHERE image IS NULL OR image = '';

-- Alternatif: Telegram'dan çekilen profil fotoğrafı varsa stats içinden al
-- (Eğer stats içinde photo_url gibi bir alan varsa)
-- UPDATE channels
-- SET image = stats->>'photo_url'
-- WHERE (image IS NULL OR image = '') 
--   AND stats->>'photo_url' IS NOT NULL;

-- stats alanı null olanları boş obje ile başlat
UPDATE channels
SET stats = '{}'::jsonb
WHERE stats IS NULL;

-- stats.subscribers alanı yoksa varsayılan değer ekle
UPDATE channels
SET stats = jsonb_set(stats, '{subscribers}', '"0"')
WHERE stats->>'subscribers' IS NULL;

-- member_count null olanları 0 yap (en azından bir sayı görünsün)
UPDATE channels
SET member_count = 0
WHERE member_count IS NULL;


-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ ADIM 3: KONTROL                                                         │
-- │ Düzeltme sonrası kontrol et                                             │
-- └─────────────────────────────────────────────────────────────────────────┘

-- Düzeltme sonrası durum
SELECT 
  COUNT(*) FILTER (WHERE image IS NULL OR image = '') as hala_eksik_fotograf,
  COUNT(*) FILTER (WHERE member_count IS NULL) as hala_eksik_uye,
  COUNT(*) as toplam_kanal
FROM channels;

-- Son 10 kanalı kontrol et
SELECT id, name, image, member_count, stats->>'subscribers' as stats_subs
FROM channels
ORDER BY created_at DESC
LIMIT 10;
