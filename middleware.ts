import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Kötü Bot / Scraper User-Agent Listesi ────────────────────────────────────
// Cloudflare Bot Fight Mode birinci katman, bu ikinci katman (defense in depth)
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

// ─── Ana Middleware ───────────────────────────────────────────────────────────
// Rate limiting & DDoS koruması artık Cloudflare tarafından yapılıyor
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''

  // 1. Meşru arama motoru botları → her zaman geçir
  const GOOD_BOTS = /Googlebot|Google-InspectionTool|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot/i
  if (GOOD_BOTS.test(userAgent)) {
    return NextResponse.next()
  }

  // 2. Kötü botları engelle (Cloudflare'i bypass ederse ikinci katman)
  if (isBadBot(userAgent)) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // 3. Boş User-Agent = tarayıcı/scanner → engelle
  if (userAgent.length < 10) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // 4. Supabase auth — sadece korumalı rotalar için çalışır
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
