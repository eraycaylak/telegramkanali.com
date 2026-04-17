import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Genel kural — meşru botlar için
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/private/', '/dashboard/', '/go/', '/login', '/register', '/callback'],
            },
            // Google — tam erişim (SEO için)
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/dashboard/', '/go/', '/login', '/register', '/callback'],
            },
            // Bing — tam erişim
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/dashboard/', '/go/', '/login', '/register', '/callback'],
            },
            // AI eğitim botları — tüm site engelli
            { userAgent: 'GPTBot', disallow: ['/'] },
            { userAgent: 'ChatGPT-User', disallow: ['/'] },
            { userAgent: 'ClaudeBot', disallow: ['/'] },
            { userAgent: 'Google-Extended', disallow: ['/'] },
            { userAgent: 'CCBot', disallow: ['/'] },
            { userAgent: 'anthropic-ai', disallow: ['/'] },
            { userAgent: 'Bytespider', disallow: ['/'] },
            { userAgent: 'Amazonbot', disallow: ['/'] },
            { userAgent: 'Diffbot', disallow: ['/'] },
            { userAgent: 'PerplexityBot', disallow: ['/'] },
            { userAgent: 'YouBot', disallow: ['/'] },
            // Agresif SEO botları — tüm site engelli
            { userAgent: 'SemrushBot', disallow: ['/'] },
            { userAgent: 'AhrefsBot', disallow: ['/'] },
            { userAgent: 'DotBot', disallow: ['/'] },
            { userAgent: 'MJ12bot', disallow: ['/'] },
            { userAgent: 'BLEXBot', disallow: ['/'] },
            { userAgent: 'PetalBot', disallow: ['/'] },
            { userAgent: 'DataForSeoBot', disallow: ['/'] },
        ],
        sitemap: 'https://telegramkanali.com/sitemap.xml',
    }
}
