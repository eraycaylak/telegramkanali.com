-- Migration to add advanced styling fields to banners table
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'normal', -- 'small', 'normal', 'large', 'xl'
ADD COLUMN IF NOT EXISTS text_align text DEFAULT 'left', -- 'left', 'center', 'right'
ADD COLUMN IF NOT EXISTS overlay_opacity integer DEFAULT 40, -- 0 to 100
ADD COLUMN IF NOT EXISTS floating_logo_url text,
ADD COLUMN IF NOT EXISTS badge_text text,
ADD COLUMN IF NOT EXISTS badge_bg_color text DEFAULT 'bg-red-600';

-- Force schema cache refresh (usually automatic)
