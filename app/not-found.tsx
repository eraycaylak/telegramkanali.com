import Link from 'next/link'
import Header from '@/components/StaticHeader'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center max-w-3xl">
                {/* 404 Numarası */}
                <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 leading-none">
                    404
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h2>
                <p className="text-gray-600 mb-8 max-w-md text-lg">
                    Aradığınız Telegram kanalı veya sayfa silinmiş, adı değiştirilmiş veya taşınmış olabilir.
                    Popüler kanallarımıza göz atın veya arama yapın.
                </p>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 justify-center mb-10">
                    <Link
                        href="/"
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                    >
                        🏠 Anasayfa
                    </Link>
                    <Link
                        href="/18"
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all hover:scale-105"
                    >
                        🔞 +18 Kanalları
                    </Link>
                    <Link
                        href="/populer"
                        className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:shadow-md transition-all hover:scale-105"
                    >
                        🔥 Popüler
                    </Link>
                </div>

                {/* Popular Categories */}
                <div className="w-full border border-gray-100 rounded-2xl p-6 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Popüler Kategoriler</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[
                            { name: '+18', slug: '18', emoji: '🔞' },
                            { name: 'Haber', slug: 'haber', emoji: '📰' },
                            { name: 'Kripto Para', slug: 'kripto-para', emoji: '₿' },
                            { name: 'Eğitim', slug: 'egitim-ders', emoji: '📚' },
                            { name: 'Film & Dizi', slug: 'film-dizi', emoji: '🎬' },
                            { name: 'Spor', slug: 'spor', emoji: '⚽' },
                            { name: 'Sohbet', slug: 'sohbet', emoji: '💬' },
                            { name: 'İddaa', slug: 'iddaa', emoji: '🎯' },
                            { name: 'Ticaret', slug: 'ticaret', emoji: '💼' },
                        ].map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/${cat.slug}`}
                                className="bg-white border border-gray-200 text-sm text-gray-700 px-4 py-2 rounded-full hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-1.5"
                            >
                                <span>{cat.emoji}</span> {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Rehber Links - SEO internal linking */}
                <div className="w-full mt-6 border border-gray-100 rounded-2xl p-6 bg-white">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">📖 Rehberler</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link href="/rehber/en-iyi-telegram-kanallari" className="text-blue-600 hover:underline text-sm font-medium">En İyi Telegram Kanalları</Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/rehber/turk-telegram-kanallari" className="text-blue-600 hover:underline text-sm font-medium">Türk Telegram Kanalları</Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/rehber/aktif-telegram-kanallari" className="text-blue-600 hover:underline text-sm font-medium">Aktif Kanallar</Link>
                        <span className="text-gray-300">•</span>
                        <Link href="/rehber/ucretsiz-telegram-kanallari" className="text-blue-600 hover:underline text-sm font-medium">Ücretsiz Kanallar</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
