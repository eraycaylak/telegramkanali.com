import Link from 'next/link'

export const dynamic = 'force-dynamic';

export default function PublicNotFound() {
    return (
        <div className="flex-1 container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">404</h2>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Sayfa Bulunamadı</h3>
            <p className="text-gray-600 mb-8 max-w-md">
                Aradığınız trend silinmiş, adı değiştirilmiş veya geçici olarak yayından kaldırılmış olabilir.
            </p>
            <Link
                href="/trends"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
            >
                Trendlere Dön
            </Link>
        </div>
    )
}
