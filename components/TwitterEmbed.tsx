'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function TwitterEmbed({ url }: { url?: string }) {
    const triggerLoad = () => {
        if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
        }
    };

    useEffect(() => {
        const timeout = setTimeout(triggerLoad, 300);
        return () => clearTimeout(timeout);
    }, [url]);

    return (
        <Script 
            id="twitter-widget" 
            async 
            src="https://platform.twitter.com/widgets.js" 
            strategy="lazyOnload" 
            onLoad={triggerLoad}
        />
    );
}
