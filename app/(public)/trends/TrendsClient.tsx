'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Flame, Clock, PlayCircle, Menu, User, Map, BarChart2 } from 'lucide-react';

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
        <div className="min-h-screen bg-white pb-24 md:pb-32 font-sans text-gray-900">
            {/* Minimal Centered App Header (Like "Find courses" screen) */}
            <div className="pt-6 pb-4 px-6 flex items-center justify-between max-w-5xl mx-auto">
                <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"><Menu size={24} className="text-black" /></button>
                <h1 className="text-lg md:text-xl font-black text-black tracking-tight">Trendler & Gündem</h1>
                <button className="p-2 -mr-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><User size={20} className="text-black" /></button>
            </div>

            {/* Horizontal Filter Chips (App Style) */}
            <div className="px-6 max-w-5xl mx-auto mb-6">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold tracking-tight transition-all flex items-center gap-2 ${
                            selectedCategory === 'all' 
                                ? 'bg-black text-white' 
                                : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {selectedCategory === 'all' && <Flame size={16} fill="currentColor" />}
                        Popüler
                    </button>
                    {/* Add some fake icon filters to perfectly match the right screen vibe */}
                    <button className="flex-shrink-0 p-2 rounded-full border border-gray-200 hover:bg-gray-50"><Map size={18} className="text-black" /></button>
                    <button className="flex-shrink-0 p-2 border-r border-gray-200 pr-4 mr-2"><BarChart2 size={18} className="text-black" /></button>

                    {initialCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold tracking-tight transition-all ${
                                selectedCategory === cat.id 
                                    ? 'bg-black text-white' 
                                    : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 max-w-5xl mx-auto">
                {displayedTrends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2rem]">
                        <Flame size={32} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz İçerik Yok</h3>
                        <p className="text-sm text-gray-500 font-medium">Bu kategoride trend bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Featured Top Card (White overlapping card style from the left screen) */}
                        {featuredTrend && (
                            <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm border border-gray-100 group">
                                {/* Top Image Half */}
                                <div className="w-full h-[280px] md:h-[400px] relative">
                                    {featuredTrend.image ? (
                                        <img 
                                            src={featuredTrend.image} 
                                            alt={featuredTrend.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                    )}
                                </div>
                                
                                {/* Bottom Overlapping White Box */}
                                <div className="bg-white px-6 py-8 relative rounded-t-[2.5rem] -mt-12 w-full z-10 shadow-[0_-20px_25px_-5px_rgba(0,0,0,0.1)]">
                                    <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">
                                        {featuredTrend.trend_categories?.name || 'GÜNDEM'}
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black text-black tracking-tighter leading-[1.05] uppercase mb-4">
                                        {featuredTrend.title}
                                    </h2>
                                    
                                    <div className="flex items-center gap-2 mb-6">
                                        <PlayCircle size={16} className="text-red-500" fill="currentColor" />
                                        <span className="text-xs font-bold text-gray-800 tracking-tight">Güncel Okuma & Detaylar</span>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link href={`/trends/${featuredTrend.slug}`} className="flex-1 bg-black text-white flex justify-center items-center py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-transform active:scale-95">
                                            DEVAMI <span className="ml-2">→</span>
                                        </Link>
                                        <button className="px-6 bg-gray-100 text-black flex justify-center items-center py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-transform active:scale-95">
                                            ATLA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Narrower Grid for the rest of cards (like right screen) */}
                        {restTrends.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                {restTrends.map((trend) => (
                                    <Link 
                                        href={`/trends/${trend.slug}`} 
                                        key={trend.id}
                                        className="group flex flex-col w-full"
                                    >
                                        {trend.image && (
                                            <div className="w-full h-[180px] rounded-[2rem] overflow-hidden mb-4 relative bg-gray-100 shadow-sm">
                                                <img 
                                                    src={trend.image} 
                                                    alt={trend.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="px-2">
                                            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">
                                                {trend.trend_categories?.name || 'GÜNDEM'}
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-black tracking-tighter leading-[1.1] uppercase line-clamp-2 mb-2">
                                                {trend.title}
                                            </h3>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                                    <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> {formatDate(trend.created_at)}</span>
                                                    <span className="flex items-center gap-1"><Flame size={14} className="text-gray-400" /> {trend.view_count || 0}</span>
                                                </div>
                                                <div className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-colors">
                                                    GÖNDER <span className="ml-1">→</span>
                                                </div>
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
