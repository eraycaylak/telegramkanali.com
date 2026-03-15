'use server';

import { supabase } from '@/lib/supabaseClient';

export async function trackVisitorProfile(
    visitorId: string,
    page: string,
    interests: string[],
    sessionSeconds: number,
    deviceType: string | null,
    referrer: string | null,
    country: string | null
) {
    try {
        const { error } = await supabase.rpc('upsert_visitor_profile', {
            p_visitor_id: visitorId,
            p_page: page,
            p_interests: interests,
            p_session_seconds: sessionSeconds,
            p_device_type: deviceType,
            p_referrer: referrer,
            p_country: country
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

        return {
            totalVisitors: (totalVisitors as any)?.length ?? 0,
            todayVisitors: todayCount ?? 0,
            returningVisitors: returningCount ?? 0,
            topInterests,
            deviceDistribution: deviceCounts,
            recentVisitors: recentVisitors || [],
            avgSessionSeconds: avgSession
        };
    } catch (err) {
        console.error('getVisitorStats error:', err);
        return null;
    }
}
