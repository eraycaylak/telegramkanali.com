'use client';

import { Channel } from '@/lib/types';
import { BadgeCheck, Users, Globe, Share2, Star } from 'lucide-react';
import Link from 'next/link';

interface ChannelDetailProps {
    channel: Channel;
}

export default function ChannelDetail({ channel }: ChannelDetailProps) {
    // Determine category link (fallback to home if missing)
    const categorySlug = (channel as any).categories?.slug || '';
    const categoryName = channel.categoryName || 'Genel';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header / Banner Area */}
            <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative">
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="px-6 md:px-10 pb-10">
                {/* Logo & Identity */}
                <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    <div className="relative">
                        {channel.image && channel.image !== '/images/logo.png' ? (
                            <img
                                src={channel.image}
                                alt={channel.name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                                {channel.name.charAt(0)}
                            </div>
                        )}
                        {channel.verified && (
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm text-blue-500">
                                <BadgeCheck size={24} fill="currentColor" className="text-white" />
                                <BadgeCheck size={24} className="absolute inset-1" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-2">
                            {channel.name}
                            {channel.verified && <BadgeCheck className="text-blue-500" size={28} />}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                            <Link href={`/${categorySlug}`} className="bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition">
                                📂 {categoryName}
                            </Link>
                            <span className="flex items-center gap-1">
                                <Users size={16} />
                                {channel.member_count ? new Intl.NumberFormat('tr-TR').format(channel.member_count) : '---'} Üye
                            </span>
                            <span className="flex items-center gap-1 text-yellow-500 font-medium">
                                <Star size={16} fill="currentColor" />
                                {channel.rating || 5}/5
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href={channel.join_link}
                            target="_blank"
                            rel="nofollow noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                        >
                            KANALA KATIL
                        </a>
                        <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500" title="Paylaş">
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Kanal Hakkında</h2>
                            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                {channel.description || 'Bu kanal için henüz bir açıklama girilmemiş.'}
                            </div>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Neden Katılmalısın?</h3>
                            <ul className="list-disc list-inside text-blue-800 space-y-1">
                                <li>Güncel ve kaliteli paylaşımlar</li>
                                <li>{categoryName} alanında uzman içerikler</li>
                                <li>Güvenilir topluluk ortamı</li>
                            </ul>
                        </section>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">İstatistikler</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 text-sm">Takipçi</span>
                                    <span className="font-medium text-gray-900">{channel.member_count?.toLocaleString() || 'Veri Yok'}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 text-sm">Puan</span>
                                    <span className="font-medium text-green-600">+{channel.score}</span>
                                </div>
                                <div className="flex justify-between items-center pb-1">
                                    <span className="text-gray-500 text-sm">Dil</span>
                                    <span className="font-medium text-gray-900">Türkçe 🇹🇷</span>
                                </div>
                            </div>
                        </div>

                        {/* Advertisement Placeholder */}
                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
                            <p className="text-yellow-800 font-bold mb-2">🔥 Kanalını Öne Çıkar</p>
                            <p className="text-xs text-yellow-700 mb-3">Burada reklam vermek için iletişime geçin.</p>
                            <button className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded font-bold">
                                BİLGİ AL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
