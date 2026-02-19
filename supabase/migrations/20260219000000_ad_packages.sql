-- Create a table for Ad Packages
create table if not exists public.ad_packages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  duration_text text not null, -- e.g., "1 Aylık", "3 Aylık"
  features jsonb default '[]'::jsonb, -- Array of strings
  icon text, -- Icon name from Lucide (e.g., "MonitorSmartphone", "Zap")
  badge text, -- e.g., "EN POPÜLER", "İNDİRİM"
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ad_packages enable row level security;

-- Policies
create policy "Public read access"
  on public.ad_packages for select
  using (true);

create policy "Admin full access"
  on public.ad_packages for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed initial data based on current page content
insert into public.ad_packages (title, description, price, duration_text, features, icon, badge, sort_order) values
('Anasayfa Banner', 'Sitenin en görünür alanında, tüm ziyaretçilerin gördüğü tepe reklam alanı.', 1500, '1 Aylık', '["%100 Görünürlük", "Masaüstü & Mobil Uyumlu", "GIF Desteği"]', 'MonitorSmartphone', 'EN POPÜLER', 1),
('Anasayfa Banner (3 Aylık)', 'Uzun süreli planlar için indirimli fiyat.', 3000, '3 Aylık', '["%100 Görünürlük", "İndirimli Fiyat", "GIF Desteği"]', 'MonitorSmartphone', 'İNDİRİM', 2),
('Pop-Up Reklam', 'Siteye giren herkese açılan, kapatılmadığı sürece ekranda kalan dev reklam.', 5000, '1 Aylık', '["En Yüksek Tıklama Oranı", "Tam Ekran Deneyimi", "Özel Tasarım Desteği", "Günlük Max 1 Gösterim"]', 'Zap', null, 3),
('Editörün Seçimi', 'Anasayfada "Editörün Seçtikleri" listesinde sabit yerleşim.', 2000, '6 Aylık', '["Uzun Süreli Görünürlük", "\"Güvenilir\" Rozeti Algısı", "Sabit Sıralama"]', 'Award', 'PRESTİJ', 4),
('Kategori Reklamı', 'Sadece ilgili kategoride (örn: Kripto veya Haber) en tepede çıkın.', 500, '1 Aylık', '["Hedefli Kitle", "Kategori Bazlı", "Uygun Fiyat"]', 'MousePointerClick', null, 5);
