-- profiles tablosuna permissions JSONB kolonu ekle
-- Bu kolon admin panelinde editör kullanıcıların yetkilerini saklar
-- Örnek: { "manage_blog": true, "manage_channels": false, ... }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT NULL;

-- Mevcut admin kullanıcının rolünü kontrol etmek için index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
