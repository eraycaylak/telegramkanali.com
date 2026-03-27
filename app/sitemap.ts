import { MetadataRoute } from 'next';
import { getChannels, getCategories, getSeoPages, getAllBlogSlugs } from '@/lib/data';

export const baseUrl = 'https://telegramkanali.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Pages
    const staticPages = [
        '',
        '/hakkimizda',
        '/iletisim',
        '/gizlilik',
        '/kullanim-sartlari',
        '/webmaster',
        '/blog',
        '/yeni-eklenenler',
        '/one-cikanlar',
        '/reklam',
        '/trends',
        '/populer',
        '/kunye',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.7,
    }));

    // 2. Şehir bazlı SEO sayfaları
    const cityPages = [
        'istanbul', 'ankara', 'izmir', 'bursa', 'antalya',
        'adana', 'konya', 'gaziantep', 'mersin', 'kayseri'
    ].map(city => ({
        url: `${baseUrl}/${city}-telegram-gruplari`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    // 3. Dynamic Data from database — fetch in parallel for speed
    const [{ data: channels }, categories, seoPages, blogSlugs] = await Promise.all([
        getChannels(1, 2000),
        getCategories(),
        getSeoPages(),
        getAllBlogSlugs(),
    ]);

    // Filter out invalid slugs
    const isValidSlug = (slug: string) => {
        if (!slug) return false;
        if (slug.length < 3) return false;
        if (slug.startsWith('-') || slug.endsWith('-')) return false;
        if (slug.includes('--')) return false;
        if (slug.startsWith('telegram-contact-')) return false;
        if (!/^[a-z0-9-]+$/.test(slug)) return false;
        return true;
    };

    const validChannels = channels.filter(c => {
        if (!isValidSlug(c.slug)) return false;
        if (!c.description || c.description.trim().length < 20) return false;
        return true;
    });

    // Dynamic priority based on member count — bigger channels get higher crawl priority
    const getChannelPriority = (memberCount: number = 0): number => {
        if (memberCount >= 100000) return 0.9;
        if (memberCount >= 10000) return 0.8;
        if (memberCount >= 1000) return 0.7;
        return 0.5;
    };

    // Turkish channel URLs — use real updated_at date
    const channelsUrls = validChannels.map((channel) => ({
        url: `${baseUrl}/${channel.slug}`,
        lastModified: new Date((channel as any).updated_at ?? channel.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: getChannelPriority(channel.member_count),
    }));

    // English channel URLs
    const channelsUrlsEn = validChannels.map((channel) => ({
        url: `${baseUrl}/en/${channel.slug}`,
        lastModified: new Date((channel as any).updated_at ?? channel.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: Math.max(0.4, getChannelPriority(channel.member_count) - 0.1),
    }));

    const validCategories = categories.filter(cat => isValidSlug(cat.slug));

    // Turkish category URLs
    const categoriesUrls = validCategories.map((category) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date((category as any).updated_at ?? new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // English category URLs
    const categoriesUrlsEn = validCategories.map((category) => ({
        url: `${baseUrl}/en/${category.slug}`,
        lastModified: new Date((category as any).updated_at ?? new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const seoPageUrls = seoPages.map((page) => ({
        url: `${baseUrl}/rehber/${page.slug}`,
        lastModified: new Date(page.updated_at ?? page.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const blogUrls = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Trends pages — important for SEO, add them too
    let trendsUrls: MetadataRoute.Sitemap = [];
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: trends } = await supabase
            .from('trends')
            .select('slug, created_at, updated_at')
            .eq('is_active', true)
            .not('slug', 'is', null);

        if (trends) {
            trendsUrls = trends
                .filter(t => t.slug && isValidSlug(t.slug))
                .map(t => ({
                    url: `${baseUrl}/trends/${t.slug}`,
                    lastModified: new Date(t.updated_at ?? t.created_at ?? Date.now()),
                    changeFrequency: 'daily' as const,
                    priority: 0.75,
                }));
        }
    } catch {
        // Trends not critical for sitemap — skip silently if error
    }

    return [
        ...staticPages,
        ...cityPages,
        ...categoriesUrls,
        ...categoriesUrlsEn,
        ...seoPageUrls,
        ...blogUrls,
        ...trendsUrls,
        ...channelsUrls,
        ...channelsUrlsEn,
    ];
}
