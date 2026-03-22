'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Flame, ArrowUpRight, ChevronRight, BarChart2 } from 'lucide-react';

export default function TrendsClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const displayedTrends = useMemo(() => {
        if (selectedCategory === 'all') return initialTrends;
        return initialTrends.filter(t => t.category_id === selectedCategory);
    }, [initialTrends, selectedCategory]);

    const topTrends = displayedTrends.slice(0, 10);
    const sliderTrends = displayedTrends.filter(t => t.image).slice(0, 6);

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-32 font-sans">
            
            {/* Header Area */}
            <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">Öne çıkan trendler</h1>
                    <p className="text-gray-500 text-sm font-medium">Sosyal medya aramalarına ve site içi görüntülenmelere dayalı olarak nelerin trend olduğunu görün.</p>
                </div>
                
                {/* Desktop Native Select / Mobile Chips */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <button onClick={() => setSelectedCategory('all')} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}>Tümü</button>
                    {initialCategories.map(cat => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat.id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="hidden md:block">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">İlgi Alanı</label>
                    <select 
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 font-bold cursor-pointer outline-none"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">Tümü</option>
                        {initialCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {displayedTrends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2rem]">
                        <Flame size={32} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz İçerik Yok</h3>
                        <p className="text-sm text-gray-500 font-medium">Bu kategoride trend bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                        
                        {/* Mobile: Image Slider - Shown above the list on mobile only */}
                        {sliderTrends.length > 0 && (
                            <div className="w-full md:hidden mb-2">
                                <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x px-1">
                                    {sliderTrends.map((trend) => (
                                        <Link href={`/trends/${trend.slug}`} key={`slider-${trend.id}`} className="snap-center shrink-0 w-[240px] h-[320px] rounded-3xl overflow-hidden relative shadow-sm group">
                                            <img src={trend.image} alt={trend.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                                                <div className="text-[10px] font-black text-white/80 tracking-widest uppercase mb-1">
                                                    {trend.trend_categories?.name || 'GÜNDEM'}
                                                </div>
                                                <h3 className="text-white font-bold text-lg leading-tight line-clamp-3">
                                                    {trend.title}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Left Column: Numbered List */}
                        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col gap-2">
                            {topTrends.map((trend, index) => {
                                const isTopHitter = index === 0;
                                return (
                                    <Link 
                                        key={trend.id} 
                                        href={`/trends/${trend.slug}`}
                                        className={`flex items-center gap-4 p-4 rounded-3xl transition-all hover:bg-gray-50 group border border-transparent ${isTopHitter ? 'bg-gray-50/50 hover:border-gray-200' : ''}`}
                                    >
                                        <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-black text-lg ${isTopHitter ? 'bg-[#dcf5cc] text-[#1c6400]' : 'bg-gray-100 text-gray-800'}`}>
                                            {index + 1}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="text-[17px] font-bold text-gray-900 truncate mb-0.5 group-hover:underline">
                                                {trend.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                                                <ArrowUpRight size={14} className={isTopHitter ? "text-[#1c6400]" : "text-gray-400"} />
                                                <span className="truncate">
                                                    <strong className="text-gray-900">{trend.view_count || 12} görüntülenme</strong> - 
                                                    <span className="font-bold ml-1">{trend.trend_categories?.name || 'Gündem'}</span> kategorisinde popüler
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex items-center justify-center w-16 h-8 text-gray-400">
                                            <BarChart2 size={24} className="opacity-50" strokeWidth={1.5} />
                                        </div>

                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-800 transition-colors flex-shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop: Masonry / Grid for Images */}
                        <div className="hidden md:block w-full md:w-[55%] lg:w-[60%]">
                            {sliderTrends.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sliderTrends.map((trend, i) => (
                                        <Link 
                                            href={`/trends/${trend.slug}`} 
                                            key={`grid-${trend.id}`}
                                            className={`rounded-3xl overflow-hidden relative group bg-gray-100 shadow-sm ${i === 0 ? 'col-span-2 row-span-2 aspect-square lg:aspect-auto' : 'aspect-[4/5] lg:aspect-square'}`}
                                        >
                                            <img src={trend.image} alt={trend.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full h-full min-h-[400px] bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center">
                                    <p className="text-gray-400 font-bold">Görsel bulunamadı</p>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
