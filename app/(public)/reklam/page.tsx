import Link from 'next/link';
import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabaseAdmin';
import {
    Zap, Eye, TrendingUp, Star, Wallet, CheckCircle2,
    ArrowRight, MessageCircle, Shield, Users, BarChart2
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Telegram Kanal Reklamı Ver — Öne Çıkarma Paketleri | TelegramKanali.com',
    description: '290.000+ aylık ziyaretçiye Telegram kanalınızı tanıtın. Reklam vermek için bizimle iletişime geçin.',
};

export const revalidate = 3600;

const TELEGRAM_CONTACT = 'https://t.me/comtelegramkanali';

async function getStats() {
    try {
        const db = getAdminClient();
        const [channelRes, viewRes] = await Promise.all([
            db.from('channels').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            db.from('site_analytics').select('page_views').limit(500),
        ]);
        const totalViews = viewRes.data?.reduce((acc: number, r: any) => acc + (r.page_views || 0), 0) || 290000;
        return { channels: channelRes.count || 1468, views: totalViews };
    } catch {
        return { channels: 1468, views: 290000 };
    }
}

const PACKAGES = [
    {
        label: 'Başlangıç',
        views: '10.000',
        usdt: '$15',
        stars: '250⭐',
        desc: 'Kanalınızı test etmek için ideal giriş paketi.',
        popular: false,
    },
    {
        label: 'Büyüme',
        views: '35.000',
        usdt: '$40',
        stars: '700⭐',
        desc: 'Hedef kitlenize ulaşmaya başlayın.',
        popular: false,
    },
    {
        label: 'Pro',
        views: '100.000',
        usdt: '$90',
        stars: '1.500⭐',
        desc: 'Ciddi büyüme için en çok tercih edilen.',
        popular: true,
    },
    {
        label: 'Elite',
        views: '300.000',
        usdt: '$200',
        stars: '3.500⭐',
        desc: 'Maksimum erişim ve marka bilinirliği.',
        popular: false,
    },
    {
        label: 'Ultra',
        views: '1.000.000',
        usdt: '$450',
        stars: '8.000⭐',
        desc: 'Sınırsız görünürlük, tam hâkimiyet.',
        popular: false,
        highlight: true,
    },
];

const AD_TYPES = [
    {
        icon: Zap,
        label: '⚡ Öne Çıkarma',
        desc: 'Kanalınız kanal listesinin 1. pozisyonuna yerleşir. Her ziyaretçi ilk sizin kanalınızı görür.',
        gradient: 'from-violet-500/20 to-purple-500/10',
        border: 'border-violet-500/30',
        icon_color: 'text-violet-400',
        icon_bg: 'bg-violet-500/15',
    },
    {
        icon: Eye,
        label: '🖼 Banner Reklam',
        desc: 'Kategori sayfaları ve anasayfada büyük görsel banner alanı. Yüksek tıklanma oranı.',
        gradient: 'from-sky-500/20 to-blue-500/10',
        border: 'border-sky-500/30',
        icon_color: 'text-sky-400',
        icon_bg: 'bg-sky-500/15',
    },
    {
        icon: TrendingUp,
        label: '🎬 Hikaye Reklamı',
        desc: 'Sayfanın üstünde story dairesi olarak görünürsünüz. 24 saat - 7 gün seçenekleri.',
        gradient: 'from-pink-500/20 to-rose-500/10',
        border: 'border-pink-500/30',
        icon_color: 'text-pink-400',
        icon_bg: 'bg-pink-500/15',
    },
];

export default async function ReklamPage() {
    const stats = await getStats();
    const viewsFormatted =
        stats.views >= 1000000
            ? `${(stats.views / 1000000).toFixed(1)}M+`
            : stats.views >= 1000
                ? `${Math.floor(stats.views / 1000)}K+`
                : stats.views.toLocaleString();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #0d0d1f 50%, #0a0a14 100%)' }}>

            {/* ── HERO ─────────────────────────────────────── */}
            <section className="relative overflow-hidden px-4 pt-24 pb-28">
                {/* Ambient BG */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }} />
                    <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
                    <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl text-center">

                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-violet-300 backdrop-blur-sm">
                        <Zap size={12} className="fill-violet-400 text-violet-400" />
                        {viewsFormatted} Aylık Organik Ziyaretçi
                    </div>

                    {/* H1 */}
                    <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight text-white md:text-7xl">
                        Telegram Kanalınızı<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 40%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            1. Sıraya Taşıyın
                        </span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
                        Türkiye&apos;nin en büyük Telegram dizininde <strong className="text-white">görünürlük bazlı reklam verin.</strong><br />
                        Aylık <strong className="text-violet-300">{viewsFormatted} gerçek ziyaretçiye</strong> doğrudan ulaşın.
                    </p>

                    {/* Primary CTA */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a
                            href={TELEGRAM_CONTACT}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-4 text-base font-black text-white shadow-2xl transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                        >
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} />
                            <MessageCircle size={20} className="relative z-10" />
                            <span className="relative z-10">Reklam Almak İstiyorum</span>
                            <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                        </a>

                        <a
                            href={TELEGRAM_CONTACT}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-2xl border border-slate-700 px-6 py-4 text-sm font-bold text-slate-300 transition-all hover:border-slate-600 hover:text-white"
                        >
                            <MessageCircle size={16} />
                            @comtelegramkanali
                        </a>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ───────────────────────────────── */}
            <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
                    {[
                        { val: viewsFormatted, label: 'Aylık Görüntülenme' },
                        { val: `${stats.channels}+`, label: 'Kayıtlı Kanal' },
                        { val: '1. Sıra', label: 'Garanti Konum' },
                        { val: '7/24', label: 'Destek Hattı' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <div className="text-3xl font-black text-violet-400 md:text-4xl">{s.val}</div>
                            <div className="mt-1 text-xs font-medium text-slate-500">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── REKLAM TİPLERİ ──────────────────────────── */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-3 text-center text-4xl font-black text-white">Reklam Formatları</h2>
                    <p className="mb-12 text-center text-slate-400">İhtiyacınıza göre 3 farklı reklam pozisyonu</p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {AD_TYPES.map(t => (
                            <div
                                key={t.label}
                                className={`rounded-3xl border bg-gradient-to-b p-6 ${t.gradient} ${t.border}`}
                            >
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${t.icon_bg}`}>
                                    <t.icon size={24} className={t.icon_color} />
                                </div>
                                <h3 className="mb-2 text-lg font-black text-white">{t.label}</h3>
                                <p className="text-sm leading-relaxed text-slate-400">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PAKETLER ────────────────────────────────── */}
            <section className="px-4 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-3 text-center text-4xl font-black text-white">Fiyat Paketleri</h2>
                    <p className="mb-12 text-center text-slate-400">
                        ⭐ Telegram Yıldız veya 💎 USDT — fiyat ve detaylar için iletişime geçin.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PACKAGES.map(pkg => (
                            <div
                                key={pkg.label}
                                className="relative flex flex-col overflow-hidden rounded-3xl border p-6 transition-all hover:scale-[1.02]"
                                style={{
                                    background: pkg.popular
                                        ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(109,40,217,0.10))'
                                        : pkg.highlight
                                            ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(10,10,20,0.8))'
                                            : 'rgba(255,255,255,0.03)',
                                    borderColor: pkg.popular
                                        ? 'rgba(139,92,246,0.5)'
                                        : pkg.highlight
                                            ? 'rgba(245,158,11,0.4)'
                                            : 'rgba(255,255,255,0.07)',
                                }}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-xl bg-violet-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-900/50">
                                        En Popüler
                                    </div>
                                )}
                                {pkg.highlight && (
                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-xl bg-amber-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-amber-950 shadow-lg shadow-amber-900/50">
                                        🔥 Maksimum
                                    </div>
                                )}

                                <div className="mb-1 text-xl font-black text-white">{pkg.label}</div>
                                <div className="mb-4 text-sm text-slate-400">{pkg.desc}</div>

                                {/* Stats */}
                                <div className="mb-5 space-y-2 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">Gösterim</span>
                                        <span className="font-black text-white">👁 {pkg.views}</span>
                                    </div>
                                </div>

                                {/* Prices */}
                                <div className="mt-auto space-y-2">
                                    <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2"
                                        style={{ background: 'rgba(245,158,11,0.08)' }}>
                                        <span className="text-xs font-bold text-amber-400">⭐ Telegram Yıldız</span>
                                        <span className="font-black text-amber-400">{pkg.stars}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 px-3 py-2"
                                        style={{ background: 'rgba(16,185,129,0.08)' }}>
                                        <span className="text-xs font-bold text-emerald-400">💎 USDT</span>
                                        <span className="font-black text-emerald-400">{pkg.usdt}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA under packages */}
                    <div className="mt-10 text-center">
                        <a
                            href={TELEGRAM_CONTACT}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-base font-black text-white shadow-2xl transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                        >
                            <MessageCircle size={20} />
                            Paket Seçmek İçin Yazın
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ── ÖDEME YÖNTEMLERİ ────────────────────────── */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-12 text-center text-4xl font-black text-white">Ödeme Yöntemleri</h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="rounded-3xl border p-8"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(10,10,20,0.8))', borderColor: 'rgba(245,158,11,0.25)' }}>
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                                    style={{ background: 'rgba(245,158,11,0.2)' }}>
                                    ⭐
                                </div>
                                <div>
                                    <div className="font-black text-white text-lg">Telegram Yıldız</div>
                                    <div className="text-xs text-amber-400/70">Telegram üzerinden doğrudan</div>
                                </div>
                            </div>
                            <p className="mb-5 text-sm leading-relaxed text-slate-400">
                                Telegram uygulamanız üzerinden yıldız göndererek ödeme yapın.
                                Güvenli, hızlı ve tamamen Telegram ekosistemi içinde.
                            </p>
                            <div className="space-y-2">
                                {['Telegram üzerinden güvenli', 'Anonim işlem', 'Anında onay bildirimi'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle2 size={13} className="text-amber-400" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border p-8"
                            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(10,10,20,0.8))', borderColor: 'rgba(16,185,129,0.25)' }}>
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                                    style={{ background: 'rgba(16,185,129,0.2)' }}>
                                    💎
                                </div>
                                <div>
                                    <div className="font-black text-white text-lg">USDT Kripto</div>
                                    <div className="text-xs text-emerald-400/70">TRC-20 veya BEP-20</div>
                                </div>
                            </div>
                            <p className="mb-5 text-sm leading-relaxed text-slate-400">
                                USDT stablecoin ile kripto ödeme yapın.
                                Tron (TRC-20) veya BNB Chain (BEP-20) ağları desteklenmektedir.
                            </p>
                            <div className="space-y-2">
                                {['TRC-20 & BEP-20 ağları', 'Kripto cüzdandan transfer', '1 iş günü onay'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle2 size={13} className="text-emerald-400" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── NASIL ÇALIŞIR ───────────────────────────── */}
            <section className="px-4 py-20" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-12 text-center text-4xl font-black text-white">Nasıl Çalışır?</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {[
                            { n: '01', icon: MessageCircle, label: 'İletişime Geçin', desc: 'Telegram kanalımıza yazın, paket seçin.' },
                            { n: '02', icon: Wallet, label: 'Ödeme Yapın', desc: 'Yıldız veya USDT ile ödemenizi gönderin.' },
                            { n: '03', icon: Zap, label: 'Aktive Edilir', desc: '1 iş günü içinde kanalınız öne çıkarılır.' },
                            { n: '04', icon: BarChart2, label: 'Büyüyün', desc: 'Binlerce ziyaretçi kanalınızı görür.' },
                        ].map(s => (
                            <div key={s.n} className="text-center">
                                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20"
                                    style={{ background: 'rgba(124,58,237,0.1)' }}>
                                    <s.icon size={24} className="text-violet-400" />
                                </div>
                                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-violet-500">{s.n}</div>
                                <div className="mb-1 font-black text-white">{s.label}</div>
                                <div className="text-xs text-slate-500">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── GÜVENCE ─────────────────────────────────── */}
            <section className="px-4 py-16">
                <div className="mx-auto max-w-3xl rounded-3xl border p-8 md:p-10"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="mb-6 flex items-center gap-3">
                        <Shield size={22} className="text-violet-400" />
                        <h3 className="text-xl font-black text-white">Neden Güvenilir?</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm text-slate-400 sm:grid-cols-2">
                        {[
                            '290K+ aylık doğrulanmış ziyaretçi',
                            '1.400+ kayıtlı Telegram kanalı',
                            'Görüntülenme bazlı — adil ve şeffaf',
                            'Manuel onay ile güvenli ödeme',
                            '7/24 Telegram destek hattı',
                            'İptal durumunda tam iade garantisi',
                        ].map(f => (
                            <div key={f} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ───────────────────────────────── */}
            <section className="px-4 py-24 text-center">
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent)' }} />
                <div className="relative z-10">
                    <h2 className="mb-4 text-4xl font-black text-white md:text-5xl">
                        Kanalınızı Öne Çıkarmaya<br />Hazır mısınız?
                    </h2>
                    <p className="mx-auto mb-10 max-w-md text-slate-400">
                        {viewsFormatted} aylık ziyaretçiye kanalınızı tanıtın.<br />
                        Hemen yazın, birlikte en iyi paketi seçelim.
                    </p>
                    <a
                        href={TELEGRAM_CONTACT}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-black text-white shadow-2xl transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 20px 60px rgba(124,58,237,0.4)' }}
                    >
                        <MessageCircle size={22} />
                        Telegram&apos;dan Yazın
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </a>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Users size={12} />
                        @comtelegramkanali
                    </div>
                </div>
            </section>
        </div>
    );
}
