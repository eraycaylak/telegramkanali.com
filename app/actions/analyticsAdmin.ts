'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

const supabase = getAdminClient();

export async function getAnalyticsSummary() {
    try {
        // 1. Get Page View Stats (Group by path)
        const { data: pageStats, error: pageError } = await supabase
            .from('site_analytics')
            .select('path, page_views, visitors, date')
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
            .order('date', { ascending: false });

        if (pageError) {
            console.error('Analytics Fetch Error (Pages):', pageError);
            return null;
        }

        // Aggregate by path
        const pathAggregation: any = {};
        pageStats?.forEach(stat => {
            if (!pathAggregation[stat.path]) {
                pathAggregation[stat.path] = { path: stat.path, total_views: 0, total_visitors: 0 };
            }
            pathAggregation[stat.path].total_views += stat.page_views;
            pathAggregation[stat.path].total_visitors += stat.visitors;
        });

        const pageViews = Object.values(pathAggregation).sort((a: any, b: any) => b.total_views - a.total_views);

        // 2. Get Channel Clicks (Group by channel)
        // Join with channels table to get name and image
        // Since Supabase join syntax is tricky with simple client, let's fetch stats then channels

        // Option A: Use 'channel_stats' table
        const { data: clickStats, error: clickError } = await supabase
            .from('channel_stats')
            .select('channel_id, clicks, date')
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Also check 'channels' table 'clicks' column for total lifetime
        const { data: channelsData, error: channelsError } = await supabase
            .from('channels')
            .select('id, name, image, clicks')
            .order('clicks', { ascending: false })
            .limit(20);

        // Let's use the 'channels' table 'clicks' column for "Most Clicked All Time" as it is simpler
        // And maybe use clickStats for "Recent Clicks" if needed.
        // For now, return top channels by 'clicks'
        const channelClicks = channelsData?.map(c => ({
            channel: { name: c.name, image: c.image },
            total_clicks: c.clicks,
            id: c.id
        }));

        return {
            pageViews: pageViews,
            channelClicks: channelClicks
        };

    } catch (error) {
        console.error('Analytics Action Error:', error);
        return null;
    }
}
