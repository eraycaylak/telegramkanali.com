'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    BarChart, MousePointer2, Calendar, Eye, Link as LinkIcon,
    FolderOpen, Search, ArrowDownUp, ChevronDown, ChevronUp, ExternalLink,
    TrendingUp, TrendingDown, Minus, Globe, FileText, Activity, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString('tr-TR');
}

function calcChange(current: number, previous: number): { pct: number; direction: 'up' | 'down' | 'flat' } {
    if (previous === 0 && current === 0) return { pct: 0, direction: 'flat' };
    if (previous === 0) return { pct: 100, direction: 'up' };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { pct: Math.abs(pct), direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
    const { pct, direction } = calcChange(current, previous);
    if (direction === 'flat') return <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-gray-400"><Minus size={12} /> Aynı</span>;
    const isUp = direction === 'up';
    return (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            %{pct}
        </span>
    );
}

// ─── Mini Bar Chart (Pure CSS) ──────────────────────────────────────────────

function MiniBarChart({ data, maxVal, color = '#3b82f6', height = 120 }: { data: { label: string; value: number; secondValue?: number }[]; maxVal: number; color?: string; height?: number }) {
    const barCount = data.length;
    const barWidth = barCount > 14 ? 'flex-1 min-w-[4px]' : 'flex-1 min-w-[10px]';

    return (
        <div className="flex items-end gap-[2px] w-full" style={{ height }}>
            {data.map((d, i) => {
                const h = maxVal > 0 ? Math.max(2, (d.value / maxVal) * 100) : 2;
                const h2 = d.secondValue && maxVal > 0 ? Math.max(1, (d.secondValue / maxVal) * 100) : 0;
                return (
                    <div key={i} className={`${barWidth} group relative flex flex-col items-stretch justify-end`} style={{ height: '100%' }}>
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                            <div className="font-bold">{d.label}</div>
                            <div>{d.value.toLocaleString('tr-TR')} görüntüleme</div>
                            {d.secondValue !== undefined && <div className="text-blue-300">{d.secondValue.toLocaleString('tr-TR')} ziyaretçi</div>}
                        </div>
                        {/* Visitors bar (behind) */}
                        {h2 > 0 && (
                            <div
                                className="w-full rounded-t-sm transition-all duration-500 absolute bottom-0"
                                style={{ height: `${h2}%`, backgroundColor: color, opacity: 0.2 }}
                            />
                        )}
                        {/* Views bar */}
                        <div
                            className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80 relative"
                            style={{ height: `${h}%`, background: `linear-gradient(to top, ${color}, ${color}cc)` }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AnalyticsClient() {
    const [pageViews, setPageViews] = useState<any[]>([]);
    const [channelClicks, setChannelClicks] = useState<any[]>([]);
    const [categoryViews, setCategoryViews] = useState<any[]>([]);
    const [dailyTrends, setDailyTrends] = useState<any[]>([]);
    const [topPages, setTopPages] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalViews: 0, totalVisitors: 0, dailyViews: 0, dailyVisitors: 0,
        totalPeriodClicks: 0, prevViews: 0, prevVisitors: 0, prevPeriodClicks: 0,
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [daysFilter, setDaysFilter] = useState<number>(30);
    const [channelSearch, setChannelSearch] = useState('');
    const [sortBy, setSortBy] = useState<'period_clicks' | 'total_clicks' | 'daily_clicks'>('period_clicks');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [showAllChannels, setShowAllChannels] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'pages'>('overview');

    // Server-side search results
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        checkPermission();
    }, []);

    useEffect(() => {
        loadData(daysFilter);
    }, [daysFilter]);

    // Server-side search with debounce
    useEffect(() => {
        if (!channelSearch.trim()) {
            setSearchResults(null);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const mod = await import('@/app/actions/analyticsAdmin');
                const results = await mod.searchChannelStats(channelSearch.trim(), daysFilter);
                setSearchResults(results);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [channelSearch, daysFilter]);

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
                setDailyTrends(stats.dailyTrends || []);
                setTopPages(stats.topPages || []);
                if (stats.summary) setSummary(stats.summary as any);
            }
        } catch (err) {
            console.error("Error loading analytics data:", err);
        } finally {
            setLoading(false);
        }
    }

    // Computed values
    const totalViews = summary.totalViews;
    const totalDailyViews = summary.dailyViews;
    const totalVisitors = summary.totalVisitors;
    const totalDailyVisitors = summary.dailyVisitors;
    const totalPeriodClicks = summary.totalPeriodClicks || channelClicks.reduce((acc: number, curr: any) => acc + (curr.period_clicks || 0), 0);

    // Chart data
    const chartMaxVal = Math.max(...dailyTrends.map(d => d.views), 1);
    const chartData = dailyTrends.map(d => {
        const dateObj = new Date(d.date);
        const label = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        return { label, value: d.views, secondValue: d.visitors };
    });

    // Channel list
    const filteredChannels = useMemo(() => {
        if (channelSearch.trim() && searchResults !== null) {
            return [...searchResults].sort((a, b) => {
                const val = b[sortBy] - a[sortBy];
                return sortDir === 'desc' ? val : -val;
            });
        }
        if (channelSearch.trim() && searchResults === null) return [];
        return [...channelClicks].sort((a, b) => {
            const val = b[sortBy] - a[sortBy];
            return sortDir === 'desc' ? val : -val;
        });
    }, [channelClicks, channelSearch, searchResults, sortBy, sortDir]);

    const displayedChannels = showAllChannels ? filteredChannels : filteredChannels.slice(0, 20);

    const toggleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const SortIcon = ({ col }: { col: typeof sortBy }) => {
        if (sortBy !== col) return <ArrowDownUp size={12} className="opacity-30" />;
        return sortDir === 'desc' ? <ChevronDown size={12} className="text-blue-400" /> : <ChevronUp size={12} className="text-blue-400" />;
    };

    // Period label
    const periodLabel = daysFilter === 1 ? 'Son 24 Saat' : `Son ${daysFilter} Gün`;

    return (
        <div className="space-y-6 pb-10">
            {/* ─── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <Activity size={22} />
                        </div>
                        Site Analitiği
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 ml-14">Gerçek zamanlı site metrikleri ve kanal performansı</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadData(daysFilter)}
                        disabled={loading}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                        title="Yenile"
                    >
                        <RefreshCw size={16} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <select
                            value={daysFilter}
                            onChange={(e) => setDaysFilter(Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
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
            </div>

            {loading ? (
                <div className="flex justify-center flex-col items-center py-24 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-full border-4 border-gray-100" />
                        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm">Analitik veriler getiriliyor...</p>
                </div>
            ) : (
                <>
                    {/* ─── Summary Cards ────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Views Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-200/50">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                                        <Eye size={20} />
                                    </div>
                                    <ChangeIndicator current={totalViews} previous={summary.prevViews} />
                                </div>
                                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Sayfa Görüntüleme</p>
                                <h3 className="text-4xl font-black tracking-tight">{formatNumber(totalViews)}</h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-bold">Bugün: {formatNumber(totalDailyViews)}</span>
                                    <span className="text-xs text-blue-300">{periodLabel}</span>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 text-white/5"><Eye size={140} /></div>
                        </div>

                        {/* Visitors Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-800 rounded-2xl p-6 text-white shadow-xl shadow-purple-200/50">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                                        <MousePointer2 size={20} />
                                    </div>
                                    <ChangeIndicator current={totalVisitors} previous={summary.prevVisitors} />
                                </div>
                                <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1">Tekil Ziyaretçi</p>
                                <h3 className="text-4xl font-black tracking-tight">{formatNumber(totalVisitors)}</h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-bold">Bugün: {formatNumber(totalDailyVisitors)}</span>
                                    <span className="text-xs text-purple-300">{periodLabel}</span>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 text-white/5"><MousePointer2 size={140} /></div>
                        </div>

                        {/* Clicks Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 rounded-2xl p-6 text-white shadow-xl shadow-green-200/50">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
                                        <LinkIcon size={20} />
                                    </div>
                                    <ChangeIndicator current={totalPeriodClicks} previous={summary.prevPeriodClicks} />
                                </div>
                                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Kanal Tıklaması</p>
                                <h3 className="text-4xl font-black tracking-tight">{formatNumber(totalPeriodClicks)}</h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-bold">{periodLabel}</span>
                                    <span className="text-xs text-emerald-300">Önceki dönem: {formatNumber(summary.prevPeriodClicks)}</span>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 text-white/5"><LinkIcon size={140} /></div>
                        </div>
                    </div>

                    {/* ─── Daily Trend Chart ─────────────────────────────────────── */}
                    {dailyTrends.length > 1 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 md:p-6 border-b border-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                            <TrendingUp className="text-blue-500" size={20} />
                                            Günlük Trafik Trendi
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-0.5">{periodLabel} — Görüntüleme ve ziyaretçi sayıları</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Görüntüleme</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/20" /> Ziyaretçi</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 md:p-6">
                                <MiniBarChart data={chartData} maxVal={chartMaxVal} color="#3b82f6" height={160} />
                                {/* X-axis labels */}
                                <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                                    {chartData.length > 0 && <span>{chartData[0]?.label}</span>}
                                    {chartData.length > 7 && <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>}
                                    {chartData.length > 0 && <span>{chartData[chartData.length - 1]?.label}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── Tab Navigation ────────────────────────────────────────── */}
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
                        {[
                            { id: 'overview' as const, icon: BarChart, label: 'Genel Bakış' },
                            { id: 'channels' as const, icon: LinkIcon, label: 'Kanal Tıklamaları' },
                            { id: 'pages' as const, icon: FileText, label: 'Sayfalar' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ─── OVERVIEW TAB ───────────────────────────────────────────── */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Pages */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-50">
                                    <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <Globe className="text-blue-500" size={18} />
                                        En Çok Ziyaret Edilen Sayfalar
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{periodLabel} — İlk 15 sayfa</p>
                                </div>
                                <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {topPages.slice(0, 15).map((page, i) => {
                                        const maxPageViews = topPages[0]?.views || 1;
                                        const barW = Math.max(3, Math.round((page.views / maxPageViews) * 100));
                                        return (
                                            <div key={i} className="px-5 py-3 hover:bg-blue-50/30 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-300 w-5 shrink-0">{i + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{page.path === '/' ? 'Ana Sayfa' : page.path}</p>
                                                            <Link
                                                                href={page.path}
                                                                target="_blank"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-blue-500"
                                                            >
                                                                <ExternalLink size={12} />
                                                            </Link>
                                                        </div>
                                                        <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${barW}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-2">
                                                        <span className="text-sm font-black text-gray-800">{page.views.toLocaleString('tr-TR')}</span>
                                                        {page.dailyViews > 0 && (
                                                            <span className="block text-[10px] font-bold text-emerald-500">+{page.dailyViews} bugün</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {topPages.length === 0 && (
                                        <div className="text-center py-12 text-gray-300">
                                            <Globe className="mx-auto mb-2 opacity-30" size={28} />
                                            <p className="text-sm">Bu dönemde veri yok.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Views */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-50">
                                    <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <FolderOpen className="text-violet-500" size={18} />
                                        Kategori Performansı
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{periodLabel} — Sayfa görüntülenmeleri</p>
                                </div>
                                <div className="p-5 space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {categoryViews.map((cat: any, i: number) => {
                                        const maxViews = (categoryViews[0] as any)?.views || 1;
                                        const pct = Math.max(3, Math.round((cat.views / maxViews) * 100));
                                        const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-indigo-600', 'from-cyan-500 to-teal-600', 'from-emerald-500 to-green-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600'];
                                        const colorClass = colors[i % colors.length];
                                        return (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0`}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate capitalize">{cat.name?.replace(/-/g, ' ')}</p>
                                                    <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-black shrink-0">
                                                    {cat.views.toLocaleString('tr-TR')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {categoryViews.length === 0 && (
                                        <div className="text-center py-12 text-gray-300">
                                            <FolderOpen className="mx-auto mb-2 opacity-30" size={28} />
                                            <p className="text-sm">Bu dönemde kategori verisi yok.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── CHANNELS TAB ───────────────────────────────────────────── */}
                    {activeTab === 'channels' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div>
                                    <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                                        <LinkIcon className="text-blue-500" size={18} />
                                        Kanal Tıklama Detayları
                                    </h2>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        {searchLoading
                                            ? '🔍 Veritabanında aranıyor...'
                                            : channelSearch.trim()
                                                ? `${filteredChannels.length} sonuç: "${channelSearch}"`
                                                : `${filteredChannels.length} kanal — ${periodLabel}`
                                        }
                                    </p>
                                </div>
                                <div className="relative w-full sm:w-60">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="Kanal adı ara..."
                                        value={channelSearch}
                                        onChange={(e) => setChannelSearch(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50/50 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Sort Header */}
                            <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-2.5 bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Kanal</div>
                                <button onClick={() => toggleSort('period_clicks')} className="col-span-2 flex items-center gap-1 hover:text-blue-500 transition-colors justify-end">
                                    Dönem <SortIcon col="period_clicks" />
                                </button>
                                <button onClick={() => toggleSort('daily_clicks')} className="col-span-2 flex items-center gap-1 hover:text-blue-500 transition-colors justify-end">
                                    Bugün <SortIcon col="daily_clicks" />
                                </button>
                                <button onClick={() => toggleSort('total_clicks')} className="col-span-2 flex items-center gap-1 hover:text-blue-500 transition-colors justify-end">
                                    Toplam <SortIcon col="total_clicks" />
                                </button>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {displayedChannels.length === 0 ? (
                                    <div className="text-center py-16 text-gray-300">
                                        <LinkIcon className="mx-auto mb-2 opacity-20" size={28} />
                                        <p className="text-sm font-medium">{channelSearch ? `"${channelSearch}" için sonuç bulunamadı.` : 'Bu dönemde tıklama verisi yok.'}</p>
                                    </div>
                                ) : (
                                    displayedChannels.map((stat, i) => {
                                        const maxClicks = filteredChannels[0]?.period_clicks || 1;
                                        const barWidth = Math.max(2, Math.round((stat.period_clicks / maxClicks) * 100));

                                        return (
                                            <div key={stat.id || i} className="px-4 md:px-6 py-3 hover:bg-blue-50/20 transition-colors group">
                                                {/* Mobile */}
                                                <div className="md:hidden flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-300 w-5 shrink-0">{i + 1}</span>
                                                    {stat.channel?.image ? (
                                                        <img src={stat.channel.image} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                                                            {stat.channel?.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 text-sm truncate">{stat.channel?.name || 'Bilinmeyen'}</p>
                                                        <div className="flex gap-3 text-[10px] text-gray-400 mt-0.5 font-bold">
                                                            <span className="text-blue-600">{stat.period_clicks} dönem</span>
                                                            <span>{stat.daily_clicks} bugün</span>
                                                            <span>{stat.total_clicks} toplam</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop */}
                                                <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                                                    <span className="col-span-1 text-xs font-black text-gray-300">{i + 1}</span>
                                                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                                                        {stat.channel?.image ? (
                                                            <img src={stat.channel.image} className="w-8 h-8 rounded-lg object-cover border border-gray-100 shrink-0" alt="" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                                                                {stat.channel?.name?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-gray-800 text-sm truncate">{stat.channel?.name || 'Bilinmeyen'}</p>
                                                            <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                                <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }} />
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/${stat.channel?.slug || ''}`}
                                                            target="_blank"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-blue-500 shrink-0"
                                                        >
                                                            <ExternalLink size={13} />
                                                        </Link>
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-black">
                                                            {stat.period_clicks.toLocaleString('tr-TR')}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 text-right text-sm">
                                                        {stat.daily_clicks > 0 ? (
                                                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[11px] font-black">+{stat.daily_clicks}</span>
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-right text-sm text-gray-500 font-bold tabular-nums">
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
                                <div className="p-4 border-t border-gray-50 text-center">
                                    <button
                                        onClick={() => setShowAllChannels(v => !v)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto transition"
                                    >
                                        {showAllChannels ? (
                                            <><ChevronUp size={16} /> Daha az göster</>
                                        ) : (
                                            <><ChevronDown size={16} /> Tümünü göster ({filteredChannels.length})</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── PAGES TAB ──────────────────────────────────────────────── */}
                    {activeTab === 'pages' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 md:p-6 border-b border-gray-50">
                                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                                    <FileText className="text-indigo-500" size={18} />
                                    Tüm Sayfa Görüntülenmeleri
                                </h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">{pageViews.length} sayfa — {periodLabel}</p>
                            </div>

                            {/* Header */}
                            <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-2.5 bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Sayfa</div>
                                <div className="col-span-2 text-right">Görüntüleme</div>
                                <div className="col-span-2 text-right">Ziyaretçi</div>
                                <div className="col-span-2 text-right">Bugün</div>
                            </div>

                            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {pageViews.slice(0, 100).map((page: any, i: number) => {
                                    const maxPV = (pageViews[0] as any)?.total_views || 1;
                                    const barW = Math.max(2, Math.round((page.total_views / maxPV) * 100));
                                    return (
                                        <div key={i} className="px-4 md:px-6 py-3 hover:bg-indigo-50/20 transition-colors group">
                                            {/* Mobile */}
                                            <div className="md:hidden flex items-center gap-3">
                                                <span className="text-[10px] font-black text-gray-300 w-5">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{page.path === '/' ? 'Ana Sayfa' : page.path}</p>
                                                    <div className="flex gap-3 text-[10px] text-gray-400 mt-0.5 font-bold">
                                                        <span className="text-indigo-600">{page.total_views} görüntüleme</span>
                                                        <span>{page.total_visitors} ziyaretçi</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Desktop */}
                                            <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                                                <span className="col-span-1 text-xs font-black text-gray-300">{i + 1}</span>
                                                <div className="col-span-5 flex items-center gap-2 min-w-0">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-gray-800 text-sm truncate">{page.path === '/' ? 'Ana Sayfa' : page.path}</p>
                                                        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${barW}%` }} />
                                                        </div>
                                                    </div>
                                                    <Link href={page.path} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-indigo-500 shrink-0">
                                                        <ExternalLink size={12} />
                                                    </Link>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className="text-sm font-black text-gray-800">{page.total_views.toLocaleString('tr-TR')}</span>
                                                </div>
                                                <div className="col-span-2 text-right text-sm text-gray-500 font-bold tabular-nums">
                                                    {page.total_visitors.toLocaleString('tr-TR')}
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    {page.daily_views > 0 ? (
                                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[11px] font-black">+{page.daily_views}</span>
                                                    ) : (
                                                        <span className="text-gray-300 text-sm">—</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #d1d5db; }
            `}</style>
        </div>
    );
}
