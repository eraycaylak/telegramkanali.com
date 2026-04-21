import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { Suspense } from 'react';
import StatsClient from './StatsClient';

export default async function StatsPage({
    searchParams,
}: {
    searchParams: Promise<{ channel?: string }>;
}) {
    const user = await getServerUser();
    if (!user) redirect('/login');

    const db = getAdminClient();
    const { data: channels } = await db
        .from('channels')
        .select('id, name, image, member_count, bot_enabled, slug')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const userChannels = channels || [];
    const params = await searchParams;
    const channelId = params?.channel;

    if (!channelId && userChannels.length > 0) {
        redirect(`/dashboard/stats?channel=${userChannels[0].id}`);
    }

    if (channelId && userChannels.length > 0 && !userChannels.some(c => c.id === channelId)) {
        redirect(`/dashboard/stats?channel=${userChannels[0].id}`);
    }

    return (
        <Suspense fallback={<div className="h-96 flex items-center justify-center" style={{ color: '#94A3B8' }}>Yükleniyor...</div>}>
            <StatsClient channels={userChannels} channelId={channelId || null} />
        </Suspense>
    );
}
