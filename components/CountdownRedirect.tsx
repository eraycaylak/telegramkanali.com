'use client';

import { useEffect, useState, useTransition } from 'react';
import { MessageCircle, ExternalLink, Shield, ArrowRight, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { trackChannelClick } from '@/app/actions/analytics';
import { recordAgeVerification } from '@/app/actions/age-verification';
import AdsterraBanner from '@/components/AdsterraBanner';

interface CountdownRedirectProps {
    channelId: string;
    channelName: string;
    channelImage: string | null;
    joinLink: string;
    categoryName: string;
    categorySlug: string;
    channelSlug: string;
    memberCount?: number;
    /** Kanal +18 kategorisindeyse true — yaş kapısı zorunlu */
    requiresAgeVerification?: boolean;
    /** Sunucuda önceden kontrol edilmiş onay durumu */
    isAgeVerified?: boolean;
}

const WAIT_SECONDS = 10;

export default function CountdownRedirect({
    channelId,
    channelName,
    channelImage,
    joinLink,
    categoryName,
    categorySlug,
    channelSlug,
    memberCount,
    requiresAgeVerification = false,
    isAgeVerified = false,
}: CountdownRedirectProps) {
    const [seconds, setSeconds] = useState(WAIT_SECONDS);
    const [redirected, setRedirected] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Yaş kapısı: sunucu onayı yoksa ve +18 gerektiriyorsa modal aç
    const needsGate = requiresAgeVerification && !isAgeVerified;
    const [showAgeGate, setShowAgeGate] = useState(needsGate);
    const [ageAccepted, setAgeAccepted] = useState(!needsGate);
    const [isPending, startTransition] = useTransition();

    const progress = ((WAIT_SECONDS - seconds) / WAIT_SECONDS) * 100;

    // Geri sayım — yaş onayı verildikten sonra başlar
    useEffect(() => {
        if (!ageAccepted) return;

        if (seconds <= 0) {
            setRedirected(true);
            if (!clicked) {
                trackChannelClick(channelId).catch(() => {});
                setClicked(true);
            }
            window.location.href = joinLink;
            return;
        }
        const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds, joinLink, channelId, clicked, ageAccepted]);

    const handleJoinClick = () => {
        if (!clicked) {
            trackChannelClick(channelId).catch(() => {});
            setClicked(true);
        }
    };

    // Kullanıcı "+18 Yaşındayım" butonuna bastı
    const handleAgeAccept = () => {
        startTransition(async () => {
            await recordAgeVerification(channelId);
            setShowAgeGate(false);
            setAgeAccepted(true);
        });
    };

    // Kullanıcı reddetti — kanal sayfasına geri gönder
    const handleAgeDecline = () => {
        window.location.href = `/${channelSlug}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">

            {/* ─── +18 YAŞ KAPISI MODAL ─── */}
            {showAgeGate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <div className="relative z-10 w-full max-w-md bg-gray-900 border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20">
                        {/* Top accent */}
                        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600" />

                        <div className="p-8 text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-5">
                                <div className="w-20 h-20 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle size={40} className="text-orange-400" />
                                </div>
                            </div>

                            {/* Başlık */}
                            <h2 className="text-2xl font-black text-white mb-2">
                                +18 İçerik Uyarısı
                            </h2>
                            <p className="text-orange-300 font-semibold text-sm mb-5">
                                Bu kanal yalnızca 18 yaş ve üzeri kullanıcılara yöneliktir.
                            </p>

                            {/* Kanal adı */}
                            <div className="bg-gray-800/50 rounded-xl px-4 py-3 mb-6">
                                <p className="text-gray-300 text-sm">Hedef kanal:</p>
                                <p className="text-white font-bold">{channelName}</p>
                            </div>

                            {/* Açıklama */}
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                Devam ederek <strong className="text-white">18 yaşından büyük</strong> olduğunuzu,
                                bu içeriklere erişmenin bulunduğunuz yerde yasal olduğunu kabul etmiş olursunuz.
                                Onayınız 30 gün boyunca kaydedilecektir.
                            </p>

                            {/* Butonlar */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAgeAccept}
                                    disabled={isPending}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-black text-base shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
                                >
                                    {isPending ? 'Kaydediliyor...' : '✓ Evet, 18 Yaşından Büyüğüm — Devam Et'}
                                </button>

                                <button
                                    onClick={handleAgeDecline}
                                    disabled={isPending}
                                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 py-3 px-6 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={16} />
                                    Hayır, Geri Dön
                                </button>
                            </div>

                            {/* Yasal uyarı */}
                            <p className="text-gray-600 text-xs mt-5 leading-relaxed">
                                TCK Md. 226/7 kapsamında yaş doğrulama kaydı tutulmaktadır.
                                IP adresiniz onay kaydı için kullanılır. Detaylar için{' '}
                                <Link href="/gizlilik-politikasi" className="text-blue-400 hover:underline">
                                    gizlilik politikamızı
                                </Link>{' '}
                                inceleyin.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MEVCUT COUNTDOWN SAYFASI ─── */}
            <div className={`w-full max-w-lg transition-all duration-300 ${showAgeGate ? 'blur-sm pointer-events-none select-none' : ''}`}>
                {/* Card */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
                    {/* Top accent */}
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                        <div
                            className="h-full bg-white/30 transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="p-8">
                        {/* Site branding */}
                        <div className="text-center mb-6">
                            <Link href="/" className="text-sm text-gray-400 hover:text-blue-600 transition">
                                telegramkanali.com
                            </Link>
                        </div>

                        {/* +18 badge — sadece +18 kanallarında göster */}
                        {requiresAgeVerification && (
                            <div className="flex justify-center mb-4">
                                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    +18 Yetişkin İçeriği
                                </span>
                            </div>
                        )}

                        {/* Channel Avatar */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                {channelImage && channelImage !== '/images/logo.png' ? (
                                    <img
                                        src={channelImage}
                                        alt={channelName}
                                        className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-4 ring-blue-100"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-blue-100">
                                        {channelName.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                                    <div className="w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Channel Info */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black text-gray-900 mb-1">{channelName}</h1>
                            <Link href={`/${categorySlug}`} className="text-sm text-blue-600 font-medium hover:underline">
                                📂 {categoryName}
                            </Link>
                            {memberCount && memberCount > 0 && (
                                <p className="text-sm text-gray-500 mt-1">{memberCount.toLocaleString('tr-TR')} üye</p>
                            )}
                        </div>

                        {/* Countdown */}
                        {ageAccepted && (
                            <>
                                <div className="flex items-center justify-center mb-6">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="16" fill="none"
                                                stroke="url(#grad)" strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${progress} 100`}
                                            />
                                            <defs>
                                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#6366f1" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {redirected ? (
                                                <ArrowRight size={24} className="text-blue-600 animate-pulse" />
                                            ) : (
                                                <span className="text-2xl font-black text-gray-900">{seconds}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-sm text-gray-500 mb-6">
                                    {redirected ? 'Yönlendiriliyorsunuz...' : `${seconds} saniye içinde Telegram'a yönlendirileceksiniz`}
                                </p>
                            </>
                        )}

                        {/* Yaş onayı bekleniyor mesajı */}
                        {!ageAccepted && (
                            <p className="text-center text-sm text-orange-500 mb-6 font-semibold">
                                ⚠️ Lütfen yaş doğrulamasını tamamlayın
                            </p>
                        )}

                        {/* CTA Button */}
                        <a
                            href={ageAccepted ? joinLink : '#'}
                            target="_blank"
                            rel="nofollow noreferrer"
                            onClick={ageAccepted ? handleJoinClick : (e) => { e.preventDefault(); setShowAgeGate(true); }}
                            className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 px-6 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5 mb-4"
                        >
                            <MessageCircle size={22} />
                            HEMEN KATIL
                            <ExternalLink size={16} className="opacity-70" />
                        </a>

                        {/* Back link */}
                        <Link
                            href={`/${channelSlug}`}
                            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition"
                        >
                            ← Kanal sayfasına geri dön
                        </Link>

                        {/* Trust badges */}
                        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Shield size={12} className="text-green-500" /> Güvenli yönlendirme
                            </span>
                            <span>•</span>
                            <span>telegramkanali.com doğrulaması</span>
                        </div>
                    </div>
                </div>

                {/* Adsterra Native Banner Ad */}
                <div className="mt-6">
                    <AdsterraBanner />
                </div>

                {/* Bottom info */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    Üçüncü taraf linklere yönlendiriliyorsunuz. Dikkatli olun.
                </p>
            </div>
        </div>
    );
}
