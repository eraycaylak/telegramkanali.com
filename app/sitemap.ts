import { MetadataRoute } from 'next';
import { getChannels, getCategories, getSeoPages } from '@/lib/data';

export const baseUrl = 'https://telegramkanali.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch dynamic data from database
    const { data: channels } = await getChannels(1, 1000); // Fetch up to 1000 for sitemap
    const categories = await getCategories();
    const seoPages = await getSeoPages();

    const channelsUrls = channels.map((channel) => ({
        url: `${baseUrl}/${channel.slug}`,
        lastModified: new Date(channel.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const categoriesUrls = categories.map((category) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    const seoPageUrls = seoPages.map((page) => ({
        url: `${baseUrl}/rehber/${page.slug}`,
        lastModified: new Date(page.updated_at ?? page.created_at ?? Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...categoriesUrls,
        ...seoPageUrls,
        ...channelsUrls,
    ];
}
