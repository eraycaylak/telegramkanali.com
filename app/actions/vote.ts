'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const MAX_VOTES_PER_USER = 2; // Maksimum oy sayısı

export async function voteChannel(channelId: string, voteType: 1 | -1, fingerprint?: string) {
    console.log('[VOTE] Starting vote:', { channelId, voteType, fingerprint });

    const adminClient = getAdminClient();

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
            .select('*')
            .eq('channel_id', channelId)
            .eq('fingerprint', combinedId)
            .single();

        let newScoreChange = 0;

        if (existingVote) {
            // A. SAME VOTE TYPE -> REMOVE VOTE (TOGGLE)
            if (existingVote.vote_type === voteType) {
                console.log('[VOTE] Removing existing vote (Toggle)');

                // Remove vote
                const { error: deleteError } = await adminClient
                    .from('votes')
                    .delete()
                    .eq('id', existingVote.id);

                if (deleteError) throw deleteError;

                // Reverse the score change
                newScoreChange = -voteType;
            }
            // B. DIFFERENT VOTE TYPE -> UPDATE VOTE
            else {
                console.log('[VOTE] Changing vote type');

                // Update vote
                const { error: updateVoteError } = await adminClient
                    .from('votes')
                    .update({ vote_type: voteType })
                    .eq('id', existingVote.id);

                if (updateVoteError) throw updateVoteError;

                // Calculate score diff (e.g. -1 to +1 = +2, +1 to -1 = -2)
                newScoreChange = voteType * 2;
            }
        } else {
            // C. NEW VOTE -> INSERT

            // Check limits only for NEW votes
            // Check TOTAL votes by this fingerprint (max 2 active votes)
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

            // Also check by IP alone
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

            // Insert new vote
            const { error: insertError } = await adminClient
                .from('votes')
                .insert({
                    channel_id: channelId,
                    fingerprint: combinedId,
                    vote_type: voteType
                });

            if (insertError) throw insertError;

            newScoreChange = voteType;
        }

        // 4. Update Channel Score
        const { data: channel, error: fetchError } = await adminClient
            .from('channels')
            .select('score')
            .eq('id', channelId)
            .single();

        if (fetchError) throw fetchError;

        const newScore = (channel.score || 0) + newScoreChange;

        const { error: updateError } = await adminClient
            .from('channels')
            .update({ score: newScore })
            .eq('id', channelId);

        if (updateError) throw updateError;

        console.log('[VOTE] Success! New score:', newScore);
        revalidatePath('/');

        // Recalculate remaining votes for UI
        const { count: currentTotalVotes } = await adminClient
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('fingerprint', combinedId);

        const remainingVotes = MAX_VOTES_PER_USER - (currentTotalVotes || 0);
        return { success: true, newScore, remainingVotes };
    } catch (error: any) {
        console.error('[VOTE] Exception:', error?.message || error);
        return { error: `Oy verilemedi: ${error?.message || 'Bilinmeyen hata'}` };
    }
}
