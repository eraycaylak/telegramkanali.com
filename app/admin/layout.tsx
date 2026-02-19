'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderTree, FileText, Users, Settings, LogOut, Menu, Image, Shield, BarChart, Send, BookOpen } from 'lucide-react';
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

        // Client-side auth check
        const checkAuth = async () => {
            const adminStatus = localStorage.getItem('isAdmin');
            // Check legacy local storage auth (mostly for dev/demo)
            // Ideally we should check supabase session or fetch profile

            if (adminStatus === 'true') {
                setIsAuthenticated(true);

                // Fetch profile to get permissions (Simulating "logged in user" since we don't have full Auth)
                // In a real app we'd use supabase.auth.getUser()
                // For now, let's fetch the first admin/editor profile or handle mock
                // Since this is a specialized requested feature, we'll try to get the profile if stored, 
                // OR we just use the local storage 'isAdmin' as a fallback master admin.
                // 
                // However, to test "Editor" role, we need a way to know WHICH user is logged in.
                // Since we don't have a login flow that sets a user ID, we will assume:
                // If localStorage has 'userId', use it. If not, assume 'admin' role.

                const storedUserId = localStorage.getItem('userId');
                if (storedUserId) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', storedUserId)
                        .single();

                    if (data) {
                        setUserProfile(data);
                        // If role is user, kick them out
                        if (data.role === 'user') {
                            setIsAuthenticated(false);
                            router.replace('/admin');
                        }
                    }
                } else {
                    // Fallback for legacy admin login (User 1)
                    setUserProfile({
                        id: 'admin',
                        email: 'admin@admin.com',
                        role: 'admin',
                        balance: 0,
                        created_at: new Date().toISOString()
                    });
                }

            } else {
                setIsAuthenticated(false);
                // Login sayfasına yönlendir
                router.replace('/admin');
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [pathname, router, isLoginPage]);

    // Role-based menu filtering
    const allMenuItems = [
        { name: 'Kanal Yönetimi', href: '/admin/dashboard', icon: LayoutDashboard, perm: 'manage_channels' },
        { name: 'Reklam Yönetimi', href: '/admin/ads', icon: Zap, perm: 'manage_banners' },
        { name: 'Toplu Kanal Ekle', href: '/admin/bulk-add', icon: Send, perm: 'manage_channels' },
        { name: 'Kategoriler', href: '/admin/categories', icon: FolderTree, perm: 'manage_categories' },
        { name: 'Bannerlar', href: '/admin/banners', icon: Image, perm: 'manage_banners' },
        { name: 'Analitik', href: '/admin/analytics', icon: BarChart, perm: 'view_analytics' },
        { name: 'Ödemeler', href: '/admin/deposits', icon: Shield, perm: 'manage_users' }, // Re-using Shield or similar
        { name: 'Blog Yönetimi', href: '/admin/blog', icon: BookOpen, perm: 'manage_blog' },
        { name: 'Sayfalar', href: '/admin/pages', icon: FileText, perm: 'manage_blog' },
        { name: 'Kullanıcılar', href: '/admin/users', icon: Users, perm: 'manage_users' },
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
                        onClick={() => {
                            localStorage.removeItem('isAdmin');
                            localStorage.removeItem('userId'); // Also clear userId
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
                    {menuItems.slice(0, 5).map((item) => {
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
                        onClick={() => { /* Could open a drawer for remaining links */ }}
                        className="flex flex-col items-center gap-1 px-3 py-1 text-gray-400"
                    >
                        <Menu size={22} />
                        <span className="text-[10px] font-bold">Daha</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
