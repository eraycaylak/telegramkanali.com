'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, Users, ThumbsUp, ThumbsDown, ArrowUp, ExternalLink, AlertTriangle } from 'lucide-react';
import { Channel } from '@/lib/types';
import { useState, useEffect } from 'react';

interface ChannelCardProps {
    channel: Channel;
    compact?: boolean;
}

// Generate a simple browser fingerprint
function generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
    }
    const canvasData = canvas.toDataURL();

    const data = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvasData.slice(-50) // Last 50 chars of canvas
    ].join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

export default function ChannelCard({ channel, compact = false }: ChannelCardProps) {
    const categoryName = channel.categoryName || 'Kategori Yok';
    const [score, setScore] = useState(channel.score || 0);
    const [userVote, setUserVote] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [fingerprint, setFingerprint] = useState<string>('');
    const [hasVoted, setHasVoted] = useState(false);
    // const compact = ... removed

    useEffect(() => {
        // ... (keep existing useEffect)
        const fp = generateFingerprint();
        setFingerprint(fp);

        const votedChannels = JSON.parse(localStorage.getItem('votedChannels') || '{}');
        if (votedChannels[channel.id]) {
            setHasVoted(true);
            setUserVote(votedChannels[channel.id]);
        }
    }, [channel.id]);

    const handleVote = async (type: 1 | -1) => {
        // ... (keep existing handleVote)
        if (loading || hasVoted) {
            if (hasVoted) alert('Bu kanala zaten oy verdiniz!');
            return;
        }
        setLoading(true);

        try {
            const oldScore = score;
            setScore(s => s + type);
            setUserVote(type);

            const { voteChannel } = await import('@/app/actions/vote');
            const res = await voteChannel(channel.id, type, fingerprint);

            if (res.error) {
                setScore(oldScore);
                setUserVote(null);
                // alreadyVoted check removed as we now toggle votes
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
            alert('Oy verirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // COMPACT MODE (For Popular Channels)
    if (compact) {
        return (
            <div className="group relative flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200 text-center h-full">
                <Link href={`/${channel.slug}`} aria-label={channel.name} className="absolute inset-0 z-10" />

                <div className="mx-auto mb-3 relative">
                    {channel.image && channel.image !== '/images/logo.png' ? (
                        <Image
                            src={channel.image}
                            alt={channel.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-100">
                            {channel.name.charAt(0)}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-200 flex items-center gap-0.5">
                        <span>★</span> {score}
                    </div>
                </div>

                <h3 className="font-bold text-gray-900 text-sm mb-1 truncate px-1 group-hover:text-blue-600 transition-colors">
                    {channel.name}
                </h3>

                <p className="text-xs text-gray-500 mb-3 truncate px-2">
                    {categoryName}
                </p>

                <div className="mt-auto">
                    <button className="w-full bg-blue-50 text-blue-600 text-xs font-bold py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        İNCELE
                    </button>
                </div>
            </div>
        );
    }

    // NORMAL MODE
    const isSponsored = (channel as any).is_sponsored;

    return (
        <div className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg min-h-[72px] md:h-full ${isSponsored ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-200 hover:border-blue-300'}`}>
            {/* Sponsored Badge */}
            {isSponsored && (
                <div className="absolute top-0 left-3 md:left-14 z-30 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-b-md shadow-sm tracking-wider">
                    SPONS.
                </div>
            )}

            {/* Voting Sidebar (Desktop Only) */}
            <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-12 bg-gray-50 flex-col items-center justify-center gap-2 border-r border-gray-100 z-30">
                <button
                    onClick={() => handleVote(1)}
                    disabled={loading}
                    className={`p-1 rounded hover:bg-gray-200 transition ${userVote === 1 ? 'text-green-700' : 'text-gray-500'}`}
                >
                    <ArrowUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
                </button>
                <span className={`font-bold text-sm ${score > 0 ? 'text-green-700' : score < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                    {score}
                </span>
                <button
                    onClick={() => handleVote(-1)}
                    disabled={loading}
                    className={`p-1 rounded hover:bg-gray-200 transition ${userVote === -1 ? 'text-red-700' : 'text-gray-500'}`}
                >
                    <ThumbsDown size={14} className={userVote === -1 ? 'fill-current' : ''} />
                </button>
                <a
                    href={`https://t.me/sibelliee?text=Şikayet: ${channel.name}`}
                    target="_blank"
                    title="Şikayet Et"
                    className="p-1 mt-2 text-gray-400 hover:text-red-500 transition"
                >
                    <AlertTriangle size={16} />
                </a>
            </div>

            {/* Mobile View / Main Content Container */}
            <div className="flex flex-row flex-1 gap-3 md:gap-5 p-3 pr-14 md:p-5 md:pl-16 md:pr-5 items-center md:items-start text-left">
                {/* Logo */}
                {channel.image && channel.image !== '/images/logo.png' ? (
                    <Image
                        src={channel.image}
                        alt={channel.name}
                        width={80}
                        height={80}
                        className="h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                ) : (
                    <div className="h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl md:text-3xl border border-blue-100 shadow-sm">
                        {channel.name.charAt(0)}
                    </div>
                )}

                {/* Info Text */}
                <div className="flex flex-col gap-0.5 md:gap-1 w-full relative z-20 min-w-0 justify-center">
                    <div className="flex items-center w-full">
                        <div className="w-full flex items-center pr-2 md:pr-0">
                            {/* Star Rating mapped to small text on Mobile */}
                            <div className="hidden md:flex text-yellow-600 mr-1 text-[10px]">
                                {[...Array(channel.rating || 5)].map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <h3 className="font-bold text-gray-900 text-[15px] md:text-lg group-hover:text-blue-600 transition-colors truncate">
                                <Link href={`/${channel.slug}`}>
                                    <span className="absolute inset-0 z-10" />
                                    {channel.name}
                                </Link>
                            </h3>
                            {channel.verified && (
                                <BadgeCheck className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0 ml-1" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded-md truncate max-w-[100px] md:max-w-none font-medium">{categoryName}</span>
                        <div className="flex items-center gap-1 font-medium text-gray-700">
                            <Users size={12} className="text-blue-500" />
                            {channel.member_count ? (
                                new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(channel.member_count)
                            ) : (
                                channel.stats.subscribers
                            )}
                        </div>
                    </div>

                    <p className="mt-0.5 md:mt-2 text-[11px] md:text-sm text-gray-500 md:text-gray-600 line-clamp-1 md:line-clamp-2 leading-tight md:leading-normal">
                        {channel.description}
                    </p>
                </div>
            </div>

            {/* Mobile Small Join Button */}
            <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20">
                <a
                    href={`/go/${channel.id}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                    <ExternalLink size={16} />
                </a>
            </div>

            {/* Desktop Full Join Button */}
            <div className="hidden md:flex mt-auto px-5 pb-5 pt-0 relative z-20 pl-16">
                <span className="sr-only">
                    {channel.name} Telegram kanalı, {categoryName} kategorisinde aktif bir kanaldır.
                </span>
                <a
                    href={`/go/${channel.id}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                    KANALA GİT
                </a>
            </div>
        </div>
    );
}
