'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

const supabase = getAdminClient();

export async function getAnalyticsSummary() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // 1. Get Page View Stats (Group by path)
        let allPageStats: any[] = [];
        let hasMorePages = true;
        let pFrom = 0;
        const limitSize = 1000;

        while (hasMorePages) {
            const { data: pageStats, error: pageError } = await supabase
                .from('site_analytics')
                .select('path, page_views, visitors, date')
                .gte('date', thirtyDaysAgo) // Last 30 days
                .order('date', { ascending: false })
                .range(pFrom, pFrom + limitSize - 1);

            if (pageError) {
                console.error('Analytics Fetch Error (Pages):', pageError);
                break;
            }

            if (pageStats && pageStats.length > 0) {
                allPageStats = [...allPageStats, ...pageStats];
                pFrom += limitSize;
                if (pageStats.length < limitSize) hasMorePages = false;
            } else {
                hasMorePages = false;
            }
        }

        // Aggregate by path
        const pathAggregation: any = {};
        allPageStats.forEach(stat => {
            const isDaily = stat.date >= twentyFourHoursAgo;

            if (!pathAggregation[stat.path]) {
                pathAggregation[stat.path] = {
                    path: stat.path,
                    total_views: 0,
                    total_visitors: 0,
                    daily_views: 0,
                    daily_visitors: 0
                };
            }
            pathAggregation[stat.path].total_views += stat.page_views;
            pathAggregation[stat.path].total_visitors += stat.visitors;

            if (isDaily) {
                pathAggregation[stat.path].daily_views += stat.page_views;
                pathAggregation[stat.path].daily_visitors += stat.visitors;
            }
        });

        const pageViews = Object.values(pathAggregation).sort((a: any, b: any) => b.total_views - a.total_views);

        // 2. Get Channel Clicks (Group by channel)
        let allClickStats: any[] = [];
        let hasMoreClicks = true;
        let cFrom = 0;

        while (hasMoreClicks) {
            const { data: clickStats, error: clickError } = await supabase
                .from('channel_stats')
                .select('channel_id, clicks, date')
                .gte('date', twentyFourHoursAgo)
                .range(cFrom, cFrom + limitSize - 1);

            if (clickError) break;

            if (clickStats && clickStats.length > 0) {
                allClickStats = [...allClickStats, ...clickStats];
                cFrom += limitSize;
                if (clickStats.length < limitSize) hasMoreClicks = false;
            } else {
                hasMoreClicks = false;
            }
        }

        // Aggregate daily clicks per channel
        const dailyClicksMap: { [key: string]: number } = {};
        allClickStats.forEach(stat => {
            dailyClicksMap[stat.channel_id] = (dailyClicksMap[stat.channel_id] || 0) + stat.clicks;
        });

        // Also check 'channels' table 'clicks' column for total lifetime
        const { data: channelsData, error: channelsError } = await supabase
            .from('channels')
            .select('id, name, image, clicks')
            .order('clicks', { ascending: false })
            .limit(20);

        const channelClicks = channelsData?.map(c => ({
            channel: { name: c.name, image: c.image },
            total_clicks: c.clicks,
            daily_clicks: dailyClicksMap[c.id] || 0,
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
