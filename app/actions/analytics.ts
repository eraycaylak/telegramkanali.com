'use server';

import { supabase } from '@/lib/supabaseClient';

// Public Supabase client for analytics (RLS policies allow anonymous inserts)

export async function trackPageView(path: string) {
    try {
        const { error } = await supabase.rpc('increment_page_view', { p_path: path });

        if (error) {
            // Silently fail if function doesn't exist yet (migration not run)
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
        const { error } = await supabase.rpc('increment_channel_click', { p_channel_id: channelId });

        if (error) {
            console.warn('Analytics Error (ChannelClick):', error.message);
            // Fallback: update local count if RPC fails? No, just fail silently.
            return { error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        console.error('Analytics Exception:', err);
        return { error: err.message };
    }
}

export async function getSiteAnalytics(days = 30) {
    // Admin only function - implemented later or used directly in admin page
    return [];
}
