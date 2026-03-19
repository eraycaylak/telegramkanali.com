import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get('id');

    if (!channelId) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        // 1. Get the channel's actual join link
        const { data: channel, error: fetchError } = await supabase
            .from('channels')
            .select('join_link')
            .eq('id', channelId)
            .single();

        if (fetchError || !channel || !channel.join_link) {
            console.error('Error fetching channel for redirect:', fetchError);
            return NextResponse.redirect(new URL('/', request.url));
        }

        const destinationUrl = channel.join_link;

        // 2. Fire and forget the analytics tracking
        ; (async () => {
            try {
                const { error } = await supabase.rpc('increment_channel_click', { p_channel_id: channelId });
                if (error) console.error('Error recording click in /api/go:', error);
            } catch (err) {
                console.error('Exception recording click in /api/go:', err);
            }
        })();

        // 3. Perform the redirect
        // We use a 302 Found redirect, meaning it's temporary, so the browser doesn't cache it
        // and we can track every click.
        return NextResponse.redirect(destinationUrl, 302);

    } catch (err) {
        console.error('Unexpected error in /api/go route:', err);
        return NextResponse.redirect(new URL('/', request.url));
    }
}
