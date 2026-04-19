import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Kötü Bot / Scraper User-Agent Listesi ────────────────────────────────────
// Bu botlar bandwidth ve function invocation tüketiyor, hiçbir değer üretmiyor
const BAD_BOT_PATTERNS: RegExp[] = [
  // AI eğitim botları
  /GPTBot/i,
  /ChatGPT-User/i,
  /ClaudeBot/i,
  /Google-Extended/i,
  /CCBot/i,
  /anthropic-ai/i,
  /Bytespider/i,
  /Amazonbot/i,
  /Diffbot/i,
  /omgili/i,
  /Applebot-Extended/i,
  /ImagesiftBot/i,
  /YouBot/i,
  /PerplexityBot/i,
  // Agresif SEO botları
  /SemrushBot/i,
  /AhrefsBot/i,
  /DotBot/i,
  /MJ12bot/i,
  /BLEXBot/i,
  /PetalBot/i,
  /DataForSeoBot/i,
  /serpstatbot/i,
  /SEOkicks/i,
  /linkdexbot/i,
  /Screaming.Frog/i,
  /cognitiveSEO/i,
  /seoscannerbot/i,
  // Generic HTTP istemcileri ve tarayıcılar
  /python-requests/i,
  /python-urllib/i,
  /Go-http-client/i,
  /Java\/\d/i,
  /libwww-perl/i,
  /curl\/\d/i,
  /wget\/\d/i,
  /scrapy/i,
  /node-fetch/i,
  /axios\/\d/i,
  /php\/\d/i,
  /ruby/i,
  // Güvenlik tarayıcıları / saldırı araçları
  /masscan/i,
  /nikto/i,
  /sqlmap/i,
  /zgrab/i,
  /nuclei/i,
  /nmap/i,
  /dirbuster/i,
  /gobuster/i,
  /wpscan/i,
  /acunetix/i,
]

function isBadBot(userAgent: string): boolean {
  for (const pattern of BAD_BOT_PATTERNS) {
    if (pattern.test(userAgent)) return true
  }
  return false
}

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
// Next.js middleware instance başına bellekte tutulur.
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 200     // 1 dakikada max istek sayısı per IP
const RATE_WINDOW = 60_000 // 1 dakika (ms)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateMap.get(ip)

  if (!record || now > record.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false // not limited
  }

  record.count++
  if (record.count > RATE_LIMIT) {
    return true // rate limited
  }

  // Bellek temizliği
  if (rateMap.size > 10_000) {
    for (const [key, val] of rateMap) {
      if (now > val.resetAt) rateMap.delete(key)
    }
  }

  return false
}

// ─── Ana Middleware ───────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''

  // 1. Meşru arama motoru botları → her zaman geçir
  //    Bu kontrol olmadan Googlebot engellenebilir ve indeksleme durabilir!
  const GOOD_BOTS = /Googlebot|Google-InspectionTool|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot/i
  if (GOOD_BOTS.test(userAgent)) {
    return NextResponse.next()
  }

  // 2. Kötü botları anında engelle — DB çağrısı yok, bandwidth sıfır
  if (isBadBot(userAgent)) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // 3. Boş User-Agent = ham tarayıcı/scanner → engelle
  if (userAgent.length < 10) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // 4. Rate Limiting per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  if (checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'text/plain',
        'X-RateLimit-Limit': String(RATE_LIMIT),
        'X-RateLimit-Remaining': '0',
      },
    })
  }

  // 5. Supabase auth — sadece korumalı rotalar için çalışır
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/kanal-ekle'

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // /kanal-ekle → /dashboard/kanal-ekle yönlendirmesi
  if (pathname === '/kanal-ekle') {
    return NextResponse.redirect(new URL('/dashboard/kanal-ekle', request.url))
  }

  // /dashboard koruması
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Zaten giriş yapmış → /login veya /register'dan uzaklaştır
  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Bot koruması: static asset'ler hariç her şey
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)).*)',
  ],
}

