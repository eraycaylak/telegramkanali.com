import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminClient } from '@/lib/supabaseAdmin';
import KanalSatClient from './KanalSatClient';

export default async function KanalSatPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const adminClient = getAdminClient();

    const [channelsRes, listingsRes, ordersRes] = await Promise.all([
        // Kullanıcının kendi kanalları
        adminClient
            .from('channels')
            .select('id, name, username, image, member_count, category_id')
            .eq('owner_id', user.id)
            .eq('status', 'approved')
            .order('member_count', { ascending: false }),

        // Mevcut satış ilanları
        adminClient
            .from('channel_listings')
            .select('*')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false }),

        // Gelen teklifler (alıcı olarak)
        adminClient
            .from('marketplace_orders')
            .select('*, channel_listings(title, channel_name, asking_price)')
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    // Kullanıcı profili (telegram username için)
    const { data: profile } = await adminClient
        .from('profiles')
        .select('telegram_username, full_name')
        .eq('id', user.id)
        .single();

    return (
        <KanalSatClient
            userId={user.id}
            userProfile={profile}
            myChannels={channelsRes.data || []}
            myListings={listingsRes.data || []}
            incomingOrders={ordersRes.data || []}
        />
    );
}
