import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Server component - fetches logo from database
async function getLogoUrl(): Promise<string | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'logo_url')
            .single();

        if (!data?.value) return null;

        // Handle JSONB - value could be the URL directly or need parsing
        let url = data.value;
        if (typeof url === 'string') {
            // Remove surrounding quotes if present (from JSONB)
            url = url.replace(/^"|"$/g, '');
        }

        return url || null;
    } catch (error) {
        console.error('[LOGO] Error:', error);
        return null;
    }
}

export default async function DynamicLogo() {
    const logoUrl = await getLogoUrl();

    return (
        <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition">
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt="Telegram Kanalları"
                    style={{
                        height: '100px',
                        width: 'auto',
                        maxWidth: '400px',
                        objectFit: 'contain'
                    }}
                />
            ) : (
                <div
                    className="bg-[#444] rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold"
                    style={{ width: '300px', height: '100px' }}
                >
                    LOGO
                </div>
            )}
        </Link>
    );
}
