'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    BarChart, MousePointer2, Calendar, Eye, Link as LinkIcon,
    FolderOpen, Search, ArrowDownUp, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsClient() {
    const [pageViews, setPageViews] = useState<any[]>([]);
    const [channelClicks, setChannelClicks] = useState<any[]>([]);
    const [categoryViews, setCategoryViews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [daysFilter, setDaysFilter] = useState<number>(30);
    const [channelSearch, setChannelSearch] = useState('');
    const [sortBy, setSortBy] = useState<'period_clicks' | 'total_clicks' | 'daily_clicks'>('period_clicks');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [showAllChannels, setShowAllChannels] = useState(false);

    useEffect(() => {
        checkPermission();
    }, []);

    useEffect(() => {
        loadData(daysFilter);
    }, [daysFilter]);

    const checkPermission = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { window.location.href = '/admin'; return; }

        const { data: user } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

        if (user?.role === 'admin') return;
        if (user?.role === 'editor' && user.permissions?.view_analytics) return;

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

    // Filtered + sorted channel clicks
    const filteredChannels = useMemo(() => {
        let list = [...channelClicks];

        // Filter by search term
        if (channelSearch.trim()) {
            const q = channelSearch.toLowerCase();
            list = list.filter(s => s.channel?.name?.toLowerCase().includes(q));
        }

        // Sort
        list.sort((a, b) => {
            const val = b[sortBy] - a[sortBy];
            return sortDir === 'desc' ? val : -val;
        });

        return list;
    }, [channelClicks, channelSearch, sortBy, sortDir]);

    const displayedChannels = showAllChannels ? filteredChannels : filteredChannels.slice(0, 20);

    const toggleSort = (col: typeof sortBy) => {
        if (sortBy === col) {
            setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(col);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ col }: { col: typeof sortBy }) => {
        if (sortBy !== col) return <ArrowDownUp size={14} className="opacity-30" />;
        return sortDir === 'desc' ? <ChevronDown size={14} className="text-blue-600" /> : <ChevronUp size={14} className="text-blue-600" />;
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart className="text-blue-600" />
                    Site Analitiği
                </h1>

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
                    <p className="text-gray-500 font-medium">Veriler getiriliyor...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/20 rounded-xl"><Eye size={24} /></div>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Toplam Görüntülenme</p>
                                    <h3 className="text-3xl font-bold">{totalViews.toLocaleString('tr-TR')}</h3>
                                    <div className="text-xs text-blue-200 mt-1 bg-white/10 px-2 py-1 rounded inline-block">Bugün: {totalDailyViews.toLocaleString('tr-TR')}</div>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 text-white/5 transform translate-x-1/4 translate-y-1/4"><Eye size={120} /></div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/20 rounded-xl"><MousePointer2 size={24} /></div>
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Toplam Ziyaretçi</p>
                                    <h3 className="text-3xl font-bold">{totalVisitors.toLocaleString('tr-TR')}</h3>
                                    <div className="text-xs text-purple-200 mt-1 bg-white/10 px-2 py-1 rounded inline-block">Bugün: {totalDailyVisitors.toLocaleString('tr-TR')}</div>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 text-white/5 transform translate-x-1/4 translate-y-1/4"><MousePointer2 size={120} /></div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-white/20 rounded-xl"><LinkIcon size={24} /></div>
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Kanal Tıklamaları (Dönem)</p>
                                    <h3 className="text-3xl font-bold">{totalPeriodClicks.toLocaleString('tr-TR')}</h3>
                                    <div className="text-xs text-green-200 mt-1 bg-white/10 px-2 py-1 rounded inline-block">Son {daysFilter} gün</div>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 text-white/5 transform translate-x-1/4 translate-y-1/4"><LinkIcon size={120} /></div>
                        </div>
                    </div>

                    {/* === FULL CHANNEL CLICKS TABLE === */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <LinkIcon className="text-blue-500" size={20} />
                                    Kanal Tıklama Detayları
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {filteredChannels.length} kanal ({channelSearch ? `"${channelSearch}" araması için ` : ''}son {daysFilter} gün)
                                </p>
                            </div>

                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Kanal adı ara..."
                                    value={channelSearch}
                                    onChange={(e) => setChannelSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* Sort Row */}
                        <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">Kanal</div>
                            <button
                                onClick={() => toggleSort('period_clicks')}
                                className="col-span-2 flex items-center gap-1 hover:text-blue-600 transition-colors justify-end"
                            >
                                Dönem <SortIcon col="period_clicks" />
                            </button>
                            <button
                                onClick={() => toggleSort('daily_clicks')}
                                className="col-span-2 flex items-center gap-1 hover:text-blue-600 transition-colors justify-end"
                            >
                                Bugün <SortIcon col="daily_clicks" />
                            </button>
                            <button
                                onClick={() => toggleSort('total_clicks')}
                                className="col-span-2 flex items-center gap-1 hover:text-blue-600 transition-colors justify-end"
                            >
                                Toplam <SortIcon col="total_clicks" />
                            </button>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {displayedChannels.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <LinkIcon className="mx-auto mb-2 opacity-20" size={32} />
                                    {channelSearch ? `"${channelSearch}" için sonuç bulunamadı.` : 'Bu dönemde tıklama verisi yok.'}
                                </div>
                            ) : (
                                displayedChannels.map((stat, i) => {
                                    // Bar width for visual scaling
                                    const maxClicks = filteredChannels[0]?.period_clicks || 1;
                                    const barWidth = Math.max(2, Math.round((stat.period_clicks / maxClicks) * 100));

                                    return (
                                        <div key={stat.id || i} className="px-4 md:px-6 py-3.5 hover:bg-blue-50/30 transition-colors group">
                                            {/* Mobile Layout */}
                                            <div className="md:hidden flex items-center gap-3">
                                                <span className="text-xs font-black text-gray-400 w-5 shrink-0">{i + 1}.</span>
                                                {stat.channel?.image ? (
                                                    <img src={stat.channel.image} className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" alt="" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                        {stat.channel?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{stat.channel?.name || 'Bilinmeyen'}</p>
                                                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                                                        <span className="text-blue-700 font-bold">{stat.period_clicks} dönem</span>
                                                        <span>{stat.daily_clicks} bugün</span>
                                                        <span>{stat.total_clicks} toplam</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop Layout */}
                                            <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                                                <span className="col-span-1 text-sm font-black text-gray-400">{i + 1}.</span>
                                                <div className="col-span-5 flex items-center gap-3 min-w-0">
                                                    {stat.channel?.image ? (
                                                        <img src={stat.channel.image} className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" alt="" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                            {stat.channel?.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-gray-900 text-sm truncate">{stat.channel?.name || 'Bilinmeyen Kanal'}</p>
                                                        {/* Mini bar chart */}
                                                        <div className="h-1.5 bg-gray-100 rounded-full mt-1 w-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-400 rounded-full"
                                                                style={{ width: `${barWidth}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/${stat.channel?.slug || ''}`}
                                                        target="_blank"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 shrink-0 ml-1"
                                                        title="Kanalı Görüntüle"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-black">
                                                        {stat.period_clicks.toLocaleString('tr-TR')}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-right text-sm text-gray-600 font-medium">
                                                    {stat.daily_clicks > 0 ? (
                                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                                                            +{stat.daily_clicks}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-right text-sm text-gray-500">
                                                    {stat.total_clicks?.toLocaleString('tr-TR') || 0}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Show More */}
                        {filteredChannels.length > 20 && (
                            <div className="p-4 border-t border-gray-100 text-center">
                                <button
                                    onClick={() => setShowAllChannels(v => !v)}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
                                >
                                    {showAllChannels ? (
                                        <><ChevronUp size={16} /> Daha az göster</>
                                    ) : (
                                        <><ChevronDown size={16} /> Tümünü göster ({filteredChannels.length} kanal)</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Category Views */}
                    <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FolderOpen className="text-purple-500" size={20} />
                                Kategori Görüntülenmeleri
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">Son {daysFilter} güne ait sayfa görüntülenmeleri.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryViews.map((cat, i) => {
                                const maxViews = categoryViews[0]?.views || 1;
                                const pct = Math.max(2, Math.round((cat.views / maxViews) * 100));
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <span className="text-sm font-black text-gray-400 w-5 shrink-0">{i + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 capitalize text-sm truncate">{cat.name.replace(/-/g, ' ')}</p>
                                            <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
                                            {cat.views.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                            {categoryViews.length === 0 && (
                                <div className="col-span-full text-center py-10 text-gray-400">
                                    <FolderOpen className="mx-auto mb-2 opacity-20" size={32} />
                                    Bu tarih aralığında görüntülenme yok.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #d1d5db; }
            `}</style>
        </div>
    );
}
