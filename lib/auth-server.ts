import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Netlify-uyumlu auth helper.
 * cookies() API yerine request headers'dan JWT parse eder.
 * Server Components ve Server Actions içinde kullanılabilir.
 */
export async function getServerUser() {
    try {
        const headersList = await headers();
        const cookieHeader = headersList.get('cookie') || '';

        // Cookie string'i map'e çevir
        const cookieMap: Record<string, string> = {};
        cookieHeader.split(';').forEach(c => {
            const eqIdx = c.indexOf('=');
            if (eqIdx === -1) return;
            const k = c.slice(0, eqIdx).trim();
            const v = c.slice(eqIdx + 1).trim();
            cookieMap[k] = v;
        });

        // Supabase auth token cookie key'ini bul (sb-xxx-auth-token)
        const tokenKey = Object.keys(cookieMap).find(k =>
            k.startsWith('sb-') && k.endsWith('-auth-token')
        );

        if (!tokenKey) return null;

        let accessToken: string | null = null;

        try {
            const raw = decodeURIComponent(cookieMap[tokenKey]);
            let parsed: any;
            if (raw.startsWith('base64-')) {
                parsed = JSON.parse(Buffer.from(raw.slice(7), 'base64').toString());
            } else {
                parsed = JSON.parse(raw);
            }
            // Supabase v2 farklı yapılarda saklayabilir
            if (parsed?.access_token) accessToken = parsed.access_token;
            else if (Array.isArray(parsed) && parsed[0]?.access_token) accessToken = parsed[0].access_token;
        } catch { }

        // Fallback: Authorization header
        if (!accessToken) {
            const authHeader = headersList.get('authorization') || '';
            if (authHeader.startsWith('Bearer ')) accessToken = authHeader.slice(7);
        }

        if (!accessToken) return null;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: { persistSession: false, autoRefreshToken: false },
                global: { headers: { Authorization: `Bearer ${accessToken}` } },
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error) return null;
        return user;
    } catch {
        return null;
    }
}
