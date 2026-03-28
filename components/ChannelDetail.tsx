'use client';

import { Channel } from '@/lib/types';
import { BadgeCheck, Users, Globe, Share2, Star, Eye, ExternalLink, MessageCircle, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ChannelDetailProps {
    channel: Channel;
}

function generateFingerprint(): string {
    const nav = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const screen = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
    let hash = 0;
    for (const char of (nav + screen)) {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}

export default function ChannelDetail({ channel }: ChannelDetailProps) {
    const categorySlug = (channel as any).categories?.slug || '';
    const categoryName = channel.categoryName || 'Genel';

    const [score, setScore] = useState(channel.score || 0);
    const [userVote, setUserVote] = useState<number | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);

    const [activityVote, setActivityVote] = useState<'active' | 'inactive' | null>(null);
    const [activitySent, setActivitySent] = useState(false);
    const [imageError, setImageError] = useState(false);

    const [fingerprint, setFingerprint] = useState('');

    useEffect(() => {
        const fp = generateFingerprint();
        setFingerprint(fp);

        const votedChannels = JSON.parse(localStorage.getItem('votedChannels') || '{}');
        if (votedChannels[channel.id]) {
            setHasVoted(true);
            setUserVote(votedChannels[channel.id]);
        }

        const activityVotes = JSON.parse(localStorage.getItem('activityVotes') || '{}');
        if (activityVotes[channel.id]) {
            setActivityVote(activityVotes[channel.id]);
            setActivitySent(true);
        }
    }, [channel.id]);

    const handleVote = async (type: 1 | -1) => {
        if (voteLoading || hasVoted) {
            if (hasVoted) alert('Bu kanala zaten oy verdiniz!');
            return;
        }
        setVoteLoading(true);
        const oldScore = score;
        setScore(s => s + type);
        setUserVote(type);

        try {
            const { voteChannel } = await import('@/app/actions/vote');
            const res = await voteChannel(channel.id, type, fingerprint);

            if (res.error) {
                setScore(oldScore);
                setUserVote(null);
                alert(res.error);
            } else if (res.success && res.newScore !== undefined) {
                setScore(res.newScore);
                setHasVoted(true);
                const votedChannels = JSON.parse(localStorage.getItem('votedChannels') || '{}');
                votedChannels[channel.id] = type;
                localStorage.setItem('votedChannels', JSON.stringify(votedChannels));
            }
        } catch (err) {
            console.error('Vote error:', err);
            setScore(oldScore);
        } finally {
            setVoteLoading(false);
        }
    };

    const handleActivityVote = (vote: 'active' | 'inactive') => {
        if (activitySent) return;
        setActivityVote(vote);
        setActivitySent(true);
        const activityVotes = JSON.parse(localStorage.getItem('activityVotes') || '{}');
        activityVotes[channel.id] = vote;
        localStorage.setItem('activityVotes', JSON.stringify(activityVotes));
        // Could also send to server here for analytics
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: channel.name,
                text: `${channel.name} Telegram kanalına katıl!`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Hero */}
            <div className="relative h-48 md:h-64 overflow-hidden group">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-50 transition-transform duration-700 group-hover:scale-125"
                    style={{ backgroundImage: `url(${(!imageError && channel.image) || '/images/logo.png'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="relative flex-shrink-0">
                            {channel.image && channel.image !== '/images/logo.png' && !imageError ? (
                                <img
                                    src={channel.image}
                                    alt={channel.name}
                                    onError={() => setImageError(true)}
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white/20 shadow-2xl object-cover bg-white"
                                />
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white/20 shadow-2xl bg-white flex items-center justify-center text-4xl font-bold text-blue-600">
                                    {channel.name.charAt(0)}
                                </div>
                            )}
                            {channel.verified && (
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg ring-4 ring-black/20">
                                    <BadgeCheck size={20} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left text-white mb-2">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-blue-100 mb-3 border border-white/10 hover:bg-white/20 transition cursor-pointer">
                                <Link href={`/${categorySlug}`}>📂 {categoryName}</Link>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 drop-shadow-md">
                                {channel.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-300 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Users size={16} className="text-blue-400" />
                                    {channel.member_count ? new Intl.NumberFormat('tr-TR').format(channel.member_count) : '---'} Üye
                                </span>
                                <span className="flex items-center gap-1.5 text-yellow-400">
                                    <Star size={16} fill="currentColor" />
                                    Puan: {score >= 0 ? '+' : ''}{score}
                                </span>
                            </div>
                        </div>

                        <div className="hidden md:flex gap-3 pb-2">
                            <a
                                href={`/go/${channel.id}`}
                                target="_blank"
                                rel="nofollow noreferrer"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                <MessageCircle size={20} />
                                KANALA KATIL
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-0">
                <div className="md:col-span-8 p-6 md:p-10 space-y-8 border-r border-gray-100">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-blue-600 mb-1 flex justify-center"><Users size={24} /></div>
                            <div className="font-bold text-gray-900 text-lg">{channel.member_count?.toLocaleString('tr-TR') || '-'}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Abone</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-green-600 mb-1 flex justify-center"><Star size={24} /></div>
                            <div className="font-bold text-gray-900 text-lg">{score >= 0 ? '+' : ''}{score}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Puan</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-purple-600 mb-1 flex justify-center"><Eye size={24} /></div>
                            <div className="font-bold text-gray-900 text-lg">{(channel as any).clicks || 0}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tıklama</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-orange-600 mb-1 flex justify-center"><ExternalLink size={24} /></div>
                            <div className="font-bold text-gray-900 text-lg">Aktif</div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Durum</div>
                        </div>
                    </div>

                    {/* Description */}
                    <section className="prose prose-lg prose-blue max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Globe size={24} /></span>
                            Kanal Hakkında
                        </h2>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            {channel.description || 'Bu kanal için henüz detaylı açıklama eklenmemiş. Telegram üzerinde daha fazla bilgi bulabilirsiniz.'}
                        </div>
                    </section>

                    {/* Vote Section */}
                    <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" />
                            Bu Kanalı Değerlendirin
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Kanalı beğendiniz mi? Oy vererek diğer kullanıcılara yardımcı olun.</p>
                        {hasVoted ? (
                            <div className="flex items-center gap-2 text-green-700 font-medium text-sm bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                                <CheckCircle2 size={18} />
                                Oyunuz kaydedildi. Katkınız için teşekkürler! (Puan: {score >= 0 ? '+' : ''}{score})
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleVote(1)}
                                    disabled={voteLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-green-600/20"
                                >
                                    <ThumbsUp size={18} /> Beğendim
                                </button>
                                <button
                                    onClick={() => handleVote(-1)}
                                    disabled={voteLoading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition-all disabled:opacity-50"
                                >
                                    <ThumbsDown size={18} /> Beğenmedim
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Activity Report */}
                    <section className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-blue-500" />
                            Bu kanal hâlâ aktif mi?
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Son paylaşım yapıldığını düşünüyor musunuz?</p>
                        {activitySent ? (
                            <div className="flex items-center gap-2 text-blue-700 font-medium text-sm bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                                <CheckCircle2 size={18} />
                                Bildiriminiz için teşekkürler!
                                {activityVote === 'active' ? ' Kanal aktif olarak işaretlendi.' : ' Kanal pasif olarak işaretlendi.'}
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleActivityVote('active')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-green-400 hover:bg-green-50 text-green-700 rounded-xl font-bold transition-all"
                                >
                                    <CheckCircle2 size={18} /> Evet, Aktif
                                </button>
                                <button
                                    onClick={() => handleActivityVote('inactive')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all"
                                >
                                    <XCircle size={18} /> Pasif / Ölü
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Sidebar */}
                <div className="md:col-span-4 bg-gray-50/50 p-6 md:p-8 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BadgeCheck className="text-blue-500" size={20} />
                            Güvenlik Kontrolü
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-center gap-2 text-green-700 font-medium">
                                <span className="bg-green-100 p-1 rounded-full">✓</span> Spam kontrolü yapıldı
                            </li>
                            <li className="flex items-center gap-2 text-green-700 font-medium">
                                <span className="bg-green-100 p-1 rounded-full">✓</span> İçerik doğrulandı
                            </li>
                            <li className="flex items-center gap-2 text-green-700 font-medium">
                                <span className="bg-green-100 p-1 rounded-full">✓</span> Aktif paylaşım
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-yellow-900 mb-2"> Reklam Vermek İster misiniz?</h3>
                            <p className="text-sm text-yellow-800 mb-4">Kanalınızı binlerce kişiye tanıtın.</p>
                            <Link href="/reklam" className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold py-3 rounded-xl transition-colors shadow-sm">
                                İLETİŞİME GEÇİN
                            </Link>
                        </div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-50 blur-2xl"></div>
                    </div>

                    <a
                        href={`https://t.me/sibelliee?text=Merhaba, şu kanalı şikayet etmek istiyorum: ${channel.name}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition text-red-600 font-bold bg-white mb-4"
                    >
                        <AlertTriangle size={20} />
                        Kanalı Şikayet Et / Kaldır
                    </a>

                    <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition text-gray-600 font-medium bg-white"
                    >
                        <Share2 size={20} />
                        Arkadaşlarınla Paylaş
                    </button>
                </div>
            </div>

            {/* Mobile Sticky Action Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 flex items-center gap-4 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
                <div className="flex-1">
                    <div className="text-xs text-gray-500">Telegram Kanalı</div>
                    <div className="font-bold text-gray-900 truncate">{channel.name}</div>
                </div>
                <a
                    href={`/go/${channel.id}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    KATIL
                </a>
            </div>
            <div className="md:hidden h-20"></div>
        </div>
    );
}
