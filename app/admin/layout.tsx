'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, FolderTree, FileText, Users, Settings, LogOut,
    Menu, Shield, BarChart, Send, BookOpen, MessageSquare, TrendingUp,
    Megaphone, ChevronDown, Star, Image, Zap, CreditCard, X, Wallet, LifeBuoy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/lib/types';

// ─── Menü Yapısı ──────────────────────────────────────────────────────────────
interface MenuItem {
    name: string;
    href: string;
    icon: any;
    perm?: string;
}

interface MenuGroup {
    label: string;
    icon: any;
    items: MenuItem[];
    perm?: string; // grup gösterim izni (en az 1 item'da bu izin varsa göster)
}

const MENU_GROUPS: MenuGroup[] = [
    {
        label: 'Genel',
        icon: LayoutDashboard,
        items: [
            { name: 'Kanal Yönetimi', href: '/admin/dashboard', icon: LayoutDashboard, perm: 'manage_channels' },
            { name: 'Toplu Kanal Ekle', href: '/admin/bulk-add', icon: Send, perm: 'manage_channels' },
            { name: 'Kategoriler', href: '/admin/categories', icon: FolderTree, perm: 'manage_categories' },
            { name: 'Trend Yönetimi', href: '/admin/trends', icon: TrendingUp, perm: 'manage_blog' },
        ],
    },
    {
        label: 'Reklamlar',
        icon: Megaphone,
        perm: 'manage_banners',
        items: [
            { name: 'Sponsor Yönetimi (1. Sıra)', href: '/admin/sponsor', icon: Star, perm: 'manage_banners' },
            { name: 'Bannerlar', href: '/admin/banners', icon: Image, perm: 'manage_banners' },
            { name: 'Öne Çıkanlar', href: '/admin/promoted', icon: Zap, perm: 'manage_banners' },
            { name: 'Kampanya Onayları', href: '/admin/campaigns', icon: Shield, perm: 'manage_banners' },
            { name: 'Reklam Paketleri', href: '/admin/ads', icon: CreditCard, perm: 'manage_banners' },
            { name: 'Ödemeler', href: '/admin/deposits', icon: CreditCard, perm: 'manage_users' },
            { name: '💎 USDT Ödemeleri', href: '/admin/usdt-payments', icon: Wallet, perm: 'manage_banners' },
            { name: 'Marketplace Sohbetleri', href: '/admin/marketplace', icon: MessageSquare, perm: 'manage_banners' },
        ],
    },
    {
        label: 'İçerik',
        icon: BookOpen,
        items: [
            { name: 'Blog Yönetimi', href: '/admin/blog', icon: BookOpen, perm: 'manage_blog' },
            { name: 'Sayfalar', href: '/admin/pages', icon: FileText, perm: 'manage_blog' },
            { name: 'Yorumlar', href: '/admin/comments', icon: MessageSquare, perm: 'manage_blog' },
        ],
    },
    {
        label: 'Kullanıcılar & Analitik',
        icon: BarChart,
        items: [
            { name: 'Analitik', href: '/admin/analytics', icon: BarChart, perm: 'view_analytics' },
            { name: 'Ziyaretçi Profilleri', href: '/admin/visitors', icon: Users, perm: 'view_analytics' },
            { name: 'Kullanıcılar', href: '/admin/users', icon: Users, perm: 'manage_users' },
            { name: '🎫 Destek Talepleri', href: '/admin/destek', icon: LifeBuoy, perm: 'manage_users' },
        ],
    },
    {
        label: 'Sistem',
        icon: Settings,
        items: [
            { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
        ],
    },
];

// ─── Layout Component ──────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Reklam grubu varsayılan olarak açık başlasın (reklam sayfasındaysak)
    const isInAdGroup = MENU_GROUPS.find(g => g.label === 'Reklamlar')?.items.some(i => pathname.startsWith(i.href));
    const [openGroups, setOpenGroups] = useState<Set<string>>(
        new Set(['Genel', isInAdGroup ? 'Reklamlar' : ''])
    );

    const isLoginPage = pathname === '/admin' || pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) { setIsLoading(false); setIsAuthenticated(true); return; }
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session?.user) { setIsAuthenticated(false); router.replace('/admin'); return; }
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profile && (profile.role === 'admin' || profile.role === 'editor')) {
                    setUserProfile(profile); setIsAuthenticated(true);
                } else { setIsAuthenticated(false); router.replace('/admin'); }
            } catch { setIsAuthenticated(false); router.replace('/admin'); }
            finally { setIsLoading(false); }
        };
        checkAuth();
        
        // Listen for auth state changes (logout, session expiry) instead of re-checking on each route
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                router.replace('/admin');
            }
        });
        return () => subscription.unsubscribe();
    }, [router, isLoginPage]);

    useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

    // Aktif sayfanın grubunu otomatik aç
    useEffect(() => {
        MENU_GROUPS.forEach(group => {
            if (group.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))) {
                setOpenGroups(prev => new Set([...prev, group.label]));
            }
        });
    }, [pathname]);

    function toggleGroup(label: string) {
        setOpenGroups(prev => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    }

    function canSeeItem(item: MenuItem): boolean {
        if (!userProfile) return false;
        if (userProfile.role === 'admin') return true;
        if (!item.perm) return false;
        return !!(userProfile.role === 'editor' && userProfile.permissions?.[item.perm as keyof typeof userProfile.permissions]);
    }

    function canSeeGroup(group: MenuGroup): boolean {
        return group.items.some(item => canSeeItem(item));
    }

    // Tüm öğelerin düz listesi — header title ve mobile nav için
    const allItems = MENU_GROUPS.flatMap(g => g.items);
    const currentPageName = allItems.find(i => i.href === pathname)?.name;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (isLoginPage) return <>{children}</>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-14 h-14 text-red-400 mx-auto mb-4" />
                    <h1 className="text-lg font-bold text-gray-800 mb-2">Erişim Reddedildi</h1>
                    <p className="text-gray-500 text-sm mb-4">Bu sayfaya erişmek için giriş yapmalısınız.</p>
                    <Link href="/admin" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold">Giriş Yap</Link>
                </div>
            </div>
        );
    }

    // ─── Sidebar Nav Content (memoized to prevent re-renders) ──────────
    const renderSidebarNav = (compact = false) => (
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {MENU_GROUPS.map(group => {
                if (!canSeeGroup(group)) return null;
                const visibleItems = group.items.filter(canSeeItem);
                const isGroupOpen = openGroups.has(group.label);
                const GroupIcon = group.icon;
                const hasActiveItem = visibleItems.some(i => pathname === i.href);

                return (
                    <div key={group.label}>
                        {/* Group Header */}
                        {!compact && (
                            <button
                                onClick={() => toggleGroup(group.label)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all mb-0.5
                                    ${hasActiveItem
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <GroupIcon size={14} />
                                <span className="flex-1 text-left">{group.label}</span>
                                <ChevronDown
                                    size={13}
                                    className={`transition-transform duration-200 ${isGroupOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                        )}

                        {/* Items */}
                        {(isGroupOpen || compact) && (
                            <div className={`space-y-0.5 ${!compact ? 'pl-2 border-l border-gray-100 ml-3.5 mb-2' : ''}`}>
                                {visibleItems.map(item => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm
                                                ${isActive
                                                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                                            {!compact && <span>{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans select-none">

            {/* ── Desktop Sidebar ── */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                    {isSidebarOpen && (
                        <Link href="/admin/dashboard" className="font-bold text-xl text-blue-600 truncate">
                            Admin Panel
                        </Link>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg shrink-0">
                        <Menu size={18} />
                    </button>
                </div>

                {isSidebarOpen ? renderSidebarNav() : renderSidebarNav(true)}

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 shrink-0">
                    {isSidebarOpen && userProfile && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                                {userProfile.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{userProfile.full_name || 'Kullanıcı'}</p>
                                <p className="text-[10px] text-gray-400 uppercase">{userProfile.role}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin'; }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        {isSidebarOpen && <span>Çıkış</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>

                {/* Header */}
                <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2 text-gray-500" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900 text-sm">
                                {currentPageName || 'Panel'}
                            </h2>
                            <p className="text-[10px] text-gray-400 hidden sm:block">Admin Paneli</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{userProfile?.full_name || 'Kullanıcı'}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{userProfile?.role || 'Üye'}</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                            {userProfile?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </main>
            </div>

            {/* ── Mobile Drawer ── */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative bg-white w-72 h-full flex flex-col shadow-2xl">
                        {/* Mobile header */}
                        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
                            <span className="font-bold text-blue-600">Admin Panel</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Mobile nav — same groups, always open */}
                        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                            {MENU_GROUPS.map(group => {
                                if (!canSeeGroup(group)) return null;
                                const visibleItems = group.items.filter(canSeeItem);
                                const GroupIcon = group.icon;
                                const hasActiveItem = visibleItems.some(i => pathname === i.href);

                                return (
                                    <div key={group.label} className="mb-2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg mb-1
                                            ${hasActiveItem ? 'text-blue-600' : 'text-gray-400'}`}>
                                            <GroupIcon size={12} />
                                            {group.label}
                                        </div>
                                        <div className="space-y-0.5 pl-2 border-l border-gray-100 ml-3.5">
                                            {visibleItems.map(item => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                                                            ${isActive
                                                                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
                                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <Icon size={16} />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>

                        {/* Mobile footer */}
                        <div className="p-4 border-t border-gray-100 shrink-0">
                            <button
                                onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin'; }}
                                className="flex items-center gap-2 w-full px-4 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors"
                            >
                                <LogOut size={16} />
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
