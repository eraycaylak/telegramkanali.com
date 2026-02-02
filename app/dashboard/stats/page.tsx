'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    TrendingUp,
    TrendingDown,
    BarChart3,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [channels, setChannels] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        if (selectedId) fetchStats();
    }, [selectedId]);

    async function fetchChannels() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase.from('channels').select('*').eq('owner_id', user.id);
            setChannels(data || []);
            if (data && data.length > 0) setSelectedId(data[0].id);
        } catch (error) {
            console.error('Error fetching channels for stats:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchStats() {
        const { data } = await supabase
            .from('bot_analytics')
            .select('*')
            .eq('channel_id', selectedId)
            .order('date', { ascending: false })
            .limit(30);

        setStats(data || []);
    }

    const selectedChannel = channels.find(c => c.id === selectedId);

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="h-10 bg-gray-100 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
        </div>
    </div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">İstatistikler</h2>
                <select
                    className="bg-white border text-sm font-bold rounded-xl px-4 py-2 outline-none"
                    value={selectedId || ''}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {!selectedChannel?.bot_enabled ? (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <BarChart3 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analizler Devre Dışı</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Bu kanal için bot analizi henüz aktif değil. Botu ekleyerek giren/çıkan üye takibini başlatabilirsiniz.
                    </p>
                    <Link href={`/dashboard/bot?channel=${selectedId}`} className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        Botu Kur
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">TOPLAM ÜYE</span>
                            <div className="text-3xl font-extrabold text-gray-900">{(selectedChannel.member_count || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-green-50 shadow-sm shadow-green-100/20">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block text-green-600">SON 7 GÜN GİREN</span>
                            <div className="text-3xl font-extrabold text-green-700">+{stats.slice(0, 7).reduce((a, b) => a + b.joins, 0)}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm shadow-red-100/20">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block text-red-600">SON 7 GÜN ÇIKAN</span>
                            <div className="text-3xl font-extrabold text-red-700">-{stats.slice(0, 7).reduce((a, b) => a + b.leaves, 0)}</div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-8">Günlük Üye Trafiği</h3>
                        {stats.length === 0 ? (
                            <div className="py-20 text-center text-gray-400">Veri toplanıyor... (Yarın ilk verileri görebileceksiniz)</div>
                        ) : (
                            <div className="space-y-4">
                                {stats.map(s => (
                                    <div key={s.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="font-bold text-gray-700">{new Date(s.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' })}</div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-2 text-green-600 font-bold">
                                                <TrendingUp size={16} /> +{s.joins}
                                            </div>
                                            <div className="flex items-center gap-2 text-red-600 font-bold">
                                                <TrendingDown size={16} /> -{s.leaves}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
