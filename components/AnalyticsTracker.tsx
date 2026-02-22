'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/app/actions/analytics';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track page view on mount and path change
        const track = async () => {
            // Avoid tracking admin pages or api routes
            if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

            let isNewVisitor = false;
            // Benzersiz ziyaretçiyi path (sayfa) bazında belirle
            const pathSessionKey = `tk_visited_${pathname}`;
            if (!sessionStorage.getItem(pathSessionKey)) {
                isNewVisitor = true;
                sessionStorage.setItem(pathSessionKey, 'true');
            }

            await trackPageView(pathname, isNewVisitor);
        };

        track();
    }, [pathname, searchParams]);

    return null;
}
