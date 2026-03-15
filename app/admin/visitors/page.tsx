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

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Top Interests */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-orange-500" /> İlgi Alanları (Top 15)
                        </h2>
                        <div className="space-y-3">
                            {stats.topInterests.map((interest: any, i: number) => {
                                const maxCount = stats.topInterests[0]?.count || 1;
                                const pct = Math.round((interest.count / maxCount) * 100);
                                return (
                                    <div key={interest.name} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400 w-5 text-right font-mono">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-800 truncate">{interest.name}</span>
                                                <span className="text-xs text-gray-500 font-mono ml-2">{interest.count}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.topInterests.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">Henüz ilgi alanı verisi yok</p>
                            )}
                        </div>
                    </div>

                    {/* Device Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Monitor size={18} className="text-blue-500" /> Cihaz Dağılımı
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(stats.deviceDistribution as Record<string, number>)
                                .sort((a, b) => b[1] - a[1])
                                .map(([device, count]) => {
                                    const pct = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;
                                    const colors: Record<string, string> = {
                                        mobile: 'from-green-400 to-green-600',
                                        desktop: 'from-blue-400 to-blue-600',
                                        tablet: 'from-purple-400 to-purple-600',
                                        unknown: 'from-gray-400 to-gray-600'
                                    };
                                    return (
                                        <div key={device}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    {deviceIcons[device] || <Globe size={16} />}
                                                    {device === 'mobile' ? 'Mobil' : device === 'desktop' ? 'Masaüstü' : device === 'tablet' ? 'Tablet' : 'Bilinmiyor'}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{pct}%</span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors[device] || colors.unknown} rounded-full transition-all`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{count.toLocaleString('tr-TR')} ziyaretçi</p>
                                        </div>
                                    );
                                })}
                            {Object.keys(stats.deviceDistribution).length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">Henüz cihaz verisi yok</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Visitors */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye size={18} className="text-green-500" /> Son Ziyaretçiler
                        </h2>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {stats.recentVisitors.map((v: any) => (
                                <div key={v.id} className="border border-gray-50 rounded-xl p-3 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {v.device_type === 'mobile' ? <Smartphone size={12} className="text-green-500" /> :
                                                v.device_type === 'tablet' ? <Tablet size={12} className="text-purple-500" /> :
                                                    <Monitor size={12} className="text-blue-500" />}
                                            <span className="text-xs font-mono text-gray-500">{v.visitor_id?.substring(0, 12)}...</span>
                                        </div>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                            {v.visit_count}x
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>{v.country || '?'}</span>
                                        <span>•</span>
                                        <span>{v.total_pages_viewed} sayfa</span>
                                        <span>•</span>
                                        <span>{formatSeconds(v.avg_session_seconds || 0)}</span>
                                    </div>
                                    {v.interests && v.interests.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {v.interests.slice(0, 4).map((int: string) => (
                                                <span key={int} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                                                    {int}
                                                </span>
                                            ))}
                                            {v.interests.length > 4 && (
                                                <span className="text-xs text-gray-400">+{v.interests.length - 4}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {stats.recentVisitors.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">Henüz ziyaretçi verisi yok</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
