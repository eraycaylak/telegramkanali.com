'use client';

import Link from 'next/link';
import { Search, Menu, X, Flame, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Channel } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { LogIn, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import VisitorCounter from './VisitorCounter';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderClientProps {
    categories: Category[];
    logo: React.ReactNode;
    user?: User | null;
    recentChannels?: Channel[];
}

export default function HeaderClient({ categories, logo, user: initialUser, recentChannels = [] }: HeaderClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [loading, setLoading] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync searchTerm with URL if it changes externally
    useEffect(() => {
        setSearchTerm(searchParams.get('q') || '');
    }, [searchParams]);

    // Listen for auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateSearch(searchTerm);
    };

    const updateSearch = (term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.delete('page'); // Reset pagination on search
        router.push(`/?${params.toString()}`);
    };

    // Debounced search for typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get('q') || '')) {
                updateSearch(searchTerm);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [menuOpen]);

    return (
        <header className="flex flex-col w-full text-white font-sans relative z-50">

            {/* 1. Top Bar - Hidden on Mobile */}
            {/* 1. Top Bar - Removed to simplify UI as requested */}


            {/* 2. Main Bar - App Style Red Header */}
            {/* Using #E30613 which is exact Hürriyet brand red, avoiding any pink hues */}
            <div className="bg-[#E30613] py-3 md:py-4 relative z-20 shadow-md">
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">

                    {/* Left: Hamburger Menu (Mobile/Tablet) */}
                    <button 
                        className="md:hidden text-white p-1 -ml-1 hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menü"
                    >
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {/* Desktop: Empty space or menu for flex balance if needed, but we'll let logo sit left on Desktop */}
                    
                    {/* Logo: Centered on Mobile, Left on Desktop */}
                    <div className="flex-1 flex justify-center md:flex-none md:justify-start">
                        <Link href="/" className="scale-90 md:scale-100 origin-center block">
                            {logo}
                        </Link>
                    </div>

                    {/* Right: Actions (Mobile & Desktop) */}
                    <div className="flex items-center justify-end gap-3 md:gap-4 md:flex-1">
                        
                        {/* Mobile Actions */}
                        <div className="flex md:hidden items-center gap-3">
                            <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="text-white hover:text-white/80 transition-colors">
                                <Search size={22} />
                            </button>
                            
                            {/* Notification Dropdown Container */}
                            <div className="relative" ref={notificationsRef}>
                                <button 
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                                    className="text-white hover:text-white/80 transition-colors relative"
                                    aria-label="Bildirimler"
                                >
                                    {recentChannels.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-white text-[#E30613] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                            {recentChannels.length}
                                        </span>
                                    )}
                                    <Bell size={22} fill={isNotificationsOpen ? "currentColor" : "none"} />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {isNotificationsOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2">
                                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Son Eklenen Kanallar</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {recentChannels.length > 0 ? (
                                                recentChannels.map((channel) => (
                                                    <Link 
                                                        href={`/kanal/${channel.slug}`} 
                                                        key={`notif-${channel.id}`}
                                                        onClick={() => setIsNotificationsOpen(false)}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                            <img src={channel.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=random`} alt={channel.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-bold text-gray-900 truncate">{channel.name}</span>
                                                            <span className="text-[11px] text-gray-500 truncate">Yeni eklendi!</span>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Henüz kanal bulunmuyor.
                                                </div>
                                            )}
                                        </div>
                                        <Link 
                                            href="/kategoriler" 
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className="block w-full text-center py-2.5 bg-gray-50 text-[12px] font-black text-[#E30613] hover:bg-gray-100 transition-colors uppercase"
                                        >
                                            Tümünü Gör
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <Link href="/dashboard" className="whitespace-nowrap bg-[#B7050F] text-white flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-black tracking-wider shadow-sm border border-red-800/40">
                                    <UserIcon size={14} /> PANEL
                                </Link>
                            ) : (
                                <Link href="/login" className="whitespace-nowrap bg-[#B7050F] text-white flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-black tracking-wider shadow-sm border border-red-800/40">
                                    <UserIcon size={14} /> GİRİŞ
                                </Link>
                            )}
                        </div>

                        {/* Desktop: Search Bar */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 relative max-w-xl mx-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Arama yapın..."
                                className="w-full h-11 bg-white/10 text-white placeholder-white/60 rounded-full px-5 pr-12 text-sm outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-all shadow-inner border border-white/20"
                            />
                            <button type="submit" aria-label="Ara" className="absolute right-4 top-0 h-11 flex items-center text-white/80 hover:text-white transition">
                                <Search size={20} />
                            </button>
                        </form>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <LanguageSwitcher />
                            <VisitorCounter />
                            <Link href="/dashboard/kanal-ekle" className="whitespace-nowrap bg-white text-[#ed1c24] px-5 py-2 rounded-full font-bold text-sm shadow hover:bg-gray-100 transition">
                                + KANAL EKLE
                            </Link>

                            {!loading && (
                                user ? (
                                    <>
                                        <Link href="/dashboard" className="flex items-center gap-2 bg-[#c4151c] border border-red-700/50 hover:bg-[#a31117] rounded-full px-5 py-2 transition text-white shadow font-bold text-sm">
                                            <LayoutDashboard size={16} /> PANEL
                                        </Link>
                                        <button onClick={() => signOut()} aria-label="Çıkış Yap" className="bg-[#c4151c] border border-red-700/50 p-2 rounded-full text-white hover:bg-[#a31117] transition" title="Çıkış Yap">
                                            <LogOut size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" className="flex items-center gap-2 bg-[#c4151c] border border-red-700/50 hover:bg-[#a31117] text-white rounded-full px-5 py-2 transition shadow font-bold text-sm">
                                        <UserIcon size={16} /> GİRİŞ YAP
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Dropdown */}
                {isSearchVisible && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#ed1c24] p-4 border-t border-red-800/30 shadow-lg animate-in slide-in-from-top-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Arama yapın..."
                                className="w-full h-12 bg-white text-gray-900 placeholder-gray-500 rounded-lg px-4 pr-12 text-[15px] outline-none shadow-inner"
                                autoFocus
                            />
                            <button type="submit" className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-[#ed1c24]">
                                <Search size={20} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* 3. Navigation Bar - Desktop */}
            <div className="hidden md:block bg-black shadow-lg border-t border-[#222]">
                <div className="container mx-auto px-6">
                    <nav className="flex flex-wrap items-center gap-x-8 gap-y-4 py-5 text-[14px] font-bold tracking-wider text-white uppercase">
                        <Link href="/trends" className="hover:text-orange-400 text-orange-500 transition-colors whitespace-nowrap font-black flex items-center gap-1">
                            <Flame size={16} /> TRENDLER
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${cat.slug}`}
                                className="hover:text-gray-300 transition-colors whitespace-nowrap"
                            >
                                {cat.name.split('&')[0]}
                            </Link>
                        ))}
                        <Link href="/webmaster" className="hover:text-gray-300 transition-colors whitespace-nowrap">
                            WEBMASTER
                        </Link>
                        <Link href="/marketplace" className="hover:text-emerald-400 text-emerald-400 transition-colors whitespace-nowrap font-black">
                            💰 KANAL AL-SAT
                        </Link>
                        <Link href="/reklam" className="hover:text-yellow-400 text-yellow-500 transition-colors whitespace-nowrap font-black">
                            REKLAM VER
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Mobile Slide-in Menu */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/80" onClick={() => setMenuOpen(false)}>
                    <div
                        className="w-[280px] h-full bg-[#222] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <span className="font-bold text-lg">Menü</span>
                            <button onClick={() => setMenuOpen(false)} aria-label="Menüyü Kapat" className="p-1">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="p-4 flex flex-col gap-3">
                            <Link href="/trends" onClick={() => setMenuOpen(false)} className="py-2.5 px-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-bold text-center text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                                <Flame size={18} /> GÜNÜN TRENDLERİ
                            </Link>
                            
                            <div className="border-t border-gray-700 my-1"></div>
                            
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/${cat.slug}`}
                                    onClick={() => setMenuOpen(false)}
                                    className="py-2 px-3 bg-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-700 my-2"></div>

                            <Link href="/reklam" onClick={() => setMenuOpen(false)} className="py-2 px-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm font-bold text-center">
                                REKLAM VER / İLAN
                            </Link>

                            <Link href="/marketplace" onClick={() => setMenuOpen(false)} className="py-2 px-3 bg-emerald-600/15 text-emerald-400 border border-emerald-500/25 rounded-lg text-sm font-bold text-center">
                                💰 KANAL AL-SAT
                            </Link>

                            {user ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 px-3 bg-blue-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                        <LayoutDashboard size={18} /> DASHBOARD
                                    </Link>
                                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="py-2 px-3 bg-gray-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                        <LogOut size={18} /> ÇIKIŞ YAP
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2 px-3 bg-gray-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                    <LogIn size={18} /> GİRİŞ YAP
                                </Link>
                            )}
                            <Link href="/dashboard/kanal-ekle" onClick={() => setMenuOpen(false)} className="py-2 px-3 border border-gray-600 rounded-lg text-sm font-semibold text-center">
                                + KANAL EKLE
                            </Link>
                            <Link href="/populer" onClick={() => setMenuOpen(false)} className="py-2 px-3 bg-red-600 rounded-lg text-sm font-semibold text-center">
                                POPÜLER GRUPLAR
                            </Link>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
