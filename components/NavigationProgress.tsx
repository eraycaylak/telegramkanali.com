'use client';

import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * A slim progress bar that appears at the top of the page during navigation.
 * Provides visual feedback for page transitions.
 */
export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // When route changes, show a brief completion animation
        if (isVisible) {
            // Route completed — finish the bar
            setProgress(100);
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
            }, 300);
        }
    }, [pathname, searchParams]);

    // Intercept all link clicks to show progress
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor) return;
            
            const href = anchor.getAttribute('href');
            if (!href) return;
            
            // Only handle internal navigation
            if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || anchor.target === '_blank') return;
            
            // Don't show for same page
            if (href === pathname) return;

            // Start progress animation
            setIsVisible(true);
            setProgress(20);

            // Simulate incremental progress
            let current = 20;
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                current += Math.random() * 15;
                if (current >= 90) {
                    current = 90;
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
                setProgress(current);
            }, 200);
        };

        // Also intercept button clicks that use router.push
        const handleButtonClick = (e: MouseEvent) => {
            const button = (e.target as HTMLElement).closest('button');
            if (!button) return;
            // Can't detect router.push from button clicks easily,
            // so we rely on the route change effect above
        };

        document.addEventListener('click', handleClick, true);
        
        return () => {
            document.removeEventListener('click', handleClick, true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
            <div
                className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 shadow-lg shadow-blue-500/30"
                style={{
                    width: `${progress}%`,
                    transition: progress === 100
                        ? 'width 200ms ease-out'
                        : 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            />
            {/* Glow pulse at the tip */}
            {progress < 100 && (
                <div
                    className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white/40 to-transparent animate-pulse"
                    style={{ right: `${100 - progress}%` }}
                />
            )}
        </div>
    );
}
