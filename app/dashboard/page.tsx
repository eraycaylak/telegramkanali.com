import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import { getAdminClient } from '@/lib/supabaseAdmin';
import DashboardOverviewClient from './DashboardOverviewClient';

export default async function DashboardOverview() {
    const user = await getServerUser();
    if (!user) redirect('/login');

    const db = getAdminClient();

    const [channelsRes, activeAdsRes, pendingAdsRes, totalViewsRes] = await Promise.all([
        db.from('channels').select('member_count').eq('owner_id', user.id),
        db.from('ad_campaigns').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        db.from('ad_campaigns').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
        db.from('ad_campaigns').select('current_views').eq('user_id', user.id),
    ]);

    const channelCount = channelsRes.data?.length || 0;
    const totalMembers = channelsRes.data?.reduce((acc: number, c: any) => acc + (c.member_count || 0), 0) || 0;
    const totalViews = totalViewsRes.data?.reduce((acc: number, c: any) => acc + (c.current_views || 0), 0) || 0;

    return (
        <DashboardOverviewClient
            userName={user.email?.split('@')[0] || 'Kullanıcı'}
            channels={channelCount}
            totalMembers={totalMembers}
            activeAds={activeAdsRes.count || 0}
            pendingAds={pendingAdsRes.count || 0}
            totalViews={totalViews}
        />
    );
}
