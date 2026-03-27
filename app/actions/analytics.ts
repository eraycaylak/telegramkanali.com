'use server';

import { createClient } from '@supabase/supabase-js';

// Create a fast, stateless client for anonymous tracking
const getTrackingClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
        auth: { persistSession: false }
    });
};

export async function trackPageView(path: string, isNewVisitor: boolean = false) {
    try {
        const supabase = getTrackingClient();
        const { error } = await supabase.rpc('increment_page_view', {
            p_path: path,
            p_is_new_visitor: isNewVisitor
        });

        if (error) {
            console.warn('Analytics Error (PageView):', error.message);
            return { error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        console.error('Analytics Exception:', err);
        return { error: err.message };
    }
}

export async function trackChannelClick(channelId: string) {
    try {
        const supabase = getTrackingClient();
        const { error } = await supabase.rpc('increment_channel_click', { p_channel_id: channelId });

        if (error) {
            console.warn('Analytics Error (ChannelClick):', error.message);
            return { error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        console.error('Analytics Exception:', err);
        return { error: err.message };
    }
}

export async function getSiteAnalytics(days = 30) {
    return [];
}
