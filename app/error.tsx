'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Runtime Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Beklenmeyen Bir Hata Oluştu
            </h2>

            <p className="text-gray-500 max-w-md mb-8">
                Üzgünüz, bir şeyler yanlış gitti. Bu hatayı teknik ekibimize bildirdik.
                Lütfen sayfayı yenilemeyi deneyin veya anasayfaya dönün.
            </p>

            {error.digest && (
                <p className="text-xs text-gray-400 font-mono mb-4">
                    Error Digest: {error.digest}
                </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                >
                    <RefreshCw size={18} />
                    Tekrar Dene
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    <Home size={18} />
                    Anasayfaya Dön
                </Link>
            </div>
        </div>
    );
}
