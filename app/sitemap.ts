import { MetadataRoute } from 'next';
import { getChannels, getCategories, getSeoPages, getAllBlogSlugs } from '@/lib/data';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { getCryptoSitemapEntries } from '@/lib/crypto-pages';

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
        '/marketplace',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : route === '/marketplace' ? 0.95 : 0.7,
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

    // 2. Dynamic Data from database — limit kaldırıldı, tüm kanallar
    const { data: channels } = await getChannels(1, 10000);
    const categories = await getCategories();
    const seoPages = await getSeoPages();

    // 3. Marketplace aktif ilanlar
    const { data: marketplaceListings } = await getAdminClient()
        .from('channel_listings')
        .select('id, updated_at, created_at')
        .eq('status', 'active');

    const marketplaceUrls = (marketplaceListings || []).map((listing: { id: string; updated_at: string | null; created_at: string | null }) => ({
        url: `${baseUrl}/marketplace/${listing.id}`,
        lastModified: new Date(listing.updated_at ?? listing.created_at ?? Date.now()),
        changeFrequency: 'daily' as const,
        priority: 0.85,
    }));

    // Filter out invalid slugs
    const isValidSlug = (slug: string) => {
        if (!slug) return false;
        // Kategori slug'ları (ör. "18") 2 karakter olabilir — bunları dışlama
        if (slug.length < 2) return false;
        if (slug.startsWith('-') || slug.endsWith('-')) return false;
        if (slug.includes('--')) return false;
        if (slug.startsWith('telegram-contact-')) return false;
        if (!/^[a-z0-9-]+$/.test(slug)) return false;
        return true;
    };

    const validChannels = channels.filter(c => {
        if (!isValidSlug(c.slug)) return false;
        // Kalite filtresi: açıklama en az 50 karakter olmalı (thin content sinyali verme)
        if (!c.description || c.description.trim().length < 50) return false;
        return true;
    });

    // Üye sayısına göre dinamik priority — daha iyi crawl budget kullanımı
    const channelsUrls = validChannels.map((channel) => {
        const memberCount = (channel as any).member_count || 0;
        const score = (channel as any).score || 0;
        let priority = 0.5;
        if (memberCount > 50000 || score >= 100) priority = 0.9;
        else if (memberCount > 10000 || score >= 50) priority = 0.75;
        else if (memberCount > 1000) priority = 0.65;
        const lastMod = (channel as any).updated_at || channel.created_at;
        return {
            url: `${baseUrl}/kanallar/${channel.slug}`,
            lastModified: new Date(lastMod ?? Date.now()),
            changeFrequency: priority >= 0.75 ? 'daily' as const : 'weekly' as const,
            priority,
        };
    });

    const validCategories = categories.filter(cat => isValidSlug(cat.slug));

    // Kategoriler — en yüksek öncelik (crawl budget'ın en verimli kısmı)
    const categoriesUrls = validCategories.map((category) => ({
        url: `${baseUrl}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
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

    // ====================================================
    // 🚀 KRİPTO Landing Pages — 30 sayfa, lib/crypto-pages'ten otomatik
    // ====================================================
    const cryptoKeywordPages = getCryptoSitemapEntries().map(({ slug, priority }) => ({
        url: `${baseUrl}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority,
    }));

    // +18 Ana Keyword Hedef Sayfaları
    const keyword18Pages = [
        'telegram-18-kanallari',
        '18-telegram-kanallari',
        '18-telegram',
        'turk-18-telegram-kanallari',
        'ucretsiz-18-telegram-kanallari',
    ].map(slug => ({
        url: `${baseUrl}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.95,
    }));

    // İfşa sayfaları next.config.ts'de 301 redirect ile /telegram-18-kanallari'ya
    // yönlendirildiği için sitemap'e dahil edilMEMELİ (crawl budget israfını önle)
    // Kaldırıldı: 2026-04-21

    return [
        ...staticPages,
        ...cityPages,
        ...cryptoKeywordPages,   // 🚀 KRİPTO — EN ÖNCE (crawl önceliği için)
        ...keyword18Pages,
        ...marketplaceUrls,
        ...categoriesUrls,
        ...seoPageUrls,
        ...blogUrls,
        ...channelsUrls,
    ];
}
