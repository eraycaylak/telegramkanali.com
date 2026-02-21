-- =============================================
-- SAHİPSİZ KANAL KURTARMA - Genişletilmiş Versiyon
-- Mevcut kanalları kullanıcılarına atar
-- =============================================

-- 1. contact_info = email eşleşmesi (zaten var, tekrar çalıştır)
UPDATE public.channels
SET owner_id = p.id
FROM public.profiles p
WHERE public.channels.contact_info IS NOT NULL
  AND LOWER(TRIM(public.channels.contact_info)) = LOWER(TRIM(p.email))
  AND public.channels.owner_id IS NULL;

-- 2. contact_info = username eşleşmesi
UPDATE public.channels
SET owner_id = p.id
FROM public.profiles p
WHERE public.channels.contact_info IS NOT NULL
  AND p.username IS NOT NULL
  AND LOWER(TRIM(public.channels.contact_info)) = LOWER(TRIM(p.username))
  AND public.channels.owner_id IS NULL;

-- 3. auth.users tablosundan email eşleşmesi (profiles'ta email olmayan durumlar için)
UPDATE public.channels
SET owner_id = au.id
FROM auth.users au
WHERE public.channels.contact_info IS NOT NULL
  AND LOWER(TRIM(public.channels.contact_info)) = LOWER(TRIM(au.email))
  AND public.channels.owner_id IS NULL;

-- 4. Sadece tek kullanıcı varsa ve sahipsiz kanallar varsa, hepsini o kullanıcıya ata
-- (Küçük projeler için faydalı)
DO $$
DECLARE
  user_count integer;
  single_user_id uuid;
  orphan_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  SELECT COUNT(*) INTO orphan_count FROM public.channels WHERE owner_id IS NULL;
  
  IF user_count = 1 AND orphan_count > 0 THEN
    SELECT id INTO single_user_id FROM public.profiles LIMIT 1;
    UPDATE public.channels SET owner_id = single_user_id WHERE owner_id IS NULL;
    RAISE NOTICE 'Tek kullanıcı bulundu. % sahipsiz kanal % kullanıcıya atandı.', orphan_count, single_user_id;
  END IF;
END $$;

-- 5. Kalan sahipsiz kanalları logla
DO $$
DECLARE
  orphan_count integer;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM public.channels WHERE owner_id IS NULL;
  IF orphan_count > 0 THEN
    RAISE NOTICE 'UYARI: Hala % sahipsiz kanal var. Bunlar admin panelinden elle atanabilir.', orphan_count;
  ELSE
    RAISE NOTICE 'Tüm kanallar başarıyla sahiplendirildi!';
  END IF;
END $$;
