-- ==========================================
-- EKSİK 'owner_id' SÜTUNU VE DİĞERLERİNİ EKLEME YAMASI
-- ==========================================

-- 1. ÖNCE SÜTUNLARI EKLE (Sıralama Önemli!)
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS contact_info text,
ADD COLUMN IF NOT EXISTS member_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 2. owner_id VARSAYILAN DEĞERİNİ AYARLA (Hataları önler)
ALTER TABLE public.channels ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- 3. ŞİMDİ İZİNLERİ (POLICIES) TANIMLA
DROP POLICY IF EXISTS "Users can insert own channels" ON public.channels;
CREATE POLICY "Users can insert own channels"
ON public.channels
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
);

DROP POLICY IF EXISTS "Users can update own channels" ON public.channels;
CREATE POLICY "Users can update own channels"
ON public.channels
FOR UPDATE
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own channels" ON public.channels;
CREATE POLICY "Users can delete own channels"
ON public.channels
FOR DELETE
USING (auth.uid() = owner_id);

-- 4. KANAL LİSTELEME İZNİ (Eğer yoksa)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.channels;
CREATE POLICY "Enable read access for all users" 
ON public.channels FOR SELECT 
USING (true);
