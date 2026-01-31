import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Server component - fetches logo from database
async function getLogoUrl(): Promise<string | null> {
    try {
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
                    className="h-10 md:h-[100px] w-auto max-w-[200px] md:max-w-[400px] object-contain"
                />
            ) : (
                <div
                    className="bg-[#444] rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold h-10 w-32 md:h-[100px] md:w-[300px]"
                >
                    LOGO
                </div>
            )}
        </Link>
    );
}
