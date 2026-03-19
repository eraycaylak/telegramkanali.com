import Link from 'next/link'
import Header from '@/components/StaticHeader'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">404</h2>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sayfa Bulunamadı</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                    Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak servis dışı kalmış olabilir.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
                >
                    Anasayfaya Dön
                </Link>
            </div>
            <Footer />
        </div>
    )
}
