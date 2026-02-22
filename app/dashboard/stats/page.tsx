// Server Component — kullanıcının kanallarını çeker, channel param yoksa ilkine yönlendirir
import { createServerClient } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import StatsClient from './StatsClient';

export default async function StatsPage({
    searchParams,
}: {
    searchParams: Promise<{ channel?: string }>;
}) {
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
    const { data: channels } = await adminClient
        .from('channels')
        .select('id, name, image, member_count, bot_enabled, slug')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const userChannels = channels || [];
    const params = await searchParams;
    const channelId = params?.channel;

    // channel param yoksa ilk kanala yönlendir
    if (!channelId && userChannels.length > 0) {
        redirect(`/dashboard/stats?channel=${userChannels[0].id}`);
    }

    // channel param var ama bu kanala sahip değilse ilk kanala yönlendir
    if (channelId && userChannels.length > 0 && !userChannels.some(c => c.id === channelId)) {
        redirect(`/dashboard/stats?channel=${userChannels[0].id}`);
    }

    return (
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-400">Yükleniyor...</div>}>
            <StatsClient
                channels={userChannels}
                channelId={channelId || null}
            />
        </Suspense>
    );
}
