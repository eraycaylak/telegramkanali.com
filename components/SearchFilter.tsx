'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Category } from '@/lib/types';

interface SearchFilterProps {
    categories: Category[];
}

export default function SearchFilter({ categories }: SearchFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset page when filtering
        params.delete('page');

        router.push(`/?${params.toString()}`, { scroll: false });
    };

    const handleCategoryClick = (catId: string) => {
        const newValue = selectedCategory === catId ? '' : catId;
        setSelectedCategory(newValue);
        updateParams('category', newValue);
    };

    return (
        <div className="space-y-4">
            {/* Category Chips */}
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    onClick={() => handleCategoryClick('')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedCategory
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Tümü
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
