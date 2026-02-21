'use client';

import { useState, useEffect } from 'react';
import { getActiveAds } from '@/app/actions/tokens';
import AdTracker from '@/components/AdTracker';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, ExternalLink } from 'lucide-react';

interface FeaturedAdsProps {
    adType: 'featured' | 'banner' | 'story';
    maxAds?: number;
    categoryId?: string;
}

export default function FeaturedAds({ adType, maxAds = 6, categoryId }: FeaturedAdsProps) {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAds() {
            try {
                const data = await getActiveAds(adType, categoryId);
                // Çok fazla reklam olduğunda adil görünüm sağlamak için rastgele karıştır
                const shuffledData = data.sort(() => 0.5 - Math.random());
                setAds(shuffledData.slice(0, maxAds));
            } catch (error) {
                console.error('Error loading ads:', error);
            } finally {
                setLoading(false);
            }
        }
        loadAds();
    }, [adType, maxAds, categoryId]);

    if (loading || ads.length === 0) return null;

    if (adType === 'featured') {
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-purple-500" />
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Sponsorlu</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {ads.map((ad: any) => (
                        <AdTracker key={ad.id} campaignId={ad.id}>
                            <Link
                                href={ad.channels?.join_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white border border-purple-100 rounded-xl p-3 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3 relative overflow-hidden"
                            >
                                {ad.channels?.image ? (
                                    <Image
                                        src={ad.channels.image}
                                        alt={ad.channels.name}
                                        width={44}
                                        height={44}
                                        className="w-11 h-11 rounded-xl object-cover border border-purple-100 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100 flex-shrink-0">
                                        {ad.channels?.name?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 pr-14">
                                    <div className="font-bold text-gray-900 text-sm truncate group-hover:text-purple-600 transition">
                                        {ad.channels?.name}
                                    </div>
                                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
                                        {ad.channels?.member_count?.toLocaleString() || '0'} üye
                                    </div>
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                                        Reklam
                                    </span>
                                </div>
                            </Link>
                        </AdTracker>
                    ))}
                </div>
            </div>
        );
    }

    if (adType === 'banner') {
        return (
            <div className="mb-6">
                {ads.map((ad: any) => (
                    <AdTracker key={ad.id} campaignId={ad.id}>
                        <Link
                            href={ad.channels?.join_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-5 text-white hover:shadow-lg hover:shadow-purple-200 transition-all mb-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {ad.channels?.image && (
                                        <Image
                                            src={ad.channels.image}
                                            alt={ad.channels.name}
                                            width={56}
                                            height={56}
                                            className="w-14 h-14 rounded-xl object-cover border-2 border-white/30"
                                        />
                                    )}
                                    <div>
                                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full mb-1 inline-block">Sponsorlu</span>
                                        <div className="font-bold text-lg">{ad.channels?.name}</div>
                                        <p className="text-white/80 text-sm">
                                            {ad.channels?.member_count?.toLocaleString() || '0'} üye · {ad.channels?.description?.substring(0, 60)}
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-white text-purple-600 px-4 py-2 rounded-xl font-bold text-sm shrink-0">
                                    Katıl →
                                </span>
                            </div>
                        </Link>
                    </AdTracker>
                ))}
            </div>
        );
    }

    // Story type
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {ads.map((ad: any) => (
                <AdTracker key={ad.id} campaignId={ad.id}>
                    <Link
                        href={ad.channels?.join_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-20 text-center group"
                    >
                        <div className="w-16 h-16 mx-auto rounded-full border-2 border-purple-600 p-0.5 bg-gradient-to-tr from-purple-600 to-pink-600 mb-1">
                            {ad.channels?.image ? (
                                <Image
                                    src={ad.channels.image}
                                    alt={ad.channels.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                    {ad.channels?.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 truncate block">{ad.channels?.name}</span>
                        <span className="text-[9px] text-purple-500 font-bold">Reklam</span>
                    </Link>
                </AdTracker>
            ))}
        </div>
    );
}
