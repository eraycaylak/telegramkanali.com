'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import DynamicLogo from './DynamicLogo';
import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';

interface HeaderClientProps {
    categories: Category[];
}

export default function HeaderClient({ categories }: HeaderClientProps) {
    const [menuOpen, setMenuOpen] = useState(false);

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
            <div className="hidden md:block bg-[#4a4a4a] border-b border-[#555]">
                <div className="container mx-auto px-6 h-12 flex items-center justify-end gap-4 text-[13px] font-bold">
                    <Link href="/kanal-ekle" className="flex items-center gap-1 border border-gray-300 rounded-full px-5 py-2 hover:bg-gray-600 transition tracking-wide text-gray-100 hover:text-white">
                        + KANAL EKLE
                    </Link>
                    <Link href="/populer" className="bg-[#cc0000] hover:bg-[#aa0000] rounded-full px-5 py-2 transition tracking-wide text-white shadow-lg">
                        POPÜLER GRUPLAR &gt;
                    </Link>
                </div>
            </div>

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
                        <DynamicLogo />
                    </div>

                    {/* Mobile: Search Button (Placeholder for now or modal trigger) */}
                    <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition" type="button" aria-label="Arama">
                        <Search size={24} />
                    </button>

                    {/* Desktop: Search Bar */}
                    <div className="hidden md:flex flex-1 relative w-full ml-8">
                        <input
                            type="text"
                            placeholder="Aradığınız grubu yazınız..."
                            className="w-full h-14 bg-[#555555] text-gray-100 placeholder-gray-400 rounded-full px-8 pr-14 text-base outline-none focus:bg-[#666] focus:ring-2 focus:ring-gray-400 transition-all shadow-inner"
                        />
                        <button className="absolute right-5 top-0 h-14 w-10 flex items-center justify-center text-gray-300 hover:text-white transition">
                            <Search size={26} />
                        </button>
                    </div>
                </div>
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
                            <Link href="/kanal-ekle" onClick={() => setMenuOpen(false)} className="py-2 px-3 bg-blue-600 rounded-lg text-sm font-semibold text-center">
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
