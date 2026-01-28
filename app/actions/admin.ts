'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize Service Role Client for Admin actions (Bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function deleteChannel(channelId: string) {
    if (!channelId) return { error: 'Channel ID required' };

    try {
        const { error } = await adminClient
            .from('channels')
            .delete()
            .eq('id', channelId);

        if (error) throw error;

        revalidatePath('/'); // Revalidate home
        revalidatePath('/admin/dashboard'); // Revalidate dashboard
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { error: 'Failed to delete channel' };
    }
}

export async function addChannel(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Basic validation
    if (!name || !join_link) return { error: 'Name and Join Link are required' };

    try {
        const { error } = await adminClient
            .from('channels')
            .insert({
                name,
                description,
                join_link,
                slug,
                category_id,
                stats: { subscribers: '0' },
                image: '/images/logo.png', // Default image or handle upload later
                verified: false,
                featured: false
            });

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Add error:', error);
        return { error: 'Failed to add channel' };
    }
}
