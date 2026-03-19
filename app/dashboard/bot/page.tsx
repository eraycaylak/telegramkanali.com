// Server Component — kanalları sunucu tarafında oturumla çeker
import { createServerClient } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import BotSettingsClient from './BotSettingsClient';

export default async function BotSettingsPage({ searchParams }: { searchParams: Promise<{ channel?: string }> }) {
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
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    const params = await searchParams;
    const initialChannelId = params?.channel || null;

    return <BotSettingsClient channels={channels || []} initialChannelId={initialChannelId} />;
}
