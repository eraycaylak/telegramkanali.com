-- =========================================================
-- KESİN ÇÖZÜM: VERİTABANI ONARIM VE ADMIN YETKİLENDİRME
-- =========================================================

-- 1. PROFILES TABLOSUNU OLUŞTUR (Eğer Yoksa)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  telegram_username text,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. DİĞER TABLOLAR (Deposits, Analytics, Categories, Channels)
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'USDT',
  status text DEFAULT 'pending',
  tx_hash text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.bot_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    joins INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    UNIQUE(channel_id, date)
);
ALTER TABLE public.bot_analytics ENABLE ROW LEVEL SECURITY;

-- Channels ve Categories tabloları zaten vardı ama policy hatası almamak için güvenli policy oluşturma
DO $$ 
BEGIN
    -- Categories Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users' AND tablename = 'categories') THEN
        CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
    END IF;

    -- Channels Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users' AND tablename = 'channels') THEN
        CREATE POLICY "Enable read access for all users" ON public.channels FOR SELECT USING (true);
    END IF;
END $$;


-- 3. PROFILES POLICIES (Hata vermemesi için önce silip sonra oluşturuyoruz)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. BOT ANALYTICS POLICIES
DROP POLICY IF EXISTS "Allow public read of bot_analytics" ON public.bot_analytics;
DROP POLICY IF EXISTS "Allow service_role insert/update" ON public.bot_analytics;
CREATE POLICY "Allow public read of bot_analytics" ON public.bot_analytics FOR SELECT USING (true);
CREATE POLICY "Allow service_role insert/update" ON public.bot_analytics FOR ALL USING (true) WITH CHECK (true);


-- 5. KRİTİK ADIM: MEVCUT KULLANICILARI PROFILE AKTAR (BACKFILL)
-- Siz kayıt oldunuz ama tablo yoktu, bu yüzden profiliniz oluşmadı.
-- Bu komut, Auth tablosundaki tüm kullanıcıları Profiles tablosuna kopyalar.
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- 6. SİZİ ADMIN YAPMA (HEDEF MAİL ADRESİ)
UPDATE public.profiles
SET role = 'admin', balance = 9999
WHERE email = 'eraycayylak1@gmail.com';


-- 7. OTOMATİK TRIGGER (Bundan sonraki kayıtlar için)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
