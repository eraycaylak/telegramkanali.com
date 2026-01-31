'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { getAdminClient } from '@/lib/supabaseAdmin';

export default function AnalyticsPage() {
    const [pageViews, setPageViews] = useState<any[]>([]);
    const [channelClicks, setChannelClicks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        // İstatistikleri doğrudan view/table'dan çek
        // Not: Gerçek admin client kullanmamız lazım RLS bypass için
        // Ancak client side'da olduğumuz için bir server action kullanmak daha doğru olur.
        // Şimdilik client-side supabase ile deneyelim (RLS izin veriyorsa).
        // Fakat RLS okumaya izin vermiyor olabilir. O yüzden Server Action yazmak lazım.
        // Hızlı çözüm için burada statik/mock data yerine server action çağırmalıyız.

        // Hızlıca server action'ları çağıran bir yapı kuralım:
        import('@/app/actions/analyticsAdmin').then(async (mod) => {
            const stats = await mod.getAnalyticsSummary();
            if (stats) {
                setPageViews(stats.pageViews || []);
                setChannelClicks(stats.channelClicks || []);
            }
            setLoading(false);
        });
    }

    if (loading) return <div className="p-10 text-center text-gray-500">İstatistikler yükleniyor...</div>;

    const totalViews = pageViews.reduce((acc, curr) => acc + curr.total_views, 0);
    const totalVisitors = pageViews.reduce((acc, curr) => acc + curr.total_visitors, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart className="text-blue-600" />
                Site Analitiği
            </h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Toplam Görüntülenme</p>
                            <h3 className="text-3xl font-bold">{totalViews}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Toplam Ziyaretçi (Tahmini)</p>
                            <h3 className="text-3xl font-bold">{totalVisitors}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Popular Pages */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Popüler Sayfalar (Son 30 Gün)</h2>
                    <div className="space-y-4">
                        {pageViews.slice(0, 5).map((page, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-mono text-sm text-gray-600 truncate max-w-[200px]">{page.path}</span>
                                <div className="flex gap-4 text-sm font-semibold">
                                    <span className="text-blue-600">{page.total_views} view</span>
                                    <span className="text-purple-600">{page.total_visitors} visitor</span>
                                </div>
                            </div>
                        ))}
                        {pageViews.length === 0 && <p className="text-gray-400 text-sm">Veri yok.</p>}
                    </div>
                </div>

                {/* Popular Channels */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-lg font-bold mb-4">En Çok Tıklanan Kanallar</h2>
                    <div className="space-y-4">
                        {channelClicks.slice(0, 10).map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                                <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                                {stat.channel && (
                                    <img src={stat.channel.image || '/images/logo.png'} className="w-8 h-8 rounded-full object-cover" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{stat.channel?.name || 'Bilinmeyen Kanal'}</h4>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {stat.total_clicks} Tık
                                </div>
                            </div>
                        ))}
                        {channelClicks.length === 0 && <p className="text-gray-400 text-sm">Henüz tıklama verisi yok.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
