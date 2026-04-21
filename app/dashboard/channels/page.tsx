import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import { getAdminClient } from '@/lib/supabaseAdmin';
import MyChannelsClient from './MyChannelsClient';

export default async function MyChannelsPage() {
    const user = await getServerUser();
    if (!user) redirect('/login');

    const db = getAdminClient();
    const { data: channels } = await db
        .from('channels')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    return <MyChannelsClient channels={channels || []} />;
}
