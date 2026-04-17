import type { Config, Context } from '@netlify/edge-functions'

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
// Edge function instance'ı başına bellekte tutulur.
// Aynı IP aynı edge node'a geldiğinde yakalanır (bots genelde aynı lokasyondan gelir).
const rateMap = new Map<string, { count: number; resetAt: number }>()

const LIMIT = 120        // 1 dakikada max istek sayısı per IP
const WINDOW = 60_000    // 1 dakika (ms)

// ─── Bilinen Kötü Bot User-Agent'ları ────────────────────────────────────────
const BAD_BOT_PATTERNS = [
    /GPTBot/i, /ChatGPT-User/i, /ClaudeBot/i, /Google-Extended/i,
    /CCBot/i, /anthropic-ai/i, /Bytespider/i, /Amazonbot/i,
    /SemrushBot/i, /AhrefsBot/i, /DotBot/i, /MJ12bot/i,
    /python-requests/i, /python-urllib/i, /Go-http-client/i,
    /scrapy/i, /curl\/\d/i, /wget\/\d/i, /masscan/i, /nikto/i,
    /sqlmap/i, /zgrab/i, /nuclei/i, /PetalBot/i, /DataForSeoBot/i,
]

function isBadBot(ua: string): boolean {
    return BAD_BOT_PATTERNS.some(p => p.test(ua))
}

export default async function handler(request: Request, context: Context) {
    const ua = request.headers.get('user-agent') || ''

    // 1. Kötü bot UA → anında 403
    if (isBadBot(ua) || ua.length < 10) {
        return new Response('Forbidden', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' },
        })
    }

    // 2. Rate limiting per IP
    const ip = context.ip
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown'

    const now = Date.now()
    const record = rateMap.get(ip)

    if (!record || now > record.resetAt) {
        rateMap.set(ip, { count: 1, resetAt: now + WINDOW })
    } else {
        record.count++
        if (record.count > LIMIT) {
            return new Response('Too Many Requests', {
                status: 429,
                headers: {
                    'Retry-After': '60',
                    'Content-Type': 'text/plain',
                    'X-RateLimit-Limit': String(LIMIT),
                    'X-RateLimit-Remaining': '0',
                },
            })
        }
    }

    // 3. Bellek temizliği (10K IP geçince eski kayıtları sil)
    if (rateMap.size > 10_000) {
        for (const [key, val] of rateMap) {
            if (now > val.resetAt) rateMap.delete(key)
        }
    }

    return context.next()
}

export const config: Config = {
    path: '/*',
    excludedPath: [
        '/_next/static/*',
        '/_next/image/*',
        '/favicon.ico',
        '/favicon.png',
        '/bassagligi.svg',
        '/*.svg',
        '/*.png',
        '/*.jpg',
        '/*.jpeg',
        '/*.webp',
        '/*.ico',
        '/*.woff',
        '/*.woff2',
        '/*.css',
        '/*.js',
    ],
}
