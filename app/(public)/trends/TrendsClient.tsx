'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Flame, Clock, PlayCircle } from 'lucide-react';

export default function TrendsClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const displayedTrends = useMemo(() => {
        if (selectedCategory === 'all') return initialTrends;
        return initialTrends.filter(t => t.category_id === selectedCategory);
    }, [initialTrends, selectedCategory]);

    const featuredTrend = displayedTrends[0];
    const restTrends = displayedTrends.slice(1);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(date);
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 md:pb-32 font-sans font-medium text-gray-900">
            {/* Minimal App Header */}
            <div className="pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">Gündem</span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase">Trendler</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <Flame size={20} className="text-black" />
                </div>
            </div>

            {/* Horizontal Filter Chips (App Style) */}
            <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-8">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all flex items-center gap-2 ${
                            selectedCategory === 'all' 
                                ? 'bg-black text-white shadow-lg' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        {selectedCategory === 'all' && <Flame size={16} fill="currentColor" />}
                        Popüler
                    </button>
                    {initialCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold tracking-tight transition-all ${
                                selectedCategory === cat.id 
                                    ? 'bg-black text-white shadow-lg' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {displayedTrends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                        <Flame size={32} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Henüz İçerik Yok</h3>
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Bu kategoride trend bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Featured Top Card (Similar to the left phone UI) */}
                        {featuredTrend && (
                            <Link href={`/trends/${featuredTrend.slug}`} className="group block w-full relative bg-black rounded-[2rem] overflow-hidden shadow-2xl">
                                {featuredTrend.image ? (
                                    <div className="w-full h-[400px] md:h-[500px] relative">
                                        <img 
                                            src={featuredTrend.image} 
                                            alt={featuredTrend.title} 
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="w-full h-[300px] bg-gradient-to-br from-gray-900 to-black"></div>
                                )}
                                
                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                                    <div className="flex gap-2 mb-4">
                                        <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                                            {featuredTrend.trend_categories?.name || 'GÜNDEM'}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6 uppercase">
                                        {featuredTrend.title}
                                    </h2>
                                    
                                    <div className="flex items-center gap-3 mt-auto">
                                        <div className="bg-white text-black px-6 py-3 rounded-full text-sm font-black tracking-tight flex items-center gap-2 group-hover:bg-gray-100 transition-colors">
                                            Daha Fazla Oku <PlayCircle size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Staggered Masonry / Grid for the rest */}
                        {restTrends.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                {restTrends.map((trend) => (
                                    <Link 
                                        href={`/trends/${trend.slug}`} 
                                        key={trend.id}
                                        className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group"
                                    >
                                        {trend.image && (
                                            <div className="relative w-full h-[200px] rounded-[1.5rem] overflow-hidden mb-5 bg-gray-100">
                                                <img 
                                                    src={trend.image} 
                                                    alt={trend.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {trend.trend_categories?.name || 'GÜNDEM'}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!trend.image && trend.trend_categories?.name && (
                                            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-3 block">
                                                {trend.trend_categories.name}
                                            </span>
                                        )}

                                        <h3 className="text-xl md:text-2xl font-black text-black tracking-tighter leading-[1.15] mb-4 uppercase line-clamp-3">
                                            {trend.title}
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 tracking-tight">
                                                <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> {formatDate(trend.created_at)}</span>
                                                <span className="flex items-center gap-1"><Flame size={14} className="text-gray-400" /> {trend.view_count || 0}</span>
                                            </div>
                                            <div className="bg-black text-white px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase group-hover:bg-gray-800 transition-colors">
                                                Devamı →
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
