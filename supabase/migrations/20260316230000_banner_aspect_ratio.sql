-- Add aspect_ratio to banners table to allow different banner heights
ALTER TABLE public.banners
ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '4:1' CHECK (aspect_ratio IN ('auto', '4:1', '8:1', '21:9', '16:9'));
