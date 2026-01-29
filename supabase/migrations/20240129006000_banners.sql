-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('homepage', 'category')),
    category_id text REFERENCES public.categories(id), -- Changed from uuid to text
    title text NOT NULL,
    subtitle text,
    image_url text,
    link_url text,
    button_text text DEFAULT 'Katıl',
    bg_color text DEFAULT 'from-blue-900 to-blue-800',
    active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_banners_type ON public.banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_category_id ON public.banners(category_id);
