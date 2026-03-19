'use client';

import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100">
                        <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="text-red-600" size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kritik Sistem Hatası</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Sistem şu anda yanıt veremiyor. Bu durum genellikle geçici bir bağlantı sorunundan kaynaklanır.
                        </p>

                        {error.digest && (
                            <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-500 mb-6 select-all">
                                Hata Kodu: {error.digest}
                            </div>
                        )}

                        <button
                            onClick={() => reset()}
                            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Sistemi Yenile
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
