import { getPromotedChannels } from '@/app/actions/promoted';
import Link from 'next/link';
import Image from 'next/image';
import { Users, TrendingUp } from 'lucide-react';
import AdultChannelRow from '@/components/AdultChannelRow';

interface PromotedChannelsProps {
    categoryId?: string;
    variant?: 'default' | 'adult-table' | 'crypto-table' | 'grid';
}

export default async function PromotedChannels({ categoryId, variant = 'default' }: PromotedChannelsProps) {
    const target = categoryId || 'homepage';
    const promotedItems = await getPromotedChannels(target);

    if (!promotedItems || promotedItems.length === 0) return null;

    // Get the label from the first item (all items in same target share same label)
    const sectionLabel = promotedItems[0]?.label || 'Çok Tıklananlar';

    if (variant === 'adult-table') {
        return (
            <div className="mb-8">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-red-500/20">
                        <TrendingUp size={16} className="animate-pulse" />
                        {sectionLabel}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-transparent" />
                </div>
                
                <div className="bg-red-50/40 rounded-2xl border-2 border-red-500/20 shadow-sm overflow-x-auto relative">
                    <div className="hidden md:grid grid-cols-[28px_32px_36px_1fr_80px_28px_80px] gap-3 px-3 py-2 bg-red-100/50 border-b border-red-200 text-[10px] font-black uppercase tracking-widest text-red-500">
                        <span>#</span>
                        <span>Oy</span>
                        <span></span>
                        <span>Kanal</span>
                        <span className="text-right">Üye</span>
                        <span></span>
                        <span></span>
                    </div>
                    {promotedItems.map((item, index) => {
                        const ch = item.channel;
                        if (!ch) return null;
                        return <AdultChannelRow key={item.id} channel={ch as any} rank={index + 1} />;
                    })}
                </div>
            </div>
        );
    }

    if (variant === 'crypto-table') {
        return (
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/20">
                        <TrendingUp size={16} className="animate-pulse" />
                        {sectionLabel}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
                </div>

                <div className="bg-orange-50/40 rounded-2xl border-2 border-orange-500/20 shadow-sm overflow-hidden">
                    <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-orange-100/50 border-b border-orange-200 text-[10px] font-black uppercase tracking-widest text-orange-600">
                        <span className="w-7">#</span>
                        <span className="flex-1">Kanal</span>
                        <span className="w-20 text-right">Üyeler</span>
                        <span className="w-20"></span>
                    </div>
                    {promotedItems.map((item, index) => {
                        const ch = item.channel;
                        if (!ch) return null;
                        return (
                            <div key={item.id} className="group flex items-center gap-3 border-b border-orange-100/50 px-4 py-3 hover:bg-orange-100/40 transition-colors">
                                <span className="w-7 shrink-0 text-xs font-black text-orange-300 tabular-nums text-center">{index + 1}</span>
                                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 flex items-center justify-center text-sm font-black text-orange-600">{ch.name.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/${ch.slug}`} className="font-bold text-sm text-gray-900 hover:text-orange-600 transition truncate block">{ch.name}</Link>
                                        <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">VIP</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{ch.description || ch.seo_description || 'Telegram kanalı'}</p>
                                </div>
                                <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 w-20 justify-end shrink-0">
                                    <Users size={12} className="text-blue-400" />
                                    {ch.member_count ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ch.member_count) : '—'}
                                </div>
                                <a href={`/go/${ch.id}`} target="_blank" rel="nofollow noreferrer"
                                    className="shrink-0 flex items-center gap-1 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition shadow-sm">
                                    Katıl
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <section className="my-6">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/20">
                    <TrendingUp size={16} className="animate-pulse" />
                    {sectionLabel}
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
            </div>

            {/* Vertical List Container */}
            <div className="flex flex-col gap-2">
                {promotedItems.map((item, index) => {
                    const ch = item.channel;
                    if (!ch) return null;
                    
                    // İlk öğeyi veya belirli öğeleri daha belirgin yapmak için
                    const isPremium = index === 0;

                    return (
                        <Link
                            key={item.id}
                            href={`/${ch.slug}`}
                            className={`group flex items-start sm:items-center gap-3 p-3 transition-all duration-300 relative overflow-hidden ${
                                isPremium 
                                    ? 'bg-blue-50/50 rounded-xl border border-blue-200 border-dashed hover:bg-blue-50' 
                                    : 'bg-white rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm'
                            }`}
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0 relative">
                                {ch.image && ch.image !== '/images/logo.png' ? (
                                    <Image
                                        src={ch.image}
                                        alt={ch.name}
                                        width={48}
                                        height={48}
                                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border border-gray-200 group-hover:scale-105 transition-transform">
                                        {ch.name.charAt(0)}
                                    </div>
                                )}
                                {isPremium && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                        <span className="text-[8px] text-white font-black">★</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                        {ch.name}
                                    </h3>
                                    {isPremium && (
                                        <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                                            VIP
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-500 line-clamp-1 sm:line-clamp-2 mt-0.5 pr-2">
                                    {ch.description || ch.seo_description || 'Telegram kanalı'}
                                </p>
                            </div>

                            {/* CTA & Stats (Hidden on very small screens, visible on sm+) */}
                            <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                    <Users size={12} />
                                    {ch.member_count
                                        ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ch.member_count)
                                        : '-'}
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    Göz At
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
