'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function voteChannel(channelId: string, voteType: 1 | -1) {
    console.log('[VOTE] Starting vote:', { channelId, voteType });
    console.log('[VOTE] Env check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        urlPrefix: supabaseUrl?.substring(0, 30)
    });

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[VOTE] Missing Supabase env vars!');
        return { error: 'Sunucu yapılandırma hatası - ENV eksik' };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (!channelId) {
        console.error('[VOTE] No channel ID provided');
        return { error: 'Channel ID gerekli' };
    }

    try {
        // 1. Get current score
        console.log('[VOTE] Fetching current score for:', channelId);
        const { data: channel, error: fetchError } = await adminClient
            .from('channels')
            .select('score')
            .eq('id', channelId)
            .single();

        if (fetchError) {
            console.error('[VOTE] Fetch error:', JSON.stringify(fetchError, null, 2));
            throw fetchError;
        }

        console.log('[VOTE] Current channel data:', channel);

        // 2. Update score
        const newScore = (channel.score || 0) + voteType;
        console.log('[VOTE] Updating score to:', newScore);

        const { error: updateError } = await adminClient
            .from('channels')
            .update({ score: newScore })
            .eq('id', channelId);

        if (updateError) {
            console.error('[VOTE] Update error:', JSON.stringify(updateError, null, 2));
            throw updateError;
        }

        console.log('[VOTE] Success! New score:', newScore);
        revalidatePath('/');
        return { success: true, newScore };
    } catch (error: any) {
        console.error('[VOTE] Exception:', error?.message || error);
        console.error('[VOTE] Full error:', JSON.stringify(error, null, 2));
        return { error: `Oy verilemedi: ${error?.message || 'Bilinmeyen hata'}` };
    }
}
