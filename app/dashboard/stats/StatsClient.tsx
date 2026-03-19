'use client';

import { useState, useEffect } from 'react';
import { getChannelStats } from '@/app/actions/bot';
import {
    BarChart3, Users, UserPlus, UserMinus,
    TrendingUp, TrendingDown, ArrowLeft, Activity, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StatsClient({
    channels,
    channelId,
}: {
    channels: any[];
    channelId: string | null;
}) {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const selectedChannel = channels.find(c => c.id === channelId);

    useEffect(() => {
        if (channelId) {
            setLoading(true);
            getChannelStats(channelId).then(data => {
                setStats(data);
                setLoading(false);
            });
        }
    }, [channelId]);

    if (!channelId || channels.length === 0) {
        return (
            <div className="text-center py-20">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz kanalınız yok</h2>
                <p className="text-gray-500 mb-6">İstatistik görmek için önce bir kanal ekleyin.</p>
                <Link href="/dashboard/kanal-ekle" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                    Kanal Ekle
                </Link>
            </div>
        );
    }

    if (!selectedChannel) return null;

    const todayStats = stats?.dailyStats?.find(
        (d: any) => d.date === new Date().toISOString().split('T')[0]
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/channels" className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                    <ArrowLeft size={20} />
                </Link>

                {/* Kanal Seçici */}
                {channels.length > 1 && (
                    <select
                        value={channelId}
                        onChange={e => router.push(`/dashboard/stats?channel=${e.target.value}`)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {channels.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                )}

                <div className="flex items-center gap-3 flex-1">
                    {selectedChannel.image ? (
                        <img src={selectedChannel.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {selectedChannel.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedChannel.name}</h2>
                        <p className="text-sm">
                            {selectedChannel.bot_enabled
                                ? <span className="text-green-600 font-bold">● Bot Aktif</span>
                                : <span className="text-orange-500 font-bold">● Bot Bağlı Değil</span>
                            }
                        </p>
                    </div>
                </div>
                <Link href={`/dashboard/bot?channel=${channelId}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                    Bot Ayarları
                </Link>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-32 bg-gray-100 rounded-2xl"></div>
                    <div className="h-64 bg-gray-100 rounded-2xl"></div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg"><Users size={16} className="text-blue-600" /></div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Toplam Üye</span>
                            </div>
                            <div className="text-2xl font-extrabold text-gray-900">{(selectedChannel.member_count || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-green-50 rounded-lg"><UserPlus size={16} className="text-green-600" /></div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Bugün Giren</span>
                            </div>
                            <div className="text-2xl font-extrabold text-green-600">{todayStats?.joins || 0}</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-red-50 rounded-lg"><UserMinus size={16} className="text-red-600" /></div>
                                <span className="text-xs font-bold text-gray-400 uppercase">Bugün Çıkan</span>
                            </div>
                            <div className="text-2xl font-extrabold text-red-600">{todayStats?.leaves || 0}</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    {(stats?.netGrowth || 0) >= 0
                                        ? <TrendingUp size={16} className="text-purple-600" />
                                        : <TrendingDown size={16} className="text-purple-600" />}
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase">30 Gün Net</span>
                            </div>
                            <div className={`text-2xl font-extrabold ${(stats?.netGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(stats?.netGrowth || 0) >= 0 ? '+' : ''}{stats?.netGrowth || 0}
                            </div>
                        </div>
                    </div>

                    {/* Daily Stats */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-blue-600" /> Son 30 Gün
                        </h3>
                        {stats?.dailyStats?.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase mb-3 px-2">
                                    <span className="w-24">Tarih</span>
                                    <span className="flex-1">Giriş / Çıkış</span>
                                    <span className="w-16 text-right">Giren</span>
                                    <span className="w-16 text-right">Çıkan</span>
                                    <span className="w-16 text-right">Net</span>
                                </div>
                                {stats.dailyStats.map((day: any) => {
                                    const maxVal = Math.max(...stats.dailyStats.map((d: any) => Math.max(d.joins || 0, d.leaves || 0)), 1);
                                    const net = (day.joins || 0) - (day.leaves || 0);
                                    return (
                                        <div key={day.date} className="flex items-center gap-4 py-2 px-2 hover:bg-gray-50 rounded-lg transition">
                                            <span className="w-24 text-xs text-gray-500 font-medium">
                                                {new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <div className="flex-1 flex gap-1 items-center h-6">
                                                <div className="bg-green-400 rounded-sm h-4" style={{ width: `${((day.joins || 0) / maxVal) * 100}%`, minWidth: day.joins ? '4px' : '0' }}></div>
                                                <div className="bg-red-400 rounded-sm h-4" style={{ width: `${((day.leaves || 0) / maxVal) * 100}%`, minWidth: day.leaves ? '4px' : '0' }}></div>
                                            </div>
                                            <span className="w-16 text-right text-sm font-bold text-green-600">+{day.joins || 0}</span>
                                            <span className="w-16 text-right text-sm font-bold text-red-600">-{day.leaves || 0}</span>
                                            <span className={`w-16 text-right text-sm font-extrabold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {net >= 0 ? '+' : ''}{net}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <BarChart3 size={40} className="mx-auto mb-3" />
                                <p className="font-bold">Henüz veri yok</p>
                                <p className="text-sm mt-1">Bot aktif olduktan sonra veriler burada gösterilecek.</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Events */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" /> Son Üye Hareketleri
                        </h3>
                        {stats?.recentEvents?.length > 0 ? (
                            <div className="space-y-2">
                                {stats.recentEvents.map((event: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-xl transition">
                                        <div className={`p-1.5 rounded-lg ${event.event_type === 'join' ? 'bg-green-50' : 'bg-red-50'}`}>
                                            {event.event_type === 'join'
                                                ? <UserPlus size={14} className="text-green-600" />
                                                : <UserMinus size={14} className="text-red-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {event.username ? `@${event.username}` : event.first_name || 'Bilinmeyen'}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${event.event_type === 'join' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {event.event_type === 'join' ? 'Katıldı' : 'Ayrıldı'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(event.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <Users size={40} className="mx-auto mb-3" />
                                <p className="font-bold">Henüz hareket yok</p>
                                <p className="text-sm mt-1">Kanalınıza üye giriş/çıkış olduğunda burada görünecek.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
