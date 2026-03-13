'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();

    const isEnglish = pathname.startsWith('/en');

    const toggleLanguage = () => {
        if (isEnglish) {
            // Remove /en prefix
            const trPath = pathname.replace(/^\/en/, '') || '/';
            router.push(trPath);
        } else {
            // Add /en prefix
            router.push(`/en${pathname}`);
        }
    };

    return (
        <button
            onClick={toggleLanguage}
            title={isEnglish ? 'Türkçeye Geç' : 'Switch to English'}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-full transition-all border border-white/20"
        >
            {isEnglish ? (
                <>
                    <span className="text-base">🇹🇷</span>
                    <span className="hidden sm:inline">TR</span>
                </>
            ) : (
                <>
                    <span className="text-base">🇬🇧</span>
                    <span className="hidden sm:inline">EN</span>
                </>
            )}
        </button>
    );
}
