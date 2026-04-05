import Link from 'next/link';
import { Metadata } from 'next';
import { getAdminClient } from '@/lib/supabaseAdmin';
import {
    Zap, CheckCircle2, ArrowRight, MessageCircle,
    Shield, Users, BarChart2, Star, Wallet
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Telegram Kanal Reklamı Ver — NEON · PRIME · APEX | TelegramKanali.com',
    description: '650.000+ aylık ziyaretçiye Telegram kanalınızı tanıtın. Kategori Banner, Anasayfa Banner ve Kategori Listeleme paketleri. Telegram Yıldız veya USDT ile öde.',
};

export const dynamic = 'force-dynamic';

const TELEGRAM_CONTACT = 'https://t.me/comtelegramkanali';

async function getStats() {
    try {
        const db = getAdminClient();
        const channelRes = await db
            .from('channels')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');
        return { channels: channelRes.count || 1468 };
    } catch {
        return { channels: 1468 };
    }
}

// ─── Paketler ────────────────────────────────────────────────────────────────
const PACKAGES = [
    {
        id: 'neon',
        name: 'NEON',
        tagline: 'Kategori Reklamı',
        emoji: '⚡',
        desc: 'Kanalınız tam hedef kategorisinde öne çıkar. Kategoriye giren her ziyaretçi sizi görür.',
        feature: 'Kategori sayfası üst banner alanı',
        stars: '3.500',
        usdt: '$57.50',
        color: {
            gradient: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(109,40,217,0.08))',
            border: 'rgba(139,92,246,0.45)',
            glow: 'rgba(139,92,246,0.3)',
            badge: '#7c3aed',
            accent: '#a78bfa',
            starBg: 'rgba(245,158,11,0.1)',
            starBorder: 'rgba(245,158,11,0.25)',
            usdtBg: 'rgba(16,185,129,0.1)',
            usdtBorder: 'rgba(16,185,129,0.25)',
        },
    },
    {
        id: 'prime',
        name: 'PRIME',
        tagline: 'Kategori Listeleme',
        emoji: '👑',
        desc: 'Kanalınız seçilen kategorinin kanal listesinin 1. pozisyonuna pin\'lenir. Kimse aşağı kaydırmadan sizi görür.',
        feature: 'Listenin 1. sırası — PIN konumu',
        stars: '1.000',
        usdt: '$15',
        color: {
            gradient: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(2,132,199,0.08))',
            border: 'rgba(14,165,233,0.45)',
            glow: 'rgba(14,165,233,0.25)',
            badge: '#0284c7',
            accent: '#7dd3fc',
            starBg: 'rgba(245,158,11,0.1)',
            starBorder: 'rgba(245,158,11,0.25)',
            usdtBg: 'rgba(16,185,129,0.1)',
            usdtBorder: 'rgba(16,185,129,0.25)',
        },
    },
    {
        id: 'apex',
        name: 'APEX',
        tagline: 'Anasayfa Banner',
        emoji: '🔱',
        desc: 'Siteye giren her ziyaretçinin ilk gördüğü yer. Tüm kategorilerden gelen 650K+ trafik tek bir noktada.',
        feature: 'Anasayfa üst banner — maksimum erişim',
        stars: '9.000',
        usdt: '$200',
        highlight: true,
        color: {
            gradient: 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(217,119,6,0.08))',
            border: 'rgba(245,158,11,0.5)',
            glow: 'rgba(245,158,11,0.3)',
            badge: '#d97706',
            accent: '#fbbf24',
            starBg: 'rgba(245,158,11,0.12)',
            starBorder: 'rgba(245,158,11,0.3)',
            usdtBg: 'rgba(16,185,129,0.1)',
            usdtBorder: 'rgba(16,185,129,0.25)',
        },
    },
];

// ─── Karşılaştırma ────────────────────────────────────────────────────────────
const COMPARE = [
    { label: 'Hedef Kitlenize Özel', neon: true, prime: true, apex: false },
    { label: 'Kategori Sayfası Banner', neon: true, prime: false, apex: false },
    { label: 'Listenin 1. Sırası (PIN)', neon: false, prime: true, apex: false },
    { label: 'Anasayfa Görünüm', neon: false, prime: false, apex: true },
    { label: 'Tüm Trafiğe Erişim', neon: false, prime: false, apex: true },
    { label: 'Görüntülenme Sayacı', neon: true, prime: true, apex: true },
];

export default async function ReklamPage() {
    const stats = await getStats();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #06060f 0%, #0d0d1f 50%, #06060f 100%)' }}>

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden px-4 pt-24 pb-28">
                {/* Ambient */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-25"
                        style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }} />
                    <div className="absolute right-0 top-1/2 h-64 w-96 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
                    <div className="absolute bottom-0 left-0 h-48 w-64 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
                        style={{ borderColor: 'rgba(139,92,246,0.35)', background: 'rgba(139,92,246,0.12)', color: '#c4b5fd' }}>
                        <Zap size={12} style={{ fill: '#a78bfa', color: '#a78bfa' }} />
                        650.000+ Aylık Organik Ziyaretçi
                    </div>

                    <h1 className="mb-6 text-5xl font-black leading-[1.08] tracking-tight text-white md:text-7xl">
                        Telegram Kanalınızı<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 35%, #f59e0b 80%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Görünür Kılın
                        </span>
                    </h1>

                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
                        Türkiye&apos;nin en büyük Telegram dizininde reklam verin.<br />
                        <strong className="text-white">3 özel paket</strong> — doğru konumda, doğru kişilere.
                    </p>

                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer"
                            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-8 py-4 text-base font-black text-white shadow-2xl transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 20px 50px rgba(124,58,237,0.4)' }}>
                            <MessageCircle size={20} className="relative z-10" />
                            <span className="relative z-10">Paket Almak İstiyorum</span>
                            <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                        </a>
                        <a href="#paketler"
                            className="flex items-center gap-2 rounded-2xl border px-6 py-4 text-sm font-bold text-slate-300 transition-all hover:text-white"
                            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            Paketleri İncele ↓
                        </a>
                    </div>
                </div>
            </section>

            {/* ── STATS ────────────────────────────────────────── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
                    {[
                        { val: '650K+', label: 'Aylık Görüntülenme' },
                        { val: `${stats.channels}+`, label: 'Kayıtlı Kanal' },
                        { val: '3', label: 'Reklam Paketi' },
                        { val: '7/24', label: 'Destek Hattı' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <div className="text-3xl font-black md:text-4xl" style={{ color: '#a78bfa' }}>{s.val}</div>
                            <div className="mt-1 text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PAKETLER ─────────────────────────────────────── */}
            <section id="paketler" className="px-4 py-24">
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-3 text-center text-4xl font-black text-white md:text-5xl">3 Güçlü Paket</h2>
                    <p className="mb-16 text-center text-slate-400">
                        Her bütçeye ve hedefe uygun. Hepsi ⭐ Telegram Yıldız veya 💎 USDT ile satın alınır.
                    </p>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {PACKAGES.map(pkg => (
                            <div
                                key={pkg.id}
                                className="relative flex flex-col overflow-hidden rounded-3xl p-7 transition-all hover:-translate-y-1"
                                style={{
                                    background: pkg.color.gradient,
                                    border: `1px solid ${pkg.color.border}`,
                                    boxShadow: pkg.highlight ? `0 0 40px ${pkg.color.glow}` : 'none',
                                }}
                            >
                                {/* Package badge */}
                                <div className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-xl px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                                    style={{ background: pkg.color.badge }}>
                                    {pkg.emoji} {pkg.name}
                                </div>

                                <div className="mt-5">
                                    <div className="mb-1 text-2xl font-black text-white">{pkg.tagline}</div>
                                    <div className="mb-5 text-sm leading-relaxed" style={{ color: 'rgba(203,213,225,0.7)' }}>{pkg.desc}</div>

                                    {/* Feature highlight */}
                                    <div className="mb-5 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-bold"
                                        style={{ background: 'rgba(255,255,255,0.06)', color: pkg.color.accent }}>
                                        <Zap size={13} className="mt-0.5 shrink-0" style={{ fill: 'currentColor' }} />
                                        {pkg.feature}
                                    </div>

                                    {/* Prices */}
                                    <div className="mt-auto space-y-2.5">
                                        <div className="flex items-center justify-between rounded-xl px-4 py-3"
                                            style={{ background: pkg.color.starBg, border: `1px solid ${pkg.color.starBorder}` }}>
                                            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#fbbf24' }}>
                                                <Star size={14} style={{ fill: '#fbbf24' }} />
                                                Telegram Yıldız
                                            </div>
                                            <span className="text-lg font-black" style={{ color: '#fcd34d' }}>{pkg.stars}⭐</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl px-4 py-3"
                                            style={{ background: pkg.color.usdtBg, border: `1px solid ${pkg.color.usdtBorder}` }}>
                                            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#34d399' }}>
                                                <Wallet size={14} />
                                                USDT
                                            </div>
                                            <span className="text-lg font-black" style={{ color: '#6ee7b7' }}>{pkg.usdt}</span>
                                        </div>

                                        <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer"
                                            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition-all hover:opacity-90"
                                            style={{ background: pkg.color.badge, boxShadow: `0 8px 24px ${pkg.color.glow}` }}>
                                            <MessageCircle size={16} />
                                            {pkg.name} Paketi Al
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── KARŞILAŞTIRMA TABLOSU ────────────────────────── */}
            <section className="px-4 pb-20">
                <div className="mx-auto max-w-3xl">
                    <h2 className="mb-10 text-center text-3xl font-black text-white">Paket Karşılaştırması</h2>

                    <div className="overflow-hidden rounded-3xl" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                        {/* Header */}
                        <div className="grid grid-cols-4 gap-0 border-b px-6 py-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                            <div className="text-xs font-bold uppercase text-slate-500">Özellik</div>
                            {[
                                { name: 'NEON', color: '#a78bfa' },
                                { name: 'PRIME', color: '#7dd3fc' },
                                { name: 'APEX', color: '#fbbf24' },
                            ].map(p => (
                                <div key={p.name} className="text-center text-xs font-black" style={{ color: p.color }}>{p.name}</div>
                            ))}
                        </div>

                        {COMPARE.map((row, i) => (
                            <div key={row.label}
                                className="grid grid-cols-4 gap-0 px-6 py-3.5"
                                style={{
                                    borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                }}>
                                <div className="text-xs text-slate-400 flex items-center">{row.label}</div>
                                {[row.neon, row.prime, row.apex].map((has, idx) => (
                                    <div key={idx} className="flex justify-center">
                                        {has
                                            ? <CheckCircle2 size={16} className="text-emerald-400" />
                                            : <span className="text-slate-700 text-lg leading-none">—</span>
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ÖDEME YÖNTEMLERİ ─────────────────────────────── */}
            <section className="px-4 py-16" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-10 text-center text-3xl font-black text-white">Ödeme Yöntemleri</h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <div className="rounded-3xl p-7"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.13), rgba(6,6,15,0.8))', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: 'rgba(245,158,11,0.2)' }}>⭐</div>
                                <div>
                                    <div className="text-lg font-black text-white">Telegram Yıldız</div>
                                    <div className="text-xs" style={{ color: 'rgba(251,191,36,0.7)' }}>Telegram üzerinden doğrudan</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {['Telegram uygulamasından güvenli ödeme', 'Anonim & hızlı işlem', 'Anında onay bildirimi'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle2 size={13} className="text-amber-400 shrink-0" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl p-7"
                            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.13), rgba(6,6,15,0.8))', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: 'rgba(16,185,129,0.2)' }}>💎</div>
                                <div>
                                    <div className="text-lg font-black text-white">USDT Kripto</div>
                                    <div className="text-xs" style={{ color: 'rgba(52,211,153,0.7)' }}>TRC-20 veya BEP-20</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {['TRC-20 (Tron) & BEP-20 (BSC) destekli', 'Kripto cüzdandan direkt transfer', '1 iş günü içinde aktifleşir'].map(f => (
                                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── NASIL ÇALIŞIR ────────────────────────────────── */}
            <section className="px-4 py-20">
                <div className="mx-auto max-w-4xl">
                    <h2 className="mb-12 text-center text-3xl font-black text-white">Nasıl Satın Alırsınız?</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {[
                            { n: '01', icon: MessageCircle, label: 'Telegram\'dan Yazın', desc: '@comtelegramkanali kanalına yazın, hangi paketi istediğinizi belirtin.' },
                            { n: '02', icon: Star, label: 'Ödeme Yapın', desc: 'Yıldız veya USDT ile ödemenizi gönderin. Talimatlar kanalda mevcut.' },
                            { n: '03', icon: Zap, label: 'Aktive Edilir', desc: 'Ödemeniz onaylanır ve kanalınız 1 iş günü içinde öne çıkarılır.' },
                            { n: '04', icon: BarChart2, label: 'Büyüyün', desc: '650K+ ziyaretçi arasından tam hedef kitleniz sizi görür.' },
                        ].map(s => (
                            <div key={s.n} className="text-center">
                                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                    <s.icon size={24} style={{ color: '#a78bfa' }} />
                                </div>
                                <div className="mb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(124,58,237,0.8)' }}>{s.n}</div>
                                <div className="mb-1 font-black text-white text-sm">{s.label}</div>
                                <div className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── GÜVENCE ──────────────────────────────────────── */}
            <section className="px-4 pb-16">
                <div className="mx-auto max-w-3xl rounded-3xl p-8 md:p-10"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="mb-6 flex items-center gap-3">
                        <Shield size={22} style={{ color: '#a78bfa' }} />
                        <h3 className="text-xl font-black text-white">Neden Güvenilir?</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2" style={{ color: 'rgba(148,163,184,0.8)' }}>
                        {[
                            '650K+ aylık organik ziyaretçi',
                            '1.400+ kayıtlı Telegram kanalı',
                            'Gösterim bazlı — adil ve şeffaf',
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

            {/* ── FINAL CTA ────────────────────────────────────── */}
            <section className="relative px-4 py-24 text-center">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-64 w-[600px] rounded-full opacity-15 blur-3xl"
                        style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent)' }} />
                </div>
                <div className="relative z-10">
                    <h2 className="mb-4 text-4xl font-black text-white md:text-5xl">
                        Kanalınız Fark Yaratmaya<br />Hazır mı?
                    </h2>
                    <p className="mx-auto mb-10 max-w-md text-slate-400">
                        NEON, PRIME veya APEX — hangisi sizin için uygun?<br />
                        Hemen yazın, birlikte karar verelim.
                    </p>
                    <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-black text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 20px 60px rgba(124,58,237,0.4)' }}>
                        <MessageCircle size={22} />
                        Telegram&apos;dan Yazın
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </a>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: 'rgba(100,116,139,0.8)' }}>
                        <Users size={12} />
                        @comtelegramkanali
                    </div>
                </div>
            </section>
        </div>
    );
}
