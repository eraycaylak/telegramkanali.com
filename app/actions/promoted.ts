'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { supabase as publicClient } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export interface PromotedChannel {
    id: string;
    channel_id: string;
    label: string;
    display_order: number;
    target: string; // 'all', 'homepage', or category_id
    active: boolean;
    created_at?: string;
    // Joined channel fields
    channel?: {
        id: string;
        name: string;
        slug: string;
        image: string;
        description: string;
        member_count: number;
        category_id: string;
        categories: { name: string; slug: string } | null;
    };
}

export async function getPromotedChannels(target?: string): Promise<PromotedChannel[]> {
    let query = publicClient
        .from('promoted_channels')
        .select(`
            *,
            channel:channels(id, name, slug, image, description, member_count, category_id, categories(name, slug))
        `)
        .eq('active', true)
        .order('display_order', { ascending: true });

    if (target && target !== 'all') {
        // Match 'all' or the specific target
        query = query.or(`target.eq.all,target.eq.${target}`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[PROMOTED] Error fetching:', error);
        return [];
    }

    return (data || []) as PromotedChannel[];
}

export async function getAllPromotedChannels(): Promise<PromotedChannel[]> {
    const { data, error } = await publicClient
        .from('promoted_channels')
        .select(`
            *,
            channel:channels(id, name, slug, image, description, member_count, category_id, categories(name, slug))
        `)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('[PROMOTED] Error fetching all:', error);
        return [];
    }

    return (data || []) as PromotedChannel[];
}

export async function savePromotedChannel(data: Partial<PromotedChannel>) {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('promoted_channels')
        .upsert({
            id: data.id,
            channel_id: data.channel_id,
            label: data.label || 'Çok Tıklananlar',
            display_order: data.display_order ?? 0,
            target: data.target || 'all',
            active: data.active ?? true,
        })
        .select()
        .single();

    if (error) {
        console.error('[PROMOTED] Save error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/promoted');
    return { success: true };
}

export async function deletePromotedChannel(id: string) {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('promoted_channels')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[PROMOTED] Delete error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/promoted');
    return { success: true };
}

export async function togglePromotedChannel(id: string, currentState: boolean) {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .from('promoted_channels')
        .update({ active: !currentState })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/promoted');
    return { success: true };
}

export async function reorderPromotedChannels(items: { id: string; display_order: number }[]) {
    try {
        const supabaseAdmin = getAdminClient();
        const updates = items.map(item =>
            supabaseAdmin
                .from('promoted_channels')
                .update({ display_order: item.display_order })
                .eq('id', item.id)
        );

        await Promise.all(updates);

        revalidatePath('/');
        revalidatePath('/admin/promoted');
        return { success: true };
    } catch (error: any) {
        console.error('[PROMOTED] Reorder error:', error);
        return { success: false, error: error.message };
    }
}

// Search channels for autocomplete
export async function searchChannelsForPromoted(query: string) {
    const { data, error } = await publicClient
        .from('channels')
        .select('id, name, slug, image, member_count, category_id, categories(name)')
        .eq('status', 'approved')
        .ilike('name', `%${query}%`)
        .limit(10);

    if (error) {
        console.error('[PROMOTED] Search error:', error);
        return [];
    }

    return data || [];
}
