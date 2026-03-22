'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock } from 'lucide-react';

export default function TrendsClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
    const sliderRef = useRef<HTMLDivElement>(null);

    // Reset subcategory when category changes
    useEffect(() => {
        setSelectedSubcategory('all');
    }, [selectedCategory]);

    const displayedTrends = useMemo(() => {
        let filtered = initialTrends;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(t => t.category_id === selectedCategory);
            if (selectedSubcategory !== 'all') {
                filtered = filtered.filter(t => t.subcategory === selectedSubcategory);
            }
        }
        return filtered;
    }, [initialTrends, selectedCategory, selectedSubcategory]);

    const activeCategoryData = useMemo(() => {
        return initialCategories.find(c => c.id === selectedCategory);
    }, [selectedCategory, initialCategories]);

    // Top 5 trends go into the swipeable Hero Slider
    const sliderTrends = displayedTrends.filter(t => t.image).slice(0, 5);
    
    // The rest go into the vertical list. By user request, we show ALL items here so newly added ones don't 'disappear'.
    const listTrends = displayedTrends;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(date);
    };

    // Auto-scroll the native CSS slider
    useEffect(() => {
        if (sliderTrends.length <= 1) return;
        const interval = setInterval(() => {
            if (!sliderRef.current) return;
            const container = sliderRef.current;
            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            
            // If we are near the end, scroll back to the beginning
            if (scrollLeft + clientWidth >= scrollWidth - 20) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Otherwise scroll right by one viewport width
                container.scrollBy({ left: clientWidth, behavior: 'smooth' });
            }
        }, 4000); // 4 seconds

        return () => clearInterval(interval);
    }, [sliderTrends.length]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-32 font-sans overflow-hidden w-full">
            
            {/* Header & Filters */}
            <div className="px-4 md:px-8 pt-6 md:pt-10 pb-4 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">Keşfet</h1>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">Gündemdeki en yeni ve popüler başlıklar.</p>
                </div>
                
                {/* Horizontal Category Chips */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
                    <button 
                        onClick={() => setSelectedCategory('all')} 
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm ${selectedCategory === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50'}`}
                    >
                        Tümü
                    </button>
                    {initialCategories.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setSelectedCategory(cat.id)} 
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all shadow-sm ${selectedCategory === cat.id ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Horizontal Subcategory Chips (Nested) */}
            {activeCategoryData?.subcategories && activeCategoryData.subcategories.length > 0 && (
                <div className="px-4 md:px-8 max-w-7xl mx-auto mb-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0">
                        <button 
                            onClick={() => setSelectedSubcategory('all')} 
                            className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${selectedSubcategory === 'all' ? 'bg-[#E30613] text-white' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                        >
                            Tümü
                        </button>
                        {activeCategoryData.subcategories.map((sub: string) => (
                            <button 
                                key={sub} 
                                onClick={() => setSelectedSubcategory(sub)} 
                                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${selectedSubcategory === sub ? 'bg-[#E30613] text-white' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {displayedTrends.length === 0 ? (
                <div className="px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="flex flex-col items-center justify-center py-20 bg-white shadow-sm border border-gray-100 rounded-[2rem]">
                        <Flame size={32} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz İçerik Yok</h3>
                        <p className="text-sm text-gray-500 font-medium">Bu kategoride trend bulunmuyor.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full">
                    
                    {/* NATIVE SWIPE HERO SLIDER WITH AUTO PLAY */}
                    {sliderTrends.length > 0 && (
                        <div className="w-full">
                            <div 
                                ref={sliderRef}
                                className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide px-4 md:px-8 pb-4"
                            >
                                {sliderTrends.map((trend) => (
                                    <Link 
                                        href={`/trends/${trend.slug}`} 
                                        key={`slider-${trend.id}`} 
                                        className="snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] h-[260px] md:h-[350px] relative rounded-[2rem] overflow-hidden shadow-md group transform transition-transform active:scale-[0.98]"
                                    >
                                        <img 
                                            src={trend.image} 
                                            alt={trend.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 md:p-8">
                                            <div className="bg-red-600 text-white w-max px-3 py-1.5 rounded text-[10px] md:text-xs font-black tracking-widest uppercase mb-3 shadow-sm">
                                                {trend.trend_categories?.name || 'GÜNDEM'}
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                                                {trend.title}
                                            </h2>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VERTICAL COMPACT NEWS LIST */}
                    {listTrends.length > 0 && (
                        <div className="px-4 md:px-8 max-w-4xl mx-auto w-full flex flex-col gap-3 md:gap-4">
                            {listTrends.map((trend) => (
                                <Link 
                                    href={`/trends/${trend.slug}`} 
                                    key={`list-${trend.id}`}
                                    className="flex gap-4 p-3 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group"
                                >
                                    {trend.image && (
                                        <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl md:rounded-[1.5rem] overflow-hidden bg-gray-50">
                                            <img 
                                                src={trend.image} 
                                                alt={trend.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                                        <div className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                            {trend.trend_categories?.name || 'GÜNDEM'}
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-gray-900 leading-[1.3] line-clamp-2 md:line-clamp-3 mb-2">
                                            {trend.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-auto">
                                            <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {formatDate(trend.created_at)}</span>
                                            <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {trend.view_count || 12}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
