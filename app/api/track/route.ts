import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side tracking with IP+fingerprint deduplication
// This runs on the server, so we have access to the real IP address

const getTrackingClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
        auth: { persistSession: false }
    });
};

// Known bot user agents (server-side double check)
const BOT_UA_PATTERNS = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /Googlebot/i, /Bingbot/i,
    /Yandex/i, /Baiduspider/i, /facebookexternalhit/i, /Twitterbot/i,
    /linkedinbot/i, /Applebot/i, /WhatsApp/i, /Slackbot/i, /Discordbot/i,
    /TelegramBot/i, /AhrefsBot/i, /SemrushBot/i, /DotBot/i, /MJ12bot/i,
    /PetalBot/i, /headless/i, /PhantomJS/i, /Selenium/i, /puppeteer/i,
    /Lighthouse/i, /PTST/i, /GTmetrix/i, /prerender/i, /Mediapartners/i,
];

function isBotUA(ua: string): boolean {
    return BOT_UA_PATTERNS.some(p => p.test(ua));
}

// Simple hash for creating a dedup key from IP + fingerprint
function hashKey(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

export async function POST(req: NextRequest) {
    try {
        const ua = req.headers.get('user-agent') || '';

        // Server-side bot check
        if (isBotUA(ua)) {
            return NextResponse.json({ ok: true, filtered: 'bot' });
        }

        const body = await req.json();
        const { path, fingerprint, isNewVisitor: clientIsNew } = body;

        if (!path) {
            return NextResponse.json({ error: 'Missing path' }, { status: 400 });
        }

        // Get real IP from server headers
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || req.headers.get('cf-connecting-ip')
            || 'unknown';

        // Create a dedup key: hash(IP + fingerprint + date)
        const today = new Date().toISOString().split('T')[0];
        const dedupKey = hashKey(`${ip}_${fingerprint || 'none'}_${today}`);

        // Server-side dedup: check if this visitor was already counted today
        // We use a lightweight in-memory approach via RPC
        const supabase = getTrackingClient();

        const { data: exists } = await supabase
            .from('visitor_dedup')
            .select('id')
            .eq('dedup_key', dedupKey)
            .eq('date', today)
            .maybeSingle();

        const isActualNewVisitor = !exists;

        if (isActualNewVisitor) {
            // Record dedup entry
            await supabase
                .from('visitor_dedup')
                .insert({ dedup_key: dedupKey, date: today, path })
                .then(() => {});
        }

        // Track the page view with accurate visitor count
        await supabase.rpc('increment_page_view', {
            p_path: path,
            p_is_new_visitor: isActualNewVisitor,
        });

        return NextResponse.json({ ok: true, newVisitor: isActualNewVisitor });
    } catch (err) {
        console.error('[TRACK] Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
