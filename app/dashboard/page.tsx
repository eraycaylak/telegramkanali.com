'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    Tv,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    Plus
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        channels: 0,
        balance: 0,
        totalMembers: 0,
        activeAds: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch profile (balance)
                const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();

                // Fetch channel count
                const { count: channelCount } = await supabase.from('channels').select('*', { count: 'exact', head: true }).eq('owner_id', user.id);

                // Total members sum
                const { data: channels } = await supabase.from('channels').select('member_count').eq('owner_id', user.id);
                const totalMembers = channels?.reduce((acc, curr) => acc + (curr.member_count || 0), 0) || 0;

                setStats({
                    channels: channelCount || 0,
                    balance: profile?.balance || 0,
                    totalMembers: totalMembers,
                    activeAds: 0
                });
            } catch (error) {
                console.error('Dashboard stats fetch error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const cards = [
        { name: 'Kanallarım', value: stats.channels, icon: Tv, shadow: 'shadow-blue-100', text: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Mevcut Bakiye', value: `$${stats.balance}`, icon: CreditCard, shadow: 'shadow-green-100', text: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Toplam Üye', value: stats.totalMembers.toLocaleString(), icon: Users, shadow: 'shadow-purple-100', text: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'Aktif Reklamlar', value: stats.activeAds, icon: TrendingUp, shadow: 'shadow-orange-100', text: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>;
    }

    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hoş Geldiniz! 👋</h2>
                    <p className="text-gray-500">Kanallarınızın performansını ve reklam bütçenizi buradan yönetebilirsiniz.</p>
                </div>
                <Link href="/dashboard/billing" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 w-fit">
                    <CreditCard size={18} /> Bakiye Yükle
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm ${card.shadow} transition-hover hover:-translate-y-1 duration-300`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.text}`}>
                                <card.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.name}</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Empty States / Quick Actions */}
            {stats.channels === 0 && (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Tv size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz kanalınız yok</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Sisteme kanalınızı ekleyerek analizlerini takip edebilir ve reklam verebilirsiniz.
                    </p>
                    <Link href="/dashboard/kanal-ekle" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 inline-block">
                        Kanalımı Ekle
                    </Link>
                </div>
            )}

            {/* Placeholder for Analytics Chart */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-gray-900">Büyüme Analizi</h3>
                    <select className="bg-gray-50 border-none text-sm font-semibold rounded-lg px-4 py-2 outline-none">
                        <option>Son 7 Gün</option>
                        <option>Son 30 Gün</option>
                    </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[40, 60, 45, 90, 65, 80, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer group relative" style={{ height: `${h}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                +{h * 12} Üye
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-between text-xs font-bold text-gray-400 px-4">
                    <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
                </div>
            </div>
        </div>
    );
}
