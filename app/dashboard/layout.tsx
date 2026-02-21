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
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/app/actions/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Kanallarım', href: '/dashboard/channels', icon: Tv },
        { name: 'Jeton & Bakiye', href: '/dashboard/billing', icon: CreditCard },
        { name: 'Reklamlarım', href: '/dashboard/ads', icon: TrendingUp },
        { name: 'Bot Ayarları', href: '/dashboard/bot', icon: Settings },
        { name: 'İstatistikler', href: '/dashboard/stats', icon: PieChart },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Toggle */}
            <button
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                            <span className="font-bold text-gray-900 tracking-tight">Kanal Paneli</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut size={20} />
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <h1 className="text-lg font-bold text-gray-900">
                        {menuItems.find(i => i.href === pathname)?.name || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Link href="/kanal-ekle" className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
                            <PlusCircle size={18} /> Yeni Kanal
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                            <PieChart size={18} />
                        </div>
                    </div>
                </header>

                {/* Dynamic Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
