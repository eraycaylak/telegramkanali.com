'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';

export default function DynamicLogo() {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const settings = localStorage.getItem('siteSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            if (parsed.logoUrl) {
                setLogoUrl(parsed.logoUrl);
            }
        }
    }, []);

    if (!mounted) {
        // Server-side render placeholder
        return (
            <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition">
                <div
                    className="bg-[#444] rounded flex items-center justify-center overflow-hidden"
                    style={{ width: '350px', height: '80px' }}
                >
                    <span className="text-gray-500 text-sm">Logo</span>
                </div>
            </Link>
        );
    }

    return (
        <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition">
            <div
                className="rounded flex items-center justify-center overflow-hidden"
                style={{ width: '350px', height: '80px' }}
            >
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt="Telegram Kanalları"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            console.log('Logo load error');
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="bg-[#444] w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Logo Alanı (350x80)
                    </div>
                )}
            </div>
        </Link>
    );
}
