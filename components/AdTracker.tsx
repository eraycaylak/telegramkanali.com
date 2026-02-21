'use client';

import { useEffect, useRef } from 'react';
import { trackAdView } from '@/app/actions/tokens';

interface AdTrackerProps {
    campaignId: string;
    children: React.ReactNode;
}

/**
 * AdTracker: Bir reklam kampanyasının gösterimini takip eder.
 * Ekranda göründüğünde (IntersectionObserver ile) görüntüleme sayar.
 * Her kampanya-session bazında bir kez sayar (tekrar sayım önlenir).
 */
export default function AdTracker({ campaignId, children }: AdTrackerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const tracked = useRef(false);

    useEffect(() => {
        if (!campaignId || tracked.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !tracked.current) {
                        tracked.current = true;
                        trackAdView(campaignId);
                    }
                });
            },
            { threshold: 0.5 } // En az %50 görünür olmalı
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [campaignId]);

    return <div ref={ref}>{children}</div>;
}
