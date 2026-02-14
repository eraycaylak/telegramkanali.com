import { supabase } from './supabaseClient';
import { Channel, Category, SeoPage, BlogPost } from './types';

// Fetch Categories
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return (data || []) as Category[];
}

// Fetch Channels
// Fetch Channels with Pagination & Filtering
export async function getChannels(
    page: number = 1,
    limit: number = 20,
    search?: string,
    categoryId?: string
): Promise<{ data: Channel[], count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('channels')
        .select('*, categories(name, slug)', { count: 'exact' });
    // .eq('status', 'approved');

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
    }

    // Default sorting
    query = query
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('[DATA] Error fetching channels:', error);
        return { data: [], count: 0 };
    }

    const mappedData = data.map((d: any) => ({
        ...d,
        categoryName: d.categories?.name,
    })) as Channel[];

    return { data: mappedData, count: count || 0 };
}

// Fetch Popular Channels (High Score)
// Fetch Popular Channels (High Score)
export async function getPopularChannels(limit: number = 5): Promise<Channel[]> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        // .eq('status', 'approved')
        .order('score', { ascending: false }) // Highest score first
        .limit(limit);

    if (error) {
        console.error('Error fetching popular channels:', error);
        return [];
    }

    return (data || []).map((d: any) => ({
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
    // .eq('status', 'approved');

    if (error) return [];
    return (data || []).map((d: any) => ({ ...d, category: d.category_id, categoryName: d.categories?.name })) as Channel[];
}

export async function getNewChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        // .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) return [];
    return (data || []).map((d: any) => ({ ...d, category: d.category_id, categoryName: d.categories?.name })) as Channel[];
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
    const { data, error } = await supabase
        .from('channels')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .eq('slug', slug)
        // .eq('status', 'approved') // Disabled until status migration is applied
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
        .eq('category_id', categoryId)
        .order('score', { ascending: false })
        .order('created_at', { ascending: false });
    // .eq('status', 'approved'); // Disabled until status migration is applied

    if (error) return [];
    return (data || []).map((d: any) => ({ ...d, category: d.category_id, categoryName: d.categories?.name })) as Channel[];
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

export async function getAllChannelSlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from('channels')
        .select('slug');

    if (error) return [];
    return data.map((d: any) => d.slug);
}

// ========================
// BLOG FUNCTIONS
// ========================

export async function getBlogPosts(
    page: number = 1,
    limit: number = 12,
    category?: string,
    search?: string
): Promise<{ data: BlogPost[], count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('published', true);

    if (category) {
        query = query.eq('category', category);
    }

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    query = query
        .order('created_at', { ascending: false })
        .range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching blog posts:', error);
        return { data: [], count: 0 };
    }

    return { data: (data || []) as BlogPost[], count: count || 0 };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error || !data) return null;
    return data as BlogPost;
}

export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return (data || []) as BlogPost[];
}

export async function getRecentBlogPosts(limit: number = 6): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return (data || []) as BlogPost[];
}

export async function getAllBlogSlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('published', true);

    if (error) return [];
    return data.map((d: any) => d.slug);
}

export async function incrementBlogViewCount(id: string): Promise<void> {
    await supabase.rpc('increment_blog_view', { post_id: id }).catch(() => {
        // Fallback: direct update if RPC doesn't exist
        supabase
            .from('blog_posts')
            .update({ view_count: supabase.rpc('increment_blog_view', { post_id: id }) })
            .eq('id', id);
    });
}
