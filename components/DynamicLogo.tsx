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
            <div
                className="rounded flex items-center justify-center overflow-hidden"
                style={{ width: '350px', height: '80px' }}
            >
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt="Telegram Kanalları"
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <div className="bg-[#444] w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Logo Alanı (350x80)
                    </div>
                )}
            </div>
        </Link>
    );
}
