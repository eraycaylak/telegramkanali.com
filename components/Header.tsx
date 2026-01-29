import Link from 'next/link';
import { Search } from 'lucide-react';
import { getCategories } from '@/lib/data';
import DynamicLogo from './DynamicLogo';

export default async function Header() {
    const categories = await getCategories();

    return (
        <header className="flex flex-col w-full text-white font-sans">

            {/* 1. Top Bar - Buttons */}
            <div className="bg-[#4a4a4a] border-b border-[#555]">
                <div className="container mx-auto px-6 h-12 flex items-center justify-end gap-4 text-[13px] font-bold">
                    <Link href="/kanal-ekle" className="flex items-center gap-1 border border-gray-300 rounded-full px-5 py-2 hover:bg-gray-600 transition tracking-wide text-gray-100 hover:text-white">
                        + KANAL EKLE
                    </Link>
                    <Link href="/populer" className="bg-[#cc0000] hover:bg-[#aa0000] rounded-full px-5 py-2 transition tracking-wide text-white shadow-lg">
                        POPÜLER GRUPLAR &gt;
                    </Link>
                </div>
            </div>

            {/* 2. Main Bar - Logo & Search */}
            <div className="bg-[#333333] py-6 relative overflow-hidden">
                {/* Subtle Diamond / Baklava Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Logo - Centered on Mobile, Left on Desktop */}
                    <div className="w-full md:w-auto flex justify-center md:justify-start">
                        <DynamicLogo />
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 relative w-full">
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

            {/* 3. Navigation Bar - Categories - BIGGER TEXT */}
            <div className="bg-black shadow-lg border-t border-[#222]">
                <div className="container mx-auto px-6">
                    <nav className="flex flex-wrap items-center gap-x-8 gap-y-4 py-5 text-[14px] font-bold tracking-wider text-white uppercase">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${cat.slug}`}
                                className="hover:text-white transition-colors whitespace-nowrap"
                            >
                                {cat.name.split('&')[0]}
                            </Link>
                        ))}
                        <Link href="/webmaster" className="hover:text-white transition-colors whitespace-nowrap">
                            WEBMASTER
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
