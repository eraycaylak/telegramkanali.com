'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Flame, Clock, TrendingUp, ChevronRight } from 'lucide-react';

export default function TrendsClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

    const filteredByCategory = useMemo(() => {
        if (selectedCategory === 'all') return initialTrends;
        return initialTrends.filter(t => t.category_id === selectedCategory);
    }, [initialTrends, selectedCategory]);

    const availableSubcategories = useMemo(() => {
        const subs = new Set<string>();
        filteredByCategory.forEach(t => {
            if (t.subcategory) subs.add(t.subcategory);
        });
        return Array.from(subs);
    }, [filteredByCategory]);

    const displayedTrends = useMemo(() => {
        if (selectedSubcategory === 'all') return filteredByCategory;
        return filteredByCategory.filter(t => t.subcategory === selectedSubcategory);
    }, [filteredByCategory, selectedSubcategory]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Dark & Sleek Premium Header */}
            <div className="bg-[#0a0a0a] text-white pt-16 pb-12 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Canlı Trendler
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                            Sıcak Gündem & <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Sosyal Medya Akımları</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
                            Türkiye'nin anlık dijital nabzı. En çok aranan konular, patlayan etiketler ve günün öne çıkan içeriklerini tek merkezden tara.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation & Filters Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="bg-white p-2 rounded-2xl md:rounded-[1.5rem] shadow-lg shadow-gray-200/50 border border-gray-100 flex overflow-x-auto scrollbar-hide max-w-fit">
                    <button
                        onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-[13px] tracking-wide transition-all whitespace-nowrap ${
                            selectedCategory === 'all' 
                                ? 'bg-gray-900 text-white shadow-md' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        Tümü
                    </button>
                    {initialCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory('all'); }}
                            className={`px-5 py-2.5 rounded-xl font-bold text-[13px] tracking-wide transition-all whitespace-nowrap ${
                                selectedCategory === cat.id 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Subcategories */}
                {availableSubcategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        <button
                            onClick={() => setSelectedSubcategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                selectedSubcategory === 'all'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Hepsi
                        </button>
                        {availableSubcategories.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setSelectedSubcategory(sub)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    selectedSubcategory === sub
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* List Layout - More Professional & Compact */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
                {displayedTrends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp size={24} className="text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Şu an sessiz</h3>
                        <p className="text-sm text-gray-500">Bu kategori için yeni bir trend kaydı bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedTrends.map((trend, index) => {
                            // A dynamic sleek card
                            return (
                                <Link 
                                    href={`/trends/${trend.slug}`} 
                                    key={trend.id}
                                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden relative"
                                >
                                    {trend.image && (
                                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                            <img 
                                                src={trend.image} 
                                                alt={trend.title} 
                                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                            />
                                            {/* Top Gradient Shadow for Badge readability */}
                                            <div className="absolute inset-top h-1/2 bg-gradient-to-b from-black/40 to-transparent"></div>
                                        </div>
                                    )}

                                    {/* Content Container */}
                                    <div className="p-5 flex flex-col flex-1 relative bg-white z-10">
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-2 items-center">
                                                {trend.trend_categories?.name && (
                                                    <span className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                                                        {trend.trend_categories.name}
                                                    </span>
                                                )}
                                                {trend.subcategory && (
                                                    <span className="text-blue-600 text-[10px] uppercase font-bold tracking-wider">
                                                        #{trend.subcategory}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                                                <Clock size={12} />
                                                <span>{formatDate(trend.created_at)}</span>
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors mb-4 line-clamp-3">
                                            {trend.title}
                                        </h2>
                                        
                                        <div className="mt-auto pt-4 flex items-center border-t border-gray-50 justify-between">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                                                <Flame size={12} /> {trend.view_count || 0} görüntülenme
                                            </div>
                                            <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
