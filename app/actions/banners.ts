'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type BannerType = 'homepage' | 'category';

export interface Banner {
    id: string;
    type: BannerType;
    category_id?: string | null;
    title: string;
    subtitle?: string | null;
    image_url?: string | null;
    link_url?: string | null;
    button_text?: string | null;
    bg_color?: string | null;
    active: boolean;
    display_order: number;
    badge_text?: string | null;
    badge_bg_color?: string | null;
}

export async function getBanners(type?: BannerType, categoryId?: string) {
    let query = supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

    if (type) {
        query = query.eq('type', type);
    }

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching banners:', error);
        return [];
    }

    return data as Banner[];
}

export async function saveBanner(banner: Partial<Banner>) {
    const { data, error } = await supabase
        .from('banners')
        .upsert({
            id: banner.id,
            type: banner.type || 'homepage',
            category_id: banner.category_id,
            title: banner.title,
            subtitle: banner.subtitle,
            image_url: banner.image_url,
            link_url: banner.link_url,
            button_text: banner.button_text,
            bg_color: banner.bg_color,
            active: banner.active ?? true,
            display_order: banner.display_order ?? 0,
            badge_text: banner.badge_text,
            badge_bg_color: banner.badge_bg_color
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving banner:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/banners');
    if (banner.category_id) {
        revalidatePath('/[slug]', 'page');
    }

    return { success: true, banner: data };
}

export async function deleteBanner(id: string) {
    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting banner:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true };
}

export async function toggleBannerActive(id: string, currentState: boolean) {
    const { error } = await supabase
        .from('banners')
        .update({ active: !currentState })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/banners');
    return { success: true };
}
