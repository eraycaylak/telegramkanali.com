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

    // Regex to filter out suspicious or non-standard slugs
    // 1. Must be alphanumeric + hyphens
    // 2. Must be > 2 chars
    // 3. Must not start/end with hyphen
    // 4. Must not contain consecutive hyphens (--)
    // 5. Must not start with 'telegram-contact-' (junk data)
    const isValidSlug = (slug: string) => {
        if (!slug) return false;
        if (slug.length < 3) return false;
        if (slug.startsWith('-') || slug.endsWith('-')) return false;
        if (slug.includes('--')) return false;
        if (slug.startsWith('telegram-contact-')) return false;
        if (!/^[a-z0-9-]+$/.test(slug)) return false;
        return true;
    };

    const channelsUrls = channels
        .filter(c => {
            // Filter by slug
            if (!isValidSlug(c.slug)) return false;

            // Filter by description length (Thin Content Check)
            // If description is missing or very short, skip it to save crawl budget
            if (!c.description || c.description.trim().length < 20) return false;

            return true;
        })
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
