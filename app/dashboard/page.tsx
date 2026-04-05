// Server Component — tüm veriler sunucu tarafında çekiliyor, RLS sorun yok
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminClient } from '@/lib/supabaseAdmin';
import DashboardOverviewClient from './DashboardOverviewClient';

export default async function DashboardOverview() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const adminClient = getAdminClient();

    // Paralel veri çekimi
    const [profileRes, channelsRes, activeCampaignsRes, pendingCampaignsRes, totalViewsRes] = await Promise.all([
        adminClient.from('profiles').select('token_balance').eq('id', user.id).single(),
        adminClient.from('channels').select('member_count').eq('owner_id', user.id),
        adminClient.from('ad_campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id).eq('status', 'active'),
        adminClient.from('ad_campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id).eq('status', 'pending'),
        adminClient.from('ad_campaigns')
            .select('current_views')
            .eq('user_id', user.id),
    ]);

    const channelCount = channelsRes.data?.length || 0;
    const totalMembers = channelsRes.data?.reduce((acc: number, c: any) => acc + (c.member_count || 0), 0) || 0;
    const totalViews = totalViewsRes.data?.reduce((acc: number, c: any) => acc + (c.current_views || 0), 0) || 0;

    return (
        <DashboardOverviewClient
            channels={channelCount}
            balance={profileRes.data?.token_balance || 0}
            totalMembers={totalMembers}
            activeAds={activeCampaignsRes.count || 0}
            pendingAds={pendingCampaignsRes.count || 0}
            totalViews={totalViews}
        />
    );
}
