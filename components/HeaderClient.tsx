'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { LogIn, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import VisitorCounter from './VisitorCounter';

interface HeaderClientProps {
    categories: Category[];
    logo: React.ReactNode;
    user?: User | null;
}

export default function HeaderClient({ categories, logo, user: initialUser }: HeaderClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [loading, setLoading] = useState(false);

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
        <header className="flex flex-col w-full text-white font-sans">

            {/* 1. Top Bar - Hidden on Mobile */}
            {/* 1. Top Bar - Removed to simplify UI as requested */}


            {/* 2. Main Bar - Logo & Search & Mobile Menu */}
            <div className="bg-[#333333] py-3 md:py-6 relative overflow-hidden">
                {/* Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between md:justify-start gap-4 relative z-10">

                    {/* Mobile: Hamburger Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
                        type="button"
                        aria-label="Menüyü Aç"
                    >
                        <Menu size={28} />
                    </button>

                    {/* Logo - Centered on mobile via flex-1 or absolute centering if needed, but flex-1 text-center usually easiest or just justify-center */}
                    {/* Let's keep it simple: Menu (Left) - Logo (Center) - Search (Right) */}
                    <div className="flex-1 flex justify-center md:flex-none md:justify-start">
                        {logo}
                    </div>

                    {/* Mobile: Search Toggle Button */}
                    <button
                        onClick={() => setIsSearchVisible(!isSearchVisible)}
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
                        type="button"
                        aria-label="Arama"
                    >
                        <Search size={24} />
                    </button>

                    {/* Desktop: Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 relative w-full lg:max-w-xl ml-8">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Aradığınız grubu yazınız..."
                            className="w-full h-12 bg-[#555555] text-gray-100 placeholder-gray-400 rounded-full px-6 pr-12 text-sm outline-none focus:bg-[#666] focus:ring-2 focus:ring-gray-400 transition-all shadow-inner"
                        />
                        <button type="submit" className="absolute right-4 top-0 h-12 flex items-center text-gray-300 hover:text-white transition">
                            <Search size={22} />
                        </button>
                    </form>


                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3 ml-4">
                        <VisitorCounter />
                        <Link href="/dashboard/kanal-ekle" className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition">
                            + KANAL EKLE
                        </Link>

                        {!loading && (
                            user ? (
                                <>
                                    <Link href="/dashboard" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-full px-5 py-2.5 transition text-white shadow-md font-bold text-sm">
                                        <LayoutDashboard size={16} /> PANEL
                                    </Link>
                                    <button onClick={() => signOut()} className="bg-gray-700 p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-gray-600 transition" title="Çıkış Yap">
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-100 rounded-full px-6 py-2.5 transition shadow-md font-bold text-sm">
                                    <LogIn size={16} /> GİRİŞ YAP
                                </Link>
                            )
                        )}
                    </div>
                </div>

                {/* Mobile: Search Bar Toggleable */}
                {isSearchVisible && (
                    <div className="md:hidden px-4 pb-4 animate-in fade-in slide-in-from-top-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Grup ara..."
                                className="w-full h-12 bg-[#555555] text-gray-100 placeholder-gray-400 rounded-full px-6 pr-12 text-sm outline-none focus:bg-[#666]"
                                autoFocus
                            />
                            <button type="submit" className="absolute right-4 top-0 h-12 flex items-center text-gray-300">
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
                            <span className="font-bold text-lg">Kategoriler</span>
                            <button onClick={() => setMenuOpen(false)} className="p-1">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="p-4 flex flex-col gap-3">
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
