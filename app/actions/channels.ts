'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Giriş yapmış kullanıcının kanallarını döndürür.
 * Admin client kullanarak RLS sorunlarını önler,
 * kullanıcı kimliği doğrulaması sunucu tarafında yapılır.
 */
export async function getMyChannels() {
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

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
        return { error: 'Oturum açmanız gerekiyor.', channels: [] };
    }

    const adminClient = getAdminClient();

    const { data: channels, error } = await adminClient
        .from('channels')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[getMyChannels] DB error:', error);
        return { error: error.message, channels: [] };
    }

    return { channels: channels || [] };
}

/**
 * Belirtilen kanala ait bot token'ını (yeniden) üretir.
 * Yalnızca kanalın sahibi bu işlemi yapabilir.
 */
export async function regenerateBotToken(channelId: string) {
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

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Yetkisiz erişim' };

    const adminClient = getAdminClient();

    // Kanal sahipliğini doğrula
    const { data: channel } = await adminClient
        .from('channels')
        .select('id, owner_id')
        .eq('id', channelId)
        .single();

    if (!channel || channel.owner_id !== user.id) {
        return { error: 'Bu işlem için yetkiniz yok' };
    }

    const newToken =
        'TK_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error } = await adminClient
        .from('channels')
        .update({ bot_token: newToken })
        .eq('id', channelId);

    if (error) return { error: error.message };

    return { success: true, token: newToken };
}
