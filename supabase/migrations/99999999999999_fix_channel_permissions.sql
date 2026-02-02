-- ==========================================
-- KANAL EKLEME HATASI ÇÖZÜMÜ (400 Bad Request)
-- ==========================================

-- Sorun 1: 'contact_info' ve 'member_count' sütunları eksik olabilir.
-- Sorun 2: Kullanıcıların kanal ekleme (INSERT) yetkisi yoktu.

-- 1. EKSİK SÜTUNLARI EKLE
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS contact_info text,
ADD COLUMN IF NOT EXISTS member_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'; -- Onay bekliyor durumu

-- 2. KANAL EKLEME İZNİ VER (INSERT POLICY)
-- Kullanıcılar sadece kendi owner_id'leri ile kanal ekleyebilir.
DROP POLICY IF EXISTS "Users can insert own channels" ON public.channels;
CREATE POLICY "Users can insert own channels"
ON public.channels
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
);

-- 3. KANAL GÜNCELLEME İZNİ VER (UPDATE POLICY)
-- Kullanıcılar sadece kendi kanallarını güncelleyebilir
DROP POLICY IF EXISTS "Users can update own channels" ON public.channels;
CREATE POLICY "Users can update own channels"
ON public.channels
FOR UPDATE
USING (auth.uid() = owner_id);

-- 4. KANAL SİLME İZNİ VER (DELETE POLICY)
DROP POLICY IF EXISTS "Users can delete own channels" ON public.channels;
CREATE POLICY "Users can delete own channels"
ON public.channels
FOR DELETE
USING (auth.uid() = owner_id);

-- 5. ADMINLER HER ŞEYİ YAPABİLSİN
DROP POLICY IF EXISTS "Admins can do everything on channels" ON public.channels;
CREATE POLICY "Admins can do everything on channels"
ON public.channels
FOR ALL
TO authenticated
USING (public.get_my_role() = 'admin');
