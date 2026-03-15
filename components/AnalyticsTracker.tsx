'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/app/actions/analytics';
import { trackVisitorProfile } from '@/app/actions/visitorProfile';

// Cookie helpers
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

// Generate unique visitor ID
function generateVisitorId(): string {
    return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// Detect device type
function getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
}

// Detect language/country from browser
function getBrowserCountry(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const lang = navigator.language || (navigator as any).userLanguage || 'unknown';
    return lang; // e.g. "tr-TR", "en-US"
}

// Known category slugs cache (loaded once)
let categorySlugCache: string[] | null = null;

async function loadCategorySlugs(): Promise<string[]> {
    if (categorySlugCache) return categorySlugCache;
    try {
        const response = await fetch('/api/categories-list');
        if (response.ok) {
            categorySlugCache = await response.json();
            return categorySlugCache || [];
        }
    } catch {}
    // Fallback: well-known category slugs
    categorySlugCache = [
        '18', 'kripto-para', 'haber', 'egitim-ders', 'sohbet', 'oyun',
        'teknoloji', 'film-dizi', 'spor', 'mzik', 'futbol', 'topluluk',
        'para-kazanma', 'iddia', 'kitap', 'hobi', 'salik', 'din'
    ];
    return categorySlugCache;
}

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
                // Use sendBeacon for reliable tracking on page close
                const payload = JSON.stringify({
                    visitorId,
                    sessionSeconds
                });
                navigator.sendBeacon('/api/session-end', payload);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Reset session timer on page change
    useEffect(() => {
        sessionStartRef.current = Date.now();
    }, [pathname]);

    // Main tracking logic
    useEffect(() => {
        const track = async () => {
            // Skip admin and API pages
            if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

            const consent = getCookie('tk_consent');

            let isNewVisitor = false;

            if (consent === '1') {
                // === COOKIE MODE: Full tracking ===

                // 1. Ensure visitor has a unique ID (30-day cookie)
                let visitorId = getCookie('tk_uid');
                if (!visitorId) {
                    visitorId = generateVisitorId();
                    setCookie('tk_uid', visitorId, 30); // 30 days
                    isNewVisitor = true;
                }

                // 2. Daily unique visitor check
                const today = new Date().toISOString().split('T')[0];
                const lastVisitDay = getCookie('tk_day');
                if (!lastVisitDay || lastVisitDay !== today) {
                    isNewVisitor = true;
                    setCookie('tk_day', today, 1);
                }

                // 3. Track visit count
                const visitCount = parseInt(getCookie('tk_vc') || '0') + 1;
                setCookie('tk_vc', visitCount.toString(), 30);

                // 4. Interest tracking — detect if current path is a category
                const categorySlugs = await loadCategorySlugs();
                const pathSlug = pathname.replace(/^\//, '').split('/')[0];
                const interests: string[] = [];

                if (pathSlug && categorySlugs.includes(pathSlug)) {
                    // User is visiting a category page
                    interests.push(pathSlug);

                    // Update interests cookie (keep last 20)
                    const existingInterests = getCookie('tk_int');
                    const interestList = existingInterests ? existingInterests.split(',') : [];
                    if (!interestList.includes(pathSlug)) {
                        interestList.push(pathSlug);
                    }
                    setCookie('tk_int', interestList.slice(-20).join(','), 30);
                }

                // 5. Send profile to server (non-blocking)
                trackVisitorProfile(
                    visitorId,
                    pathname,
                    interests,
                    0, // session seconds will be tracked on beforeunload
                    getDeviceType(),
                    document.referrer || null,
                    getBrowserCountry()
                ).catch(() => {}); // silent fail

            } else {
                // === FALLBACK MODE: sessionStorage (no cookies) ===
                const pathSessionKey = `tk_visited_${pathname}`;
                if (!sessionStorage.getItem(pathSessionKey)) {
                    isNewVisitor = true;
                    sessionStorage.setItem(pathSessionKey, 'true');
                }
            }

            // Always track page view
            await trackPageView(pathname, isNewVisitor);
        };

        track();
    }, [pathname, searchParams]);

    return null;
}
