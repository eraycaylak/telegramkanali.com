import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/private/', '/dashboard/', '/go/', '/login', '/register', '/callback'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/dashboard/', '/go/', '/login', '/register', '/callback'],
            },
        ],
        sitemap: 'https://telegramkanali.com/sitemap.xml',
    }
}
