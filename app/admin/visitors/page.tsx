'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getVisitorStats } from '@/app/actions/visitorProfile';
import { Users, Monitor, Smartphone, Tablet, Globe, TrendingUp, Clock, BarChart3, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VisitorsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAndLoad();
    }, []);

    const checkAndLoad = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            window.location.href = '/admin';
            return;
        }
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        if (profile?.role !== 'admin') {
            window.location.href = '/admin';
            return;
        }

        const data = await getVisitorStats();
        setStats(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">Veri yüklenemedi.</p>
            </div>
        );
    }

    const deviceIcons: Record<string, any> = {
        desktop: <Monitor size={16} />,
        mobile: <Smartphone size={16} />,
        tablet: <Tablet size={16} />,
        unknown: <Globe size={16} />
    };

    const totalDevices = Object.values(stats.deviceDistribution as Record<string, number>).reduce((a: number, b: number) => a + b, 0);

    const formatSeconds = (s: number) => {
        if (s < 60) return `${s}sn`;
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}dk ${sec}sn`;
    };

    const returningRate = stats.totalVisitors > 0
        ? Math.round((stats.returningVisitors / stats.totalVisitors) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/analytics" className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <Users className="text-blue-600" /> Ziyaretçi Profilleri
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Cookie tabanlı ziyaretçi takibi ve davranış analizi</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
                            <Users size={14} /> TOPLAM ZİYARETÇİ
                        </div>
                        <div className="text-2xl font-black text-gray-900">{stats.totalVisitors?.toLocaleString('tr-TR')}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
                            <Eye size={14} /> BUGÜN
                        </div>
                        <div className="text-2xl font-black text-blue-600">{stats.todayVisitors?.toLocaleString('tr-TR')}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
                            <TrendingUp size={14} /> GERİ DÖNEN
                        </div>
                        <div className="text-2xl font-black text-green-600">{returningRate}%</div>
                        <div className="text-xs text-gray-400 mt-1">{stats.returningVisitors?.toLocaleString('tr-TR')} kişi</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
                            <Clock size={14} /> ORT. OTURUM
                        </div>
                        <div className="text-2xl font-black text-purple-600">{formatSeconds(stats.avgSessionSeconds)}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
                            <BarChart3 size={14} /> İLGİ ALANI
                        </div>
                        <div className="text-2xl font-black text-orange-600">{stats.topInterests?.length || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">farklı kategori</div>
                    </div>
                </div>

                {/* Helper for bar distribution rendering */}
                {(() => {
                    const DistBar = ({ items, gradient, emptyText }: { items: [string, number][]; gradient: string; emptyText: string }) => {
                        const total = items.reduce((a, b) => a + b[1], 0);
                        if (items.length === 0) return <p className="text-sm text-gray-400 text-center py-4">{emptyText}</p>;
                        return (
                            <div className="space-y-3">
                                {items.map(([name, count]) => {
                                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                    return (
                                        <div key={name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700 truncate">{name}</span>
                                                <span className="text-xs font-bold text-gray-600">{pct}% <span className="text-gray-400 font-normal">({count})</span></span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    };

                    const browserItems = Object.entries(stats.browserDistribution || {}).sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][];
                    const osItems = Object.entries(stats.osDistribution || {}).sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][];
                    const deviceItems = Object.entries(stats.deviceDistribution || {}).sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][];

                    return (
                        <>
                            {/* ROW 1: Interests + Device + Browser */}
                            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                                {/* Top Interests */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-orange-500" /> İlgi Alanları
                                    </h2>
                                    <DistBar
                                        items={stats.topInterests.map((i: any) => [i.name, i.count])}
                                        gradient="from-orange-400 to-orange-600"
                                        emptyText="Henüz veri yok"
                                    />
                                </div>

                                {/* Device Distribution */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Monitor size={18} className="text-blue-500" /> Cihaz Dağılımı
                                    </h2>
                                    <DistBar
                                        items={deviceItems.map(([k, v]) => [k === 'mobile' ? 'Mobil' : k === 'desktop' ? 'Masaüstü' : k === 'tablet' ? 'Tablet' : k, v])}
                                        gradient="from-blue-400 to-blue-600"
                                        emptyText="Henüz veri yok"
                                    />
                                </div>

                                {/* Browser Distribution */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Globe size={18} className="text-indigo-500" /> Tarayıcılar
                                    </h2>
                                    <DistBar
                                        items={browserItems}
                                        gradient="from-indigo-400 to-indigo-600"
                                        emptyText="Henüz veri yok"
                                    />
                                </div>
                            </div>

                            {/* ROW 2: OS + Cities + Screens */}
                            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                                {/* OS Distribution */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Monitor size={18} className="text-teal-500" /> İşletim Sistemi
                                    </h2>
                                    <DistBar
                                        items={osItems}
                                        gradient="from-teal-400 to-teal-600"
                                        emptyText="Henüz veri yok"
                                    />
                                </div>

                                {/* Top Cities */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Globe size={18} className="text-pink-500" /> Şehirler
                                    </h2>
                                    <DistBar
                                        items={(stats.topCities || []).map((c: any) => [c.name, c.count])}
                                        gradient="from-pink-400 to-pink-600"
                                        emptyText="Henüz şehir verisi yok"
                                    />
                                </div>

                                {/* Screen Resolutions */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BarChart3 size={18} className="text-amber-500" /> Ekran Çözünürlükleri
                                    </h2>
                                    <DistBar
                                        items={(stats.topScreens || []).map((s: any) => [s.name, s.count])}
                                        gradient="from-amber-400 to-amber-600"
                                        emptyText="Henüz veri yok"
                                    />
                                </div>
                            </div>

                            {/* ROW 3: Recent Visitors (full width) */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Eye size={18} className="text-green-500" /> Son Ziyaretçiler
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 font-medium">
                                                <th className="pb-3 pr-4">ID</th>
                                                <th className="pb-3 pr-4">Ziyaret</th>
                                                <th className="pb-3 pr-4">Sayfa</th>
                                                <th className="pb-3 pr-4">Oturum</th>
                                                <th className="pb-3 pr-4">Cihaz</th>
                                                <th className="pb-3 pr-4">Tarayıcı</th>
                                                <th className="pb-3 pr-4">OS</th>
                                                <th className="pb-3 pr-4">Şehir</th>
                                                <th className="pb-3 pr-4">IP</th>
                                                <th className="pb-3">İlgi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {stats.recentVisitors.map((v: any) => (
                                                <tr key={v.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{v.visitor_id?.substring(0, 14)}..</td>
                                                    <td className="py-2.5 pr-4">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{v.visit_count}x</span>
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-gray-700">{v.total_pages_viewed}</td>
                                                    <td className="py-2.5 pr-4 text-gray-600">{formatSeconds(v.avg_session_seconds || 0)}</td>
                                                    <td className="py-2.5 pr-4">
                                                        {v.device_type === 'mobile' ? <Smartphone size={14} className="text-green-500" /> :
                                                            v.device_type === 'tablet' ? <Tablet size={14} className="text-purple-500" /> :
                                                                <Monitor size={14} className="text-blue-500" />}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-xs text-gray-600">{v.browser || '-'}</td>
                                                    <td className="py-2.5 pr-4 text-xs text-gray-600">{v.os || '-'}</td>
                                                    <td className="py-2.5 pr-4 text-xs text-gray-600">{v.city || v.country || '-'}</td>
                                                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{v.ip_address ? v.ip_address.substring(0, 15) : '-'}</td>
                                                    <td className="py-2.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(v.interests || []).slice(0, 3).map((int: string) => (
                                                                <span key={int} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">{int}</span>
                                                            ))}
                                                            {(v.interests || []).length > 3 && <span className="text-xs text-gray-400">+{v.interests.length - 3}</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {stats.recentVisitors.length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-8">Henüz ziyaretçi verisi yok</p>
                                    )}
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
}

