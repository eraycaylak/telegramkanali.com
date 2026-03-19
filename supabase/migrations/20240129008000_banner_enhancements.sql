-- Migration to add badge fields to banners table
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS badge_text text,
ADD COLUMN IF NOT EXISTS badge_bg_color text DEFAULT 'bg-red-600';

-- Force refresh the schema cache if needed (usually automatic in Supabase client)
