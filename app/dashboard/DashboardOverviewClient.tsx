'use client';

import {
    Users, Tv, TrendingUp, Coins, Zap, ArrowRight, CheckCircle2,
    MessageCircle, Phone, BarChart2, Eye, Clock, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface DashboardOverviewClientProps {
    channels: number;
    balance: number;
    totalMembers: number;
    activeAds: number;
    pendingAds?: number;
    totalViews?: number;
}

export default function DashboardOverviewClient({
    channels,
    balance,
    totalMembers,
    activeAds,
    pendingAds = 0,
    totalViews = 0,
}: DashboardOverviewClientProps) {

    const hasChannel = channels > 0;
    const hasBalance = balance > 0;
    const completedSteps = [hasChannel, hasBalance, activeAds > 0].filter(Boolean).length;

    return (
        <div className="space-y-6 text-white">

            {/* Welcome Hero */}
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl shadow-violet-950/50">
                {/* BG decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.3) 0%, transparent 60%)' }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-2">
                            ⚡ Reklam Paneli
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                            Hoş Geldiniz! 👋
                        </h2>
                        <p className="text-violet-200 text-sm max-w-md">
                            Telegram kanalınızı <strong className="text-white">290.000+</strong> aylık ziyaretçiye tanıtın.
                            Görüntülenme bazlı reklamlarla hedef kitlenize kesin olarak ulaşın.
                        </p>
                    </div>

                    {/* Balance Widget */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 shrink-0 min-w-[180px]">
                        <div className="text-xs font-bold text-violet-300 mb-1">Jeton Bakiyeniz</div>
                        <div className="text-3xl font-black text-white mb-3">
                            💰 {balance.toLocaleString()}
                        </div>
                        <Link
                            href="/dashboard/billing"
                            className="w-full flex items-center justify-center gap-2 bg-white text-violet-700 text-xs font-black py-2 px-4 rounded-xl hover:bg-violet-50 transition-all"
                        >
                            <Coins size={14} />
                            Jeton Yükle
                        </Link>
                    </div>
                </div>
            </div>

            {/* Alert: Bakiye 0 ise urgency */}
            {!hasBalance && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-300 font-bold text-sm">Bakiyeniz yok</p>
                        <p className="text-amber-400/70 text-xs mt-0.5">
                            Reklam kampanyası başlatmak için jeton yüklemeniz gerekiyor.
                            <Link href="/dashboard/billing" className="text-amber-300 font-bold ml-1 underline">Hemen yükle →</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Kanallarım', value: channels, icon: Tv, color: 'text-sky-400', bg: 'from-sky-500/10 to-sky-600/5', border: 'border-sky-500/20' },
                    { label: 'Toplam Üye', value: totalMembers.toLocaleString(), icon: Users, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/20' },
                    { label: 'Aktif Reklam', value: activeAds, icon: TrendingUp, color: 'text-violet-400', bg: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-500/20' },
                    { label: 'Toplam Gösterim', value: totalViews > 0 ? totalViews.toLocaleString() : '—', icon: Eye, color: 'text-pink-400', bg: 'from-pink-500/10 to-pink-600/5', border: 'border-pink-500/20' },
                ].map(card => (
                    <div
                        key={card.label}
                        className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-2xl p-4 md:p-5`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <card.icon size={18} className={card.color} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:block">{card.label}</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-white">{card.value}</div>
                        <div className="text-[11px] text-slate-400 mt-1 md:hidden">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Başlangıç Rehberi */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-white">🚀 Hızlı Başlangıç Rehberi</h3>
                        <span className="text-xs font-bold text-slate-500">{completedSteps}/3 tamamlandı</span>
                    </div>

                    {/* Progress */}
                    <div className="h-1.5 bg-slate-800 rounded-full mb-5 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
                            style={{ width: `${(completedSteps / 3) * 100}%` }}
                        />
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                step: 1,
                                done: hasChannel,
                                title: 'Kanalınızı Ekleyin',
                                desc: 'Telegram kanalınızı dizine ekleyin. Ücretsiz ve hızlı.',
                                link: '/dashboard/kanal-ekle',
                                cta: 'Kanal Ekle',
                            },
                            {
                                step: 2,
                                done: hasBalance,
                                title: 'Jeton Yükleyin',
                                desc: '⭐ Telegram Yıldız veya 💎 USDT ile kolayca bakiye yükleyin.',
                                link: '/dashboard/billing',
                                cta: 'Jeton Yükle',
                            },
                            {
                                step: 3,
                                done: activeAds > 0,
                                title: 'İlk Reklamınızı Başlatın',
                                desc: 'Kanalınız 290K+ ziyaretçinin önünde 1. sıraya yerleşsin.',
                                link: '/dashboard/ads',
                                cta: 'Reklam Oluştur',
                            },
                        ].map(item => (
                            <div
                                key={item.step}
                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${item.done
                                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                                    : 'bg-slate-800/50 border-slate-700/50 hover:border-violet-500/30'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                    {item.done ? <CheckCircle2 size={18} /> : item.step}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm ${item.done ? 'line-through text-slate-500' : 'text-white'}`}>{item.title}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                                </div>
                                {!item.done && (
                                    <Link
                                        href={item.link}
                                        className="flex items-center gap-1 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg hover:bg-violet-500/20 transition-all shrink-0"
                                    >
                                        {item.cta} <ArrowRight size={12} />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Destek Kartı */}
                <div className="flex flex-col gap-4">
                    {/* Neden reklamver? */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800/60 rounded-3xl p-6 flex-1">
                        <h3 className="text-sm font-bold text-white mb-4">📊 Platform İstatistikleri</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Aylık Görüntülenme', value: '290.000+', icon: BarChart2, color: 'text-violet-400' },
                                { label: '/18 Kategorisi', value: '102.000+', icon: Eye, color: 'text-pink-400' },
                                { label: 'Kayıtlı Kanal', value: '1.400+', icon: Tv, color: 'text-sky-400' },
                                { label: 'Reklamın Önüne Geç', value: '1. Sıra', icon: Zap, color: 'text-amber-400' },
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <stat.icon size={13} className={stat.color} />
                                        {stat.label}
                                    </div>
                                    <span className="text-xs font-black text-white">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Destek */}
                    <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/5 border border-sky-500/20 rounded-3xl p-5 text-center">
                        <div className="w-11 h-11 bg-sky-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={22} className="text-sky-400" />
                        </div>
                        <p className="text-white font-bold text-sm">Destek & İletişim</p>
                        <p className="text-slate-400 text-xs mt-1 mb-4">Soru ve sorunlarınız için 7/24 ulaşın.</p>
                        <a
                            href="https://t.me/comtelegramkanali"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 justify-center bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-sky-500/30 transition-all w-full"
                        >
                            <Phone size={13} />
                            @comtelegramkanali ile Konuş
                        </a>
                    </div>
                </div>
            </div>

            {/* Pending Ads Alert */}
            {pendingAds > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock size={18} className="text-amber-500" />
                        <div>
                            <p className="text-amber-300 font-bold text-sm">{pendingAds} kampanya onay bekliyor</p>
                            <p className="text-amber-400/70 text-xs">Admin onayından sonra reklamlarınız yayına girecek.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/ads" className="text-xs font-bold text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-all">
                        Görüntüle →
                    </Link>
                </div>
            )}

            {/* Hızlı Erişim */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { href: '/dashboard/ads', label: 'Yeni Kampanya', desc: 'Reklam oluştur', icon: Zap, color: 'from-violet-600/20 to-purple-600/10 border-violet-500/20 hover:border-violet-500/40' },
                    { href: '/reklam', label: 'Fiyat Listesi', desc: 'Paketleri incele', icon: BarChart2, color: 'from-sky-600/20 to-blue-600/10 border-sky-500/20 hover:border-sky-500/40' },
                    { href: '/dashboard/channels', label: 'Kanallarım', desc: 'Kanal yönetimi', icon: Tv, color: 'from-emerald-600/20 to-green-600/10 border-emerald-500/20 hover:border-emerald-500/40' },
                ].map(q => (
                    <Link
                        key={q.href}
                        href={q.href}
                        className={`bg-gradient-to-br ${q.color} border rounded-2xl p-4 group transition-all`}
                    >
                        <q.icon size={20} className="text-slate-300 mb-3 group-hover:text-white transition-colors" />
                        <div className="font-bold text-white text-sm">{q.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{q.desc}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
