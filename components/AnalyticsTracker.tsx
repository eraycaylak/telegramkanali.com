'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/app/actions/analytics';
import { trackVisitorProfile } from '@/app/actions/visitorProfile';

// ============ Cookie Helpers ============
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

// ============ Visitor ID ============
function generateVisitorId(): string {
    return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// ============ Device Detection ============
function getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
}

// ============ Browser Detection ============
function getBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
    return 'Other';
}

// ============ OS Detection ============
function getOS(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('CrOS')) return 'ChromeOS';
    return 'Other';
}

// ============ Screen Resolution ============
function getScreenResolution(): string {
    if (typeof screen === 'undefined') return 'unknown';
    return `${screen.width}x${screen.height}`;
}

// ============ Browser Language/Country ============
function getBrowserCountry(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    return navigator.language || (navigator as any).userLanguage || 'unknown';
}

// ============ Canvas Fingerprint (lightweight) ============
function getFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('TKfp1.0', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('TKfp1.0', 4, 17);

        const dataUrl = canvas.toDataURL();
        // Simple hash
        let hash = 0;
        for (let i = 0; i < dataUrl.length; i++) {
            const char = dataUrl.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'fp_' + Math.abs(hash).toString(36);
    } catch {
        return 'fp_error';
    }
}

// ============ IP & Geo Cache ============
let geoCache: { ip: string; country: string | null; city: string | null } | null = null;

async function getGeoInfo(): Promise<{ ip: string; country: string | null; city: string | null }> {
    if (geoCache) return geoCache;
    try {
        const res = await fetch('/api/visitor-info');
        if (res.ok) {
            geoCache = await res.json();
            return geoCache!;
        }
    } catch {}
    geoCache = { ip: 'unknown', country: null, city: null };
    return geoCache;
}

// ============ Category Slugs Cache ============
let categorySlugCache: string[] | null = null;

async function loadCategorySlugs(): Promise<string[]> {
    if (categorySlugCache) return categorySlugCache;
    try {
        const res = await fetch('/api/categories-list');
        if (res.ok) {
            categorySlugCache = await res.json();
            return categorySlugCache || [];
        }
    } catch {}
    categorySlugCache = [];
    return categorySlugCache;
}

// ============ MAIN COMPONENT ============
export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const sessionStartRef = useRef<number>(Date.now());

    // Track session duration on page leave
    useEffect(() => {
        const handleBeforeUnload = () => {
            const consent = getCookie('tk_consent');
            if (consent !== '1') return;

            const visitorId = getCookie('tk_uid');
            if (!visitorId) return;

            const sessionSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
            if (sessionSeconds > 1 && sessionSeconds < 3600) {
                navigator.sendBeacon('/api/session-end', JSON.stringify({ visitorId, sessionSeconds }));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Reset session timer on page change
    useEffect(() => {
        sessionStartRef.current = Date.now();
    }, [pathname]);

    // Main tracking
    useEffect(() => {
        const track = async () => {
            if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

            const consent = getCookie('tk_consent');
            let isNewVisitor = false;

            if (consent === '1') {
                // === FULL COOKIE MODE ===

                // 1. Unique Visitor ID (30 days)
                let visitorId = getCookie('tk_uid');
                if (!visitorId) {
                    visitorId = generateVisitorId();
                    setCookie('tk_uid', visitorId, 30);
                    isNewVisitor = true;
                }

                // 2. Daily unique check
                const today = new Date().toISOString().split('T')[0];
                const lastDay = getCookie('tk_day');
                if (!lastDay || lastDay !== today) {
                    isNewVisitor = true;
                    setCookie('tk_day', today, 1);
                }

                // 3. Visit count
                const vc = parseInt(getCookie('tk_vc') || '0') + 1;
                setCookie('tk_vc', vc.toString(), 30);

                // 4. Interest tracking
                const categorySlugs = await loadCategorySlugs();
                const pathSlug = pathname.replace(/^\//, '').split('/')[0];
                const interests: string[] = [];
                if (pathSlug && categorySlugs.includes(pathSlug)) {
                    interests.push(pathSlug);
                    const existing = getCookie('tk_int');
                    const list = existing ? existing.split(',') : [];
                    if (!list.includes(pathSlug)) list.push(pathSlug);
                    setCookie('tk_int', list.slice(-20).join(','), 30);
                }

                // 5. Collect extended data
                const geo = await getGeoInfo();
                const browser = getBrowser();
                const os = getOS();
                const screenRes = getScreenResolution();
                const fingerprint = getFingerprint();
                const referrer = document.referrer || null;

                // 6. Send to server (non-blocking)
                trackVisitorProfile(
                    visitorId,
                    pathname,
                    interests,
                    0,
                    getDeviceType(),
                    referrer,
                    geo.country || getBrowserCountry(),
                    geo.ip,
                    geo.city,
                    screenRes,
                    browser,
                    os,
                    fingerprint
                ).catch(() => {});

            } else {
                // === FALLBACK: sessionStorage ===
                const key = `tk_visited_${pathname}`;
                if (!sessionStorage.getItem(key)) {
                    isNewVisitor = true;
                    sessionStorage.setItem(key, 'true');
                }
            }

            await trackPageView(pathname, isNewVisitor);
        };

        track();
    }, [pathname, searchParams]);

    return null;
}
