'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Flame, Clock, TrendingUp } from 'lucide-react';

export default function TrendsClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

    // Filter trends by category
    const filteredByCategory = useMemo(() => {
        if (selectedCategory === 'all') return initialTrends;
        return initialTrends.filter(t => t.category_id === selectedCategory);
    }, [initialTrends, selectedCategory]);

    // Extract unique subcategories from the currently filtered category
    const availableSubcategories = useMemo(() => {
        const subs = new Set<string>();
        filteredByCategory.forEach(t => {
            if (t.subcategory) subs.add(t.subcategory);
        });
        return Array.from(subs);
    }, [filteredByCategory]);

    // Final filtered trends
    const displayedTrends = useMemo(() => {
        if (selectedSubcategory === 'all') return filteredByCategory;
        return filteredByCategory.filter(t => t.subcategory === selectedSubcategory);
    }, [filteredByCategory, selectedSubcategory]);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Awesome Premium Header */}
            <div className="relative overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-purple-50/50"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
                            <Flame size={14} className="text-orange-500" /> Günün Nabzı
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
                            Gündemin <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Öne Çıkanları</span>
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                            Türkiye gündemi, sosyal medya trendleri, en çok izlenenler ve anlık patlama yaşayan içerikleri tek bir ekranda keşfedin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                
                {/* Modern Navigation Tabs */}
                <div className="flex bg-white/80 backdrop-blur-xl p-1.5 md:p-2 rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white max-w-fit mx-auto overflow-x-auto scrollbar-hide mb-8">
                    <button
                        onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
                        className={`px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-[1.5rem] font-bold text-sm transition-all whitespace-nowrap ${
                            selectedCategory === 'all' 
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                        }`}
                    >
                        Tüm Trendler
                    </button>
                    {initialCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory('all'); }}
                            className={`px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-[1.5rem] font-bold text-sm transition-all whitespace-nowrap ${
                                selectedCategory === cat.id 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Subcategories (Pills) */}
                {availableSubcategories.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
                        <button
                            onClick={() => setSelectedSubcategory('all')}
                            className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border ${
                                selectedSubcategory === 'all'
                                    ? 'bg-white text-gray-900 border-gray-200 shadow-sm'
                                    : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Tümü
                        </button>
                        {availableSubcategories.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setSelectedSubcategory(sub)}
                                className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all border ${
                                    selectedSubcategory === sub
                                        ? 'bg-white text-gray-900 border-gray-200 shadow-sm'
                                        : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                )}

                {/* Bento Grid Layout - Premium Display */}
                {displayedTrends.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <TrendingUp size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Trend Bulunamadı</h3>
                        <p className="text-gray-500">Bu kategoride henüz bir gündem bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                        {displayedTrends.map((trend, index) => {
                            // Make the first item in the grid a "Hero" bento card on desktop if there are enough items
                            const isHero = index === 0 && selectedCategory === 'all' && selectedSubcategory === 'all';
                            
                            return (
                                <Link 
                                    href={`/trends/${trend.slug}`} 
                                    key={trend.id}
                                    className={`group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 ${
                                        isHero ? 'md:col-span-2 md:row-span-2 lg:col-span-2' : ''
                                    }`}
                                >
                                    <div className={`relative ${isHero ? 'aspect-[2/1] md:aspect-auto md:h-80 lg:h-96' : 'aspect-video'} w-full bg-gray-100 overflow-hidden`}>
                                        {trend.image ? (
                                            <img 
                                                src={trend.image} 
                                                alt={trend.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center">
                                                <TrendingUp size={48} className="text-gray-200" />
                                            </div>
                                        )}
                                        {/* Overlay Gradient for Hero */}
                                        {isHero && (
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        )}
                                        
                                        {/* Badges on Top */}
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                            {trend.trend_categories?.name && (
                                                <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm">
                                                    {trend.trend_categories.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`flex flex-col flex-1 p-6 md:p-8 ${isHero ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-white'}`}>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            {trend.subcategory && (
                                                <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isHero ? 'text-gray-300' : 'text-blue-600'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {trend.subcategory}
                                                </div>
                                            )}
                                            <div className={`flex items-center gap-1.5 text-xs font-bold ${isHero ? 'text-gray-400' : 'text-gray-400'}`}>
                                                <Clock size={14} /> {formatDate(trend.created_at)}
                                            </div>
                                        </div>
                                        
                                        <h2 className={`font-black tracking-tight mb-4 group-hover:text-blue-500 transition-colors ${
                                            isHero ? 'text-2xl md:text-3xl lg:text-4xl text-white' : 'text-xl text-gray-900'
                                        }`}>
                                            {trend.title}
                                        </h2>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100/10">
                                            <div className={`text-xs font-bold flex items-center gap-1.5 ${isHero ? 'text-gray-300' : 'text-gray-400'}`}>
                                                <Flame size={14} className={isHero ? 'text-orange-400' : 'text-orange-500'} /> 
                                                {trend.view_count || 0} görüntülenme
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                                                isHero ? 'bg-white/10 text-white' : 'bg-gray-50 border border-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100'
                                            }`}>
                                                <ArrowUpRight size={16} />
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
