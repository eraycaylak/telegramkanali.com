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

            await trackPageView(pathname);
        };

        track();
    }, [pathname, searchParams]);

    return null;
}
