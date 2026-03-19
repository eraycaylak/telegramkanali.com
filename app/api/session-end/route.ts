import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, sessionSeconds } = body;

        if (!visitorId || !sessionSeconds) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Clamp session to reasonable bounds (1s - 1hr)
        const clampedSeconds = Math.max(1, Math.min(3600, sessionSeconds));

        await supabase.rpc('upsert_visitor_profile', {
            p_visitor_id: visitorId,
            p_page: '',
            p_interests: [],
            p_session_seconds: clampedSeconds,
            p_device_type: null,
            p_referrer: null,
            p_country: null
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
