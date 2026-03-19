-- Add image_alignment to banners table to allow cropping adjustment for strict 800x200 banners
ALTER TABLE public.banners
ADD COLUMN IF NOT EXISTS image_alignment text DEFAULT 'center' CHECK (image_alignment IN ('top', 'center', 'bottom'));
