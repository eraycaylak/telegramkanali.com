'use client';

import Link from 'next/link';
import {
    Tv, Users, TrendingUp, Eye, BarChart2, Clock,
    PlusCircle, Zap, AlertTriangle, CheckCircle2, ArrowRight,
} from 'lucide-react';

interface Props {
    userName: string;
    channels: number;
    totalMembers: number;
    activeAds: number;
    pendingAds: number;
    totalViews: number;
}

const CARD_STYLE = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
};

export default function DashboardOverviewClient({ userName, channels, totalMembers, activeAds, pendingAds, totalViews }: Props) {
    const completedSteps = [channels > 0, activeAds > 0].filter(Boolean).length;

    return (
        <div className="space-y-5 max-w-5xl">

            {/* Welcome */}
            <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)' }}
            >
                <div>
                    <p className="text-blue-200 text-sm font-medium mb-1">Hoş Geldiniz 👋</p>
                    <h2 className="text-white text-2xl font-bold capitalize">{userName}</h2>
                    <p className="text-blue-200 text-sm mt-1">Kanallarınızı yönetin ve reklamlarınızı takip edin.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link
                        href="/dashboard/kanal-ekle"
                        className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-blue-50 transition-all"
                    >
                        <PlusCircle size={15} /> Kanal Ekle
                    </Link>
                    <Link
                        href="/dashboard/ads"
                        className="flex items-center gap-2 bg-blue-500/30 border border-blue-300/30 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500/40 transition-all"
                    >
                        <Zap size={15} /> Reklam Oluştur
                    </Link>
                </div>
            </div>

            {/* Pending alert */}
            {pendingAds > 0 && (
                <div
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
                >
                    <Clock size={16} style={{ color: '#D97706' }} />
                    <p className="text-sm" style={{ color: '#92400E' }}>
                        <strong>{pendingAds} reklam kampanyanız</strong> admin onayı bekliyor.
                        <Link href="/dashboard/ads" className="ml-2 font-bold underline">Görüntüle →</Link>
                    </p>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Kanallarım', value: channels, icon: Tv, color: '#2563EB', bg: '#EFF6FF' },
                    { label: 'Toplam Üye', value: totalMembers.toLocaleString('tr-TR'), icon: Users, color: '#059669', bg: '#ECFDF5' },
                    { label: 'Aktif Reklam', value: activeAds, icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF' },
                    { label: 'Toplam Gösterim', value: totalViews > 0 ? totalViews.toLocaleString('tr-TR') : '—', icon: Eye, color: '#DB2777', bg: '#FDF2F8' },
                ].map(card => (
                    <div key={card.label} style={CARD_STYLE}>
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                            style={{ background: card.bg }}
                        >
                            <card.icon size={17} style={{ color: card.color }} />
                        </div>
                        <div className="text-2xl font-bold" style={{ color: '#0F172A' }}>{card.value}</div>
                        <div className="text-xs font-medium mt-1" style={{ color: '#64748B' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Başlangıç Rehberi */}
                <div className="lg:col-span-2" style={CARD_STYLE}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm" style={{ color: '#0F172A' }}>🚀 Başlangıç Rehberi</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                            {completedSteps}/2 tamamlandı
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: '#E2E8F0' }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(completedSteps / 2) * 100}%`, background: '#2563EB' }}
                        />
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                done: channels > 0,
                                title: 'Kanalınızı Ekleyin',
                                desc: 'Telegram kanalınızı dizine ekleyin. Ücretsiz ve hızlı.',
                                href: '/dashboard/kanal-ekle',
                                cta: 'Kanal Ekle',
                            },
                            {
                                done: activeAds > 0,
                                title: 'İlk Reklamınızı Oluşturun',
                                desc: 'Kanalınızı 290K+ aylık ziyaretçiye tanıtın.',
                                href: '/dashboard/ads',
                                cta: 'Reklam Oluştur',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{
                                    background: item.done ? '#F0FDF4' : '#F8FAFC',
                                    border: `1px solid ${item.done ? '#BBF7D0' : '#E2E8F0'}`,
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                                    style={{
                                        background: item.done ? '#DCFCE7' : '#EFF6FF',
                                        color: item.done ? '#16A34A' : '#2563EB',
                                    }}
                                >
                                    {item.done ? <CheckCircle2 size={16} /> : i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-sm font-semibold"
                                        style={{ color: item.done ? '#64748B' : '#0F172A', textDecoration: item.done ? 'line-through' : 'none' }}
                                    >
                                        {item.title}
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{item.desc}</div>
                                </div>
                                {!item.done && (
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all"
                                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                                    >
                                        {item.cta} <ArrowRight size={11} />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ Panel */}
                <div className="space-y-3">
                    {/* Platform Stats */}
                    <div style={CARD_STYLE}>
                        <h3 className="font-bold text-sm mb-4" style={{ color: '#0F172A' }}>📊 Platform</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Aylık Görüntülenme', value: '290K+', icon: BarChart2, color: '#7C3AED' },
                                { label: 'Kayıtlı Kanal', value: '1.400+', icon: Tv, color: '#2563EB' },
                                { label: 'Reklamın Önüne Geç', value: '1. Sıra', icon: Zap, color: '#D97706' },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                                        <s.icon size={13} style={{ color: s.color }} />
                                        {s.label}
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: '#0F172A' }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hızlı Erişim */}
                    <div style={CARD_STYLE}>
                        <h3 className="font-bold text-sm mb-3" style={{ color: '#0F172A' }}>Hızlı Erişim</h3>
                        <div className="space-y-2">
                            {[
                                { href: '/dashboard/channels', label: 'Kanallarım', icon: Tv },
                                { href: '/dashboard/ads', label: 'Reklamlarım', icon: TrendingUp },
                                { href: '/dashboard/stats', label: 'İstatistikler', icon: BarChart2 },
                            ].map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm transition-all"
                                    style={{ color: '#475569' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                >
                                    <link.icon size={15} style={{ color: '#94A3B8' }} />
                                    {link.label}
                                    <ArrowRight size={13} className="ml-auto" style={{ color: '#CBD5E1' }} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
