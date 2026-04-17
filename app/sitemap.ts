import { MetadataRoute } from 'next';
import { getChannels, getCategories, getSeoPages, getAllBlogSlugs } from '@/lib/data';
import { getAdminClient } from '@/lib/supabaseAdmin';

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

    // 2. Dynamic Data from database
    const { data: channels } = await getChannels(1, 2000);
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

    const validCategories = categories.filter(cat => isValidSlug(cat.slug));

    // Turkish category URLs
    const categoriesUrls = validCategories.map((category) => ({
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

    const blogSlugs = await getAllBlogSlugs();
    const blogUrls = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // ====================================================
    // 🚀 KRİPTO Ana Keyword Hedef Sayfaları — MAX ÖNCELİK
    // ====================================================
    const cryptoKeywordPages = [
        // Tier 1: En yüksek hacim — priority 0.98
        { slug: 'kripto-telegram-kanallari',     p: 0.98 },  // kripto telegram kanalları
        { slug: 'bitcoin-telegram-kanallari',     p: 0.98 },  // bitcoin telegram kanalları
        { slug: 'borsa-telegram-kanallari',       p: 0.98 },  // borsa telegram kanalları
        { slug: 'kripto-sinyal-telegram',         p: 0.98 },  // kripto sinyal telegram
        { slug: 'kripto-para-telegram',           p: 0.98 },  // kripto para telegram
        { slug: 'kripto-para',                    p: 0.98 },  // ana kripto hub sayfası

        // Tier 2: Yüksek hacim — priority 0.96
        { slug: 'ethereum-telegram-kanallari',    p: 0.96 },  // ethereum telegram
        { slug: 'binance-telegram-kanallari',     p: 0.96 },  // binance telegram
        { slug: 'altcoin-telegram-kanallari',     p: 0.96 },  // altcoin telegram
        { slug: 'futures-telegram-kanallari',     p: 0.96 },  // futures telegram
        { slug: 'bist-telegram-kanallari',        p: 0.96 },  // bist telegram
        { slug: 'solana-telegram-kanallari',      p: 0.96 },  // solana telegram
        { slug: 'usdt-telegram-kanallari',        p: 0.96 },  // usdt telegram
        { slug: 'defi-telegram-kanallari',        p: 0.95 },  // defi telegram
        { slug: 'nft-telegram-kanallari',         p: 0.95 },  // nft telegram
    ].map(({ slug, p }) => ({
        url: `${baseUrl}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: p,
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
        ...cryptoKeywordPages,   // 🚀 KRİPTO — EN ÖNCE (crawl önceliği için)
        ...keyword18Pages,
        ...ifsaPages,
        ...marketplaceUrls,
        ...categoriesUrls,
        ...seoPageUrls,
        ...blogUrls,
        ...channelsUrls,
    ];
}
