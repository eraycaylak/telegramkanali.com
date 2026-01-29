'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_VOTES_PER_USER = 2; // Maksimum oy sayısı

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

    // Get IP address as secondary identifier
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
        headersList.get('x-real-ip') ||
        'unknown';

    // Combine fingerprint with IP for stronger identification
    const fp = fingerprint || 'anon';
    const combinedId = `${fp}_${ip.replace(/\./g, '-')}`;

    console.log('[VOTE] Combined ID:', combinedId);

    try {
        // 1. Check if already voted for THIS channel
        const { data: existingVote } = await adminClient
            .from('votes')
            .select('id')
            .eq('channel_id', channelId)
            .eq('fingerprint', combinedId)
            .single();

        if (existingVote) {
            return { error: 'Bu kanala zaten oy verdiniz!', alreadyVoted: true };
        }

        // 2. Check TOTAL votes by this fingerprint (max 2)
        const { count: totalVotes } = await adminClient
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('fingerprint', combinedId);

        if (totalVotes !== null && totalVotes >= MAX_VOTES_PER_USER) {
            return {
                error: `Maksimum ${MAX_VOTES_PER_USER} kanala oy verebilirsiniz!`,
                maxReached: true
            };
        }

        // 3. Also check by IP alone (catches fingerprint spoofing)
        const { count: ipVotes } = await adminClient
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .like('fingerprint', `%_${ip.replace(/\./g, '-')}`);

        if (ipVotes !== null && ipVotes >= MAX_VOTES_PER_USER) {
            console.log('[VOTE] IP limit reached:', ip);
            return {
                error: `Maksimum ${MAX_VOTES_PER_USER} kanala oy verebilirsiniz!`,
                maxReached: true
            };
        }

        // 4. Get current score
        const { data: channel, error: fetchError } = await adminClient
            .from('channels')
            .select('score')
            .eq('id', channelId)
            .single();

        if (fetchError) throw fetchError;

        // 5. Update score
        const newScore = (channel.score || 0) + voteType;

        const { error: updateError } = await adminClient
            .from('channels')
            .update({ score: newScore })
            .eq('id', channelId);

        if (updateError) throw updateError;

        // 6. Record the vote with combined ID
        await adminClient
            .from('votes')
            .insert({
                channel_id: channelId,
                fingerprint: combinedId,
                vote_type: voteType
            });

        console.log('[VOTE] Success! New score:', newScore);
        revalidatePath('/');

        const remainingVotes = MAX_VOTES_PER_USER - (totalVotes || 0) - 1;
        return { success: true, newScore, remainingVotes };
    } catch (error: any) {
        console.error('[VOTE] Exception:', error?.message || error);
        return { error: `Oy verilemedi: ${error?.message || 'Bilinmeyen hata'}` };
    }
}
