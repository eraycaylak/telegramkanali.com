'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowUpRight, ChevronRight, BarChart2, ChevronLeft } from 'lucide-react';

export default function TrendsClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [currentSlide, setCurrentSlide] = useState(0);

    const displayedTrends = useMemo(() => {
        if (selectedCategory === 'all') return initialTrends;
        return initialTrends.filter(t => t.category_id === selectedCategory);
    }, [initialTrends, selectedCategory]);

    const topTrends = displayedTrends.slice(0, 10);
    const sliderTrends = displayedTrends.filter(t => t.image).slice(0, 5);

    // Auto-play slider
    useEffect(() => {
        if (sliderTrends.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderTrends.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [sliderTrends.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderTrends.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? sliderTrends.length - 1 : prev - 1));

    return (
        <div className="min-h-screen bg-white pb-24 md:pb-32 font-sans">
            
            {/* Header Area */}
            <div className="px-4 md:px-8 py-6 md:py-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter mb-1 md:mb-2 uppercase">Günün Trendleri</h1>
                    <p className="text-gray-500 text-xs md:text-sm font-medium">Türkiye'de anlık olarak en çok okunan ve paylaşılan başlıklar.</p>
                </div>
                
                {/* Desktop Native Select / Mobile Chips */}
                <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <button onClick={() => setSelectedCategory('all')} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}>Tümü</button>
                    {initialCategories.map(cat => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat.id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="hidden md:block">
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Filtrele</label>
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
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        
                        {/* Mobile & Desktop: True News Hero Carousel */}
                        {sliderTrends.length > 0 && (
                            <div className="w-full md:w-[55%] lg:w-[60%] relative group">
                                <Link href={`/trends/${sliderTrends[currentSlide].slug}`} className="block w-full h-[280px] md:h-[450px] relative rounded-3xl overflow-hidden shadow-lg bg-black">
                                    <img 
                                        key={sliderTrends[currentSlide].id}
                                        src={sliderTrends[currentSlide].image} 
                                        alt={sliderTrends[currentSlide].title} 
                                        className="w-full h-full object-cover opacity-80 animate-in fade-in duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                                        <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm w-fit mb-3">
                                            {sliderTrends[currentSlide].trend_categories?.name || 'GÜNDEM'}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight md:leading-[1.1] uppercase drop-shadow-md decoration-white/30 decoration-2 underline-offset-4 hover:underline">
                                            {sliderTrends[currentSlide].title}
                                        </h2>
                                    </div>
                                </Link>

                                {/* Slider Controls & Dots */}
                                {sliderTrends.length > 1 && (
                                    <>
                                        <button onClick={(e) => { e.preventDefault(); prevSlide(); }} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:flex">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button onClick={(e) => { e.preventDefault(); nextSlide(); }} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:flex">
                                            <ChevronRight size={24} />
                                        </button>
                                        
                                        <div className="absolute bottom-4 right-6 flex gap-2 z-10">
                                            {sliderTrends.map((_, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => setCurrentSlide(idx)}
                                                    className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
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

                    </div>
                )}
            </div>
        </div>
    );
}
