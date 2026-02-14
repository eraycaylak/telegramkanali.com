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
        '/kanal-ekle'
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.7,
    }));

    // 2. Dynamic Data from database
    const { data: channels } = await getChannels(1, 2000); // Fetch more for sitemap
    const categories = await getCategories();
    const seoPages = await getSeoPages();

    // Regex to filter out suspicious or non-standard slugs if any
    const isValidSlug = (slug: string) => /^[a-z0-9-]+$/.test(slug) && slug.length > 2 && !slug.startsWith('-');

    const channelsUrls = channels
        .filter(c => isValidSlug(c.slug))
        .map((channel) => ({
            url: `${baseUrl}/${channel.slug}`,
            lastModified: new Date(channel.created_at ?? Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

    const categoriesUrls = categories
        .filter(cat => isValidSlug(cat.slug))
        .map((category) => ({
            url: `${baseUrl}/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        }));

    const seoPageUrls = seoPages.map((page) => ({
        url: `${baseUrl}/rehber/${page.slug}`,
        lastModified: new Date(page.updated_at ?? page.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Blog posts
    const blogSlugs = await getAllBlogSlugs();
    const blogUrls = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        ...staticPages,
        ...categoriesUrls,
        ...seoPageUrls,
        ...blogUrls,
        ...channelsUrls,
    ];
}
