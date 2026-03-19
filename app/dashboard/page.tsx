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

    // Profil (token_balance)
    const { data: profile } = await adminClient
        .from('profiles')
        .select('token_balance')
        .eq('id', user.id)
        .single();

    // Kullanıcının kanalları
    const { data: channels } = await adminClient
        .from('channels')
        .select('member_count')
        .eq('owner_id', user.id);

    const channelCount = channels?.length || 0;
    const totalMembers = channels?.reduce((acc, c) => acc + (c.member_count || 0), 0) || 0;

    // Aktif reklam sayısı
    const { count: activeAdCount } = await adminClient
        .from('ad_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

    return (
        <DashboardOverviewClient
            channels={channelCount}
            balance={profile?.token_balance || 0}
            totalMembers={totalMembers}
            activeAds={activeAdCount || 0}
        />
    );
}
