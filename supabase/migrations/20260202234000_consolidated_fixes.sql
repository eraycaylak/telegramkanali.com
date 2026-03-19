-- ==========================================
-- 1. BENZERSİZ KANAL LİNKİ KORUMASI
-- ==========================================
ALTER TABLE public.channels 
ADD CONSTRAINT channels_join_link_key UNIQUE (join_link);

-- ==========================================
-- 2. RLS VE ADMIN FONKSİYONLARI (Tekrar Garanti Olsun)
-- ==========================================

-- Güvenli Admin Kontrolü
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profil Politikaları
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = id);

-- Kanal Politikaları
DROP POLICY IF EXISTS "Enable read access for own channels" ON public.channels;
CREATE POLICY "Enable read access for own channels" ON public.channels FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can view all channels" ON public.channels;
CREATE POLICY "Admins can view all channels" ON public.channels FOR SELECT TO authenticated USING (public.is_admin());

-- ==========================================
-- 3. SAHİPSİZ KANAL KURTARMA (Otomatik)
-- ==========================================
UPDATE public.channels
SET owner_id = profiles.id
FROM public.profiles
WHERE public.channels.contact_info = public.profiles.email 
AND public.channels.owner_id IS NULL;
