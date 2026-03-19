'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState(587); // Start from user request

    useEffect(() => {
        // Initial random offset to make it look "live" immediately
        setCount(prev => prev + Math.floor(Math.random() * 5));

        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.floor(Math.random() * 13) - 5; // Random change between -5 and +8
                // Ensure it doesn't drop too low below the baseline
                if (prev + change < 550) return prev + 1;
                return prev + change;
            });
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-sm backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-xs font-medium text-white/90 whitespace-nowrap">
                <span className="font-bold text-white">{count.toLocaleString()}</span> kişi şuan sitede
            </span>
        </div>
    );
}
