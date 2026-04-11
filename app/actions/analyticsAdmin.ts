'use server';

// Use public anon client for reads — site_analytics and channel_stats have public RLS policies
import { supabase } from '@/lib/supabaseClient';

export async function getAnalyticsSummary(days: number = 30) {
    try {
        const timeAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // Previous period for comparison (e.g. if days=30, compare with 30-60 days ago)
        const prevPeriodStart = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Get Page View Stats (Group by path)
        let allPageStats: any[] = [];
        let hasMorePages = true;
        let pFrom = 0;
        const limitSize = 1000;

        while (hasMorePages) {
            const { data: pageStats, error: pageError } = await supabase
                .from('site_analytics')
                .select('path, page_views, visitors, date')
                .gte('date', prevPeriodStart) // Fetch both current AND previous period
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

        // Separate current vs previous period data
        const currentPeriodStats = allPageStats.filter(s => s.date >= timeAgo);
        const previousPeriodStats = allPageStats.filter(s => s.date < timeAgo);

        // Aggregate by path (current period only)
        const pathAggregation: any = {};
        currentPeriodStats.forEach(stat => {
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

        // /go/ redirect sayfaları = kanal tıklamaları, gerçek sayfa görüntülemesi DEĞİL — filtreliyoruz
        const pageViews = Object.values(pathAggregation)
            .filter((p: any) => !p.path.startsWith('/go/'))
            .sort((a: any, b: any) => b.total_views - a.total_views);

        // Current period totals (only real pages, /go/ excluded)
        const totalViews = pageViews.reduce((sum: number, p: any) => sum + p.total_views, 0);
        const totalVisitors = pageViews.reduce((sum: number, p: any) => sum + p.total_visitors, 0);
        const dailyViews = pageViews.reduce((sum: number, p: any) => sum + p.daily_views, 0);
        const dailyVisitors = pageViews.reduce((sum: number, p: any) => sum + p.daily_visitors, 0);

        // Previous period totals for comparison
        const prevViews = previousPeriodStats
            .filter(s => !s.path.startsWith('/go/'))
            .reduce((sum: number, s: any) => sum + s.page_views, 0);
        const prevVisitors = previousPeriodStats
            .filter(s => !s.path.startsWith('/go/'))
            .reduce((sum: number, s: any) => sum + s.visitors, 0);

        // Calculate Category Views from Paths — using ACTUAL category slugs from DB
        const { data: actualCategories } = await supabase
            .from('categories')
            .select('slug, name');

        const categorySlugSet = new Set((actualCategories || []).map(c => c.slug));
        const categoryNameMap: Record<string, string> = {};
        (actualCategories || []).forEach(c => { categoryNameMap[c.slug] = c.name; });

        const categoriesAggregation: any = {};
        Object.values(pathAggregation).forEach((p: any) => {
            const segments = p.path.split('/').filter(Boolean);
            if (segments.length === 1 && categorySlugSet.has(segments[0])) {
                const catSlug = segments[0];
                categoriesAggregation[catSlug] = {
                    name: categoryNameMap[catSlug] || catSlug,
                    slug: catSlug,
                    views: p.total_views
                };
            }
        });
        const categoryViews = Object.values(categoriesAggregation).sort((a: any, b: any) => b.views - a.views);

        // ─── Daily Trends (for chart) ───────────────────────────────────────
        const dailyTrendsMap: Record<string, { date: string; views: number; visitors: number }> = {};

        // Initialize all days in the range (so chart shows 0 for empty days)
        for (let i = 0; i < Math.min(days, 90); i++) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            dailyTrendsMap[key] = { date: key, views: 0, visitors: 0 };
        }

        currentPeriodStats.forEach(stat => {
            if (stat.path.startsWith('/go/')) return; // Exclude redirects from trend chart
            const dateKey = stat.date.split('T')[0];
            if (dailyTrendsMap[dateKey]) {
                dailyTrendsMap[dateKey].views += stat.page_views;
                dailyTrendsMap[dateKey].visitors += stat.visitors;
            }
        });

        const dailyTrends = Object.values(dailyTrendsMap).sort((a, b) => a.date.localeCompare(b.date));

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

        const periodClicksMap: { [key: string]: number } = {};
        const dailyClicksMap: { [key: string]: number } = {};

        allClickStats.forEach(stat => {
            const isDaily = stat.date >= twentyFourHoursAgo;
            periodClicksMap[stat.channel_id] = (periodClicksMap[stat.channel_id] || 0) + stat.clicks;
            if (isDaily) {
                dailyClicksMap[stat.channel_id] = (dailyClicksMap[stat.channel_id] || 0) + stat.clicks;
            }
        });

        const { data: channelsData } = await supabase
            .from('channels')
            .select('id, name, slug, image, clicks')
            .order('clicks', { ascending: false })
            .limit(500);

        const channelClicks = channelsData?.map(c => ({
            channel: { name: c.name, image: c.image, slug: c.slug },
            total_clicks: c.clicks,
            period_clicks: periodClicksMap[c.id] || 0,
            daily_clicks: dailyClicksMap[c.id] || 0,
            id: c.id
        })).sort((a, b) => b.period_clicks - a.period_clicks);

        // Total period clicks
        const totalPeriodClicks = Object.values(periodClicksMap).reduce((sum, v) => sum + v, 0);

        // Previous period clicks for comparison
        let prevClickStats: any[] = [];
        let hasMorePrevClicks = true;
        let pcFrom = 0;

        while (hasMorePrevClicks) {
            const { data: pClickStats, error: pClickError } = await supabase
                .from('channel_stats')
                .select('channel_id, clicks, date')
                .gte('date', prevPeriodStart)
                .lt('date', timeAgo)
                .range(pcFrom, pcFrom + limitSize - 1);

            if (pClickError) break;
            if (pClickStats && pClickStats.length > 0) {
                prevClickStats = [...prevClickStats, ...pClickStats];
                pcFrom += limitSize;
                if (pClickStats.length < limitSize) hasMorePrevClicks = false;
            } else {
                hasMorePrevClicks = false;
            }
        }
        const prevPeriodClicks = prevClickStats.reduce((sum: number, s: any) => sum + s.clicks, 0);

        // ─── Top Pages (top 20) ────────────────────────────────────────────
        const topPages = pageViews.slice(0, 30).map((p: any) => ({
            path: p.path,
            views: p.total_views,
            visitors: p.total_visitors,
            dailyViews: p.daily_views,
        }));

        return {
            pageViews: pageViews,
            channelClicks: channelClicks,
            categoryViews: categoryViews,
            dailyTrends: dailyTrends,
            topPages: topPages,
            summary: {
                totalViews,
                totalVisitors,
                dailyViews,
                dailyVisitors,
                totalPeriodClicks,
                // Previous period for comparison
                prevViews,
                prevVisitors,
                prevPeriodClicks,
            }
        };

    } catch (error) {
        console.error('Analytics Action Error:', error);
        return null;
    }
}

export async function searchChannelStats(searchTerm: string, days: number = 30) {
    try {
        if (!searchTerm.trim()) return [];

        const timeAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const term = searchTerm.replace(/[%_]/g, '\\$&');

        const { data: channels, error } = await supabase
            .from('channels')
            .select('id, name, slug, image, clicks')
            .or(`name.ilike.%${term}%,slug.ilike.%${term}%,description.ilike.%${term}%`)
            .limit(100);

        if (error || !channels || channels.length === 0) return [];

        const channelIds = channels.map(c => c.id);
        const { data: clickStats } = await supabase
            .from('channel_stats')
            .select('channel_id, clicks, date')
            .in('channel_id', channelIds)
            .gte('date', timeAgo);

        const periodMap: Record<string, number> = {};
        const dailyMap: Record<string, number> = {};

        (clickStats || []).forEach(stat => {
            periodMap[stat.channel_id] = (periodMap[stat.channel_id] || 0) + stat.clicks;
            if (stat.date >= twentyFourHoursAgo) {
                dailyMap[stat.channel_id] = (dailyMap[stat.channel_id] || 0) + stat.clicks;
            }
        });

        return channels.map(c => ({
            channel: { name: c.name, image: c.image, slug: c.slug },
            total_clicks: c.clicks || 0,
            period_clicks: periodMap[c.id] || 0,
            daily_clicks: dailyMap[c.id] || 0,
            id: c.id
        })).sort((a, b) => b.total_clicks - a.total_clicks);

    } catch (error) {
        console.error('searchChannelStats Error:', error);
        return [];
    }
}
