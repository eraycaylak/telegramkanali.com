#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🕷️  SEO SPIDER PRO v2.0                                    ║
 * ║  Semrush / Ahrefs / Screaming Frog kalitesinde SEO aracı    ║
 * ║  telegramkanali.com için özelleştirilmiş                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Kullanım:
 *   node crawler.js                 → Normal tarama
 *   node crawler.js --quick         → Hızlı (sadece sitemap)
 *   node crawler.js --full          → Tam tarama (tüm keşfedilen linkler)
 *   node crawler.js --no-telegram   → Telegram kontrolü yapmadan
 *   node crawler.js --max=500       → Maksimum 500 sayfa tara
 */

import * as cheerio from 'cheerio';
import { SingleBar, Presets } from 'cli-progress';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════
const args = process.argv.slice(2);
const isQuick = args.includes('--quick');
const isFull = args.includes('--full');
const noTelegram = args.includes('--no-telegram');
const maxArg = args.find(a => a.startsWith('--max='));
const maxPages = maxArg ? parseInt(maxArg.split('=')[1]) : (isQuick ? 5000 : isFull ? 10000 : 5000);

const CONFIG = {
    baseUrl: 'https://telegramkanali.com',
    sitemapUrl: 'https://telegramkanali.com/sitemap.xml',
    maxConcurrency: 8,
    requestDelay: 200,
    requestTimeout: 20000,
    maxPages,
    userAgent: 'Mozilla/5.0 (compatible; SEOSpiderPro/2.0; +https://telegramkanali.com)',
    checkTelegramLinks: !noTelegram,
    telegramDelay: 800,
    // SEO Thresholds
    thresholds: {
        titleMinLen: 20,
        titleMaxLen: 70,
        titleIdealMin: 30,
        titleIdealMax: 60,
        descMinLen: 50,
        descMaxLen: 160,
        descIdealMin: 120,
        descIdealMax: 155,
        h1Max: 1,
        urlMaxLen: 115,
        urlMaxDepth: 4,
        minWordCount: 100,
        goodWordCount: 300,
        maxResponseTime: 3000,
        slowResponseTime: 1500,
        maxPageSize: 3 * 1024 * 1024, // 3MB
        maxImageSize: 200 * 1024,      // 200KB
    },
};

// ═══════════════════════════════════════════════
// DATA STORAGE
// ═══════════════════════════════════════════════
const crawledUrls = new Set();
const pageResults = [];
const telegramResults = [];
const allInternalLinks = new Map();  // url -> Set<source pages>
const allExternalLinks = new Map();
const allTelegramLinks = new Map();
const allAnchors = new Map();        // anchor text -> [{from, to}]
const allResources = { css: new Set(), js: new Set(), images: new Set(), fonts: new Set() };
const redirectChains = [];
const orphanPages = [];
let robotsTxtContent = '';
let robotsTxtRules = [];
let sitemapUrlList = [];

let startTime = Date.now();
let stats = {
    totalFetched: 0,
    totalBytes: 0,
    status2xx: 0, status3xx: 0, status4xx: 0, status5xx: 0, statusTimeout: 0,
};

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════

function normalizeUrl(url, base) {
    try {
        const parsed = new URL(url, base);
        parsed.hash = '';
        if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
            parsed.pathname = parsed.pathname.slice(0, -1);
        }
        return parsed.href;
    } catch { return null; }
}

function isInternalUrl(url) {
    try { return new URL(url).hostname === new URL(CONFIG.baseUrl).hostname; }
    catch { return false; }
}

function isTelegramUrl(url) {
    try {
        const h = new URL(url).hostname;
        return h === 't.me' || h === 'telegram.me';
    } catch { return false; }
}

function getUrlDepth(url) {
    try {
        const path = new URL(url).pathname;
        return path.split('/').filter(Boolean).length;
    } catch { return 0; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function truncate(s, n = 60) { return !s ? '' : s.length > n ? s.slice(0, n) + '…' : s; }
function escHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(2) + ' MB';
}
function formatDuration(ms) {
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
    return m > 0 ? `${m}dk ${s % 60}sn` : `${s}sn`;
}
function pct(part, total) { return total === 0 ? 0 : Math.round((part / total) * 100); }

// ═══════════════════════════════════════════════
// FETCHER
// ═══════════════════════════════════════════════

async function fetchUrl(url, timeout = CONFIG.requestTimeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const start = Date.now();
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': CONFIG.userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
                'Accept-Encoding': 'identity',
            },
            redirect: 'follow',
        });
        const responseTime = Date.now() - start;
        const body = await res.text();
        clearTimeout(timer);
        stats.totalFetched++;
        stats.totalBytes += body.length;
        if (res.status < 300) stats.status2xx++;
        else if (res.status < 400) stats.status3xx++;
        else if (res.status < 500) stats.status4xx++;
        else stats.status5xx++;
        return {
            ok: res.ok, status: res.status, statusText: res.statusText,
            finalUrl: res.url, redirected: res.redirected,
            headers: Object.fromEntries(res.headers.entries()),
            contentType: res.headers.get('content-type') || '',
            body, responseTime,
        };
    } catch (e) {
        clearTimeout(timer);
        stats.statusTimeout++;
        return {
            ok: false, status: e.name === 'AbortError' ? 408 : 0,
            statusText: e.name === 'AbortError' ? 'Timeout' : e.message,
            finalUrl: url, redirected: false, headers: {},
            contentType: '', body: '', responseTime: timeout,
        };
    }
}

// ═══════════════════════════════════════════════
// ROBOTS.TXT PARSER
// ═══════════════════════════════════════════════

async function fetchRobotsTxt() {
    console.log(chalk.cyan('  🤖 robots.txt kontrol ediliyor...'));
    const res = await fetchUrl(CONFIG.baseUrl + '/robots.txt', 10000);
    if (!res.ok) {
        console.log(chalk.yellow('    ⚠ robots.txt bulunamadı'));
        return;
    }
    robotsTxtContent = res.body;
    const lines = res.body.split('\n');
    let currentAgent = '*';
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed) continue;
        const [key, ...valParts] = trimmed.split(':');
        const val = valParts.join(':').trim();
        if (key.toLowerCase() === 'user-agent') currentAgent = val;
        else if (key.toLowerCase() === 'disallow') robotsTxtRules.push({ agent: currentAgent, type: 'disallow', path: val });
        else if (key.toLowerCase() === 'allow') robotsTxtRules.push({ agent: currentAgent, type: 'allow', path: val });
        else if (key.toLowerCase() === 'sitemap') { /* sitemap reference */ }
    }
    console.log(chalk.green(`    ✓ ${robotsTxtRules.length} kural bulundu`));
}

function isBlockedByRobots(url) {
    try {
        const path = new URL(url).pathname;
        for (const rule of robotsTxtRules) {
            if (rule.agent !== '*' && rule.agent !== CONFIG.userAgent) continue;
            if (rule.type === 'disallow' && path.startsWith(rule.path) && rule.path !== '') return true;
        }
    } catch {}
    return false;
}

// ═══════════════════════════════════════════════
// SITEMAP PARSER
// ═══════════════════════════════════════════════

async function parseSitemap(url) {
    console.log(chalk.cyan(`  📋 Sitemap: ${url}`));
    const res = await fetchUrl(url, 30000);
    if (!res.ok) { console.log(chalk.red(`    ✗ Okunamadı: ${res.statusText}`)); return []; }

    const $ = cheerio.load(res.body, { xmlMode: true });
    const urls = [];
    const subSitemaps = $('sitemapindex sitemap loc');
    if (subSitemaps.length > 0) {
        console.log(chalk.yellow(`    → ${subSitemaps.length} alt sitemap`));
        for (const el of subSitemaps.toArray()) {
            urls.push(...await parseSitemap($(el).text().trim()));
        }
    } else {
        $('urlset url').each((_, el) => {
            const loc = $(el).find('loc').text().trim();
            const lastmod = $(el).find('lastmod').text().trim();
            const priority = $(el).find('priority').text().trim();
            const changefreq = $(el).find('changefreq').text().trim();
            if (loc) urls.push({ url: loc, lastmod, priority, changefreq });
        });
    }
    console.log(chalk.green(`    ✓ ${urls.length} URL`));
    return urls;
}

// ═══════════════════════════════════════════════
// SECURITY HEADERS ANALYZER
// ═══════════════════════════════════════════════

function analyzeSecurityHeaders(headers) {
    const checks = [];
    const h = (name) => headers[name.toLowerCase()] || headers[name] || null;

    // HTTPS
    checks.push({
        name: 'HTTPS',
        status: CONFIG.baseUrl.startsWith('https') ? 'pass' : 'fail',
        detail: CONFIG.baseUrl.startsWith('https') ? 'Site HTTPS kullanıyor ✓' : 'Site HTTP kullanıyor! HTTPS\'e geçin.',
        importance: 'critical',
    });

    // HSTS
    const hsts = h('strict-transport-security');
    checks.push({
        name: 'HSTS (Strict-Transport-Security)',
        status: hsts ? 'pass' : 'fail',
        detail: hsts ? `Aktif: ${hsts}` : 'HSTS header eksik. Tarayıcılar HTTP\'yi otomatik HTTPS\'e yönlendirmez.',
        importance: 'high',
    });

    // X-Content-Type-Options
    const xcto = h('x-content-type-options');
    checks.push({
        name: 'X-Content-Type-Options',
        status: xcto === 'nosniff' ? 'pass' : 'fail',
        detail: xcto === 'nosniff' ? 'nosniff aktif ✓' : 'Eksik. MIME-type sniffing saldırılarına karşı koruma yok.',
        importance: 'medium',
    });

    // X-Frame-Options
    const xfo = h('x-frame-options');
    checks.push({
        name: 'X-Frame-Options',
        status: xfo ? 'pass' : 'warning',
        detail: xfo ? `Aktif: ${xfo}` : 'Eksik. Clickjacking saldırılarına açık olabilirsiniz.',
        importance: 'medium',
    });

    // Content-Security-Policy
    const csp = h('content-security-policy');
    checks.push({
        name: 'Content-Security-Policy (CSP)',
        status: csp ? 'pass' : 'warning',
        detail: csp ? 'CSP tanımlı ✓' : 'CSP header eksik. XSS saldırılarına karşı ek koruma yok.',
        importance: 'medium',
    });

    // X-XSS-Protection (legacy but still checked)
    const xxss = h('x-xss-protection');
    checks.push({
        name: 'X-XSS-Protection',
        status: xxss ? 'pass' : 'info',
        detail: xxss ? `Aktif: ${xxss}` : 'Eksik (modern tarayıcılarda CSP daha etkili).',
        importance: 'low',
    });

    // Referrer-Policy
    const rp = h('referrer-policy');
    checks.push({
        name: 'Referrer-Policy',
        status: rp ? 'pass' : 'warning',
        detail: rp ? `Aktif: ${rp}` : 'Eksik. Referrer bilgisi kontrolsüz paylaşılabilir.',
        importance: 'low',
    });

    // Permissions-Policy
    const pp = h('permissions-policy') || h('feature-policy');
    checks.push({
        name: 'Permissions-Policy',
        status: pp ? 'pass' : 'info',
        detail: pp ? 'Aktif ✓' : 'Eksik. Kamera, mikrofon, konum gibi API\'ler kısıtlanmamış.',
        importance: 'low',
    });

    // Server header leak
    const server = h('server');
    checks.push({
        name: 'Server Bilgisi Gizleme',
        status: !server || server === 'cloudflare' ? 'pass' : 'info',
        detail: server ? `Server: ${server} (bilgi sızıntısı)` : 'Server header gizli ✓',
        importance: 'low',
    });

    // X-Powered-By
    const xpb = h('x-powered-by');
    checks.push({
        name: 'X-Powered-By Gizleme',
        status: !xpb ? 'pass' : 'warning',
        detail: xpb ? `X-Powered-By: ${xpb} (kaldırılmalı, bilgi sızıntısı)` : 'X-Powered-By gizli ✓',
        importance: 'low',
    });

    return checks;
}

// ═══════════════════════════════════════════════
// STRUCTURED DATA (Schema.org) ANALYZER
// ═══════════════════════════════════════════════

function analyzeStructuredData($, url) {
    const schemas = [];

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            const items = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
            for (const item of items) {
                schemas.push({
                    type: item['@type'] || 'Unknown',
                    format: 'JSON-LD',
                    url,
                    valid: true,
                    properties: Object.keys(item).filter(k => !k.startsWith('@')),
                });
            }
        } catch {
            schemas.push({ type: 'Parse Error', format: 'JSON-LD', url, valid: false, properties: [] });
        }
    });

    // Microdata
    $('[itemtype]').each((_, el) => {
        const type = $(el).attr('itemtype') || '';
        schemas.push({
            type: type.split('/').pop() || type,
            format: 'Microdata',
            url,
            valid: true,
            properties: [],
        });
    });

    return schemas;
}

// ═══════════════════════════════════════════════
// FULL PAGE ANALYZER
// ═══════════════════════════════════════════════

function analyzePage(url, response, depth = 0, source = 'sitemap') {
    const html = response.body;
    const $ = cheerio.load(html);
    const issues = [];
    const T = CONFIG.thresholds;

    // ─── HTTP STATUS ───
    if (response.status >= 500) {
        issues.push({ cat: 'http', sev: 'critical', code: 'STATUS_5XX', msg: `Sunucu hatası (${response.status})`, detail: `Bu sayfa sunucu hatası döndürüyor. Google bu sayfayı indekslemez ve kullanıcılar erişemez. Sunucu loglarını kontrol edin.` });
    } else if (response.status >= 400) {
        issues.push({ cat: 'http', sev: 'critical', code: 'STATUS_4XX', msg: `İstemci hatası (${response.status})`, detail: `Bu sayfa ${response.status} hatası veriyor. ${response.status === 404 ? '404: Sayfa bulunamadı. Bu URL atıfta bulunulan her yerden kaldırılmalı veya doğru URL\'ye yönlendirilmeli.' : 'Bu hata kodunu araştırın ve düzeltin.'}` });
    } else if (response.status === 0 || response.status === 408) {
        issues.push({ cat: 'http', sev: 'critical', code: 'TIMEOUT', msg: 'Zaman aşımı', detail: `Sunucu ${CONFIG.requestTimeout / 1000} saniye içinde yanıt vermedi. Bu ciddi bir performans problemidir. Sunucu kaynakları, veritabanı sorguları ve hosting planınızı kontrol edin.` });
    }

    // ─── REDIRECT ───
    let redirectUrl = null;
    if (response.redirected && response.finalUrl !== url) {
        redirectUrl = response.finalUrl;
        const isHttpToHttps = url.replace('http://', '') === response.finalUrl.replace('https://', '');
        if (!isHttpToHttps) {
            issues.push({ cat: 'redirect', sev: 'info', code: 'REDIRECT', msg: `Yönlendirme → ${truncate(response.finalUrl, 80)}`, detail: `Bu URL başka bir URL'ye yönlendiriliyor. Eğer bu kalıcı bir değişiklikse, sitemap ve iç linklerden eski URL'yi yeni URL ile değiştirin. Gereksiz yönlendirmeler crawl budget israf eder.` });
        }
    }

    // ─── TITLE TAG ───
    const title = $('title').first().text().trim();
    if (!title) {
        issues.push({ cat: 'title', sev: 'critical', code: 'TITLE_MISSING', msg: 'Title etiketi eksik', detail: 'Sayfa başlığı (title tag) sayfanın en önemli SEO öğesidir. Google arama sonuçlarında bu metin gösterilir. Her sayfada benzersiz ve açıklayıcı bir title olmalıdır.' });
    } else {
        if (title.length < T.titleMinLen) {
            issues.push({ cat: 'title', sev: 'warning', code: 'TITLE_SHORT', msg: `Title çok kısa (${title.length} kar.)`, detail: `Title ${T.titleIdealMin}-${T.titleIdealMax} karakter arasında olmalıdır. Kısa title'lar arama sonuçlarında daha az tıklama alır ve Google'a sayfa hakkında yeterli sinyal vermez.` });
        } else if (title.length > T.titleMaxLen) {
            issues.push({ cat: 'title', sev: 'warning', code: 'TITLE_LONG', msg: `Title çok uzun (${title.length} kar.)`, detail: `Title ${T.titleMaxLen} karakterden uzun. Google bu title'ı arama sonuçlarında kesecektir. İdeal aralık: ${T.titleIdealMin}-${T.titleIdealMax} karakter.` });
        }
    }

    // ─── META DESCRIPTION ───
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
    if (!metaDesc) {
        issues.push({ cat: 'meta', sev: 'error', code: 'DESC_MISSING', msg: 'Meta description eksik', detail: 'Meta description, Google arama sonuçlarında title altında gösterilir. Eksik olduğunda Google sayfadan rastgele metin seçer ve bu genellikle kullanıcı için anlamsız olur. CTR (tıklama oranı) düşer.' });
    } else {
        if (metaDesc.length < T.descMinLen) {
            issues.push({ cat: 'meta', sev: 'warning', code: 'DESC_SHORT', msg: `Meta description kısa (${metaDesc.length} kar.)`, detail: `Meta description ${T.descIdealMin}-${T.descIdealMax} karakter arasında olmalıdır. Kısa açıklamalar arama sonuçlarında daha az ikna edici görünür.` });
        } else if (metaDesc.length > T.descMaxLen) {
            issues.push({ cat: 'meta', sev: 'info', code: 'DESC_LONG', msg: `Meta description uzun (${metaDesc.length} kar.)`, detail: `Meta description ${T.descMaxLen} karakterden uzun. Google bunu kesecektir. İdeal: ${T.descIdealMin}-${T.descIdealMax} karakter.` });
        }
    }

    // ─── META ROBOTS ───
    const metaRobots = $('meta[name="robots"]').attr('content')?.trim() || '';
    if (metaRobots.includes('noindex')) {
        issues.push({ cat: 'indexing', sev: 'info', code: 'NOINDEX', msg: 'Sayfa noindex', detail: 'Bu sayfa "noindex" etiketine sahip, yani Google bu sayfayı indekslemeyecek. Eğer bu bilinçli bir tercihse sorun yok. Aksi halde kaldırın.' });
    }
    if (metaRobots.includes('nofollow')) {
        issues.push({ cat: 'indexing', sev: 'info', code: 'NOFOLLOW', msg: 'Sayfa nofollow', detail: 'Bu sayfa "nofollow" etiketine sahip. Sayfadaki hiçbir link Google tarafından takip edilmeyecek. İç link değeri (link juice) aktarılmaz.' });
    }

    // ─── CANONICAL ───
    const canonical = $('link[rel="canonical"]').attr('href')?.trim() || '';
    if (!canonical) {
        issues.push({ cat: 'canonical', sev: 'warning', code: 'CANONICAL_MISSING', msg: 'Canonical tag eksik', detail: 'Canonical URL, arama motorlarına bu sayfanın "asıl" versiyonunun hangisi olduğunu söyler. Eksik olduğunda, Google farklı URL varyasyonlarını duplicate içerik olarak algılayabilir (örn: ?page=1, /page vs /page/ gibi).' });
    } else {
        const normalizedCanonical = normalizeUrl(canonical, url);
        const normalizedUrl = normalizeUrl(url, url);
        if (normalizedCanonical && normalizedUrl && normalizedCanonical !== normalizedUrl) {
            issues.push({ cat: 'canonical', sev: 'info', code: 'CANONICAL_DIFF', msg: `Canonical farklı: ${truncate(canonical, 60)}`, detail: 'Canonical URL bu sayfanın URL\'sinden farklı. Bu, Google\'a "asıl içerik şurada" demektir. Bu sayfa indekslenmez, yerine canonical URL indekslenir.' });
        }
    }

    // ─── HEADINGS ───
    const h1s = []; $('h1').each((_, el) => h1s.push($(el).text().trim()));
    const h2s = []; $('h2').each((_, el) => h2s.push($(el).text().trim()));
    const h3s = []; $('h3').each((_, el) => h3s.push($(el).text().trim()));

    if (h1s.length === 0) {
        issues.push({ cat: 'heading', sev: 'error', code: 'H1_MISSING', msg: 'H1 etiketi eksik', detail: 'H1, sayfanın ana başlığıdır ve Google için en önemli ikinci sinyaldir (title\'dan sonra). Her sayfada bir adet, sayfanın konusunu açıklayan H1 olmalıdır.' });
    } else if (h1s.length > 1) {
        issues.push({ cat: 'heading', sev: 'warning', code: 'H1_MULTIPLE', msg: `${h1s.length} adet H1`, detail: `Sayfada ${h1s.length} H1 etiketi var. Google teknik olarak bunu destekler, ancak en iyi pratik tek bir H1 kullanmaktır. Diğerlerini H2\'ye dönüştürün.` });
    }

    if (h1s.length > 0 && h2s.length === 0) {
        issues.push({ cat: 'heading', sev: 'info', code: 'NO_H2', msg: 'H2 etiketi yok', detail: 'Sayfa H2 alt başlıkları kullanmıyor. İçeriği H2, H3 gibi alt başlıklarla yapılandırmak hem kullanıcı deneyimini hem SEO\'yu iyileştirir.' });
    }

    // ─── URL STRUCTURE ───
    const urlPath = new URL(url).pathname;
    const urlDepth = getUrlDepth(url);
    if (url.length > T.urlMaxLen) {
        issues.push({ cat: 'url', sev: 'warning', code: 'URL_LONG', msg: `URL çok uzun (${url.length} kar.)`, detail: `URL'ler ${T.urlMaxLen} karakterden kısa olmalıdır. Uzun URL'ler kullanıcı deneyimini ve paylaşılabilirliği olumsuz etkiler. Google da uzun URL'leri kısaltabilir.` });
    }
    if (urlDepth > T.urlMaxDepth) {
        issues.push({ cat: 'url', sev: 'info', code: 'URL_DEEP', msg: `URL derinliği yüksek (${urlDepth} seviye)`, detail: `Bu sayfa ${urlDepth} seviye derinlikte. Google derin sayfalara daha az önem verir. İdeal derinlik 1-3 seviyedir.` });
    }
    if (/[A-Z]/.test(urlPath)) {
        issues.push({ cat: 'url', sev: 'warning', code: 'URL_UPPERCASE', msg: 'URL\'de büyük harf var', detail: 'URL\'lerde büyük harf kullanmak duplicate içerik sorununa yol açabilir (/Page ve /page farklı URL olarak kabul edilir). URL\'lerinizi küçük harfe dönüştürün.' });
    }
    if (urlPath.includes('_')) {
        issues.push({ cat: 'url', sev: 'info', code: 'URL_UNDERSCORE', msg: 'URL\'de alt çizgi (_) var', detail: 'Google alt çizgiyi kelime ayırıcı olarak görmez. "telegram_kanali" → tek kelime olarak algılanır. Tire (-) kullanın: "telegram-kanali".' });
    }

    // ─── CONTENT ───
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 1).length;
    if (wordCount < T.minWordCount && response.status < 300) {
        issues.push({ cat: 'content', sev: 'warning', code: 'THIN_CONTENT', msg: `İnce içerik (${wordCount} kelime)`, detail: `Bu sayfada yalnızca ${wordCount} kelime var. Google "thin content" olarak değerlendirip sıralama düşürebilir. En az ${T.goodWordCount} kelime içerik hedefleyin.` });
    }

    // ─── LINKS ───
    const internalLinks = new Set();
    const externalLinks = new Set();
    const telegramLinks = new Set();
    const nofollowLinks = [];

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        const fullUrl = normalizeUrl(href, url);
        if (!fullUrl) return;

        const anchorText = $(el).text().trim();
        const rel = $(el).attr('rel') || '';
        const isNofollow = rel.includes('nofollow');

        if (isNofollow) nofollowLinks.push({ url: fullUrl, anchor: anchorText });

        // Track anchor texts
        if (anchorText && anchorText.length > 1) {
            if (!allAnchors.has(anchorText)) allAnchors.set(anchorText, []);
            allAnchors.get(anchorText).push({ from: url, to: fullUrl });
        }

        if (isTelegramUrl(fullUrl)) {
            telegramLinks.add(fullUrl);
            if (!allTelegramLinks.has(fullUrl)) allTelegramLinks.set(fullUrl, new Set());
            allTelegramLinks.get(fullUrl).add(url);
        } else if (isInternalUrl(fullUrl)) {
            internalLinks.add(fullUrl);
            if (!allInternalLinks.has(fullUrl)) allInternalLinks.set(fullUrl, new Set());
            allInternalLinks.get(fullUrl).add(url);
        } else {
            externalLinks.add(fullUrl);
            if (!allExternalLinks.has(fullUrl)) allExternalLinks.set(fullUrl, new Set());
            allExternalLinks.get(fullUrl).add(url);
        }
    });

    if (internalLinks.size === 0 && response.status < 300) {
        issues.push({ cat: 'links', sev: 'warning', code: 'NO_INTERNAL_LINKS', msg: 'İç link yok', detail: 'Bu sayfada hiç iç link yok. İç linkler Google\'ın sitenizi anlamasına yardımcı olur ve "link juice" dağıtır. İlgili sayfalara link ekleyin.' });
    }

    // ─── IMAGES ───
    const images = [];
    const imagesWithoutAlt = [];
    $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || '';
        const alt = $(el).attr('alt')?.trim() || '';
        const loading = $(el).attr('loading') || '';
        const width = $(el).attr('width') || '';
        const height = $(el).attr('height') || '';
        images.push({ src, alt, loading, width, height });
        if (!alt) imagesWithoutAlt.push(src);

        if (src) allResources.images.add(normalizeUrl(src, url) || src);
    });

    if (imagesWithoutAlt.length > 0) {
        issues.push({ cat: 'images', sev: 'warning', code: 'IMG_NO_ALT', msg: `${imagesWithoutAlt.length} resimde alt tag eksik`, detail: `Alt tag, görüntü yüklenemediğinde veya ekran okuyucu kullanıldığında gösterilen metindir. Google Görsel Arama\'da sıralanmak için gereklidir. Her resme açıklayıcı alt tag ekleyin.` });
    }

    const imagesNoSize = images.filter(i => !i.width || !i.height);
    if (imagesNoSize.length > 0) {
        issues.push({ cat: 'images', sev: 'info', code: 'IMG_NO_SIZE', msg: `${imagesNoSize.length} resimde width/height eksik`, detail: 'Resimlerde width ve height belirtmek CLS (Cumulative Layout Shift) skorunu iyileştirir. Bu bir Core Web Vitals metriğidir ve sıralamayı etkiler.' });
    }

    // ─── RESOURCES (CSS, JS) ───
    $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) allResources.css.add(normalizeUrl(href, url) || href);
    });
    $('script[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src) allResources.js.add(normalizeUrl(src, url) || src);
    });

    // ─── OPEN GRAPH ───
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
    const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || '';
    const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || '';
    const ogType = $('meta[property="og:type"]').attr('content')?.trim() || '';
    const ogUrl = $('meta[property="og:url"]').attr('content')?.trim() || '';

    if (!ogTitle) issues.push({ cat: 'social', sev: 'info', code: 'OG_TITLE_MISSING', msg: 'og:title eksik', detail: 'Open Graph title Facebook, Twitter, Telegram gibi sosyal medyada paylaşıldığında görünen başlığı belirler. Eksik olduğunda platform otomatik seçim yapar.' });
    if (!ogImage) issues.push({ cat: 'social', sev: 'info', code: 'OG_IMAGE_MISSING', msg: 'og:image eksik', detail: 'Open Graph image sosyal medya paylaşımlarında görünen resimdir. Bu olmadan paylaşımlar görsel olarak zayıf kalır ve daha az tıklama alır.' });

    // ─── TWITTER CARD ───
    const twCard = $('meta[name="twitter:card"]').attr('content')?.trim() || '';
    if (!twCard) {
        issues.push({ cat: 'social', sev: 'info', code: 'TW_CARD_MISSING', msg: 'Twitter Card eksik', detail: 'Twitter Card meta tagları X (Twitter) paylaşımlarının görünümünü kontrol eder.' });
    }

    // ─── STRUCTURED DATA ───
    const schemas = analyzeStructuredData($, url);
    if (schemas.length === 0 && response.status < 300) {
        issues.push({ cat: 'structured', sev: 'info', code: 'NO_SCHEMA', msg: 'Schema.org verisi yok', detail: 'Yapılandırılmış veri (structured data) Google\'ın sayfayı daha iyi anlamasını sağlar ve zengin snippet (yıldız, fiyat, FAQ vb.) görüntülemesine olanak tanır. JSON-LD formatında ekleyin.' });
    }

    // ─── VIEWPORT ───
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    if (!viewport) {
        issues.push({ cat: 'mobile', sev: 'error', code: 'NO_VIEWPORT', msg: 'Viewport meta tag eksik', detail: 'Viewport meta tag mobil uyum için zorunludur. Eksik olduğunda Google siteyi "mobil uyumlu değil" olarak işaretler. Mobile-first indexing\'de bu kritiktir.' });
    }

    // ─── LANGUAGE ───
    const htmlLang = $('html').attr('lang') || '';
    if (!htmlLang) {
        issues.push({ cat: 'i18n', sev: 'info', code: 'NO_LANG', msg: 'HTML lang attribute eksik', detail: 'HTML lang özelliği sayfanın dilini belirtir. Ekran okuyucular ve arama motorları için önemlidir. <html lang="tr"> ekleyin.' });
    }

    // ─── HREFLANG ───
    const hreflangs = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
        hreflangs.push({ lang: $(el).attr('hreflang'), url: $(el).attr('href') });
    });

    // ─── PERFORMANCE ───
    if (response.responseTime > T.maxResponseTime) {
        issues.push({ cat: 'performance', sev: 'error', code: 'SLOW_PAGE', msg: `Çok yavaş (${(response.responseTime / 1000).toFixed(1)}sn)`, detail: `Bu sayfa ${(response.responseTime / 1000).toFixed(1)} saniyede yüklendi. Google 3 saniyenin üzerini "yavaş" kabul eder. Yavaş sayfalar hem sıralama hem de kullanıcı deneyimini olumsuz etkiler. Sunucu optimizasyonu, önbellek, CDN ve resource minimize etmeyi düşünün.` });
    } else if (response.responseTime > T.slowResponseTime) {
        issues.push({ cat: 'performance', sev: 'warning', code: 'MODERATE_SPEED', msg: `Biraz yavaş (${(response.responseTime / 1000).toFixed(1)}sn)`, detail: `Yanıt süresi 1.5-3 saniye arası. İyileştirme yapılabilir.` });
    }

    const pageSize = html.length;
    if (pageSize > T.maxPageSize) {
        issues.push({ cat: 'performance', sev: 'warning', code: 'LARGE_PAGE', msg: `Büyük sayfa (${formatBytes(pageSize)})`, detail: `Sayfa boyutu ${formatBytes(pageSize)}. Büyük sayfalar mobilde yavaş yüklenir ve veri tüketir. HTML\'i minimize edin, gereksiz içeriği lazy-load yapın.` });
    }

    // ─── FAVICON ───
    const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';

    // ─── INLINE STYLES ───
    const inlineStyleCount = $('[style]').length;
    if (inlineStyleCount > 20) {
        issues.push({ cat: 'best-practice', sev: 'info', code: 'INLINE_STYLES', msg: `${inlineStyleCount} adet inline style`, detail: 'Fazla inline style bakım zorluğu yaratır ve CSS dosyaları ile cache avantajını kaybettirir.' });
    }

    return {
        url,
        statusCode: response.status,
        statusText: response.statusText,
        contentType: response.contentType,
        responseTime: response.responseTime,
        pageSize,
        title, titleLen: title?.length || 0,
        metaDescription: metaDesc, descLen: metaDesc?.length || 0,
        metaRobots, canonical,
        h1s, h2s, h3s,
        internalLinks: [...internalLinks],
        externalLinks: [...externalLinks],
        telegramLinks: [...telegramLinks],
        nofollowLinks,
        images, imagesWithoutAlt,
        wordCount,
        redirectUrl,
        issues,
        depth, source,
        ogTitle, ogDesc, ogImage, ogType, ogUrl,
        twCard,
        schemas,
        viewport,
        htmlLang,
        hreflangs,
        favicon,
        urlDepth,
        headers: response.headers,
        crawledAt: new Date().toISOString(),
    };
}

// ═══════════════════════════════════════════════
// TELEGRAM LINK CHECKER
// ═══════════════════════════════════════════════

async function checkTelegramLink(url) {
    try {
        const response = await fetchUrl(url, 10000);
        const $ = cheerio.load(response.body);
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        const ogDesc = $('meta[property="og:description"]').attr('content') || '';
        const bodyText = $('body').text() || '';
        const ogImage = $('meta[property="og:image"]').attr('content') || '';

        let status = 'unknown';
        if (response.status === 404) status = 'dead';
        else if (bodyText.includes('tg://resolve') || bodyText.includes('tg://join') || ogTitle) status = 'alive';
        else if (bodyText.includes("doesn't exist") || bodyText.includes("can't be displayed")) status = 'dead';
        else if (response.status >= 400) status = 'dead';
        else status = ogTitle ? 'alive' : 'uncertain';

        const channelName = ogTitle || extractChannelName(url);
        const memberMatch = ogDesc.match(/([\d\s]+)\s*(members?|subscribers?|üye)/i);
        const memberCount = memberMatch ? memberMatch[1].replace(/\s/g, '') : '';

        return { url, status, statusCode: response.status, channelName, memberCount, ogImage, foundOn: [...(allTelegramLinks.get(url) || [])] };
    } catch {
        return { url, status: 'error', statusCode: 0, channelName: extractChannelName(url), memberCount: '', ogImage: '', foundOn: [...(allTelegramLinks.get(url) || [])] };
    }
}

function extractChannelName(url) {
    try { return new URL(url).pathname.replace(/^\/+/, '').split('/')[0] || ''; }
    catch { return ''; }
}

// ═══════════════════════════════════════════════
// BATCH CRAWLER
// ═══════════════════════════════════════════════

async function crawlBatch(urls, progressBar) {
    const results = [];
    for (let i = 0; i < urls.length; i += CONFIG.maxConcurrency) {
        const batch = urls.slice(i, i + CONFIG.maxConcurrency);
        const promises = batch.map(async (item) => {
            const url = typeof item === 'string' ? item : item.url;
            if (crawledUrls.has(url)) { progressBar?.increment(); return null; }
            crawledUrls.add(url);
            const response = await fetchUrl(url);
            progressBar?.increment();
            if (response.contentType?.includes('text/html')) {
                return analyzePage(url, response, item.depth || 0, item.source || 'sitemap');
            }
            return {
                url, statusCode: response.status, statusText: response.statusText,
                contentType: response.contentType, responseTime: response.responseTime,
                pageSize: response.body.length, issues: response.status >= 400 ? [{ cat: 'http', sev: 'critical', code: 'STATUS_ERR', msg: `HTTP ${response.status}`, detail: '' }] : [],
                depth: item.depth || 0, source: item.source || 'sitemap',
                crawledAt: new Date().toISOString(),
            };
        });
        const batch_results = await Promise.all(promises);
        results.push(...batch_results.filter(Boolean));
        if (i + CONFIG.maxConcurrency < urls.length) await sleep(CONFIG.requestDelay);
    }
    return results;
}

// ═══════════════════════════════════════════════
// REPORT GENERATOR
// ═══════════════════════════════════════════════

function generateReport(data) {
    const { pages, telegramChecks, totalTime, securityHeaders } = data;
    const T = CONFIG.thresholds;
    const total = pages.length;
    const ok = pages.filter(p => p.statusCode >= 200 && p.statusCode < 300).length;
    const redir = pages.filter(p => p.statusCode >= 300 && p.statusCode < 400).length;
    const err4 = pages.filter(p => p.statusCode >= 400 && p.statusCode < 500).length;
    const err5 = pages.filter(p => p.statusCode >= 500).length;
    const tout = pages.filter(p => p.statusCode === 408 || p.statusCode === 0).length;

    const allIssues = pages.flatMap(p => (p.issues || []).map(i => ({ ...i, url: p.url })));
    const criticals = allIssues.filter(i => i.sev === 'critical');
    const errors = allIssues.filter(i => i.sev === 'error');
    const warnings = allIssues.filter(i => i.sev === 'warning');
    const infos = allIssues.filter(i => i.sev === 'info');

    const noTitle = pages.filter(p => p.title !== undefined && !p.title).length;
    const noDesc = pages.filter(p => p.metaDescription !== undefined && !p.metaDescription).length;
    const noH1 = pages.filter(p => p.h1s && p.h1s.length === 0).length;
    const multiH1 = pages.filter(p => p.h1s && p.h1s.length > 1).length;
    const noCanonical = pages.filter(p => p.canonical !== undefined && !p.canonical).length;
    const noViewport = pages.filter(p => p.viewport !== undefined && !p.viewport).length;
    const thinContent = pages.filter(p => p.wordCount !== undefined && p.wordCount < T.minWordCount && p.statusCode < 300).length;
    const slowPages = pages.filter(p => p.responseTime > T.slowResponseTime);
    const noindexPages = pages.filter(p => p.metaRobots && p.metaRobots.includes('noindex')).length;

    const avgTime = total > 0 ? Math.round(pages.reduce((s, p) => s + (p.responseTime || 0), 0) / total) : 0;
    const avgSize = total > 0 ? Math.round(pages.reduce((s, p) => s + (p.pageSize || 0), 0) / total) : 0;
    const avgWords = total > 0 ? Math.round(pages.filter(p => p.wordCount).reduce((s, p) => s + p.wordCount, 0) / pages.filter(p => p.wordCount).length) : 0;

    const deadTg = telegramChecks.filter(t => t.status === 'dead');
    const aliveTg = telegramChecks.filter(t => t.status === 'alive');
    const uncTg = telegramChecks.filter(t => t.status !== 'alive' && t.status !== 'dead');

    // Duplicate detection
    const titleMap = new Map(), descMap = new Map();
    pages.forEach(p => {
        if (p.title) { if (!titleMap.has(p.title)) titleMap.set(p.title, []); titleMap.get(p.title).push(p.url); }
        if (p.metaDescription) { if (!descMap.has(p.metaDescription)) descMap.set(p.metaDescription, []); descMap.get(p.metaDescription).push(p.url); }
    });
    const dupTitles = [...titleMap.entries()].filter(([, u]) => u.length > 1);
    const dupDescs = [...descMap.entries()].filter(([, u]) => u.length > 1);

    // Orphan pages
    const linkedInternals = new Set(allInternalLinks.keys());
    const sitemapSet = new Set(sitemapUrlList.map(s => s.url));
    const orphans = pages.filter(p => p.statusCode < 300 && !linkedInternals.has(p.url) && p.url !== CONFIG.baseUrl && p.url !== CONFIG.baseUrl + '/');

    // SEO Score (weighted)
    let score = 100;
    score -= Math.min(noTitle * 4, 16);
    score -= Math.min(noDesc * 3, 12);
    score -= Math.min(noH1 * 2, 8);
    score -= Math.min(err4 * 5, 20);
    score -= Math.min(err5 * 8, 16);
    score -= Math.min(deadTg.length * 2, 10);
    score -= Math.min(dupTitles.length * 2, 8);
    score -= Math.min(thinContent, 5);
    score -= Math.min(noCanonical, 5);
    score -= Math.min(noViewport * 5, 10);
    score -= Math.min(Math.floor(slowPages.length / 2), 5);
    const secFails = securityHeaders.filter(h => h.status === 'fail').length;
    score -= Math.min(secFails * 2, 6);
    score = Math.max(0, Math.min(100, Math.round(score)));
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const scoreGrade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    // Issue categories grouped
    const issueGroups = {};
    allIssues.forEach(i => {
        const key = i.code || i.msg;
        if (!issueGroups[key]) issueGroups[key] = { ...i, count: 0, urls: [] };
        issueGroups[key].count++;
        if (issueGroups[key].urls.length < 5) issueGroups[key].urls.push(i.url);
    });
    const groupedIssues = Object.values(issueGroups).sort((a, b) => {
        const o = { critical: 0, error: 1, warning: 2, info: 3 };
        return (o[a.sev] ?? 9) - (o[b.sev] ?? 9) || b.count - a.count;
    });

    // Status breakdown for chart
    const statusBreakdown = {};
    pages.forEach(p => {
        const code = p.statusCode || 0;
        statusBreakdown[code] = (statusBreakdown[code] || 0) + 1;
    });

    // Depth distribution
    const depthDist = {};
    pages.forEach(p => {
        const d = p.urlDepth || 0;
        depthDist[d] = (depthDist[d] || 0) + 1;
    });

    // Content length distribution
    const wordBuckets = { '0-50': 0, '50-100': 0, '100-300': 0, '300-500': 0, '500-1000': 0, '1000+': 0 };
    pages.filter(p => p.wordCount !== undefined).forEach(p => {
        if (p.wordCount < 50) wordBuckets['0-50']++;
        else if (p.wordCount < 100) wordBuckets['50-100']++;
        else if (p.wordCount < 300) wordBuckets['100-300']++;
        else if (p.wordCount < 500) wordBuckets['300-500']++;
        else if (p.wordCount < 1000) wordBuckets['500-1000']++;
        else wordBuckets['1000+']++;
    });

    const now = new Date().toLocaleString('tr-TR');

    // Helper: make SVG bar chart
    function svgBar(values, labels, colors, width = 400, height = 200) {
        const max = Math.max(...values, 1);
        const bw = Math.floor((width - 40) / values.length) - 4;
        let bars = '';
        values.forEach((v, i) => {
            const bh = Math.max(2, (v / max) * (height - 40));
            const x = 30 + i * (bw + 4);
            const y = height - 30 - bh;
            bars += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="${colors[i % colors.length]}" opacity="0.85"/>`;
            bars += `<text x="${x + bw / 2}" y="${y - 5}" fill="#8b92a8" font-size="11" text-anchor="middle" font-weight="600">${v}</text>`;
            bars += `<text x="${x + bw / 2}" y="${height - 12}" fill="#6b7280" font-size="9" text-anchor="middle">${labels[i]}</text>`;
        });
        return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${width}px;height:auto;">${bars}</svg>`;
    }

    // Status donut chart using SVG
    function svgDonut(segments, size = 160) {
        const total = segments.reduce((s, seg) => s + seg.value, 0);
        if (total === 0) return '';
        let offset = 0;
        const radius = 60, cx = 80, cy = 80, circumference = 2 * Math.PI * radius;
        let paths = '';
        segments.forEach(seg => {
            const pct = seg.value / total;
            const dash = pct * circumference;
            const gap = circumference - dash;
            paths += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="20" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" opacity="0.85"/>`;
            offset += dash;
        });
        return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="width:${size}px;height:${size}px;">${paths}<text x="${cx}" y="${cy - 4}" fill="white" font-size="22" text-anchor="middle" font-weight="800">${total}</text><text x="${cx}" y="${cy + 14}" fill="#8b92a8" font-size="10" text-anchor="middle">SAYFA</text></svg>`;
    }

    const sevBadge = (s) => `<span class="sev sev-${s}">${s === 'critical' ? '🔴 Kritik' : s === 'error' ? '🟠 Hata' : s === 'warning' ? '🟡 Uyarı' : '🔵 Bilgi'}</span>`;
    const statusBadge = (c) => `<span class="st st-${c >= 500 ? '5xx' : c >= 400 ? '4xx' : c >= 300 ? '3xx' : c >= 200 ? '2xx' : 'err'}">${c}</span>`;
    const link = (u) => `<a href="${u}" target="_blank" class="lnk" title="${escHtml(u)}">${u.replace(CONFIG.baseUrl, '') || '/'}</a>`;

    return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO Spider Pro Raporu — telegramkanali.com — ${now}</title>
<style>
:root{--bg:#0a0b10;--s1:#12141d;--s2:#1a1d28;--s3:#222636;--bd:#2a2f42;--tx:#e2e5f0;--tx2:#8891ab;--ac:#6366f1;--ac2:#818cf8;--gr:#10b981;--rd:#ef4444;--yl:#eab308;--or:#f97316;--bl:#3b82f6;--pk:#ec4899;--cy:#06b6d4}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--tx);line-height:1.6;font-size:14px}
.wrap{max-width:1500px;margin:0 auto;padding:20px}
/* Header */
.hdr{background:linear-gradient(135deg,#1a1040 0%,#252060 40%,#1a1040 100%);border:1px solid var(--bd);border-radius:16px;padding:36px 40px;margin-bottom:20px;position:relative;overflow:hidden}
.hdr::after{content:'';position:absolute;top:-40%;right:-10%;width:500px;height:500px;background:radial-gradient(circle,rgba(99,102,241,.12),transparent 70%);pointer-events:none}
.hdr h1{font-size:26px;font-weight:800;letter-spacing:-.5px}
.hdr .sub{color:var(--tx2);font-size:13px;margin-top:2px}
.hdr .meta{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap;font-size:12px;color:var(--tx2)}
.hdr .meta b{color:var(--tx)}
/* Score */
.sc-row{display:flex;align-items:center;gap:28px;margin-top:20px}
.sc-ring{width:100px;height:100px;border-radius:50%;border:5px solid ${scoreColor};display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.35);flex-shrink:0}
.sc-ring .n{font-size:36px;font-weight:900;color:${scoreColor};line-height:1}
.sc-ring .g{font-size:12px;color:var(--tx2);font-weight:700;letter-spacing:2px}
.sc-list{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--tx2)}
.sc-list .d::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.sc-list .d.green::before{background:var(--gr)}.sc-list .d.red::before{background:var(--rd)}.sc-list .d.yellow::before{background:var(--yl)}.sc-list .d.blue::before{background:var(--bl)}
/* Stats Grid */
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;margin-bottom:20px}
.sc{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:16px;text-align:center}
.sc .v{font-size:28px;font-weight:800;line-height:1.1}
.sc .l{font-size:10px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-top:4px}
.sc.green .v{color:var(--gr)}.sc.red .v{color:var(--rd)}.sc.yellow .v{color:var(--yl)}.sc.blue .v{color:var(--bl)}.sc.purple .v{color:var(--ac)}.sc.cyan .v{color:var(--cy)}.sc.orange .v{color:var(--or)}.sc.pink .v{color:var(--pk)}
/* Tabs */
.tabs{display:flex;gap:2px;background:var(--s1);border-radius:12px;padding:4px;overflow-x:auto;border:1px solid var(--bd);margin-bottom:20px;-webkit-overflow-scrolling:touch}
.tab{padding:9px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:var(--tx2);white-space:nowrap;border:none;background:none;transition:.15s}
.tab:hover{color:var(--tx);background:var(--s2)}
.tab.on{background:var(--ac);color:#fff}
.tab .b{display:inline-block;background:rgba(255,255,255,.15);padding:1px 7px;border-radius:8px;font-size:10px;margin-left:5px}
.tab.on .b{background:rgba(255,255,255,.25)}
/* Content sections */
.sect{display:none}.sect.on{display:block}
/* Cards */
.card{background:var(--s1);border:1px solid var(--bd);border-radius:12px;overflow:hidden;margin-bottom:16px}
.card .ch{padding:14px 18px;font-size:15px;font-weight:700;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:8px}
.card .ch .cnt{margin-left:auto;font-size:12px;color:var(--tx2)}
/* Tables */
.tscr{max-height:600px;overflow-y:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 14px;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--tx2);background:var(--s2);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:1}
td{padding:8px 14px;font-size:12px;border-bottom:1px solid rgba(42,47,66,.5);max-width:350px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
tr:hover td{background:rgba(99,102,241,.04)}
/* Badges */
.st{display:inline-block;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700}
.st-2xx{background:rgba(16,185,129,.12);color:var(--gr)}
.st-3xx{background:rgba(234,179,8,.12);color:var(--yl)}
.st-4xx{background:rgba(239,68,68,.12);color:var(--rd)}
.st-5xx{background:rgba(239,68,68,.2);color:var(--rd)}
.st-err{background:rgba(239,68,68,.12);color:var(--rd)}
.sev{display:inline-block;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600}
.sev-critical{background:rgba(239,68,68,.15);color:#f87171}
.sev-error{background:rgba(249,115,22,.12);color:var(--or)}
.sev-warning{background:rgba(234,179,8,.12);color:var(--yl)}
.sev-info{background:rgba(59,130,246,.1);color:var(--bl)}
.tg-alive{background:rgba(16,185,129,.12);color:var(--gr)}
.tg-dead{background:rgba(239,68,68,.12);color:var(--rd)}
.tg-unc{background:rgba(234,179,8,.12);color:var(--yl)}
.lnk{color:var(--ac2);text-decoration:none;font-size:12px}.lnk:hover{text-decoration:underline}
.pass{color:var(--gr)}.fail{color:var(--rd)}.warn{color:var(--yl)}
/* Search */
.srch{width:100%;padding:10px 14px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-size:13px;margin-bottom:12px}.srch:focus{outline:none;border-color:var(--ac)}.srch::placeholder{color:var(--tx2)}
/* Detail box */
.det{background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:12px 16px;margin:8px 0;font-size:12px;color:var(--tx2);line-height:1.7}
.det b{color:var(--tx)}
/* Charts */
.chart-row{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
.chart-card{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:20px;flex:1;min-width:250px}
.chart-card h3{font-size:13px;font-weight:700;margin-bottom:12px;color:var(--tx2)}
.chart-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:var(--tx2)}
.chart-legend .ci{width:10px;height:10px;border-radius:3px;display:inline-block;margin-right:4px}
/* Inline grid */
.ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;margin-bottom:16px}
/* Accordion */
.acc{border:1px solid var(--bd);border-radius:8px;margin-bottom:6px;overflow:hidden}
.acc summary{padding:12px 16px;cursor:pointer;font-size:13px;font-weight:600;background:var(--s1);list-style:none}
.acc summary::-webkit-details-marker{display:none}
.acc summary::before{content:'▸';margin-right:8px;color:var(--ac)}
.acc[open] summary::before{content:'▾'}
.acc .inner{padding:12px 16px;background:var(--s2);font-size:12px}
/* Footer */
.ftr{text-align:center;color:var(--tx2);font-size:11px;padding:24px;border-top:1px solid var(--bd);margin-top:24px}
@media(max-width:768px){.wrap{padding:10px}.hdr{padding:20px}.hdr h1{font-size:20px}.sg{grid-template-columns:repeat(2,1fr)}.sc-row{flex-direction:column;align-items:flex-start}.chart-row{flex-direction:column}}
@media print{body{background:#fff;color:#000}.tabs,.srch{display:none}.sect{display:block!important}.card,.sc{border-color:#ddd}}
</style>
</head>
<body>
<div class="wrap">

<!-- ═══ HEADER ═══ -->
<div class="hdr">
<h1>🕷️ SEO Spider Pro — Detaylı Analiz Raporu</h1>
<div class="sub">telegramkanali.com</div>
<div class="meta">
<span>📅 <b>${now}</b></span>
<span>⏱️ <b>${formatDuration(totalTime)}</b></span>
<span>📄 <b>${total}</b> sayfa tarandı</span>
<span>📊 <b>${formatBytes(stats.totalBytes)}</b> veri indirildi</span>
<span>🔗 <b>${allInternalLinks.size}</b> iç link</span>
<span>🌐 <b>${allExternalLinks.size}</b> dış link</span>
<span>📱 <b>${allTelegramLinks.size}</b> Telegram linki</span>
</div>
<div class="sc-row">
<div class="sc-ring"><div class="n">${score}</div><div class="g">${scoreGrade}</div></div>
<div class="sc-list">
<div class="d green">${ok} sayfa sorunsuz (2xx)</div>
<div class="d red">${criticals.length} kritik sorun</div>
<div class="d yellow">${errors.length + warnings.length} uyarı & hata</div>
<div class="d red">${deadTg.length} ölü Telegram linki</div>
<div class="d blue">${dupTitles.length} duplicate title</div>
<div class="d yellow">${orphans.length} orphan sayfa</div>
</div>
</div>
</div>

<!-- ═══ STATS GRID ═══ -->
<div class="sg">
<div class="sc green"><div class="v">${ok}</div><div class="l">Başarılı (2xx)</div></div>
<div class="sc yellow"><div class="v">${redir}</div><div class="l">Yönlendirme</div></div>
<div class="sc red"><div class="v">${err4 + err5}</div><div class="l">Hata (4xx/5xx)</div></div>
<div class="sc blue"><div class="v">${avgTime}ms</div><div class="l">Ort. Yanıt</div></div>
<div class="sc purple"><div class="v">${noTitle}</div><div class="l">Title Eksik</div></div>
<div class="sc orange"><div class="v">${noDesc}</div><div class="l">Desc Eksik</div></div>
<div class="sc cyan"><div class="v">${noH1}</div><div class="l">H1 Eksik</div></div>
<div class="sc red"><div class="v">${deadTg.length}</div><div class="l">Ölü Kanal</div></div>
<div class="sc pink"><div class="v">${dupTitles.length}</div><div class="l">Dup. Title</div></div>
<div class="sc yellow"><div class="v">${thinContent}</div><div class="l">İnce İçerik</div></div>
<div class="sc blue"><div class="v">${avgWords}</div><div class="l">Ort. Kelime</div></div>
<div class="sc green"><div class="v">${formatBytes(avgSize)}</div><div class="l">Ort. Boyut</div></div>
</div>

<!-- ═══ TABS ═══ -->
<div class="tabs" id="tabs">
<button class="tab on" onclick="sw(0)">📊 Genel Bakış</button>
<button class="tab" onclick="sw(1)">🚨 Sorunlar <span class="b">${criticals.length + errors.length + warnings.length}</span></button>
<button class="tab" onclick="sw(2)">📄 Tüm Sayfalar <span class="b">${total}</span></button>
<button class="tab" onclick="sw(3)">📱 Telegram <span class="b">${telegramChecks.length}</span></button>
<button class="tab" onclick="sw(4)">🏷️ Title & Meta</button>
<button class="tab" onclick="sw(5)">🔗 Link Analizi</button>
<button class="tab" onclick="sw(6)">⚡ Performans</button>
<button class="tab" onclick="sw(7)">🔒 Güvenlik</button>
<button class="tab" onclick="sw(8)">📐 Yapısal Veri</button>
<button class="tab" onclick="sw(9)">🔄 Duplikeler</button>
<button class="tab" onclick="sw(10)">👻 Orphan</button>
<button class="tab" onclick="sw(11)">📊 Grafikler</button>
</div>

<!-- ═══════════════ TAB 0: OVERVIEW ═══════════════ -->
<div class="sect on" id="s0">

${criticals.length > 0 || errors.length > 0 ? `
<div class="card"><div class="ch">🔴 Kritik ve Hata Sorunları — Hemen Düzelt <span class="cnt">${criticals.length + errors.length}</span></div>
<div class="tscr"><table><thead><tr><th>Ciddiyet</th><th>Sorun</th><th>URL</th><th>Açıklama</th></tr></thead><tbody>
${[...criticals, ...errors].slice(0, 50).map(i => `<tr><td>${sevBadge(i.sev)}</td><td style="font-weight:600">${escHtml(i.msg)}</td><td>${link(i.url)}</td><td style="color:var(--tx2);white-space:normal;max-width:400px;font-size:11px">${escHtml(i.detail || '')}</td></tr>`).join('')}
</tbody></table></div></div>` : `<div class="card"><div class="ch" style="color:var(--gr)">✅ Kritik sorun bulunamadı! Harika!</div></div>`}

${deadTg.length > 0 ? `
<div class="card"><div class="ch">💀 Ölü Telegram Kanalları — Siteden Kaldır <span class="cnt">${deadTg.length}</span></div>
<div class="tscr"><table><thead><tr><th>Kanal</th><th>Link</th><th>Bulunduğu Sayfa(lar)</th></tr></thead><tbody>
${deadTg.map(t => `<tr><td style="font-weight:700">${escHtml(t.channelName)}</td><td><a href="${t.url}" target="_blank" class="lnk">${t.url}</a></td><td style="white-space:normal">${t.foundOn.slice(0, 3).map(u => u.replace(CONFIG.baseUrl, '')).join(', ')}${t.foundOn.length > 3 ? ` +${t.foundOn.length - 3}` : ''}</td></tr>`).join('')}
</tbody></table></div></div>` : ''}

<div class="card"><div class="ch">📋 Sorun Özeti (Gruplandırılmış)</div>
<div class="tscr"><table><thead><tr><th>Ciddiyet</th><th>Sorun Kodu</th><th>Açıklama</th><th>Etkilenen Sayfa</th></tr></thead><tbody>
${groupedIssues.slice(0, 40).map(g => `<tr><td>${sevBadge(g.sev)}</td><td style="font-weight:600;font-size:11px">${g.code}</td><td style="white-space:normal">${escHtml(g.msg)}</td><td style="font-weight:700">${g.count}</td></tr>`).join('')}
</tbody></table></div></div>

</div>

<!-- ═══════════════ TAB 1: ALL ISSUES ═══════════════ -->
<div class="sect" id="s1">
<input class="srch" placeholder="🔍 Sorun, URL veya kod ara..." onkeyup="ft(this,'t1')">

${groupedIssues.map(g => `
<details class="acc">
<summary>${sevBadge(g.sev)} <b>${escHtml(g.msg)}</b> — ${g.count} sayfa</summary>
<div class="inner">
<p style="margin-bottom:8px;color:var(--tx);line-height:1.8">${escHtml(g.detail || 'Detay mevcut değil.')}</p>
<b>Etkilenen sayfalar:</b>
<ul style="margin-top:6px;padding-left:20px">${g.urls.map(u => `<li>${link(u)}</li>`).join('')}${g.count > 5 ? `<li style="color:var(--tx2)">... ve ${g.count - 5} sayfa daha</li>` : ''}</ul>
</div>
</details>
`).join('')}
</div>

<!-- ═══════════════ TAB 2: ALL PAGES ═══════════════ -->
<div class="sect" id="s2">
<input class="srch" placeholder="🔍 URL, title veya durum ara..." onkeyup="ft(this,'t2')">
<div class="card"><div class="tscr"><table id="t2"><thead><tr><th>HTTP</th><th>URL</th><th>Title</th><th>T.Uzn</th><th>Desc Uzn</th><th>H1</th><th>Kelime</th><th>Boyut</th><th>Yanıt</th><th>Sorun</th></tr></thead><tbody>
${pages.map(p => `<tr>
<td>${statusBadge(p.statusCode)}</td>
<td>${link(p.url)}</td>
<td title="${escHtml(p.title)}" style="color:${!p.title ? 'var(--rd)' : ''}">${truncate(p.title || '—', 35)}</td>
<td style="color:${!p.titleLen ? 'var(--rd)' : p.titleLen > 70 ? 'var(--yl)' : ''}">${p.titleLen || '—'}</td>
<td style="color:${!p.descLen ? 'var(--rd)' : p.descLen > 160 ? 'var(--yl)' : ''}">${p.descLen || '—'}</td>
<td style="color:${p.h1s?.length === 0 ? 'var(--rd)' : p.h1s?.length > 1 ? 'var(--yl)' : 'var(--gr)'}">${p.h1s?.length ?? '—'}</td>
<td style="color:${p.wordCount < 100 ? 'var(--yl)' : ''}">${p.wordCount ?? '—'}</td>
<td>${p.pageSize ? formatBytes(p.pageSize) : '—'}</td>
<td style="color:${p.responseTime > 3000 ? 'var(--rd)' : p.responseTime > 1500 ? 'var(--yl)' : 'var(--gr)'}; font-weight:600">${p.responseTime || '—'}ms</td>
<td>${(p.issues || []).length > 0 ? `<span class="sev sev-warning">${p.issues.length}</span>` : '<span style="color:var(--gr)">✓</span>'}</td>
</tr>`).join('')}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 3: TELEGRAM ═══════════════ -->
<div class="sect" id="s3">
<div class="sg">
<div class="sc green"><div class="v">${aliveTg.length}</div><div class="l">Aktif Kanal</div></div>
<div class="sc red"><div class="v">${deadTg.length}</div><div class="l">Ölü / Kapanmış</div></div>
<div class="sc yellow"><div class="v">${uncTg.length}</div><div class="l">Belirsiz / Hata</div></div>
</div>
<input class="srch" placeholder="🔍 Kanal adı veya URL ara..." onkeyup="ft(this,'t3')">
<div class="card"><div class="tscr"><table id="t3"><thead><tr><th>Durum</th><th>Kanal</th><th>Link</th><th>HTTP</th><th>Üye</th><th>Bulunduğu Sayfa</th></tr></thead><tbody>
${telegramChecks.sort((a, b) => { const o = { dead: 0, error: 1, uncertain: 2, alive: 3 }; return (o[a.status] ?? 4) - (o[b.status] ?? 4); }).map(t => `<tr>
<td><span class="st ${t.status === 'alive' ? 'tg-alive' : t.status === 'dead' ? 'tg-dead' : 'tg-unc'}">${t.status === 'alive' ? '✅ Aktif' : t.status === 'dead' ? '💀 Ölü' : '❓ Belirsiz'}</span></td>
<td style="font-weight:700">${escHtml(t.channelName)}</td>
<td><a href="${t.url}" target="_blank" class="lnk">${t.url}</a></td>
<td>${t.statusCode}</td>
<td>${t.memberCount || '—'}</td>
<td style="white-space:normal">${t.foundOn.slice(0, 3).map(u => u.replace(CONFIG.baseUrl, '')).join(', ')}</td>
</tr>`).join('')}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 4: TITLE & META ═══════════════ -->
<div class="sect" id="s4">
<div class="sg">
<div class="sc red"><div class="v">${noTitle}</div><div class="l">Title Eksik</div></div>
<div class="sc orange"><div class="v">${pages.filter(p => p.titleLen > 0 && p.titleLen < 30).length}</div><div class="l">Title Kısa</div></div>
<div class="sc yellow"><div class="v">${pages.filter(p => p.titleLen > 70).length}</div><div class="l">Title Uzun</div></div>
<div class="sc red"><div class="v">${noDesc}</div><div class="l">Desc Eksik</div></div>
<div class="sc orange"><div class="v">${pages.filter(p => p.descLen > 0 && p.descLen < 50).length}</div><div class="l">Desc Kısa</div></div>
<div class="sc red"><div class="v">${noH1}</div><div class="l">H1 Eksik</div></div>
<div class="sc yellow"><div class="v">${multiH1}</div><div class="l">Çoklu H1</div></div>
<div class="sc pink"><div class="v">${dupTitles.length}</div><div class="l">Dup. Title Grubu</div></div>
</div>
<input class="srch" placeholder="🔍 Title, desc veya URL ara..." onkeyup="ft(this,'t4')">
<div class="card"><div class="tscr"><table id="t4"><thead><tr><th>URL</th><th>Title</th><th>Uzn</th><th>Meta Description</th><th>Uzn</th><th>H1</th><th>OG Title</th><th>Schema</th></tr></thead><tbody>
${pages.filter(p => p.title !== undefined).map(p => `<tr>
<td>${link(p.url)}</td>
<td title="${escHtml(p.title)}" style="color:${!p.title ? 'var(--rd)' : p.titleLen > 70 ? 'var(--yl)' : ''}">${truncate(p.title || '❌', 30)}</td>
<td>${p.titleLen}</td>
<td title="${escHtml(p.metaDescription)}" style="color:${!p.metaDescription ? 'var(--rd)' : p.descLen > 160 ? 'var(--yl)' : ''}">${truncate(p.metaDescription || '❌', 30)}</td>
<td>${p.descLen}</td>
<td style="color:${!p.h1s?.length ? 'var(--rd)' : p.h1s.length > 1 ? 'var(--yl)' : 'var(--gr)'}">${p.h1s?.length || 0}</td>
<td style="color:${p.ogTitle ? 'var(--gr)' : 'var(--tx2)'}">${p.ogTitle ? '✓' : '—'}</td>
<td style="color:${p.schemas?.length ? 'var(--gr)' : 'var(--tx2)'}">${p.schemas?.length || 0}</td>
</tr>`).join('')}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 5: LINK ANALYSIS ═══════════════ -->
<div class="sect" id="s5">
<div class="sg">
<div class="sc blue"><div class="v">${allInternalLinks.size}</div><div class="l">Benzersiz İç Link</div></div>
<div class="sc cyan"><div class="v">${allExternalLinks.size}</div><div class="l">Benzersiz Dış Link</div></div>
<div class="sc purple"><div class="v">${allTelegramLinks.size}</div><div class="l">Telegram Linki</div></div>
<div class="sc green"><div class="v">${pages.filter(p => p.internalLinks?.length > 0).length}</div><div class="l">İç Link İçeren</div></div>
<div class="sc red"><div class="v">${pages.filter(p => p.statusCode >= 400).length}</div><div class="l">Kırık Link Target</div></div>
</div>

<div class="det">
<b>📖 Link Analizi Nedir?</b><br>
İç linkler (internal links) Google'ın sitenizi keşfetmesini sağlar ve "link juice" (otorite) dağıtır. Her önemli sayfa en az 3-5 iç linkle desteklenmelidir. Dış linkler (external links) sitenizden çıkan bağlantılardır — güvenilir sitelere link vermek otoritenizi artırır. Kırık linkler (broken links) hem kullanıcı deneyimini hem SEO'yu olumsuz etkiler.
</div>

<div class="card"><div class="ch">🔝 En Çok Link Alan İç Sayfalar (Popüler)</div>
<div class="tscr"><table><thead><tr><th>URL</th><th>Gelen İç Link Sayısı</th></tr></thead><tbody>
${[...allInternalLinks.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 20).map(([u, sources]) => `<tr><td>${link(u)}</td><td style="font-weight:700">${sources.size}</td></tr>`).join('')}
</tbody></table></div></div>

<div class="card"><div class="ch">📤 En Çok Dış Link İçeren Sayfalar</div>
<div class="tscr"><table><thead><tr><th>URL</th><th>Dış Link Sayısı</th><th>Telegram Linki</th></tr></thead><tbody>
${pages.filter(p => p.externalLinks).sort((a, b) => (b.externalLinks?.length || 0) - (a.externalLinks?.length || 0)).slice(0, 20).map(p => `<tr><td>${link(p.url)}</td><td>${p.externalLinks.length}</td><td>${p.telegramLinks?.length || 0}</td></tr>`).join('')}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 6: PERFORMANCE ═══════════════ -->
<div class="sect" id="s6">
<div class="sg">
<div class="sc blue"><div class="v">${avgTime}ms</div><div class="l">Ort. Yanıt</div></div>
<div class="sc green"><div class="v">${formatBytes(avgSize)}</div><div class="l">Ort. Boyut</div></div>
<div class="sc red"><div class="v">${slowPages.length}</div><div class="l">Yavaş Sayfa (&gt;1.5s)</div></div>
<div class="sc purple"><div class="v">${allResources.css.size}</div><div class="l">CSS Dosyası</div></div>
<div class="sc orange"><div class="v">${allResources.js.size}</div><div class="l">JS Dosyası</div></div>
<div class="sc cyan"><div class="v">${allResources.images.size}</div><div class="l">Benzersiz Resim</div></div>
</div>

<div class="det">
<b>⚡ Performans Neden Önemli?</b><br>
Google'ın Core Web Vitals metrikleri sıralama faktörüdür. Yavaş yüklenen sayfalar hem Google'da düşer hem kullanıcı kaybeder. <b>LCP</b> (Largest Contentful Paint) 2.5 saniyenin altında olmalıdır. Sayfa boyutunu küçültün, resimleri optimize edin, CSS/JS'yi minimize edin.
</div>

<div class="card"><div class="ch">🐌 En Yavaş 30 Sayfa</div>
<div class="tscr"><table><thead><tr><th>URL</th><th>Yanıt Süresi</th><th>Boyut</th><th>Kelime</th><th>HTTP</th></tr></thead><tbody>
${[...pages].sort((a, b) => (b.responseTime || 0) - (a.responseTime || 0)).slice(0, 30).map(p => `<tr>
<td>${link(p.url)}</td>
<td style="color:${p.responseTime > 3000 ? 'var(--rd)' : p.responseTime > 1500 ? 'var(--yl)' : 'var(--gr)'}; font-weight:700">${p.responseTime}ms</td>
<td>${p.pageSize ? formatBytes(p.pageSize) : '—'}</td>
<td>${p.wordCount ?? '—'}</td>
<td>${statusBadge(p.statusCode)}</td>
</tr>`).join('')}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 7: SECURITY ═══════════════ -->
<div class="sect" id="s7">
<div class="det">
<b>🔒 Güvenlik Header Analizi</b><br>
HTTP güvenlik headerları sitenizi XSS, clickjacking, MIME-type sniffing gibi saldırılara karşı korur. Google güvenli sitelere daha fazla güvenir. Özellikle HTTPS ve HSTS kritik önemdedir.
</div>
<div class="card"><div class="ch">🛡️ Güvenlik Kontrolleri</div>
<div class="tscr"><table><thead><tr><th>Kontrol</th><th>Durum</th><th>Önem</th><th>Detay</th></tr></thead><tbody>
${securityHeaders.map(h => `<tr>
<td style="font-weight:600">${escHtml(h.name)}</td>
<td><span class="st ${h.status === 'pass' ? 'st-2xx' : h.status === 'fail' ? 'st-4xx' : 'st-3xx'}">${h.status === 'pass' ? '✅ Geçti' : h.status === 'fail' ? '❌ Başarısız' : '⚠️ Uyarı'}</span></td>
<td>${h.importance}</td>
<td style="white-space:normal;color:var(--tx2)">${escHtml(h.detail)}</td>
</tr>`).join('')}
</tbody></table></div></div>

${robotsTxtContent ? `
<div class="card"><div class="ch">🤖 robots.txt İçeriği</div>
<pre style="padding:16px;font-size:12px;overflow-x:auto;background:var(--s2);color:var(--cy)">${escHtml(robotsTxtContent)}</pre>
</div>` : ''}
</div>

<!-- ═══════════════ TAB 8: STRUCTURED DATA ═══════════════ -->
<div class="sect" id="s8">
<div class="det">
<b>📐 Yapılandırılmış Veri (Schema.org) Nedir?</b><br>
Schema.org JSON-LD verileri Google'a sayfanızdaki içeriğin ne olduğunu anlatır. Doğru kullanıldığında arama sonuçlarında <b>zengin snippet</b> (yıldız, fiyat, FAQ, breadcrumb vb.) gösterilir. Bu CTR'yi %20-40 artırabilir.<br><br>
<b>Önerilen Schema türleri:</b> WebSite, Organization, BreadcrumbList, FAQPage, Article
</div>
<div class="sg">
<div class="sc green"><div class="v">${pages.filter(p => p.schemas?.length > 0).length}</div><div class="l">Schema İçeren</div></div>
<div class="sc red"><div class="v">${pages.filter(p => p.schemas?.length === 0 && p.statusCode < 300).length}</div><div class="l">Schema Eksik</div></div>
</div>
<div class="card"><div class="ch">📋 Tespit Edilen Schema Türleri</div>
<div class="tscr"><table><thead><tr><th>URL</th><th>Tür</th><th>Format</th><th>Özellikler</th></tr></thead><tbody>
${pages.filter(p => p.schemas?.length > 0).flatMap(p => p.schemas.map(s => `<tr><td>${link(p.url)}</td><td style="font-weight:600;color:var(--cy)">${escHtml(s.type)}</td><td>${s.format}</td><td style="color:var(--tx2)">${s.properties?.slice(0, 8).join(', ') || '—'}</td></tr>`)).join('')}
${pages.filter(p => p.schemas?.length > 0).length === 0 ? '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--yl)">⚠️ Hiçbir sayfada yapılandırılmış veri bulunamadı</td></tr>' : ''}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 9: DUPLICATES ═══════════════ -->
<div class="sect" id="s9">
<div class="det">
<b>🔄 Duplicate İçerik Google'ı Neden Kızdırır?</b><br>
Aynı title veya meta description kullanan sayfalar Google'da birbirleriyle rekabet eder (<b>"keyword cannibalization"</b>). Google hangisini sıralaması gerektiğini bilemez ve sonuçta her ikisi de düşer. <b>Her sayfanın benzersiz title ve description'ı olmalıdır.</b>
</div>
<div class="card"><div class="ch">🏷️ Duplicate Title'lar <span class="cnt">${dupTitles.length} grup</span></div>
<div class="tscr"><table><thead><tr><th>Title</th><th>URL'ler</th><th>Sayı</th></tr></thead><tbody>
${dupTitles.length > 0 ? dupTitles.map(([t, us]) => `<tr><td style="white-space:normal;font-weight:600">${truncate(t, 60)}</td><td style="white-space:normal">${us.map(u => link(u)).join('<br>')}</td><td style="font-weight:700;color:var(--yl)">${us.length}</td></tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--gr)">✅ Duplicate title bulunamadı</td></tr>'}
</tbody></table></div></div>

<div class="card"><div class="ch">📝 Duplicate Meta Description'lar <span class="cnt">${dupDescs.length} grup</span></div>
<div class="tscr"><table><thead><tr><th>Description</th><th>URL'ler</th><th>Sayı</th></tr></thead><tbody>
${dupDescs.length > 0 ? dupDescs.map(([d, us]) => `<tr><td style="white-space:normal">${truncate(d, 50)}</td><td style="white-space:normal">${us.map(u => link(u)).join('<br>')}</td><td style="font-weight:700;color:var(--yl)">${us.length}</td></tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:24px;color:var(--gr)">✅ Duplicate description bulunamadı</td></tr>'}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 10: ORPHAN PAGES ═══════════════ -->
<div class="sect" id="s10">
<div class="det">
<b>👻 Orphan (Yetim) Sayfa Nedir?</b><br>
Orphan sayfalar, sitenizdeki hiçbir başka sayfadan link almayan sayfalardır. Google bu sayfalara ulaşamaz veya geç ulaşır. Sitemap'te olsalar bile, iç link desteği olmadan sıralama gücü çok zayıf kalır. <b>Her önemli sayfaya en az 2-3 iç link verin.</b>
</div>
<div class="card"><div class="ch">👻 İç Link Almayan Sayfalar <span class="cnt">${orphans.length}</span></div>
<div class="tscr"><table><thead><tr><th>URL</th><th>Title</th><th>Sitemap'te?</th><th>Kelime</th></tr></thead><tbody>
${orphans.length > 0 ? orphans.map(p => `<tr><td>${link(p.url)}</td><td>${truncate(p.title || '—', 40)}</td><td>${sitemapSet.has(p.url) ? '<span style="color:var(--gr)">Evet</span>' : '<span style="color:var(--rd)">Hayır</span>'}</td><td>${p.wordCount ?? '—'}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--gr)">✅ Orphan sayfa bulunamadı</td></tr>'}
</tbody></table></div></div>
</div>

<!-- ═══════════════ TAB 11: CHARTS ═══════════════ -->
<div class="sect" id="s11">
<div class="chart-row">
<div class="chart-card">
<h3>📊 HTTP Durum Kodları Dağılımı</h3>
${svgDonut([
    { value: ok, color: '#10b981' },
    { value: redir, color: '#eab308' },
    { value: err4, color: '#f97316' },
    { value: err5, color: '#ef4444' },
    { value: tout, color: '#6b7280' },
])}
<div class="chart-legend">
<span><span class="ci" style="background:#10b981"></span>2xx (${ok})</span>
<span><span class="ci" style="background:#eab308"></span>3xx (${redir})</span>
<span><span class="ci" style="background:#f97316"></span>4xx (${err4})</span>
<span><span class="ci" style="background:#ef4444"></span>5xx (${err5})</span>
</div>
</div>
<div class="chart-card">
<h3>📏 İçerik Uzunluğu Dağılımı (Kelime)</h3>
${svgBar(
    Object.values(wordBuckets),
    Object.keys(wordBuckets),
    ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#6366f1'],
)}
</div>
</div>
<div class="chart-row">
<div class="chart-card">
<h3>🏗️ URL Derinlik Dağılımı</h3>
${svgBar(
    Object.values(depthDist),
    Object.keys(depthDist).map(d => `Seviye ${d}`),
    ['#10b981', '#06b6d4', '#6366f1', '#eab308', '#f97316', '#ef4444'],
)}
</div>
<div class="chart-card">
<h3>📱 Telegram Kanal Sağlığı</h3>
${svgDonut([
    { value: aliveTg.length, color: '#10b981' },
    { value: deadTg.length, color: '#ef4444' },
    { value: uncTg.length, color: '#eab308' },
])}
<div class="chart-legend">
<span><span class="ci" style="background:#10b981"></span>Aktif (${aliveTg.length})</span>
<span><span class="ci" style="background:#ef4444"></span>Ölü (${deadTg.length})</span>
<span><span class="ci" style="background:#eab308"></span>Belirsiz (${uncTg.length})</span>
</div>
</div>
</div>
</div>

<div class="ftr">
🕷️ SEO Spider Pro v2.0 — telegramkanali.com için özelleştirilmiş tarama aracı<br>
Tarama: ${now} | ${total} sayfa | ${formatDuration(totalTime)} | ${formatBytes(stats.totalBytes)}
</div>
</div>

<script>
function sw(n){
document.querySelectorAll('.sect').forEach((s,i)=>s.classList.toggle('on',i===n));
document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('on',i===n));
}
function ft(inp,tid){
const f=inp.value.toLowerCase();
document.getElementById(tid)?.querySelectorAll('tbody tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(f)?'':'none'});
}
</script>
</body></html>`;
}

// ═══════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════

async function main() {
    console.log(chalk.bold.magenta(`
╔═══════════════════════════════════════════════════════╗
║  🕷️  SEO SPIDER PRO v2.0                              ║
║  Semrush / Ahrefs / Screaming Frog kalitesinde        ║
║  Full SEO tarama aracı                                ║
╚═══════════════════════════════════════════════════════╝`));
    console.log(chalk.gray(`  Hedef:    ${CONFIG.baseUrl}`));
    console.log(chalk.gray(`  Mod:      ${isQuick ? '⚡ Hızlı' : isFull ? '🔥 Tam' : '📋 Normal'}`));
    console.log(chalk.gray(`  Telegram: ${CONFIG.checkTelegramLinks ? '✓ Aktif' : '✗ Devre Dışı'}`));
    console.log(chalk.gray(`  Max:      ${CONFIG.maxPages} sayfa`));
    console.log(chalk.gray(`  Tarih:    ${new Date().toLocaleString('tr-TR')}`));
    console.log();

    startTime = Date.now();

    // ─── STEP 0: Robots.txt ───
    console.log(chalk.bold.white('━━━ Aşama 0: Ön Analiz ━━━'));
    await fetchRobotsTxt();

    // ─── STEP 1: Sitemap ───
    console.log(chalk.bold.white('\n━━━ Aşama 1: Sitemap Tarama ━━━'));
    sitemapUrlList = await parseSitemap(CONFIG.sitemapUrl);

    // ─── STEP 2: Crawl ───
    console.log(chalk.bold.white('\n━━━ Aşama 2: Sayfa Tarama ━━━'));
    const urlsToCrawl = sitemapUrlList.slice(0, CONFIG.maxPages).map(s => ({ url: s.url, depth: 0, source: 'sitemap' }));
    console.log(chalk.white(`  ${urlsToCrawl.length} URL taranacak (${CONFIG.maxConcurrency} paralel)...\n`));

    const bar1 = new SingleBar({
        format: chalk.cyan('  Tarama   ') + chalk.cyan('{bar}') + chalk.cyan(' {percentage}% | {value}/{total} | {eta}s kaldı'),
        barCompleteChar: '█', barIncompleteChar: '░', hideCursor: true,
    }, Presets.shades_classic);
    bar1.start(urlsToCrawl.length, 0);
    pageResults.push(...await crawlBatch(urlsToCrawl, bar1));
    bar1.stop();
    console.log(chalk.green(`  ✓ ${pageResults.length} sayfa tarandı`));

    // ─── STEP 2.5: Discover ───
    if (!isQuick) {
        const discovered = new Set();
        pageResults.forEach(p => { p.internalLinks?.forEach(l => { if (!crawledUrls.has(l)) discovered.add(l); }); });
        const limit = isFull ? 2000 : 300;
        if (discovered.size > 0) {
            const newUrls = [...discovered].slice(0, limit).map(u => ({ url: u, depth: 1, source: 'keşif' }));
            console.log(chalk.cyan(`\n  🔎 ${discovered.size} yeni iç link keşfedildi → ${newUrls.length} taranacak`));
            const bar2 = new SingleBar({
                format: chalk.yellow('  Keşif    ') + chalk.yellow('{bar}') + chalk.yellow(' {percentage}% | {value}/{total} | {eta}s kaldı'),
                barCompleteChar: '█', barIncompleteChar: '░',
            }, Presets.shades_classic);
            bar2.start(newUrls.length, 0);
            pageResults.push(...await crawlBatch(newUrls, bar2));
            bar2.stop();
            console.log(chalk.green(`  ✓ Keşif tamamlandı`));
        }
    }

    // ─── STEP 3: Security ───
    console.log(chalk.bold.white('\n━━━ Aşama 3: Güvenlik Analizi ━━━'));
    const mainPage = pageResults.find(p => p.url === CONFIG.baseUrl || p.url === CONFIG.baseUrl + '/');
    const securityHeaders = analyzeSecurityHeaders(mainPage?.headers || {});
    const secPass = securityHeaders.filter(h => h.status === 'pass').length;
    console.log(chalk.green(`  ✓ ${secPass}/${securityHeaders.length} güvenlik kontrolü geçti`));

    // ─── STEP 4: Telegram ───
    if (CONFIG.checkTelegramLinks && allTelegramLinks.size > 0) {
        console.log(chalk.bold.white('\n━━━ Aşama 4: Telegram Link Kontrolü ━━━'));
        const tgUrls = [...allTelegramLinks.keys()];
        console.log(chalk.white(`  ${tgUrls.length} Telegram linki kontrol edilecek...\n`));
        const bar3 = new SingleBar({
            format: chalk.magenta('  Telegram ') + chalk.magenta('{bar}') + chalk.magenta(' {percentage}% | {value}/{total} | {eta}s kaldı'),
            barCompleteChar: '█', barIncompleteChar: '░',
        }, Presets.shades_classic);
        bar3.start(tgUrls.length, 0);
        for (const u of tgUrls) {
            telegramResults.push(await checkTelegramLink(u));
            bar3.increment();
            await sleep(CONFIG.telegramDelay);
        }
        bar3.stop();
        const dead = telegramResults.filter(t => t.status === 'dead').length;
        const alive = telegramResults.filter(t => t.status === 'alive').length;
        console.log(chalk.green(`  ✓ ${alive} aktif`) + chalk.red(` | ${dead} ölü`) + chalk.yellow(` | ${telegramResults.length - alive - dead} belirsiz`));
    }

    // ─── STEP 5: Report ───
    console.log(chalk.bold.white('\n━━━ Aşama 5: Rapor Oluşturma ━━━'));
    const totalTime = Date.now() - startTime;
    const html = generateReport({ pages: pageResults, telegramChecks: telegramResults, totalTime, securityHeaders });

    const reportDir = join(__dirname, 'reports');
    if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const reportPath = join(reportDir, `seo-report-${ts}.html`);
    writeFileSync(reportPath, html, 'utf-8');
    console.log(chalk.green(`  ✓ Rapor: ${reportPath}`));

    // ─── SUMMARY ───
    const dead = telegramResults.filter(t => t.status === 'dead').length;
    const allIssueCnt = pageResults.reduce((s, p) => s + (p.issues?.length || 0), 0);
    console.log(chalk.bold.magenta(`
╔═══════════════════════════════════════════════════════╗
║                    📊 TARAMA ÖZETİ                    ║
╚═══════════════════════════════════════════════════════╝`));
    console.log(chalk.white(`  📄 Toplam sayfa:         ${pageResults.length}`));
    console.log(chalk.green(`  ✅ Başarılı (2xx):       ${stats.status2xx}`));
    console.log(chalk.yellow(`  ↪️  Yönlendirme (3xx):   ${stats.status3xx}`));
    console.log(chalk.red(`  ❌ Hata (4xx+5xx):       ${stats.status4xx + stats.status5xx}`));
    console.log(chalk.gray(`  ⏳ Timeout:              ${stats.statusTimeout}`));
    console.log(chalk.blue(`  🔗 İç link:              ${allInternalLinks.size}`));
    console.log(chalk.gray(`  🌐 Dış link:             ${allExternalLinks.size}`));
    console.log(chalk.magenta(`  📱 Telegram:             ${allTelegramLinks.size}${dead > 0 ? chalk.red(` (${dead} ölü!)`) : ''}`));
    console.log(chalk.yellow(`  ⚠️  Toplam sorun:         ${allIssueCnt}`));
    console.log(chalk.gray(`  📦 İndirilen:            ${formatBytes(stats.totalBytes)}`));
    console.log(chalk.gray(`  ⏱️  Süre:                 ${formatDuration(totalTime)}`));
    console.log(chalk.cyan(`  📁 Rapor:                ${reportPath}\n`));
}

main().catch(e => { console.error(chalk.red('\n✗ Hata:'), e); process.exit(1); });
