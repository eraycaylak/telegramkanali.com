import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import { getAdminClient } from '@/lib/supabaseAdmin';
import KanalSatClient from './KanalSatClient';

export default async function KanalSatPage() {
    const user = await getServerUser();
    if (!user) redirect('/login');

    const db = getAdminClient();

    const [channelsRes, listingsRes, ordersRes, profileRes] = await Promise.all([
        db.from('channels').select('id, name, username, image, member_count, category_id').eq('owner_id', user.id).eq('status', 'approved').order('member_count', { ascending: false }),
        db.from('channel_listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        db.from('marketplace_orders').select('*, channel_listings(title, channel_name, asking_price)').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(10),
        db.from('profiles').select('telegram_username, full_name').eq('id', user.id).single(),
    ]);

    return (
        <KanalSatClient
            userId={user.id}
            userProfile={profileRes.data}
            myChannels={channelsRes.data || []}
            myListings={listingsRes.data || []}
            incomingOrders={ordersRes.data || []}
        />
    );
}
