'use client';

import { supabase } from '@/lib/supabaseClient';

export async function submitChannel(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const contact_info = formData.get('contact_info') as string;

    if (!name || !join_link || !category_id) {
        return { error: 'Lütfen zorunlu alanları doldurun.' };
    }

    // Check for existing channel
    const { data: existing } = await supabase
        .from('channels')
        .select('id')
        .eq('join_link', join_link)
        .single();

    if (existing) {
        return { error: 'Bu kanal zaten sistemde mevcut!' };
    }

    // Generate slug from name
    // Use timestamp to guarantee uniqueness (prevents channels_slug_key error)
    const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();

    // Get current user to link ownership
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('channels').insert({
        name,
        description,
        join_link,
        category_id,
        contact_info,
        slug,
        owner_id: user?.id, // Explicitly set owner
        status: 'pending' // Force pending for public submissions
    });

    if (error) {
        console.error('Submission error:', error);
        return { error: 'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
    }

    return { success: true };
}
