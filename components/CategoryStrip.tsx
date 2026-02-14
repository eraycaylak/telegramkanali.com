'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';
import { useRef, useEffect, useState } from 'react';

interface CategoryStripProps {
    categories: Category[];
}

export default function CategoryStrip({ categories }: CategoryStripProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const scrollRef = useRef<HTMLDivElement>(null);
    const selectedCategory = searchParams.get('category') || '';
    const [showGradient, setShowGradient] = useState({ left: false, right: true });

    // Check scroll position for gradient indicators
    const updateGradients = () => {
        const el = scrollRef.current;
        if (!el) return;
        setShowGradient({
            left: el.scrollLeft > 10,
            right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10,
        });
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateGradients();
        el.addEventListener('scroll', updateGradients, { passive: true });
        return () => el.removeEventListener('scroll', updateGradients);
    }, []);

    const handleCategoryClick = (catId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedCategory === catId) {
            params.delete('category');
        } else {
            params.set('category', catId);
        }
        params.delete('page');
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="relative md:hidden">
            {/* Left gradient */}
            {showGradient.left && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            )}

            {/* Right gradient */}
            {showGradient.right && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            )}

            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2.5 bg-white border-b border-gray-100"
            >
                <button
                    onClick={() => handleCategoryClick('')}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${!selectedCategory
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Tümü
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
