import { MetadataRoute } from 'next';
import { channels, categories } from '@/lib/data';

export const baseUrl = 'https://telegramkanali.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const channelsUrls = channels.map((channel) => ({
        url: `${baseUrl}/kanallar/${channel.slug}`,
        lastModified: new Date(channel.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const categoriesUrls = categories.map((category) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...categoriesUrls,
        ...channelsUrls,
    ];
}
