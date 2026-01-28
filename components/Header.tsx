import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { getCategories } from '@/lib/data';

export default async function Header() {
    const categories = await getCategories();

    return (
        <header className="flex flex-col w-full text-white font-sans">

            {/* 1. Top Bar - Dark Gray - Right Aligned Actions */}
            <div className="bg-[#222222] border-b border-[#333]">
                <div className="container mx-auto px-4 h-11 flex items-center justify-end gap-4 text-[11px] font-bold">
                    <Link href="/kanal-ekle" className="flex items-center gap-1 border border-gray-500 rounded-full px-4 py-1.5 hover:bg-gray-700 transition tracking-wide text-gray-300 hover:text-white">
                        + KANAL EKLE
                    </Link>
                    <Link href="/populer" className="bg-[#cc0000] hover:bg-[#aa0000] rounded-full px-4 py-1.5 transition tracking-wide text-white">
                        POPÜLER GRUPLAR &gt;
                    </Link>
                </div>
            </div>

            {/* 2. Main Bar - Gray - Logo & Search */}
            <div className="bg-[#333333] py-5">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center flex-shrink-0">
                        <img
                            src="/images/logo.png"
                            alt="Telegram Kanalları"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 w-full max-w-4xl relative">
                        <input
                            type="text"
                            placeholder="Aradığınız grubu yazınız..."
                            className="w-full h-12 bg-[#444444] text-gray-200 placeholder-gray-400 rounded-full px-6 pr-12 text-sm outline-none focus:bg-[#505050] transition-colors"
                        />
                        <button className="absolute right-4 top-0 h-12 w-8 flex items-center justify-center text-gray-400 hover:text-white">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Navigation Bar - Black - Categories */}
            <div className="bg-black shadow-md">
                <div className="container mx-auto px-4">
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 text-[12px] font-bold tracking-wider text-gray-400 uppercase">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/${cat.slug}`}
                                className="hover:text-white transition-colors whitespace-nowrap"
                            >
                                {cat.name.split('&')[0]}
                            </Link>
                        ))}
                        {/* Static Link from Screenshot */}
                        <Link href="/webmaster" className="hover:text-white transition-colors whitespace-nowrap mt-2 md:mt-0 block w-full md:w-auto md:hidden lg:inline-block">
                            WEBMASTER
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
