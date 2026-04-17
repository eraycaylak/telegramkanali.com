'use client';

import Link from 'next/link';
import { BadgeCheck, Users, ExternalLink, ArrowUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Channel } from '@/lib/types';
import { useState } from 'react';

interface AdultChannelRowProps {
    channel: Channel;
    rank?: number;
}

export default function AdultChannelRow({ channel, rank }: AdultChannelRowProps) {
    const [score, setScore] = useState(channel.score || 0);
    const [voted, setVoted] = useState(false);

    const memberCount = channel.member_count
        ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(channel.member_count)
        : channel.stats?.subscribers || '—';

    const handleVote = async (type: 1 | -1, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (voted) return;
        setScore(s => s + type);
        setVoted(true);
    };

    return (
        <div className="group relative flex items-center gap-3 border-b border-gray-100 px-3 py-3 hover:bg-red-50/40 transition-colors">

            {/* Sıra numarası */}
            {rank !== undefined && (
                <span className="w-7 shrink-0 text-center text-xs font-black text-gray-300 tabular-nums">
                    {rank}
                </span>
            )}

            {/* Oy */}
            <div className="flex flex-col items-center gap-0.5 shrink-0 w-8">
                <button
                    onClick={(e) => handleVote(1, e)}
                    title="Beğen"
                    className={`p-0.5 rounded transition-colors ${voted ? 'text-gray-300 cursor-default' : 'text-gray-400 hover:text-green-600'}`}
                >
                    <ArrowUp size={14} />
                </button>
                <span className={`text-[10px] font-black tabular-nums leading-none ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {score}
                </span>
                <button
                    onClick={(e) => handleVote(-1, e)}
                    title="Beğenme"
                    className={`p-0.5 rounded transition-colors ${voted ? 'text-gray-300 cursor-default' : 'text-gray-400 hover:text-red-600'}`}
                >
                    <ThumbsDown size={11} />
                </button>
            </div>

            {/* 🔞 Emoji avatar — fotoğraf YOK */}
            <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 border border-red-200 flex items-center justify-center text-sm font-black text-red-600 select-none">
                {channel.name.charAt(0).toUpperCase()}
            </div>

            {/* Ana içerik */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                        href={`/${channel.slug}`}
                        className="font-bold text-sm text-gray-900 group-hover:text-red-700 transition-colors truncate hover:underline"
                    >
                        {channel.name}
                    </Link>
                    {channel.verified && (
                        <BadgeCheck size={13} className="text-blue-500 shrink-0" />
                    )}
                    {channel.featured && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">ÖNE ÇIKAN</span>
                    )}
                </div>
                {channel.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5 max-w-xl leading-tight">
                        {channel.description}
                    </p>
                )}
                {/* Mobilde üye sayısı alt satırda */}
                <div className="flex items-center gap-2 mt-1 md:hidden">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Users size={10} className="text-blue-400" />
                        {memberCount}
                    </div>
                    <a
                        href={`/go/${channel.id}`}
                        target="_blank"
                        rel="nofollow noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full hover:bg-green-600 hover:text-white transition"
                    >
                        <ExternalLink size={9} />
                        Git
                    </a>
                </div>
            </div>

            {/* Desktop sağ blok */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
                {/* Üye sayısı */}
                <div className="flex items-center gap-1 text-xs text-gray-500 w-20 justify-end">
                    <Users size={12} className="text-blue-400" />
                    <span className="font-medium tabular-nums">{memberCount}</span>
                </div>

                {/* Şikayet */}
                <a
                    href={`https://t.me/sibelliee?text=Şikayet: ${channel.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    title="Şikayet Et"
                    className="p-1 text-gray-300 hover:text-red-400 transition"
                >
                    <AlertTriangle size={13} />
                </a>

                {/* Kanala Git */}
                <a
                    href={`/go/${channel.id}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs font-black text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                    <ExternalLink size={12} />
                    Katıl
                </a>
            </div>
        </div>
    );
}
