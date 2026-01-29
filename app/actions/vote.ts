'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function voteChannel(channelId: string, voteType: 1 | -1, fingerprint?: string) {
    console.log('[VOTE] Starting vote:', { channelId, voteType, fingerprint });

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[VOTE] Missing Supabase env vars!');
        return { error: 'Sunucu yapılandırma hatası' };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (!channelId) {
        return { error: 'Channel ID gerekli' };
    }

    // Generate a simple fingerprint if not provided
    const fp = fingerprint || 'anonymous';

    try {
        // Check if this fingerprint already voted for this channel
        const { data: existingVote } = await adminClient
            .from('votes')
            .select('id, vote_type')
            .eq('channel_id', channelId)
            .eq('fingerprint', fp)
            .single();

        if (existingVote) {
            console.log('[VOTE] User already voted:', existingVote);
            return { error: 'Bu kanala zaten oy verdiniz!', alreadyVoted: true };
        }

        // Get current score
        const { data: channel, error: fetchError } = await adminClient
            .from('channels')
            .select('score')
            .eq('id', channelId)
            .single();

        if (fetchError) {
            console.error('[VOTE] Fetch error:', fetchError);
            throw fetchError;
        }

        // Update score
        const newScore = (channel.score || 0) + voteType;

        const { error: updateError } = await adminClient
            .from('channels')
            .update({ score: newScore })
            .eq('id', channelId);

        if (updateError) throw updateError;

        // Record the vote
        const { error: voteError } = await adminClient
            .from('votes')
            .insert({
                channel_id: channelId,
                fingerprint: fp,
                vote_type: voteType
            });

        if (voteError) {
            console.error('[VOTE] Vote record error:', voteError);
            // Don't throw - vote was successful, just couldn't record
        }

        console.log('[VOTE] Success! New score:', newScore);
        revalidatePath('/');
        return { success: true, newScore };
    } catch (error: any) {
        console.error('[VOTE] Exception:', error?.message || error);
        return { error: `Oy verilemedi: ${error?.message || 'Bilinmeyen hata'}` };
    }
}
