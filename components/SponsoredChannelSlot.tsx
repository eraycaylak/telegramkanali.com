/**
 * SponsoredChannelSlot — Admin panelinden seçilen kanalı 1. sıraya yerleştirir.
 *
 * - Admin → /admin/sponsor sayfasından hangi kanalın 1. sıraya oturacağı belirlenir.
 * - `sponsored_slots` tablosundan aktif slot çekilir.
 * - Kategori bazlı filtreleme desteklenir (category_id = NULL → tüm sayfalar).
 * - AdTracker kullanılmaz (artık kampanya bazlı değil, düz slot).
 */
import Image from 'next/image';
import Link from 'next/link';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { Users, ExternalLink, BadgeCheck, Zap } from 'lucide-react';

interface SponsoredChannelSlotProps {
    categoryId?: string;
}

export default async function SponsoredChannelSlot({ categoryId }: SponsoredChannelSlotProps) {
    let channel: any = null;

    try {
        const db = getAdminClient();

        // Önce kategori'ye özel slot ara, yoksa genel (NULL) slota bak
        let slot: any = null;

        if (categoryId) {
            const { data } = await db
                .from('sponsored_slots')
                .select('*, channels(*, categories(name, slug))')
                .eq('is_active', true)
                .eq('category_id', categoryId)
                .order('position', { ascending: true })
                .limit(1)
                .maybeSingle();
            slot = data;
        }

        if (!slot) {
            // Genel slot (tüm sayfalar)
            const { data } = await db
                .from('sponsored_slots')
                .select('*, channels(*, categories(name, slug))')
                .eq('is_active', true)
                .is('category_id', null)
                .order('position', { ascending: true })
                .limit(1)
                .maybeSingle();
            slot = data;
        }

        channel = slot?.channels ?? null;
    } catch {
        return null;
    }

    if (!channel) return null;

    const memberCount = channel.member_count
        ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(channel.member_count)
        : null;

    return (
        <div>
            {/* Sponsor etiketi */}
            <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} className="text-violet-500 fill-violet-500" />
                <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Sponsorlu</span>
            </div>

            {/* Kart — ChannelCard ile aynı DOM yapısı */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-violet-200 bg-white transition-all hover:shadow-lg hover:border-violet-400 ring-1 ring-violet-100 min-h-[72px] md:h-full">
                {/* Reklam badge */}
                <div className="absolute top-0 left-3 md:left-14 z-30 bg-violet-600 text-white text-[9px] font-black px-2 py-0.5 rounded-b-md shadow-sm tracking-wider">
                    REKLAM
                </div>

                {/* Sol oy alanı (placeholder — layout uyumu) */}
                <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-12 bg-violet-50 flex-col items-center justify-center gap-2 border-r border-violet-100 z-30">
                    <Zap size={18} className="text-violet-400 fill-violet-100" />
                </div>

                {/* İçerik */}
                <div className="flex flex-row flex-1 gap-3 md:gap-5 p-3 pr-14 md:p-5 md:pl-16 md:pr-5 items-center md:items-start text-left">
                    {channel.image && channel.image !== '/images/logo.png' ? (
                        <Image
                            src={channel.image}
                            alt={channel.name}
                            width={80}
                            height={80}
                            loading="eager"
                            priority
                            className="h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-full object-cover border border-violet-200 shadow-sm"
                        />
                    ) : (
                        <div className="h-12 w-12 md:h-20 md:w-20 flex-shrink-0 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-xl md:text-3xl border border-violet-100 shadow-sm">
                            {channel.name?.charAt(0) || '?'}
                        </div>
                    )}

                    <div className="flex flex-col gap-0.5 md:gap-1 w-full relative z-20 min-w-0 justify-center">
                        <div className="flex items-center w-full">
                            <div className="w-full flex items-center pr-2 md:pr-0">
                                <div className="hidden md:flex text-yellow-500 mr-1 text-[10px]">★★★★★</div>
                                <h3 className="font-bold text-gray-900 text-[15px] md:text-lg group-hover:text-violet-600 transition-colors truncate">
                                    <Link href={channel.slug ? `/${channel.slug}` : '#'}>
                                        <span className="absolute inset-0 z-10" />
                                        {channel.name}
                                    </Link>
                                </h3>
                                <BadgeCheck className="h-4 w-4 md:h-5 md:w-5 text-violet-500 flex-shrink-0 ml-1" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                            <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[100px] md:max-w-none border border-violet-100">
                                {channel.categories?.name || 'Öne Çıkan'}
                            </span>
                            {memberCount && (
                                <div className="flex items-center gap-1 font-medium text-gray-700">
                                    <Users size={12} className="text-violet-500" />
                                    {memberCount}
                                </div>
                            )}
                        </div>

                        {channel.description && (
                            <p className="mt-0.5 md:mt-2 text-[11px] md:text-sm text-gray-500 md:text-gray-600 line-clamp-1 md:line-clamp-2 leading-tight md:leading-normal">
                                {channel.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Mobil buton */}
                <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20">
                    <a
                        href={channel.join_link || (channel.slug ? `/${channel.slug}` : '#')}
                        target={channel.join_link ? '_blank' : undefined}
                        rel={channel.join_link ? 'nofollow noreferrer' : undefined}
                        className="flex w-full items-center justify-center rounded-lg bg-violet-600 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>

                {/* Desktop buton */}
                <div className="hidden md:flex mt-auto px-5 pb-5 pt-0 relative z-20 pl-16">
                    <a
                        href={channel.join_link || (channel.slug ? `/${channel.slug}` : '#')}
                        target={channel.join_link ? '_blank' : undefined}
                        rel={channel.join_link ? 'nofollow noreferrer' : undefined}
                        className="flex w-full items-center justify-center rounded-lg bg-violet-600 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:bg-violet-700 transition-colors"
                    >
                        KANALA GİT
                    </a>
                </div>
            </div>
        </div>
    );
}
