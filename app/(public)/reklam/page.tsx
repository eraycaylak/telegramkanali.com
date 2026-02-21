'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    MousePointerClick,
    MonitorSmartphone,
    Star,
    Award,
    Zap,
    CheckCircle2,
    MessageCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Map icon names to components
const ICONS: any = {
    MonitorSmartphone,
    Zap,
    Award,
    Star,
    MousePointerClick
};

interface AdPackage {
    id: string;
    title: string;
    description: string;
    price: number;
    duration_text: string;
    features: string[];
    icon: string;
    badge: string | null;
}

export default function ReklamPage() {
    const [packages, setPackages] = useState<AdPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            const { data } = await supabase
                .from('ad_packages')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (data) setPackages(data);
            setLoading(false);
        };
        fetchAds();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="bg-[#111] text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-4 py-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in-up">
                        <TrendingUp size={16} />
                        <span>Aylık 40.000+ Ziyaretçi Trafiği</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Kanalınızı <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Milyonlara</span> Duyurun
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Telegram kanali Türkiye'nin en büyük kanal dizini. Hedef kitlenize doğrudan ulaşın, abone sayınızı ve etkileşiminizi katlayın.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 text-left max-w-3xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">40K+</div>
                            <div className="text-sm text-gray-400 font-medium">Aylık Ziyaretçi</div>
                        </div>
                        <div className="w-px bg-white/10 hidden sm:block"></div>
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-1">%65</div>
                            <div className="text-sm text-gray-400 font-medium">Hemen Çıkma Oranı</div>
                        </div>
                        <div className="w-px bg-white/10 hidden sm:block"></div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-400 mb-1">2.5dk</div>
                            <div className="text-sm text-gray-400 font-medium">Ortalama Oturum</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="container mx-auto px-4 -mt-10 relative z-20">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Paketler yükleniyor...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => {
                            const Icon = ICONS[pkg.icon] || MonitorSmartphone;
                            // Special styling for "Kanalı Öne Çıkarma" or similar if needed, 
                            // but generic card works for most. 
                            // We can use badge to highlight specific ones.

                            return (
                                <div key={pkg.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group flex flex-col">
                                    {pkg.badge && (
                                        <div className={`absolute top-0 right-0 ${pkg.badge === 'İNDİRİM' ? 'bg-red-500' : 'bg-blue-600'} text-white text-xs font-bold px-3 py-1 rounded-bl-xl origin-center`}>
                                            {pkg.badge}
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition ${pkg.icon === 'Star' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 h-10 line-clamp-2">{pkg.description}</p>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                                        <span className="font-bold text-gray-700">{pkg.duration_text}</span>
                                        <span className="font-black text-xl text-blue-600">{pkg.price === 0 ? 'OY İLE' : `${pkg.price} TL`}</span>
                                    </div>

                                    <ul className="space-y-3 mb-8 text-sm text-gray-600 flex-1">
                                        {pkg.features?.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <a href="https://t.me/Errccyy" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
                                        {pkg.price === 0 ? 'Detaylı Bilgi' : 'Satın Al'}
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}


                {/* Contact CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-500 font-medium mb-4">Özel paketler ve detaylı bilgi için iletişime geçin</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://t.me/Errccyy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#0088cc] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0077b5] transition shadow-lg shadow-blue-200 w-full sm:w-auto"
                        >
                            <MessageCircle size={24} />
                            Telegram
                        </a>
                        <a
                            href="https://wa.me/905427879595"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#128C7E] transition shadow-lg shadow-green-200 w-full sm:w-auto"
                        >
                            <MessageCircle size={24} />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
