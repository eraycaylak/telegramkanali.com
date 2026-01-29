import { supabase } from './supabaseClient';
import { Channel, Category, SeoPage } from './types';

// Fetch Categories
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data as Category[];
}

// Fetch Channels
export async function getChannels(): Promise<Channel[]> {
    console.log('[DATA] Fetching all channels from Supabase...');
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        .order('score', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[DATA] Error fetching channels:', error);
        return [];
    }

    console.log('[DATA] Fetched channels count:', data?.length || 0);

    // Map DB fields to Type fields
    return data.map((d: any) => ({
        ...d,
        categoryName: d.categories?.name,
    })) as Channel[];
}

// Helpers
export async function getFeaturedChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        .eq('featured', true);

    if (error) return [];
    return data.map((d: any) => ({ ...d, category: d.category_id, categoryName: d.categories?.name })) as Channel[];
}

export async function getNewChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) return [];
    return data.map((d: any) => ({ ...d, category: d.category_id, categoryName: d.categories?.name })) as Channel[];
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return { ...data, categoryName: data.categories?.name } as Channel;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return data as Category;
}

export async function getChannelsByCategory(categoryId: string): Promise<Channel[]> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        .eq('category_id', categoryId);

    if (error) return [];
    return data.map((d: any) => ({ ...d, category: d.category_id, categoryName: d.categories?.name })) as Channel[];
}

// SEO Pages
export async function getSeoPageBySlug(slug: string): Promise<SeoPage | null> {
    const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error || !data) return null;
    return data as SeoPage;
}

export async function getSeoPages(): Promise<SeoPage[]> {
    const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data as SeoPage[];
}

export async function getAllSeoSlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from('seo_pages')
        .select('slug')
        .eq('published', true);

    if (error) return [];
    return data.map((d: any) => d.slug);
}

// Export empty arrays as fallback for strict synchronous consumers if any left, 
// but we should update them to use functions.
export const categories: Category[] = [];
export const channels: Channel[] = [];

