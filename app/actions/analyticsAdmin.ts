'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

const supabase = getAdminClient();

export async function getAnalyticsSummary(days: number = 30) {
    try {
        const timeAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
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
                .gte('date', timeAgo)
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

        // Calculate Category Views from Paths
        // Example path: "/kripto-para" -> We can derive this if it doesn't have other slashes like "/admin/..."
        const categoriesAggregation: any = {};
        Object.values(pathAggregation).forEach((p: any) => {
            // Basic heuristic: if it's a root level path like /xxx and not /api or /dashboard etc
            const segments = p.path.split('/').filter(Boolean);
            if (segments.length === 1 && !['admin', 'dashboard', 'api', 'kanal-ekle'].includes(segments[0])) {
                const catSlug = segments[0];
                categoriesAggregation[catSlug] = {
                    name: catSlug, // Will map to real name ideally, but slug is close enough for quick stats
                    views: p.total_views
                };
            }
        });
        const categoryViews = Object.values(categoriesAggregation).sort((a: any, b: any) => b.views - a.views);


        // 2. Get Channel Clicks
        let allClickStats: any[] = [];
        let hasMoreClicks = true;
        let cFrom = 0;

        while (hasMoreClicks) {
            const { data: clickStats, error: clickError } = await supabase
                .from('channel_stats')
                .select('channel_id, clicks, date')
                .gte('date', timeAgo)
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

        // Aggregate period clicks and daily clicks per channel
        const periodClicksMap: { [key: string]: number } = {};
        const dailyClicksMap: { [key: string]: number } = {};

        allClickStats.forEach(stat => {
            const isDaily = stat.date >= twentyFourHoursAgo;
            periodClicksMap[stat.channel_id] = (periodClicksMap[stat.channel_id] || 0) + stat.clicks;
            if (isDaily) {
                dailyClicksMap[stat.channel_id] = (dailyClicksMap[stat.channel_id] || 0) + stat.clicks;
            }
        });

        // Fetch channel details for the top clicked channels in this period
        // To handle large datasets efficiently, we get channels that have stats, or just top overall channels
        const { data: channelsData, error: channelsError } = await supabase
            .from('channels')
            .select('id, name, image, clicks')
            // If they want period clicks we can sort in memory since we need joins otherwise
            // For now, grabbing all channels with period clicks or fallback to top total clicks
            .order('clicks', { ascending: false })
            .limit(50); // Increased limit for better coverage

        const channelClicks = channelsData?.map(c => ({
            channel: { name: c.name, image: c.image },
            total_clicks: c.clicks, // Lifetime clicks
            period_clicks: periodClicksMap[c.id] || 0, // Clicks within date range
            daily_clicks: dailyClicksMap[c.id] || 0, // Last 24h
            id: c.id
        })).sort((a, b) => b.period_clicks - a.period_clicks); // Sort by period clicks!

        return {
            pageViews: pageViews,
            channelClicks: channelClicks,
            categoryViews: categoryViews
        };

    } catch (error) {
        console.error('Analytics Action Error:', error);
        return null;
    }
}
