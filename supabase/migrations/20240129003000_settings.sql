-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read (everyone can see settings like logo)
CREATE POLICY "Allow public read" ON public.settings
    FOR SELECT USING (true);

-- Allow admin insert/update/delete
CREATE POLICY "Allow admin write" ON public.settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
    ('logo_url', '""'),
    ('site_title', '"Telegram Kanalları"'),
    ('ga_id', '""')
ON CONFLICT (key) DO NOTHING;
