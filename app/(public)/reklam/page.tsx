'use client';

import {
    TrendingUp,
    MousePointerClick,
    MonitorSmartphone,
    Star,
    Award,
    Zap,
    CheckCircle2,
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ReklamPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="bg-[#111] text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="container mx-auto px-4 py-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in-up">
                        <TrendingUp size={16} />
                        <span>Aylık 40.000+ Ziyaretçi Trafiği</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Kanalınızı <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Milyonlara</span> Duyurun
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Telegram kanali Türkiye'nin en büyük kanal dizini. Hedef kitlenize doğrudan ulaşın, abone sayınızı ve etkileşiminizi katlayın.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 text-left max-w-3xl mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">40K+</div>
                            <div className="text-sm text-gray-400 font-medium">Aylık Ziyaretçi</div>
                        </div>
                        <div className="w-px bg-white/10 hidden sm:block"></div>
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-1">%65</div>
                            <div className="text-sm text-gray-400 font-medium">Hemen Çıkma Oranı</div>
                        </div>
                        <div className="w-px bg-white/10 hidden sm:block"></div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-400 mb-1">2.5dk</div>
                            <div className="text-sm text-gray-400 font-medium">Ortalama Oturum</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Banner Ads */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl origin-center">EN POPÜLER</div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition">
                            <MonitorSmartphone size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Anasayfa Banner</h3>
                        <p className="text-gray-500 text-sm mb-6 h-10">Sitenin en görünür alanında, tüm ziyaretçilerin gördüğü tepe reklam alanı.</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-blue-500 transition">
                                <span className="font-bold text-gray-700">1 Aylık</span>
                                <span className="font-black text-xl text-blue-600">1.500 TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer relative">
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">İNDİRİM</div>
                                <span className="font-bold text-gray-700">3 Aylık</span>
                                <span className="font-black text-xl text-blue-600">3.000 TL</span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> %100 Görünürlük</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Masaüstü & Mobil Uyumlu</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> GIF Desteği</li>
                        </ul>

                        <a href="https://t.me/eraycaylak" target="_blank" className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
                            Satın Al
                        </a>
                    </div>

                    {/* Pop-Up */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pop-Up Reklam</h3>
                        <p className="text-gray-500 text-sm mb-6 h-10">Siteye giren herkese açılan, kapatılmadığı sürece ekranda kalan dev reklam.</p>

                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-4xl font-black text-purple-600">5.000 TL</span>
                            <span className="text-sm font-bold text-gray-400">/ Aylık</span>
                        </div>

                        <ul className="space-y-3 mb-8 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> En Yüksek Tıklama Oranı</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Tam Ekran Deneyimi</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Özel Tasarım Desteği</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Günlük Max 1 Gösterim (User)</li>
                        </ul>

                        <a href="https://t.me/eraycaylak" target="_blank" className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
                            Satın Al
                        </a>
                    </div>

                    {/* Editor Choice */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl origin-center">PRESTİJ</div>
                        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition">
                            <Award size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Editörün Seçimi</h3>
                        <p className="text-gray-500 text-sm mb-6 h-10">Anasayfada "Editörün Seçtikleri" listesinde sabit yerleşim.</p>

                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-4xl font-black text-yellow-600">2.000 TL</span>
                            <span className="text-sm font-bold text-gray-400">/ 6 Aylık</span>
                        </div>

                        <ul className="space-y-3 mb-8 text-sm text-gray-600">
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Uzun Süreli Görünürlük</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> "Güvenilir" Rozeti Algısı</li>
                            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Sabit Sıralama</li>
                        </ul>

                        <a href="https://t.me/eraycaylak" target="_blank" className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition">
                            Satın Al
                        </a>
                    </div>
                </div>

                {/* Secondary Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 flex-shrink-0">
                            <MousePointerClick size={32} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-900">Kategori Reklamı</h3>
                            <p className="text-gray-500 text-sm mt-1">Sadece ilgili kategoride (örn: Kripto veya Haber) en tepede çıkın. Hedefli reklam için ideal.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-pink-600">500 TL</div>
                            <div className="text-xs text-gray-400 font-bold">/ AYLIK</div>
                        </div>
                        <a href="https://t.me/eraycaylak" target="_blank" className="bg-pink-100 text-pink-700 hover:bg-pink-200 px-6 py-3 rounded-xl font-bold transition">
                            Satın Al
                        </a>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-yellow-400 flex-shrink-0 backdrop-blur-sm">
                            <Star size={32} fill="currentColor" />
                        </div>
                        <div className="flex-1 text-center md:text-left relative z-10">
                            <h3 className="text-xl font-bold">Kanalı Öne Çıkarma</h3>
                            <p className="text-gray-400 text-sm mt-1">Parayla satılamaz. Sadece kullanıcı oylarıyla "Haftanın En İyileri" listesine girebilirsiniz.</p>
                        </div>
                        <div className="relative z-10">
                            <span className="inline-block bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-4 py-2 rounded-lg font-bold text-sm">
                                SADECE OY İLE 🗳️
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-500 font-medium mb-4">Özel paketler ve detaylı bilgi için iletişime geçin</p>
                    <a
                        href="https://t.me/eraycaylak"
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-[#0088cc] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0077b5] transition shadow-lg shadow-blue-200"
                    >
                        <MessageCircle size={24} />
                        Telegram Üzerinden İletişime Geç
                    </a>
                </div>
            </div>
        </div>
    );
}
