-- Güncel reklam fiyatlarını artırma taşıması.
-- Kullanıcı 50.000 gösterime harcanan trafik karşılığında alınan ücretin çok düşük olduğunu belirtti.
-- Eski CPM: ~10 Jeton / 1000 gösterim (Yaklaşık 25 TL)
-- Yeni CPM: ~50 Jeton / 1000 gösterim (Yaklaşık 125 TL) - Fiyatlar 5 kat artırıldı.

-- Update Featured Ads
UPDATE public.ad_pricing SET tokens_required = 250 WHERE ad_type = 'featured' AND views = 5000;
UPDATE public.ad_pricing SET tokens_required = 500 WHERE ad_type = 'featured' AND views = 10000;
UPDATE public.ad_pricing SET tokens_required = 1250 WHERE ad_type = 'featured' AND views = 25000;
UPDATE public.ad_pricing SET tokens_required = 2500 WHERE ad_type = 'featured' AND views = 50000;
UPDATE public.ad_pricing SET tokens_required = 4000 WHERE ad_type = 'featured' AND views = 80000;
UPDATE public.ad_pricing SET tokens_required = 5000 WHERE ad_type = 'featured' AND views = 100000;
UPDATE public.ad_pricing SET tokens_required = 7500 WHERE ad_type = 'featured' AND views = 150000;
UPDATE public.ad_pricing SET tokens_required = 10000 WHERE ad_type = 'featured' AND views = 200000;
UPDATE public.ad_pricing SET tokens_required = 15000 WHERE ad_type = 'featured' AND views = 300000;
UPDATE public.ad_pricing SET tokens_required = 20000 WHERE ad_type = 'featured' AND views = 400000;
UPDATE public.ad_pricing SET tokens_required = 25000 WHERE ad_type = 'featured' AND views = 500000;
UPDATE public.ad_pricing SET tokens_required = 50000 WHERE ad_type = 'featured' AND views = 1000000;
UPDATE public.ad_pricing SET tokens_required = 100000 WHERE ad_type = 'featured' AND views = 2000000;
UPDATE public.ad_pricing SET tokens_required = 150000 WHERE ad_type = 'featured' AND views = 3000000;

-- Update Banner Ads
UPDATE public.ad_pricing SET tokens_required = 250 WHERE ad_type = 'banner' AND views = 5000;
UPDATE public.ad_pricing SET tokens_required = 500 WHERE ad_type = 'banner' AND views = 10000;
UPDATE public.ad_pricing SET tokens_required = 1250 WHERE ad_type = 'banner' AND views = 25000;
UPDATE public.ad_pricing SET tokens_required = 2500 WHERE ad_type = 'banner' AND views = 50000;
UPDATE public.ad_pricing SET tokens_required = 4000 WHERE ad_type = 'banner' AND views = 80000;
UPDATE public.ad_pricing SET tokens_required = 5000 WHERE ad_type = 'banner' AND views = 100000;
UPDATE public.ad_pricing SET tokens_required = 7500 WHERE ad_type = 'banner' AND views = 150000;
UPDATE public.ad_pricing SET tokens_required = 10000 WHERE ad_type = 'banner' AND views = 200000;
UPDATE public.ad_pricing SET tokens_required = 15000 WHERE ad_type = 'banner' AND views = 300000;
UPDATE public.ad_pricing SET tokens_required = 20000 WHERE ad_type = 'banner' AND views = 400000;
UPDATE public.ad_pricing SET tokens_required = 25000 WHERE ad_type = 'banner' AND views = 500000;
UPDATE public.ad_pricing SET tokens_required = 50000 WHERE ad_type = 'banner' AND views = 1000000;
UPDATE public.ad_pricing SET tokens_required = 100000 WHERE ad_type = 'banner' AND views = 2000000;
UPDATE public.ad_pricing SET tokens_required = 150000 WHERE ad_type = 'banner' AND views = 3000000;

-- Update Story Ads (1 day) - Eskiden 10 Jetondu, şimdi 50 Jeton oldu (Günlük ~125 TL)
UPDATE public.ad_pricing SET tokens_required = 50 WHERE ad_type = 'story' AND views = 0;
