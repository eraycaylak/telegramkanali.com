'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Shield } from 'lucide-react';

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Kullanıcı daha önce tercih yaptıysa banner'ı gösterme
        const consent = localStorage.getItem('tk_cookie_consent');
        if (!consent) {
            // İlk ziyarette göster, ama biraz gecikmeyle (UX best practice)
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('tk_cookie_consent', 'accepted');
        document.cookie = 'tk_consent=1; max-age=31536000; path=/; SameSite=Lax';
        setVisible(false);
    };

    const reject = () => {
        localStorage.setItem('tk_cookie_consent', 'rejected');
        // Rejekte edince analitik çerezleri siliyoruz
        document.cookie = 'tk_visitor=; max-age=0; path=/';
        document.cookie = 'tk_consent=0; max-age=31536000; path=/; SameSite=Lax';
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slideUp">
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 p-5 md:p-6">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
                        <Cookie className="text-blue-600" size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={14} className="text-green-600" />
                            <h3 className="font-bold text-gray-900 text-sm">Çerez Politikası</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Deneyiminizi iyileştirmek ve site trafiğimizi analiz etmek için çerezler kullanıyoruz. 
                            Kişisel verileriniz üçüncü taraflarla paylaşılmaz. 
                            <Link href="/gizlilik" className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline underline-offset-2">
                                Gizlilik Politikası
                            </Link>
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            <button
                                onClick={accept}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30"
                            >
                                Kabul Et
                            </button>
                            <button
                                onClick={reject}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
                            >
                                Sadece Gerekli Olanlar
                            </button>
                            <Link
                                href="/gizlilik"
                                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-auto"
                            >
                                Detaylı Bilgi
                            </Link>
                        </div>
                    </div>

                    {/* Close */}
                    <button
                        onClick={reject}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Kapat"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}
