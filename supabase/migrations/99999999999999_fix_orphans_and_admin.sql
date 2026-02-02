-- ==========================================
-- 1. KAYIP KANALLARI SAHİPLERİNE ATA (KURTARMA)
-- "contact_info" sütunundaki e-posta adresi "profiles" tablosundaki bir e-posta ile eşleşiyorsa,
-- o kanalın owner_id'sini o kullanıcının id'si yap.
-- ==========================================

UPDATE public.channels
SET owner_id = profiles.id
FROM public.profiles
WHERE 
  public.channels.contact_info = public.profiles.email 
  AND public.channels.owner_id IS NULL;


-- ==========================================
-- 2. ADMIN PANELİ: KULLANICILARI GÖRME SORUNU
-- Adminlerin "profiles" tablosunu okuyabilmesi için RLS politikası.
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Basit admin kontrolü (raw_user_meta_data veya profiles tablosundaki role göre)
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR 
  -- Alternatif: metadata içinde admin claim varsa (Supabase standartlarına göre değişebilir)
  auth.jwt() ->> 'role' = 'service_role'
);

-- ==========================================
-- 3. KENDİ PROFİLİNİ GÖRME (Çakışma Önleme)
-- Eğer admin değilse bile kullanıcı kendisini görebilmeli
-- ==========================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- ==========================================
-- 4. KANAL GÖRÜNÜRLÜĞÜ GARANTİSİ
-- Kullanıcı kendi kanalını her zaman görebilmeli
-- ==========================================
DROP POLICY IF EXISTS "Enable read access for own channels" ON public.channels;
CREATE POLICY "Enable read access for own channels"
ON public.channels
FOR SELECT
USING (
  auth.uid() = owner_id
);
