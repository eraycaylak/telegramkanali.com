-- ==========================================
-- TELEGRAMKANALI.COM MASTER SETUP SCRIPT (FIXED)
-- ==========================================

-- 1. KATEGORİLER VE KANALLAR (Temel Tablolar)
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null,
  description text,
  icon text,
  subcategories text[]
);
alter table public.categories enable row level security;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
create policy "Enable read access for all users" on public.categories for select using (true);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id text references public.categories(id),
  subcategories text[],
  join_link text,
  stats jsonb default '{}'::jsonb,
  image text,
  tags text[],
  verified boolean default false,
  featured boolean default false,
  language text default 'tr',
  rating integer default 0,
  created_at timestamptz default now(),
  clicks integer default 0
);
alter table public.channels enable row level security;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.channels;
create policy "Enable read access for all users" on public.channels for select using (true);


-- 2. KULLANICI PROFİL SİSTEMİ (PROFILES)
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

-- Mevcut policy'leri temizle (conflict olmasın)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Yeni Policy'ler
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 3. BAKİYE VE ÖDEME SİSTEMİ (DEPOSITS)
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'USDT',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  tx_hash text,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users can create their own deposits" ON public.deposits;

CREATE POLICY "Users can view their own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. BOT ANALİZ SİSTEMİ (BOT_ANALYTICS)
CREATE TABLE IF NOT EXISTS public.bot_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    joins INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    UNIQUE(channel_id, date)
);
ALTER TABLE public.bot_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of bot_analytics" ON public.bot_analytics;
DROP POLICY IF EXISTS "Allow service_role insert/update" ON public.bot_analytics;

CREATE POLICY "Allow public read of bot_analytics" ON public.bot_analytics FOR SELECT USING (true);
CREATE POLICY "Allow service_role insert/update" ON public.bot_analytics FOR ALL USING (true) WITH CHECK (true);


-- 5. KANALLAR TABLOSUNU GÜNCELLE (USER BAĞLANTISI)
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS bot_token text UNIQUE;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS bot_enabled boolean DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS telegram_chat_id text;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';


-- 6. OTOMATİK PROFİL OLUŞTURMA (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 7. ADMIN YETKİSİ VERME (LÜTFEN MAİL ADRESİNİZİ YAZIN)
-- Not: Eğer profiliniz henüz oluşmadıysa bu komut çalışmaz. Önce siteye üye olun.
-- Üye iseniz aşağıya mailinizi yazıp tek başına bu satırı çalıştırabilirsiniz.
-- UPDATE profiles SET role = 'admin', balance = 1000 WHERE email = 'SİZİN_MAİL_ADRESİNİZ';
