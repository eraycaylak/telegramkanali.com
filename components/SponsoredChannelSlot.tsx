/**
 * SponsoredChannelSlot — Kanal listesinin 1. pozisyonuna featured reklam yerleştirir.
 *
 * - Server Component (SSR) — her sayfa yüklenişinde sunucu tarafında çalışır.
 * - Aktif featured kampanyalar arasından round-robin rotasyonla seçim yapar.
 * - Mevcut ChannelCard görünümüyle tutarlı ama "Reklam" badge'i içerir.
 * - AdTracker ile view sayar (IntersectionObserver).
 */

import Image from 'next/image';
import Link from 'next/link';
import { getActiveAds } from '@/app/actions/tokens';
import AdTracker from '@/components/AdTracker';
import { Users, ExternalLink, BadgeCheck } from 'lucide-react';

interface SponsoredChannelSlotProps {
    categoryId?: string;      // Kategori filtresi (opsiyonel)
    rotationSeed?: number;    // Rotasyon seed'i (sayfa, saat vs.)
}

export default async function SponsoredChannelSlot({ categoryId, rotationSeed }: SponsoredChannelSlotProps) {
    let ads: any[] = [];

    try {
        ads = await getActiveAds('featured', categoryId);
    } catch {
        return null;
    }

    if (!ads || ads.length === 0) return null;

    // Round-robin rotasyon: seed bazında bir reklam seç (max 10)
    const pool = ads.slice(0, 10);
    const seed = rotationSeed ?? Math.floor(Date.now() / 60000); // Her dakika değişir
    const selectedAd = pool[seed % pool.length];

    if (!selectedAd?.channels) return null;

    const ch = selectedAd.channels;
    const memberCount = ch.member_count
        ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ch.member_count)
        : null;

    return (
        <AdTracker campaignId={selectedAd.id}>
            {/* Etiket */}
            <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">⚡ Sponsorlu</span>
            </div>

            {/* Kart — ChannelCard ile aynı görünüm */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-purple-200 bg-white transition-all hover:shadow-lg hover:border-purple-400 ring-1 ring-purple-100 min-h-[72px] md:h-full">
                {/* Reklam işareti */}
                <div className="absolute top-0 left-3 md:left-14 z-30 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-b-md shadow-sm tracking-wider">
                    REKLAM
                </div>

                {/* Voting alanı placeholder (boş, layout uyumu için) */}
                <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-12 bg-purple-50 flex-col items-center justify-center gap-2 border-r border-purple-100 z-30">
                    <span className="text-purple-400 text-lg">⚡</span>
                </div>

                {/* Ana içerik */}
                <div className="flex flex-row flex-1 gap-3 md:gap-5 p-3 pr-14 md:p-5 md:pl-16 md:pr-5 items-center md:items-start text-left">
                    {/* Logo */}
                    {ch.image && ch.image !== '/images/logo.png' ? (
                        <Image
                            src={ch.image}
                            alt={ch.name}
                            width={80}
                            height={80}
                            loading="eager"
                            priority
                            className="h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-full object-cover border border-purple-200 shadow-sm"
                        />
                    ) : (
                        <div className="h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl md:text-3xl border border-purple-100 shadow-sm">
                            {ch.name?.charAt(0) || '?'}
                        </div>
                    )}

                    {/* Bilgi */}
                    <div className="flex flex-col gap-0.5 md:gap-1 w-full relative z-20 min-w-0 justify-center">
                        <div className="flex items-center w-full">
                            <div className="w-full flex items-center pr-2 md:pr-0">
                                {/* Stars */}
                                <div className="hidden md:flex text-yellow-500 mr-1 text-[10px]">
                                    {'★★★★★'}
                                </div>
                                <h3 className="font-bold text-gray-900 text-[15px] md:text-lg group-hover:text-purple-600 transition-colors truncate">
                                    <Link href={ch.slug ? `/${ch.slug}` : '#'}>
                                        <span className="absolute inset-0 z-10" />
                                        {ch.name}
                                    </Link>
                                </h3>
                                <BadgeCheck className="h-4 w-4 md:h-5 md:w-5 text-purple-500 flex-shrink-0 ml-1" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[100px] md:max-w-none border border-purple-100">
                                {ch.categories?.name || 'Öne Çıkan'}
                            </span>
                            {memberCount && (
                                <div className="flex items-center gap-1 font-medium text-gray-700">
                                    <Users size={12} className="text-purple-500" />
                                    {memberCount}
                                </div>
                            )}
                        </div>

                        {ch.description && (
                            <p className="mt-0.5 md:mt-2 text-[11px] md:text-sm text-gray-500 md:text-gray-600 line-clamp-1 md:line-clamp-2 leading-tight md:leading-normal">
                                {ch.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Mobil katılma butonu */}
                <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20">
                    <a
                        href={ch.join_link || (ch.slug ? `/${ch.slug}` : '#')}
                        target={ch.join_link ? '_blank' : undefined}
                        rel={ch.join_link ? 'nofollow noreferrer' : undefined}
                        className="flex w-full items-center justify-center rounded-lg bg-purple-600 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>

                {/* Desktop katılma butonu */}
                <div className="hidden md:flex mt-auto px-5 pb-5 pt-0 relative z-20 pl-16">
                    <a
                        href={ch.join_link || (ch.slug ? `/${ch.slug}` : '#')}
                        target={ch.join_link ? '_blank' : undefined}
                        rel={ch.join_link ? 'nofollow noreferrer' : undefined}
                        className="flex w-full items-center justify-center rounded-lg bg-purple-600 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
                    >
                        KANALA GİT
                    </a>
                </div>
            </div>
        </AdTracker>
    );
}
