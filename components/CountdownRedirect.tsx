'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, ExternalLink, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackChannelClick } from '@/app/actions/analytics';

interface CountdownRedirectProps {
    channelId: string;
    channelName: string;
    channelImage: string | null;
    joinLink: string;
    categoryName: string;
    categorySlug: string;
    channelSlug: string;
    memberCount?: number;
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
    memberCount
}: CountdownRedirectProps) {
    const [seconds, setSeconds] = useState(WAIT_SECONDS);
    const [redirected, setRedirected] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Geri sayım — sona erince sadece yönlendir, tıklama SAYMA
    // Tıklama sadece kullanıcı butona basınca sayılır
    useEffect(() => {
        if (seconds <= 0) {
            setRedirected(true);
            // Geri sayım bitti, otomatik yönlendirmede de tıklama say
            // (kullanıcı sayfada bekledi, niyeti vardı)
            if (!clicked) {
                trackChannelClick(channelId).catch(() => {});
                setClicked(true);
            }
            window.location.href = joinLink;
            return;
        }
        const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds, joinLink, channelId, clicked]);

    const progress = ((WAIT_SECONDS - seconds) / WAIT_SECONDS) * 100;

    // Butona tıklanınca tıklama say ve yönlendir
    const handleJoinClick = () => {
        if (!clicked) {
            trackChannelClick(channelId).catch(() => {});
            setClicked(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
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
                                <p className="text-sm text-gray-500 mt-1">{memberCount ? memberCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0'} üye</p>
                            )}
                        </div>

                        {/* Countdown */}
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

                        {/* CTA Button — tıklama burada sayılır */}
                        <a
                            href={joinLink}
                            target="_blank"
                            rel="nofollow noreferrer"
                            onClick={handleJoinClick}
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

                {/* Bottom info */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    Üçüncü taraf linklere yönlendiriliyorsunuz. Dikkatli olun.
                </p>
            </div>
        </div>
    );
}
