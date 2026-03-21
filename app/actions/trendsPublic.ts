'use server';

import { supabase } from '@/lib/supabaseClient';

export async function getActiveTrends() {
    const { data, error } = await supabase
        .from('trends')
        .select('*, trend_categories(name, slug, order_index, id)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('getActiveTrends error:', error);
        return [];
    }
    return data;
}

export async function getActiveTrendCategories() {
    const { data, error } = await supabase
        .from('trend_categories')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });
    
    return data || [];
}

export async function getTrendBySlug(slug: string) {
    const { data, error } = await supabase
        .from('trends')
        .select('*, trend_categories(name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
    
    if (error || !data) {
        return null;
    }

    // Attempt to increment view count without blocking
    // In a real production setup you'd use an RPC or an edge function
    try {
        const { getAdminClient } = await import('@/lib/supabaseAdmin');
        const admin = getAdminClient();
        await admin.from('trends').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
    } catch(e) {}

    return data;
}
