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
        '/kanal-ekle',
        '/trends',
        '/populer',
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

    // 2. Dynamic Data from database
    const { data: channels } = await getChannels(1, 2000);
    const categories = await getCategories();
    const seoPages = await getSeoPages();

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

    // Turkish channel URLs (dynamic priority based on score)
    const channelsUrls = validChannels.map((channel) => {
        const score = (channel as any).score || 0;
        const priority = score >= 100 ? 0.8 : score >= 50 ? 0.7 : 0.6;
        const lastMod = (channel as any).updated_at || channel.created_at;
        return {
            url: `${baseUrl}/${channel.slug}`,
            lastModified: new Date(lastMod ?? Date.now()),
            changeFrequency: score >= 50 ? 'daily' as const : 'weekly' as const,
            priority,
        };
    });

    // English channel URLs
    const channelsUrlsEn = validChannels.map((channel) => {
        const score = (channel as any).score || 0;
        const priority = score >= 100 ? 0.7 : score >= 50 ? 0.6 : 0.5;
        const lastMod = (channel as any).updated_at || channel.created_at;
        return {
            url: `${baseUrl}/en/${channel.slug}`,
            lastModified: new Date(lastMod ?? Date.now()),
            changeFrequency: 'weekly' as const,
            priority,
        };
    });

    const validCategories = categories.filter(cat => isValidSlug(cat.slug));

    // Turkish category URLs
    const categoriesUrls = validCategories.map((category) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // English category URLs
    const categoriesUrlsEn = validCategories.map((category) => ({
        url: `${baseUrl}/en/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const seoPageUrls = seoPages.map((page) => ({
        url: `${baseUrl}/rehber/${page.slug}`,
        lastModified: new Date(page.updated_at ?? page.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const blogSlugs = await getAllBlogSlugs();
    const blogUrls = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // İfşa programatik SEO sayfaları
    const ifsaPages = [
        'telegram-ifsa-kanallari',
        'telegram-unlu-ifsa-kanallari',
        'telegram-18-ifsa-kanallari',
        'telegram-turk-ifsa-kanallari',
        'telegram-ifsa',
    ].map(slug => ({
        url: `${baseUrl}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    return [
        ...staticPages,
        ...cityPages,
        ...ifsaPages,
        ...categoriesUrls,
        ...categoriesUrlsEn,
        ...seoPageUrls,
        ...blogUrls,
        ...channelsUrls,
        ...channelsUrlsEn,
    ];
}
