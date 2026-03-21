'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderTree, FileText, Users, Settings, LogOut, Menu, Image, Shield, BarChart, Send, BookOpen, Zap, Star, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/lib/types';

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
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Login sayfası kontrolü - login sayfasında auth check yapma
    const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

    useEffect(() => {
        // Login sayfasındaysa auth check yapma
        if (isLoginPage) {
            setIsLoading(false);
            setIsAuthenticated(true); // Login sayfasını göster
            return;
        }

        // Client-side auth check via Supabase Session
        const checkAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session?.user) {
                    setIsAuthenticated(false);
                    router.replace('/admin');
                    setIsLoading(false);
                    return;
                }

                // Fetch real profile to get role and permissions
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile && (profile.role === 'admin' || profile.role === 'editor')) {
                    setUserProfile(profile);
                    setIsAuthenticated(true);
                } else {
                    // Kick out if not admin or editor
                    setIsAuthenticated(false);
                    router.replace('/admin');
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                setIsAuthenticated(false);
                router.replace('/admin');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router, isLoginPage]);

    // Role-based menu filtering
    const allMenuItems = [
        { name: 'Kanal Yönetimi', href: '/admin/dashboard', icon: LayoutDashboard, perm: 'manage_channels' },
        { name: 'Kampanya Onayları', href: '/admin/campaigns', icon: Star, perm: 'manage_banners' },
        { name: 'Reklam Paketleri', href: '/admin/ads', icon: Zap, perm: 'manage_banners' },
        { name: 'Toplu Kanal Ekle', href: '/admin/bulk-add', icon: Send, perm: 'manage_channels' },
        { name: 'Kategoriler', href: '/admin/categories', icon: FolderTree, perm: 'manage_categories' },
        { name: 'Trend Yönetimi', href: '/admin/trends', icon: Zap, perm: 'manage_blog' },
        { name: 'Bannerlar', href: '/admin/banners', icon: Image, perm: 'manage_banners' },
        { name: 'Analitik', href: '/admin/analytics', icon: BarChart, perm: 'view_analytics' },
        { name: 'Ziyaretçi Profilleri', href: '/admin/visitors', icon: Users, perm: 'view_analytics' },
        { name: 'Ödemeler', href: '/admin/deposits', icon: Shield, perm: 'manage_users' }, // Re-using Shield or similar
        { name: 'Blog Yönetimi', href: '/admin/blog', icon: BookOpen, perm: 'manage_blog' },
        { name: 'Sayfalar', href: '/admin/pages', icon: FileText, perm: 'manage_blog' },
        { name: 'Kullanıcılar', href: '/admin/users', icon: Users, perm: 'manage_users' },
        { name: 'Yorumlar', href: '/admin/comments', icon: MessageSquare, perm: 'manage_blog' },
        { name: 'Ayarlar', href: '/admin/settings', icon: Settings }, // No perm = Admin only
    ];

    const menuItems = allMenuItems.filter(item => {
        if (!userProfile) return false;
        if (userProfile.role === 'admin') return true; // Admin sees everything
        if (userProfile.role === 'editor' && userProfile.permissions) {
            // Check if specific permission is granted
            if (item.perm && userProfile.permissions[item.perm as keyof typeof userProfile.permissions]) {
                return true;
            }
        }
        return false;
    });

    // Toggle for mobile full menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

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
        <div className="min-h-screen bg-gray-50 flex font-sans select-none">
            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <Link href="/admin/dashboard" className={`flex items-center gap-2 font-bold text-xl text-blue-600 ${!isSidebarOpen && 'hidden'}`}>
                        <span>Panel</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    <div className="mb-4 px-2">
                        {userProfile && (
                            <div className={`text-xs font-bold uppercase tracking-wider text-gray-400 ${!isSidebarOpen && 'hidden'}`}>
                                {userProfile.role === 'admin' ? 'Yönetici' : 'Editör'} Paneli
                            </div>
                        )}
                    </div>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className={`${!isSidebarOpen && 'hidden'}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/admin';
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        <span className={`${!isSidebarOpen && 'hidden'}`}>Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile Back Button or Title */}
                        <div className="md:hidden">
                            <span className="font-bold text-blue-600">Panel</span>
                        </div>
                        <h2 className="font-bold text-gray-900 hidden md:block">
                            {menuItems.find(i => i.href === pathname)?.name || 'Panel'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{userProfile?.full_name || 'Kullanıcı'}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{userProfile?.role || 'Üye'}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                            {userProfile?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Navigation (Visible only on mobile) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around px-2 py-3 z-40 pb-safe">
                    {menuItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${isActive
                                    ? 'text-blue-600 scale-110'
                                    : 'text-gray-400'
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-bold">{item.name.split(' ')[0]}</span>
                                {isActive && <div className="w-1 h-1 bg-blue-600 rounded-full"></div>}
                            </Link>
                        );
                    })}
                    {/* More Menu Trigger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center gap-1 px-3 py-1 text-gray-400"
                    >
                        <Menu size={22} />
                        <span className="text-[10px] font-bold">Daha</span>
                    </button>
                </nav>

                {/* Mobile Menu Drawer/Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
                        <div className="bg-white w-full rounded-t-3xl p-6 min-h-[50vh] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Tüm Menü</h3>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="p-2 bg-gray-100 rounded-full text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl gap-2 ${
                                                isActive ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}
                                        >
                                            <Icon size={24} />
                                            <span className="text-xs font-bold text-center">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.href = '/admin';
                                }}
                                className="mt-8 flex items-center justify-center gap-2 w-full px-4 py-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors font-bold"
                            >
                                <LogOut size={20} />
                                <span>Çıkış Yap</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
