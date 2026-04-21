import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const db = getAdminClient();
        let query = db
            .from('usdt_payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) {
            console.error('[USDT API] Fetch error:', error);
            return NextResponse.json({ data: [], error: error.message }, { status: 200 });
        }
        return NextResponse.json({ data: data || [] });
    } catch (err: any) {
        console.error('[USDT API] Critical error:', err);
        return NextResponse.json({ data: [], error: err?.message || 'Unknown error' }, { status: 200 });
    }
}
