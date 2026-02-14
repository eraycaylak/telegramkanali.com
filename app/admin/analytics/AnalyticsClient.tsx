'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, ArrowUpRight, MousePointer2 } from 'lucide-react';
import { getAdminClient } from '@/lib/supabaseAdmin';

export default function AnalyticsClient() {
    const [pageViews, setPageViews] = useState<any[]>([]);
    const [channelClicks, setChannelClicks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkPermission();
        loadData();
    }, []);

    const checkPermission = async () => {
        const storedUserId = localStorage.getItem('userId');
        const isAdmin = localStorage.getItem('isAdmin');

        if (isAdmin === 'true' && !storedUserId) return;

        if (storedUserId) {
            const { data: user } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', storedUserId)
                .single();

            if (user) {
                if (user.role === 'admin') return;
                if (user.role === 'editor' && user.permissions?.view_analytics) return;
            }
        }

        alert('Bu sayfaya erişim yetkiniz yok.');
        window.location.href = '/admin/dashboard';
    };

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
        <div className="space-y-6 md:space-y-8 pb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                <BarChart className="text-blue-600" />
                Site Analitiği
            </h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Toplam Görüntülenme</p>
                            <h3 className="text-3xl font-bold">{totalViews}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <MousePointer2 size={24} />
                        </div>
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Toplam Ziyaretçi (Tahmini)</p>
                            <h3 className="text-3xl font-bold">{totalVisitors}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-4 md:mt-8">
                {/* Popular Pages */}
                <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-900">Popüler Sayfalar</h2>
                    <div className="space-y-3">
                        {pageViews.slice(0, 5).map((page, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-gray-50 rounded-xl gap-2">
                                <span className="font-mono text-xs text-gray-600 break-all md:max-w-[200px]">{page.path}</span>
                                <div className="flex gap-4 text-xs font-bold">
                                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">{page.total_views} görüntülenme</span>
                                    <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">{page.total_visitors} ziyaretçi</span>
                                </div>
                            </div>
                        ))}
                        {pageViews.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Veri yok.</p>}
                    </div>
                </div>

                {/* Popular Channels */}
                <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-900">En Çok Tıklanan Kanallar</h2>
                    <div className="space-y-3">
                        {channelClicks.slice(0, 10).map((stat, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                                <span className="text-lg font-black text-gray-200 w-8">#{i + 1}</span>
                                {stat.channel && (
                                    <img src={stat.channel.image || '/images/logo.png'} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-sm md:text-base">{stat.channel?.name || 'Bilinmeyen Kanal'}</h4>
                                </div>
                                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black uppercase">
                                    {stat.total_clicks} Tık
                                </div>
                            </div>
                        ))}
                        {channelClicks.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Henüz tıklama verisi yok.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
