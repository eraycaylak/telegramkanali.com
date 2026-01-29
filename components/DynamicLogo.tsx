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

        return data?.value || null;
    } catch {
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
                    style={{ height: '80px', width: 'auto', maxWidth: '350px' }}
                />
            ) : (
                <div
                    className="bg-[#444] rounded flex items-center justify-center text-gray-500 text-sm"
                    style={{ width: '350px', height: '80px' }}
                >
                    Logo Alanı (350x80)
                </div>
            )}
        </Link>
    );
}
