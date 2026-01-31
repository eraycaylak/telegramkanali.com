'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderTree, FileText, Users, Settings, LogOut, Menu, Image, Shield, BarChart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Login sayfası kontrolü - login sayfasında auth check yapma
    const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

    useEffect(() => {
        // Login sayfasındaysa auth check yapma
        if (isLoginPage) {
            setIsLoading(false);
            setIsAuthenticated(true); // Login sayfasını göster
            return;
        }

        // Client-side auth check
        const checkAuth = () => {
            const adminStatus = localStorage.getItem('isAdmin');
            if (adminStatus === 'true') {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                // Login sayfasına yönlendir
                router.replace('/admin');
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [pathname, router, isLoginPage]);

    const menuItems = [
        { name: 'Kanal Yönetimi', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Kategoriler', href: '/admin/categories', icon: FolderTree },
        { name: 'Bannerlar', href: '/admin/banners', icon: Image },
        { name: 'Analitik', href: '/admin/analytics', icon: BarChart }, // New Link
        { name: 'Sayfalar', href: '/admin/pages', icon: FileText },
        { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
        { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
    ];

    // Loading durumu
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Login sayfası için sadece children göster
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Auth check - giriş yapılmamışsa hiçbir şey gösterme (yönlendirme olacak)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Erişim Reddedildi</h1>
                    <p className="text-gray-600 mb-4">Bu sayfaya erişmek için giriş yapmalısınız.</p>
                    <Link href="/admin" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

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
                        onClick={() => { localStorage.removeItem('isAdmin'); window.location.href = '/admin'; }}
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
