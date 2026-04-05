import Link from 'next/link';
import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { Zap, Eye, TrendingUp, Star, Wallet, CheckCircle2, ArrowRight, Users, BarChart2, MessageCircle, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Telegram Kanal Reklamı Ver — Öne Çıkarma Paketleri | TelegramKanali.com',
    description: '290.000+ aylık ziyaretçiye Telegram kanalınızı tanıtın. Görüntülenme bazlı reklam paketleriyle kanalınızı listenin 1. sırasına taşıyın.',
};

export const revalidate = 3600;

async function getStats() {
    try {
        const db = getAdminClient();
        const [channelRes, viewRes] = await Promise.all([
            db.from('channels').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            db.from('site_analytics').select('page_views').limit(1000),
        ]);
        const totalViews = viewRes.data?.reduce((acc: number, r: any) => acc + (r.page_views || 0), 0) || 290000;
        return {
            channels: channelRes.count || 1400,
            views: totalViews,
        };
    } catch {
        return { channels: 1400, views: 290000 };
    }
}

const PACKAGES = [
    { label: 'Başlangıç', tokens: 500, views: '10.000', usdt: 15, stars: 250, desc: 'Ölçmek ve test etmek için ideal', color: 'from-slate-800 to-slate-800', border: 'border-slate-700/60', badge: '' },
    { label: 'Büyüme', tokens: 1500, views: '35.000', usdt: 40, stars: 700, desc: 'Büyümeye başlamak için', color: 'from-slate-800 to-slate-800', border: 'border-slate-700/60', badge: '' },
    { label: 'Pro', tokens: 4000, views: '100.000', usdt: 90, stars: 1500, desc: 'Ciddi büyüme için optimize edildi', color: 'from-violet-900/60 to-purple-900/40', border: 'border-violet-500/40', badge: '⭐ En Popüler', popular: true },
    { label: 'Elite', tokens: 10000, views: '300.000', usdt: 200, stars: 3500, desc: 'Maksimum erişim', color: 'from-slate-800 to-slate-800', border: 'border-slate-700/60', badge: '' },
    { label: 'Ultra', tokens: 25000, views: '1.000.000', usdt: 450, stars: 8000, desc: 'Sınırsız görünürlük', color: 'from-amber-900/30 to-slate-800', border: 'border-amber-500/30', badge: '🔥 Maksimum' },
];

const AD_TYPES = [
    { icon: Zap, label: 'Öne Çıkarma', color: 'text-violet-400 bg-violet-500/10', desc: 'Kanalınız kanal listesinin tam 1. sırasına yerleşir. Her ziyaretçi ilk onu görür.' },
    { icon: Eye, label: 'Banner Reklam', color: 'text-sky-400 bg-sky-500/10', desc: 'Kategori ve anasayfa üst bölümünde büyük görsel reklam alanı.' },
    { icon: TrendingUp, label: 'Hikaye Reklamı', color: 'text-pink-400 bg-pink-500/10', desc: 'Instagram story tarzı dairesel gösterim. 24 saat - 7 gün seçenekleri.' },
];

export default async function ReklamPage() {
    const stats = await getStats();
    const viewsK = stats.views >= 1000 ? `${Math.floor(stats.views / 1000)}K+` : stats.views.toLocaleString();

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Hero */}
            <section className="relative overflow-hidden pt-20 pb-24 px-4">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
                        <Zap size={12} fill="currentColor" />
                        290.000+ Aylık Ziyaretçiye Ulaşın
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Telegram Kanalınızı<br />
                        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            1. Sıraya Taşıyın
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Türkiye&apos;nin en büyük Telegram dizininde görünürlük bazlı reklam verin.
                        <strong className="text-white"> Aylık {viewsK} görüntülenme</strong> alıyoruz —
                        kanalınızı tam hedef kitlenize tanıtın.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/dashboard/billing"
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black py-4 px-8 rounded-2xl text-base transition-all shadow-2xl shadow-violet-900/40"
                        >
                            <Zap size={18} />
                            Reklam Satın Al
                            <ArrowRight size={16} />
                        </Link>
                        <a
                            href="https://t.me/sibelliee"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 px-8 rounded-2xl text-base transition-all"
                        >
                            <MessageCircle size={18} />
                            İletişime Geç
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-y border-slate-800/60 bg-slate-900/50 py-8 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { value: viewsK, label: 'Aylık Görüntülenme', icon: Eye },
                        { value: `${stats.channels}+`, label: 'Kayıtlı Kanal', icon: TrendingUp },
                        { value: '1. Sıra', label: 'Garanti Konum', icon: Zap },
                        { value: '7/24', label: 'Destek', icon: Users },
                    ].map(s => (
                        <div key={s.label}>
                            <div className="text-2xl md:text-3xl font-black text-violet-400">{s.value}</div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Reklam Türleri */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-white text-center mb-3">Reklam Türleri</h2>
                    <p className="text-slate-400 text-center mb-10">İhtiyacınıza göre 3 farklı reklam formatı</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {AD_TYPES.map(t => (
                            <div key={t.label} className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.color}`}>
                                    <t.icon size={24} />
                                </div>
                                <h3 className="font-black text-white text-lg mb-2">{t.label}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Paketler */}
            <section className="py-16 px-4 bg-slate-900/30">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-white text-center mb-3">Fiyat Paketleri</h2>
                    <p className="text-slate-400 text-center mb-10">
                        ⭐ Telegram Yıldız veya 💎 USDT ile ödeyin — jetonlarınız manuel olarak yüklenir.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PACKAGES.map((pkg) => (
                            <div
                                key={pkg.label}
                                className={`relative bg-gradient-to-b ${pkg.color} border ${pkg.border} rounded-3xl p-6 flex flex-col`}
                            >
                                {pkg.badge && (
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap ${pkg.popular ? 'bg-violet-600 text-white' : 'bg-amber-500 text-amber-950'}`}>
                                        {pkg.badge}
                                    </div>
                                )}
                                <div className="text-lg font-black text-white mb-1">{pkg.label}</div>
                                <div className="text-sm text-slate-400 mb-4">{pkg.desc}</div>

                                <div className="bg-slate-800/60 rounded-2xl p-3 mb-4 space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Gösterim</span>
                                        <span className="font-black text-white">👁 {pkg.views}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Jeton</span>
                                        <span className="font-black text-violet-400">💰 {pkg.tokens.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-auto">
                                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                                            <Star size={12} fill="currentColor" />
                                            Telegram Yıldız
                                        </div>
                                        <span className="font-black text-amber-400 text-sm">{pkg.stars}⭐</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                            <Wallet size={12} />
                                            USDT
                                        </div>
                                        <span className="font-black text-emerald-400 text-sm">${pkg.usdt}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ödeme Yöntemleri */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-white text-center mb-10">Ödeme Yöntemleri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-500/30 rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                                    <Star size={24} className="text-amber-400" fill="currentColor" />
                                </div>
                                <div>
                                    <div className="font-black text-white">⭐ Telegram Yıldız</div>
                                    <div className="text-xs text-amber-400/70">Telegram üzerinden anında</div>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                Telegram uygulaması üzerinden doğrudan yıldız ile ödeme yapın.
                                Güvenli, hızlı ve anonim.
                            </p>
                            <div className="space-y-2">
                                {['Telegram üzerinden güvenli ödeme', 'Anonim işlem', 'Anında bildirim'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle2 size={13} className="text-amber-400" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/30 rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                                    <Wallet size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-black text-white">💎 USDT Kripto</div>
                                    <div className="text-xs text-emerald-400/70">TRC-20 veya BEP-20</div>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                USDT stablecoin ile kripto ödeme yapın.
                                TRC-20 (Tron) veya BEP-20 (BSC) ağlarını destekliyoruz.
                            </p>
                            <div className="space-y-2">
                                {['TRC-20 & BEP-20 destekli', 'Kripto cüzdandan transfer', '1 iş günü onay'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle2 size={13} className="text-emerald-400" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nasıl Çalışır */}
            <section className="py-16 px-4 bg-slate-900/30">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black text-white text-center mb-10">Nasıl Çalışır?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { n: '1', icon: Users, label: 'Üye Ol', desc: 'Ücretsiz hesap oluşturun ve kanalınızı ekleyin.' },
                            { n: '2', icon: Wallet, label: 'Jeton Yükle', desc: 'Yıldız veya USDT ile tercih ettiğiniz paketi satın alın.' },
                            { n: '3', icon: Zap, label: 'Kampanya Başlat', desc: 'Panel üzerinden reklam kampanyanızı oluşturun.' },
                            { n: '4', icon: BarChart2, label: 'Büyüyün', desc: 'Kanalınız 1. sıraya yerleşir, gösterimler sayılır.' },
                        ].map(s => (
                            <div key={s.n} className="text-center">
                                <div className="w-14 h-14 bg-violet-500/15 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <s.icon size={24} className="text-violet-400" />
                                </div>
                                <div className="text-xs font-bold text-violet-400 mb-1">ADIM {s.n}</div>
                                <div className="font-black text-white mb-1">{s.label}</div>
                                <div className="text-xs text-slate-400">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Güvence */}
            <section className="py-12 px-4">
                <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800/60 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield size={20} className="text-violet-400" />
                        <h3 className="font-black text-white">Neden Güvenilir?</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-400">
                        {[
                            'Manuel onay sistemi — para kaybolmaz',
                            'Gösterim tabanlı fiyatlandırma — adil ve şeffaf',
                            'Görüntülenme sayacı dashboard\'da izlenebilir',
                            'Jeton iadesi: Admin iptal ederse tam iade',
                            '1.400+ kanalın güvendiği platform',
                            '290K+ aylık doğrulanmış ziyaretçi',
                        ].map(f => (
                            <div key={f} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Başlamaya hazır mısınız?
                </h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    290.000+ aylık ziyaretçiye kanalınızı tanıtın. Sorularınız için 7/24 ulaşabilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/dashboard/billing"
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black py-4 px-8 rounded-2xl text-base transition-all shadow-2xl shadow-violet-900/40"
                    >
                        <Zap size={18} />
                        Hemen Başla
                        <ArrowRight size={16} />
                    </Link>
                    <a
                        href="https://t.me/sibelliee"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-300 hover:text-white font-bold py-4 px-6 rounded-2xl text-base transition-all border border-slate-700 hover:border-slate-600"
                    >
                        <MessageCircle size={18} />
                        @sibelliee — Destek
                    </a>
                </div>
            </section>
        </div>
    );
}
