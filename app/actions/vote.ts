'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function voteChannel(channelId: string, voteType: 1 | -1) {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase env vars');
        return { error: 'Server configuration error' };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (!channelId) return { error: 'Channel ID required' };

    try {
        // 1. Get current score
        const { data: channel, error: fetchError } = await adminClient
            .from('channels')
            .select('score')
            .eq('id', channelId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Update score
        const newScore = (channel.score || 0) + voteType;

        const { error: updateError } = await adminClient
            .from('channels')
            .update({ score: newScore })
            .eq('id', channelId);

        if (updateError) throw updateError;

        revalidatePath('/');
        return { success: true, newScore };
    } catch (error) {
        console.error('Vote error:', error);
        return { error: 'Failed to vote' };
    }
}
