'use client';

import Link from 'next/link';
import { Home, Search, Flame, PlusCircle, Menu, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Category } from '@/lib/types';

interface MobileBottomNavProps {
    categories: Category[];
}

export default function MobileBottomNav({ categories }: MobileBottomNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSearch, setShowSearch] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close drawer on route change
    useEffect(() => {
        setShowDrawer(false);
        setShowSearch(false);
    }, [pathname]);

    // Focus search input when opened
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (showDrawer) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showDrawer]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/?q=${encodeURIComponent(searchTerm.trim())}`);
            setShowSearch(false);
            setSearchTerm('');
        }
    };

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { icon: Home, label: 'Ana Sayfa', href: '/', active: isActive('/') },
        { icon: Search, label: 'Ara', href: '#search', active: false, action: () => setShowSearch(true) },
        { icon: Flame, label: 'Popüler', href: '/populer', active: isActive('/populer') },
        { icon: PlusCircle, label: 'Ekle', href: '/kanal-ekle', active: isActive('/kanal-ekle') },
        { icon: Menu, label: 'Menü', href: '#menu', active: false, action: () => setShowDrawer(true) },
    ];

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 flex items-center justify-around px-1 pt-2 pb-safe z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else {
                                    router.push(item.href);
                                }
                            }}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 ${item.active
                                    ? 'text-blue-600'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon size={22} strokeWidth={item.active ? 2.5 : 1.8} />
                            <span className={`text-[10px] ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                            {item.active && <div className="w-1 h-1 bg-blue-600 rounded-full" />}
                        </button>
                    );
                })}
            </nav>

            {/* Search Overlay */}
            {showSearch && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowSearch(false)}>
                    <div
                        className="absolute top-0 left-0 right-0 bg-white shadow-2xl rounded-b-3xl p-5 pt-safe animate-in slide-in-from-top duration-200"
                        onClick={(e) => e.stopPropagation()}
                        style={{ paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)' }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex-1">Kanal Ara</h3>
                            <button onClick={() => setShowSearch(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X size={22} />
                            </button>
                        </div>
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Kanal veya grup ara..."
                                    className="w-full h-14 bg-gray-100 rounded-2xl px-5 pr-14 text-base outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-gray-200 transition-all"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition">
                                    <Search size={20} />
                                </button>
                            </div>
                        </form>
                        {/* Quick category links */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {categories.slice(0, 6).map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { router.push(`/${cat.slug}`); setShowSearch(false); }}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-xs font-medium rounded-full transition-colors"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* More Menu Drawer */}
            {showDrawer && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowDrawer(false)}>
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>

                        <div className="px-5 pb-6">
                            {/* Section: Kategoriler */}
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">Kategoriler</h3>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/${cat.slug}`}
                                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-colors active:scale-95"
                                    >
                                        <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Section: Hızlı Erişim */}
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Hızlı Erişim</h3>
                            <div className="space-y-1 mb-6">
                                {[
                                    { label: 'Yeni Eklenenler', href: '/yeni-eklenenler', emoji: '🆕' },
                                    { label: 'Öne Çıkanlar', href: '/one-cikanlar', emoji: '⭐' },
                                    { label: 'Blog & İpuçları', href: '/blog', emoji: '📝' },
                                    { label: 'Reklam Ver', href: '/reklam', emoji: '📢' },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl transition-colors active:scale-[0.98]"
                                    >
                                        <span className="text-lg">{item.emoji}</span>
                                        <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Section: Kurumsal */}
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Kurumsal</h3>
                            <div className="space-y-1">
                                {[
                                    { label: 'Hakkımızda', href: '/hakkimizda' },
                                    { label: 'İletişim', href: '/iletisim' },
                                    { label: 'Gizlilik Politikası', href: '/gizlilik' },
                                    { label: 'Kullanım Şartları', href: '/kullanim-sartlari' },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block px-4 py-2.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
