'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Public Segment Error:', error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bir Hata Oluştu!</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                İçerik yüklenirken bir sorunla karşılaştık. Bu durum geçici olabilir.
            </p>
            <button
                onClick={reset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
                <RefreshCw size={18} />
                Tekrar Dene
            </button>
        </div>
    );
}
