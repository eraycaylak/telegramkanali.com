'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/app/actions/analytics';

// Cookie helper: get cookie by name
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Cookie helper: set cookie with max-age
function setCookie(name: string, value: string, days: number) {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const track = async () => {
            // Avoid tracking admin pages or api routes
            if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

            // Check if user has accepted cookies
            const consent = getCookie('tk_consent');

            let isNewVisitor = false;

            if (consent === '1') {
                // COOKIE MODE: User accepted cookies — accurate tracking
                // Use a per-day visitor cookie (resets daily)
                const today = new Date().toISOString().split('T')[0]; // "2026-03-15"
                const visitorCookie = getCookie('tk_visitor');

                if (!visitorCookie || visitorCookie !== today) {
                    // First visit today — new daily visitor
                    isNewVisitor = true;
                    setCookie('tk_visitor', today, 1); // 1 day cookie
                } else {
                    // Already visited today — not a new visitor
                    isNewVisitor = false;
                }

                // Also track per-page uniqueness (cookie based)
                const pageKey = `tk_p_${pathname.replace(/[^a-z0-9]/gi, '_')}`;
                const pageVisited = getCookie(pageKey);
                if (!pageVisited) {
                    // First time seeing this specific page today
                    isNewVisitor = true;
                    setCookie(pageKey, '1', 1); // expires in 1 day
                }
            } else {
                // FALLBACK: No consent or rejected — use sessionStorage (less accurate but privacy-safe)
                const pathSessionKey = `tk_visited_${pathname}`;
                if (!sessionStorage.getItem(pathSessionKey)) {
                    isNewVisitor = true;
                    sessionStorage.setItem(pathSessionKey, 'true');
                }
            }

            await trackPageView(pathname, isNewVisitor);
        };

        track();
    }, [pathname, searchParams]);

    return null;
}
