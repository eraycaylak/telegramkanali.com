-- Migration: SEO Pages and Category SEO Fields
-- For Programmatic SEO implementation

-- 1. Create seo_pages table for landing pages
CREATE TABLE IF NOT EXISTS public.seo_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_description TEXT,
    h1 TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    related_categories TEXT[],
    target_keywords TEXT[],
    word_count INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add SEO fields to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS seo_intro TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 3. Add SEO fields to channels table
ALTER TABLE public.channels 
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS related_channels UUID[];

-- 4. Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON public.seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_published ON public.seo_pages(published);

-- 5. Enable RLS on seo_pages
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- 6. Public read policy for seo_pages
CREATE POLICY "Public can read published seo_pages" ON public.seo_pages
    FOR SELECT USING (published = true);

-- 7. Service role full access for seo_pages
CREATE POLICY "Service role full access seo_pages" ON public.seo_pages
    FOR ALL USING (true);

-- Done
