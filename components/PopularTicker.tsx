'use client';

import Link from 'next/link';
import { Channel } from '@/lib/types';

interface PopularTickerProps {
    channels: Channel[];
}

export default function PopularTicker({ channels }: PopularTickerProps) {
    if (!channels || channels.length === 0) return null;

    // Duplicate channels for infinite scroll effect
    const displayChannels = [...channels, ...channels, ...channels];

    return (
        <div className="w-full bg-white border-b border-gray-100 overflow-hidden py-2 relative">
            {/* Gradient Mask for edges */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-10"></div>

            <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
                {displayChannels.map((channel, idx) => (
                    <Link
                        key={`${channel.id}-${idx}`}
                        href={`/${channel.slug}`}
                        className="inline-flex items-center gap-2 px-6 group transition-colors hover:text-blue-600"
                    >
                        {channel.image ? (
                            <img
                                src={channel.image}
                                alt={channel.name}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                {channel.name[0]}
                            </div>
                        )}
                        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">{channel.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                            {channel.member_count?.toLocaleString()}
                        </span>
                        <span className="mx-2 text-gray-200">|</span>
                    </Link>
                ))}
            </div>

            <style jsx>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-ticker {
                    display: inline-flex;
                    animation: ticker 30s linear infinite;
                }
            `}</style>
        </div>
    );
}
