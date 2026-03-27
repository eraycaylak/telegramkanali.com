import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '404 - Sayfa Bulunamadı | Telegram Kanalları',
    description: 'Aradığınız sayfa bulunamadı. Ana sayfaya dönün veya popüler Telegram kanallarını keşfedin.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return (
        <div className="flex-1 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
            {/* 404 Numarası */}
            <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 leading-none">
                404
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Sayfa Bulunamadı
            </h1>
            <p className="text-gray-600 mb-8 max-w-md text-lg">
                Aradığınız sayfa silinmiş, taşınmış veya hiç var olmamış olabilir.
                Ana sayfadan arama yapabilir ya da popüler kanalları keşfedebilirsiniz.
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
                <Link
                    href="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                >
                    🏠 Ana Sayfa
                </Link>
                <Link
                    href="/populer"
                    className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:shadow-md transition-all hover:scale-105"
                >
                    🔥 Popüler Kanallar
                </Link>
                <Link
                    href="/blog"
                    className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:shadow-md transition-all hover:scale-105"
                >
                    📝 Blog
                </Link>
            </div>

            {/* Popular Categories */}
            <div className="w-full max-w-lg border border-gray-100 rounded-2xl p-6 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Popüler Kategoriler</h2>
                <div className="flex flex-wrap gap-2 justify-center">
                    {[
                        { name: 'Haber', slug: 'haber-telegram-kanallari' },
                        { name: 'Kripto Para', slug: 'kripto-para' },
                        { name: 'Eğitim', slug: 'egitim' },
                        { name: 'İndirim', slug: 'indirim' },
                        { name: 'Spor', slug: 'spor' },
                        { name: 'Film & Dizi', slug: 'film-dizi' },
                    ].map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/${cat.slug}`}
                            className="bg-white border border-gray-200 text-sm text-gray-700 px-4 py-2 rounded-full hover:border-blue-400 hover:text-blue-600 transition"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
