'use client';

import Link from 'next/link';
import { BadgeCheck, Users, ThumbsUp, ThumbsDown, ArrowUp } from 'lucide-react';
import { Channel } from '@/lib/types';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ChannelCardProps {
    channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
    const categoryName = channel.categoryName || 'Kategori Yok';
    const [score, setScore] = useState(channel.score || 0);
    const [userVote, setUserVote] = useState<number | null>(null); // 1, -1 or null
    const [loading, setLoading] = useState(false);

    const handleVote = async (type: 1 | -1) => {
        if (loading) return;
        setLoading(true);

        try {
            // Optimistic update
            const oldScore = score;
            const oldVote = userVote;
            setScore(s => s + type); // Immediately update UI
            setUserVote(type);

            // Using Server Action instead of Edge Function
            const { voteChannel } = await import('@/app/actions/vote');
            const res = await voteChannel(channel.id, type);

            if (res.error) {
                // Revert if error
                setScore(oldScore);
                setUserVote(oldVote);
                alert(res.error);
            } else if (res.success && res.newScore !== undefined) {
                setScore(res.newScore);
            }
        } catch (err) {
            console.error('Vote error:', err);
            alert('Oy verirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg">
            {/* Voting Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 flex flex-col items-center justify-center gap-2 border-r border-gray-100 z-30">
                <button
                    onClick={() => handleVote(1)}
                    disabled={loading}
                    className={`p-1 rounded hover:bg-gray-200 transition ${userVote === 1 ? 'text-green-600' : 'text-gray-400'}`}
                >
                    <ArrowUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
                </button>
                <span className={`font-bold text-sm ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {score}
                </span>
                <button
                    onClick={() => handleVote(-1)}
                    disabled={loading}
                    className={`p-1 rounded hover:bg-gray-200 transition ${userVote === -1 ? 'text-red-600' : 'text-gray-400'}`}
                >
                    <ThumbsDown size={14} className={userVote === -1 ? 'fill-current' : ''} />
                </button>
            </div>

            <div className="flex flex-1 gap-4 p-5 pl-16"> {/* Added padding-left for sidebar */}
                {/* Logo */}
                {channel.image && channel.image !== '/images/logo.png' ? (
                    <img
                        src={channel.image}
                        alt={channel.name}
                        className="h-14 w-14 flex-shrink-0 rounded-full object-cover border border-gray-200"
                    />
                ) : (
                    <div className="h-14 w-14 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-100">
                        {channel.name.charAt(0)}
                    </div>
                )}

                <div className="flex flex-col gap-1 w-full relative z-20">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex text-yellow-500 mb-1">
                                {[...Array(channel.rating || 5)].map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                <Link href={`/${channel.slug}`}>
                                    <span className="absolute inset-0 z-10" />
                                    {channel.name}
                                </Link>
                            </h3>
                        </div>
                        {channel.verified && (
                            <BadgeCheck className="h-5 w-5 text-blue-500 flex-shrink-0 ml-1" />
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{categoryName}</span>
                        <div className="flex items-center gap-1">
                            <Users size={12} />
                            {channel.stats.subscribers}
                        </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {channel.description}
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto px-5 pb-5 pt-0 relative z-20 pl-16">
                <Link
                    href={`/${channel.slug}`}
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                    İNCELE
                </Link>
            </div>
        </div>
    );
}
