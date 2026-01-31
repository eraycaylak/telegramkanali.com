'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Category } from '@/lib/types';

interface SearchFilterProps {
    categories: Category[];
}

export default function SearchFilter({ categories }: SearchFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get('q') || '')) {
                updateParams('q', searchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, searchParams]);

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
        <div className="space-y-4 mb-8">
            {/* Search Input */}
            <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow hover:shadow-md"
                    placeholder="Kanal veya grup ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

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
