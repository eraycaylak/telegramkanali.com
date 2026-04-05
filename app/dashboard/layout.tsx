'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Tv,
    CreditCard,
    Settings,
    PieChart,
    LogOut,
    Menu,
    X,
    PlusCircle,
    TrendingUp,
    MessageCircle,
    Coins,
    Zap,
    ChevronRight,
    Phone,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/app/actions/auth';

interface DashboardLayoutProps {
    children: React.ReactNode;
    balance?: number;
}

const menuItems = [
    { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard, desc: 'Özet ve istatistikler' },
    { name: 'Kanallarım', href: '/dashboard/channels', icon: Tv, desc: 'Kanal yönetimi' },
    { name: 'Jeton & Ödeme', href: '/dashboard/billing', icon: CreditCard, desc: 'Bakiye ve satın alma', badge: 'YENİ' },
    { name: 'Reklamlarım', href: '/dashboard/ads', icon: TrendingUp, desc: 'Kampanya yönetimi' },
    { name: 'Bot Ayarları', href: '/dashboard/bot', icon: Settings, desc: 'Telegram bot entegrasyonu' },
    { name: 'İstatistikler', href: '/dashboard/stats', icon: PieChart, desc: 'Kanal analizleri' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const currentPage = menuItems.find(i => i.href === pathname);

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 text-white p-4 rounded-full shadow-2xl shadow-violet-900/50 border border-violet-500/30"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800/60 
                transform transition-transform duration-300 ease-in-out 
                lg:translate-x-0 lg:static lg:inset-0 flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-slate-800/60">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-violet-900/40">
                            T
                        </div>
                        <div>
                            <div className="font-black text-white text-sm tracking-tight">Telegram Kanalları</div>
                            <div className="text-[10px] text-slate-400 font-medium">Reklam Paneli</div>
                        </div>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                                    ${active
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }
                                `}
                            >
                                <item.icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-violet-400 transition-colors'} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    {!active && (
                                        <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5 group-hover:text-slate-400 transition-colors">
                                            {item.desc}
                                        </div>
                                    )}
                                </div>
                                {active && <ChevronRight size={14} className="text-white/60 shrink-0" />}
                            </Link>
                        );
                    })}

                    {/* Reklam Ver CTA */}
                    <div className="pt-4 mt-4 border-t border-slate-800/60">
                        <Link
                            href="/reklam"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/20 text-violet-300 hover:border-violet-500/40 hover:text-violet-200 transition-all group"
                        >
                            <Zap size={18} className="text-violet-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold">Reklam Ver</div>
                                <div className="text-[10px] text-violet-400/70 font-normal">290K+ aylık görüntülenme</div>
                            </div>
                            <ChevronRight size={14} className="text-violet-400/50 group-hover:text-violet-400 transition-colors" />
                        </Link>
                    </div>
                </nav>

                {/* İletişim & Çıkış */}
                <div className="p-4 border-t border-slate-800/60 space-y-2">
                    {/* Destek Butonu */}
                    <a
                        href="https://t.me/comtelegramkanali"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/30 transition-all w-full"
                    >
                        <Phone size={16} className="text-sky-400" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold">Destek & İletişim</div>
                            <div className="text-[10px] text-sky-400/70">@comtelegramkanali · 7/24</div>
                        </div>
                        <MessageCircle size={14} className="text-sky-400/60" />
                    </a>

                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-900/20 hover:text-red-400 transition-all"
                    >
                        <LogOut size={18} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
                {/* Top Header */}
                <header className="h-16 bg-slate-900/80 border-b border-slate-800/60 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold text-white">
                                {currentPage?.name || 'Dashboard'}
                            </h1>
                            {currentPage?.desc && (
                                <p className="text-[11px] text-slate-500 hidden sm:block">{currentPage.desc}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Quick Support */}
                        <a
                            href="https://t.me/comtelegramkanali"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 text-xs font-bold text-sky-400 bg-sky-400/10 px-3 py-2 rounded-lg border border-sky-400/20 hover:bg-sky-400/20 transition-all"
                        >
                            <MessageCircle size={14} />
                            Destek
                        </a>

                        <Link
                            href="/dashboard/billing"
                            className="flex items-center gap-1.5 text-xs font-bold text-violet-300 bg-violet-600/20 px-3 py-2 rounded-lg border border-violet-500/20 hover:bg-violet-600/30 transition-all"
                        >
                            <Coins size={14} />
                            <span className="hidden sm:inline">Jeton Yükle</span>
                        </Link>

                        <Link
                            href="/dashboard/kanal-ekle"
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 px-3 py-2 rounded-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/30"
                        >
                            <PlusCircle size={14} />
                            <span className="hidden sm:inline">Kanal Ekle</span>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
