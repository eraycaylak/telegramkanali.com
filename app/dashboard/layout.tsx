'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Tv,
    TrendingUp,
    Tag,
    BarChart2,
    LogOut,
    Menu,
    X,
    MessageCircle,
    ChevronRight,
    PlusCircle,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    {
        group: 'ANA',
        items: [
            { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        group: 'KANALLAR',
        items: [
            { name: 'Kanallarım', href: '/dashboard/channels', icon: Tv },
            { name: 'Kanal Ekle', href: '/dashboard/kanal-ekle', icon: PlusCircle },
        ],
    },
    {
        group: 'REKLAMLAR',
        items: [
            { name: 'Reklamlarım', href: '/dashboard/ads', icon: TrendingUp },
        ],
    },
    {
        group: 'MARKETPLACE',
        items: [
            { name: 'İlanlarım', href: '/dashboard/kanal-sat', icon: Tag },
        ],
    },
    {
        group: 'ANALİTİK',
        items: [
            { name: 'İstatistikler', href: '/dashboard/stats', icon: BarChart2 },
        ],
    },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const currentItem = NAV_ITEMS.flatMap(g => g.items).find(i =>
        i.href === pathname || (i.href !== '/dashboard' && pathname.startsWith(i.href))
    );

    return (
        <div
            className="min-h-screen flex"
            style={{ background: '#F1F5F9', fontFamily: "'Inter', 'system-ui', sans-serif" }}
        >
            {/* ── Mobile Overlay ── */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:inset-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ background: '#0F172A' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 h-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
                    >
                        T
                    </div>
                    <div>
                        <div className="text-white font-bold text-sm leading-tight">TelegramKanali</div>
                        <div className="text-xs" style={{ color: '#64748B' }}>Reklam Paneli</div>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-slate-400 hover:text-white transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
                    {NAV_ITEMS.map(group => (
                        <div key={group.group}>
                            <div
                                className="px-3 mb-1 text-[10px] font-bold tracking-widest uppercase"
                                style={{ color: '#334155' }}
                            >
                                {group.group}
                            </div>
                            {group.items.map(item => {
                                const active = item.href === '/dashboard'
                                    ? pathname === '/dashboard'
                                    : pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5"
                                        style={active
                                            ? { background: '#2563EB', color: '#FFFFFF' }
                                            : { color: '#94A3B8' }
                                        }
                                        onMouseEnter={e => {
                                            if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                        }}
                                        onMouseLeave={e => {
                                            if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                        }}
                                    >
                                        <item.icon size={17} />
                                        <span>{item.name}</span>
                                        {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="px-3 py-4 space-y-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {/* Reklam Ver */}
                    <Link
                        href="/reklam"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-2"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: '1px solid rgba(37,99,235,0.25)' }}
                    >
                        <Zap size={16} />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold">Reklam Ver</div>
                            <div className="text-[10px]" style={{ color: '#60A5FA', opacity: 0.7 }}>290K+ görüntülenme</div>
                        </div>
                    </Link>

                    {/* Destek */}
                    <Link
                        href="/dashboard/kanal-ekle"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                        style={{ color: '#64748B' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                        <MessageCircle size={16} />
                        <span>Destek</span>
                    </Link>

                    {/* Çıkış */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                        style={{ color: '#64748B' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                        <LogOut size={16} className={isLoggingOut ? 'animate-spin' : ''} />
                        <span>{isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Bar */}
                <header
                    className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 border-b"
                    style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 rounded-lg transition-colors"
                            style={{ color: '#64748B' }}
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                                {currentItem?.name || 'Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/kanal-ekle"
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
                            style={{ background: '#2563EB' }}
                        >
                            <PlusCircle size={14} />
                            Kanal Ekle
                        </Link>
                        <Link
                            href="/dashboard/kanal-ekle"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border"
                            style={{ color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF' }}
                        >
                            <Zap size={14} />
                            <span className="hidden sm:inline">Reklam Oluştur</span>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
