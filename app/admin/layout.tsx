'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderTree, FileText, Users, Settings, LogOut, Menu, Image } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'Kanal Yönetimi', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Kategoriler', href: '/admin/categories', icon: FolderTree },
        { name: 'Bannerlar', href: '/admin/banners', icon: Image },
        { name: 'Sayfalar', href: '/admin/pages', icon: FileText },
        { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
        { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
    ];


    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <Link href="/admin/dashboard" className={`flex items-center gap-2 font-bold text-xl text-blue-600 ${!isSidebarOpen && 'hidden'}`}>
                        <span>Panel</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className={`${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <button
                        onClick={() => { localStorage.removeItem('isAdmin'); window.location.href = '/'; }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className={`${!isSidebarOpen && 'hidden'}`}>Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 px-8 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">
                        {menuItems.find(i => i.href === pathname)?.name || 'Panel'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Admin</span>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">A</div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
