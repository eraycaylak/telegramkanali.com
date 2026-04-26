'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackAdView, trackAdClick } from '@/app/actions/tokens';

interface AdTrackerProps {
    campaignId: string;
    children: React.ReactNode;
}

/**
 * AdTracker: Bir reklam kampanyasının gösterimini ve tıklamasını takip eder.
 * - Ekranda göründüğünde (IntersectionObserver ile) görüntüleme sayar.
 * - Link tıklamalarını yakalayarak tıklama sayar.
 * - Her kampanya-session bazında bir kez sayar (tekrar sayım önlenir).
 */
export default function AdTracker({ campaignId, children }: AdTrackerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const viewTracked = useRef(false);
    const clickTracked = useRef(false);

    // View tracking via IntersectionObserver
    useEffect(() => {
        if (!campaignId || viewTracked.current) return;

        const SEEN_ADS_KEY = 'tk_seen_ads';
        const seenAds: string[] = JSON.parse(sessionStorage.getItem(SEEN_ADS_KEY) || '[]');
        if (seenAds.includes(campaignId)) {
            viewTracked.current = true;
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !viewTracked.current) {
                        viewTracked.current = true;
                        seenAds.push(campaignId);
                        sessionStorage.setItem(SEEN_ADS_KEY, JSON.stringify(seenAds));
                        trackAdView(campaignId);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [campaignId]);

    // Click tracking — capture clicks on links inside the ad
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!campaignId || clickTracked.current) return;

        // Check if a link (<a>) was clicked
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (!link) return;

        // Prevent double counting per session
        const CLICKED_ADS_KEY = 'tk_clicked_ads';
        const clickedAds: string[] = JSON.parse(sessionStorage.getItem(CLICKED_ADS_KEY) || '[]');
        if (clickedAds.includes(campaignId)) {
            clickTracked.current = true;
            return;
        }

        clickTracked.current = true;
        clickedAds.push(campaignId);
        sessionStorage.setItem(CLICKED_ADS_KEY, JSON.stringify(clickedAds));
        trackAdClick(campaignId);
    }, [campaignId]);

    return <div ref={ref} onClick={handleClick}>{children}</div>;
}
