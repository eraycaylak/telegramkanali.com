import Link from 'next/link';
import { MessageCircle, Zap, Star, Wallet, CheckCircle2, ArrowRight, Phone } from 'lucide-react';

const TELEGRAM_CONTACT = 'https://t.me/comtelegramkanali';

const PACKAGES = [
    { label: 'Başlangıç', views: '10.000', usdt: '$15', stars: '250⭐' },
    { label: 'Büyüme', views: '35.000', usdt: '$40', stars: '700⭐' },
    { label: 'Pro', views: '100.000', usdt: '$90', stars: '1.500⭐', popular: true },
    { label: 'Elite', views: '300.000', usdt: '$200', stars: '3.500⭐' },
    { label: 'Ultra', views: '1.000.000', usdt: '$450', stars: '8.000⭐' },
];

export default function BillingPage() {
    return (
        <div className="space-y-6 text-white">

            {/* Hero */}
            <div className="relative bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl shadow-violet-950/60">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-3">Reklam Satın Al</p>
                    <h2 className="text-3xl font-black text-white mb-3">
                        Telegram Kanalınızı Öne Çıkarın
                    </h2>
                    <p className="text-violet-200/80 text-sm mb-6 max-w-lg">
                        ⭐ Telegram Yıldız veya 💎 USDT ile ödeme yapın.
                        Ödemenizi Telegram üzerinden bize bildirin, kanalınız <strong className="text-white">1 iş günü içinde</strong> öne çıkarılır.
                    </p>
                    <a
                        href={TELEGRAM_CONTACT}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-violet-700 font-black py-3 px-6 rounded-xl hover:bg-violet-50 transition-all text-sm shadow-lg"
                    >
                        <MessageCircle size={18} />
                        Telegram&apos;dan Yazın
                        <ArrowRight size={16} />
                    </a>
                </div>
            </div>

            {/* Paketler */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                    <Zap size={16} className="text-violet-400" />
                    Fiyat Paketleri
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PACKAGES.map(pkg => (
                        <div
                            key={pkg.label}
                            className={`relative rounded-2xl border p-4 transition-all ${pkg.popular
                                ? 'border-violet-500/50 bg-violet-500/10'
                                : 'border-slate-700/60 bg-slate-800/40'
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-black px-3 py-1 rounded-full whitespace-nowrap">
                                    ⭐ En Popüler
                                </div>
                            )}
                            <div className="font-black text-white mb-1">{pkg.label}</div>
                            <div className="text-xs text-slate-400 mb-3">👁 {pkg.views} görüntülenme</div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                                    <span className="text-amber-400 font-bold">⭐ Yıldız</span>
                                    <span className="font-black text-amber-400">{pkg.stars}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                                    <span className="text-emerald-400 font-bold">💎 USDT</span>
                                    <span className="font-black text-emerald-400">{pkg.usdt}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ödeme Yöntemleri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-500/25 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                            <Star size={22} className="text-amber-400" fill="currentColor" />
                        </div>
                        <div>
                            <div className="font-black text-white">⭐ Telegram Yıldız</div>
                            <div className="text-xs text-amber-400/70">Telegram üzerinden doğrudan</div>
                        </div>
                    </div>
                    <div className="space-y-1.5 mb-4">
                        {['Güvenli & anonim', 'Anında bildirim'].map(f => (
                            <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-amber-400" /> {f}
                            </div>
                        ))}
                    </div>
                    <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-sm py-2.5 rounded-xl hover:bg-amber-500/30 transition-all">
                        <MessageCircle size={14} /> Yıldız ile Satın Al
                    </a>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/25 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <Wallet size={22} className="text-emerald-400" />
                        </div>
                        <div>
                            <div className="font-black text-white">💎 USDT Kripto</div>
                            <div className="text-xs text-emerald-400/70">TRC-20 / BEP-20</div>
                        </div>
                    </div>
                    <div className="space-y-1.5 mb-4">
                        {['TRC-20 & BEP-20 destekli', '1 iş günü onay'].map(f => (
                            <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-emerald-400" /> {f}
                            </div>
                        ))}
                    </div>
                    <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm py-2.5 rounded-xl hover:bg-emerald-500/30 transition-all">
                        <MessageCircle size={14} /> USDT ile Satın Al
                    </a>
                </div>
            </div>

            {/* Nasıl Çalışır */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">📋 Nasıl Satın Alırsınız?</h3>
                <div className="space-y-3">
                    {[
                        { n: '1', text: 'Yukarıdan istediğiniz paketi ve ödeme yöntemini seçin.' },
                        { n: '2', text: 'Telegram kanalımıza yazın: hangi paketi istediğinizi ve ödeme yönteminizi belirtin.' },
                        { n: '3', text: 'Ödemeyi yapın. TX hash / ödeme ekranını bize gönderin.' },
                        { n: '4', text: 'Kanalınız 1 iş günü içinde listeye 1. sıraya eklenir.' },
                    ].map(s => (
                        <div key={s.n} className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-3">
                            <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {s.n}
                            </div>
                            <p className="text-sm text-slate-300">{s.text}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <a
                        href={TELEGRAM_CONTACT}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-900/30"
                    >
                        <MessageCircle size={18} />
                        Telegram&apos;dan Yazın (@comtelegramkanali)
                        <ArrowRight size={16} />
                    </a>
                    <Link
                        href="/reklam"
                        className="flex items-center justify-center gap-2 border border-slate-700 text-slate-300 font-bold py-3 px-5 rounded-xl text-sm hover:border-slate-600 hover:text-white transition-all"
                    >
                        Detaylı Bilgi
                    </Link>
                </div>
            </div>

            {/* Destek */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 bg-sky-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-sky-400" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-white text-sm">Sorunuz mu var?</p>
                    <p className="text-slate-400 text-xs mt-0.5">7/24 Telegram destek hattımızdan bize ulaşabilirsiniz.</p>
                </div>
                <a
                    href={TELEGRAM_CONTACT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs py-2 px-4 rounded-xl hover:bg-sky-500/30 transition-all shrink-0"
                >
                    <MessageCircle size={13} />
                    Yazın
                </a>
            </div>
        </div>
    );
}
