-- =========================================================
-- SONSUZ DÖNGÜ (500 ERROR) DÜZELTME YAMASI
-- =========================================================

-- Sorun: Admin olup olmadığınızı kontrol ederken veritabanı kendi kuyruğunu kovalıyor (Loop).
-- Çözüm: Yetki kontrolünü "Özel Yetkili Fonksiyon" (Security Definer) ile yaparak döngüyü kırmak.

-- 1. YETKİ KONTROL FONKSİYONU (RLS Kurallarına takılmadan okur)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- <--- BU SATIR ÇOK ÖNEMLİ (Loop'u kırar)


-- 2. HATALI İZİNLERİ SİL
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 3. YENİ (DÜZELTİLMİŞ) İZİNLERİ EKLE
-- Kendi profilini görme (Standart)
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admin her şeyi görebilir (Fonksiyon kullanarak)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT TO authenticated 
USING (public.get_my_role() = 'admin');

-- Profil güncelleme
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. KONTROL AMAÇLI: HESABINIZIN ADMIN VE BAKİYESİNİN TAM OLDUĞUNA EMİN OLALIM
INSERT INTO public.profiles (id, email, role, balance)
SELECT id, email, 'admin', 9999
FROM auth.users
WHERE email = 'eraycayylak1@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', balance = 9999;
