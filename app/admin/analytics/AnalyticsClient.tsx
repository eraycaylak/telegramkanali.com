'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, ArrowUpRight, MousePointer2, Calendar, Filter, Eye, Link as LinkIcon, FolderOpen } from 'lucide-react';

export default function AnalyticsClient() {
    const [pageViews, setPageViews] = useState<any[]>([]);
    const [channelClicks, setChannelClicks] = useState<any[]>([]);
    const [categoryViews, setCategoryViews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [daysFilter, setDaysFilter] = useState<number>(30);

    useEffect(() => {
        checkPermission();
        loadData(daysFilter);
    }, [daysFilter]);

    const checkPermission = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            window.location.href = '/admin';
            return;
        }

        const { data: user } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (user) {
            if (user.role === 'admin') return;
            if (user.role === 'editor' && user.permissions?.view_analytics) return;
        }

        alert('Bu sayfaya erişim yetkiniz yok.');
        window.location.href = '/admin/dashboard';
    };

    async function loadData(days: number) {
        setLoading(true);
        try {
            const mod = await import('@/app/actions/analyticsAdmin');
            const stats = await mod.getAnalyticsSummary(days);
            if (stats) {
                setPageViews(stats.pageViews || []);
                setChannelClicks(stats.channelClicks || []);
                setCategoryViews(stats.categoryViews || []);
            }
        } catch (err) {
            console.error("Error loading analytics data:", err);
        } finally {
            setLoading(false);
        }
    }

    const totalViews = pageViews.reduce((acc, curr) => acc + curr.total_views, 0);
    const totalDailyViews = pageViews.reduce((acc, curr) => acc + (curr.daily_views || 0), 0);

    const totalVisitors = pageViews.reduce((acc, curr) => acc + curr.total_visitors, 0);
    const totalDailyVisitors = pageViews.reduce((acc, curr) => acc + (curr.daily_visitors || 0), 0);

    const totalPeriodClicks = channelClicks.reduce((acc, curr) => acc + (curr.period_clicks || 0), 0);

    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart className="text-blue-600" />
                    Site Analitiği
                </h1>

                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <Calendar size={18} className="text-gray-500" />
                    <select
                        value={daysFilter}
                        onChange={(e) => setDaysFilter(Number(e.target.value))}
                        className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                        disabled={loading}
                    >
                        <option value={1}>Son 24 Saat</option>
                        <option value={7}>Son 7 Gün</option>
                        <option value={30}>Son 30 Gün</option>
                        <option value={90}>Son 90 Gün</option>
                        <option value={365}>Son 1 Yıl</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center flex-col items-center py-20 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium">Veriler getiriliyor, lütfen bekleyin...</p>
                </div>
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Toplam Görüntülenme</p>
                                    <h3 className="text-3xl font-bold">{totalViews.toLocaleString('tr-TR')}</h3>
                                    <div className="text-xs text-blue-200 mt-1 bg-white/10 px-2 py-1 rounded inline-block">
                                        Bugün: {totalDailyViews.toLocaleString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 text-white/5 transform translate-x-1/4 translate-y-1/4">
                                <Eye size={120} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <MousePointer2 size={24} />
                                </div>
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Toplam Ziyaretçi</p>
                                    <h3 className="text-3xl font-bold">{totalVisitors.toLocaleString('tr-TR')}</h3>
                                    <div className="text-xs text-purple-200 mt-1 bg-white/10 px-2 py-1 rounded inline-block">
                                        Bugün: {totalDailyVisitors.toLocaleString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 text-white/5 transform translate-x-1/4 translate-y-1/4">
                                <MousePointer2 size={120} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <LinkIcon size={24} />
                                </div>
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Kanal Tıklamaları (Bu Dönem)</p>
                                    <h3 className="text-3xl font-bold">{totalPeriodClicks.toLocaleString('tr-TR')}</h3>
                                    <div className="text-xs text-green-200 mt-1 bg-white/10 px-2 py-1 rounded inline-block">
                                        Tam Periyot İçi Tıklama
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 text-white/5 transform translate-x-1/4 translate-y-1/4">
                                <LinkIcon size={120} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Channel Clicks */}
                        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <LinkIcon className="text-blue-500" size={20} />
                                        Kanala Katıl Tıklamaları
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Son {daysFilter} gün içinde en çok yönlendirilen kanallar.</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3 custom-scrollbar">
                                {channelClicks.slice(0, 50).map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl transition border border-transparent hover:border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-gray-400 w-5">{i + 1}.</span>
                                            {stat.channel?.image ? (
                                                <img src={stat.channel.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {stat.channel?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{stat.channel?.name || 'Bilinmeyen Kanal'}</h4>
                                                <span className="text-xs text-gray-500">Ömür Boyu: {stat.total_clicks || 0}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-black inline-block">
                                                {stat.period_clicks}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {channelClicks.length === 0 && (
                                    <div className="text-center py-10 text-gray-400">
                                        <LinkIcon className="mx-auto mb-2 opacity-20" size={32} />
                                        Henüz bu tarih aralığında yönlendirme verisi yok.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category Views */}
                        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FolderOpen className="text-purple-500" size={20} />
                                        Kategori Görüntülenmeleri
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Son {daysFilter} güne ait tahmini sayfa görüntülenmeleri.</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3 custom-scrollbar">
                                {categoryViews.map((cat, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-gray-400 w-5">{i + 1}.</span>
                                            <div className="font-bold text-gray-900 capitalize text-sm md:text-base">
                                                {cat.name.replace(/-/g, ' ')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pl-8 sm:pl-0">
                                            <div className="flex-1 h-2 sm:w-24 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (cat.views / (categoryViews[0]?.views || 1)) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold w-16 text-center">
                                                {cat.views}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {categoryViews.length === 0 && (
                                    <div className="text-center py-10 text-gray-400">
                                        <FolderOpen className="mx-auto mb-2 opacity-20" size={32} />
                                        Bu tarih aralığında görüntülenme yok.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </>
            )}

            {/* Custom Scrollbar Styles for the lists */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #d1d5db;
                }
            `}</style>
        </div>
    );
}
