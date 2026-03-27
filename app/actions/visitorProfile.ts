'use server';

import { createClient } from '@supabase/supabase-js';

const getTrackingClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
        auth: { persistSession: false }
    });
};

const getAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
        auth: { persistSession: false }
    });
};

export async function trackVisitorProfile(
    visitorId: string,
    page: string,
    interests: string[],
    sessionSeconds: number,
    deviceType: string | null,
    referrer: string | null,
    country: string | null,
    ipAddress: string | null = null,
    city: string | null = null,
    screenResolution: string | null = null,
    browser: string | null = null,
    os: string | null = null,
    fingerprint: string | null = null
) {
    try {
        const supabase = getTrackingClient();
        const { error } = await supabase.rpc('upsert_visitor_profile', {
            p_visitor_id: visitorId,
            p_page: page,
            p_interests: interests,
            p_session_seconds: sessionSeconds,
            p_device_type: deviceType,
            p_referrer: referrer,
            p_country: country,
            p_ip_address: ipAddress,
            p_city: city,
            p_screen_resolution: screenResolution,
            p_browser: browser,
            p_os: os,
            p_fingerprint: fingerprint
        });

        if (error) {
            console.warn('Visitor profile tracking error:', error.message);
            return { error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        console.error('Visitor profile exception:', err);
        return { error: err.message };
    }
}


// Admin: Get visitor profile stats
export async function getVisitorStats() {
    try {
        const supabase = getAdminClient();
        const { data: totalVisitors } = await supabase
            .from('visitor_profiles')
            .select('id', { count: 'exact', head: true });

        const today = new Date().toISOString().split('T')[0];
        const { data: todayVisitors, count: todayCount } = await supabase
            .from('visitor_profiles')
            .select('id', { count: 'exact', head: true })
            .gte('last_visit', today);

        const { data: returningVisitors, count: returningCount } = await supabase
            .from('visitor_profiles')
            .select('id', { count: 'exact', head: true })
            .gt('visit_count', 1);

        // Top interests
        const { data: topInterestsRaw } = await supabase
            .from('visitor_profiles')
            .select('interests')
            .not('interests', 'eq', '{}');

        const interestCounts: Record<string, number> = {};
        (topInterestsRaw || []).forEach(row => {
            (row.interests || []).forEach((interest: string) => {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            });
        });
        const topInterests = Object.entries(interestCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([name, count]) => ({ name, count }));

        // Device distribution
        const { data: devices } = await supabase
            .from('visitor_profiles')
            .select('device_type');

        const deviceCounts: Record<string, number> = {};
        (devices || []).forEach(d => {
            const type = d.device_type || 'unknown';
            deviceCounts[type] = (deviceCounts[type] || 0) + 1;
        });

        // Recent visitors
        const { data: recentVisitors } = await supabase
            .from('visitor_profiles')
            .select('*')
            .order('last_visit', { ascending: false })
            .limit(30);

        // Avg session
        const { data: avgData } = await supabase
            .from('visitor_profiles')
            .select('avg_session_seconds')
            .gt('avg_session_seconds', 0);

        const avgSession = avgData && avgData.length > 0
            ? Math.round(avgData.reduce((a, b) => a + b.avg_session_seconds, 0) / avgData.length)
            : 0;

        // Browser distribution
        const { data: browsers } = await supabase
            .from('visitor_profiles')
            .select('browser')
            .not('browser', 'is', null);

        const browserCounts: Record<string, number> = {};
        (browsers || []).forEach(b => {
            const name = b.browser || 'Other';
            browserCounts[name] = (browserCounts[name] || 0) + 1;
        });

        // OS distribution
        const { data: osList } = await supabase
            .from('visitor_profiles')
            .select('os')
            .not('os', 'is', null);

        const osCounts: Record<string, number> = {};
        (osList || []).forEach(o => {
            const name = o.os || 'Other';
            osCounts[name] = (osCounts[name] || 0) + 1;
        });

        // Top cities
        const { data: cities } = await supabase
            .from('visitor_profiles')
            .select('city')
            .not('city', 'is', null);

        const cityCounts: Record<string, number> = {};
        (cities || []).forEach(c => {
            const name = c.city || 'Bilinmiyor';
            cityCounts[name] = (cityCounts[name] || 0) + 1;
        });
        const topCities = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([name, count]) => ({ name, count }));

        // Top screen resolutions
        const { data: screens } = await supabase
            .from('visitor_profiles')
            .select('screen_resolution')
            .not('screen_resolution', 'is', null);

        const screenCounts: Record<string, number> = {};
        (screens || []).forEach(s => {
            const name = s.screen_resolution || 'unknown';
            screenCounts[name] = (screenCounts[name] || 0) + 1;
        });
        const topScreens = Object.entries(screenCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        return {
            totalVisitors: (totalVisitors as any)?.length ?? 0,
            todayVisitors: todayCount ?? 0,
            returningVisitors: returningCount ?? 0,
            topInterests,
            deviceDistribution: deviceCounts,
            browserDistribution: browserCounts,
            osDistribution: osCounts,
            topCities,
            topScreens,
            recentVisitors: recentVisitors || [],
            avgSessionSeconds: avgSession
        };
    } catch (err) {
        console.error('getVisitorStats error:', err);
        return null;
    }
}

