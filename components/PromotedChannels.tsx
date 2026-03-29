import { getPromotedChannels } from '@/app/actions/promoted';
import Link from 'next/link';
import Image from 'next/image';
import { Users, TrendingUp } from 'lucide-react';

interface PromotedChannelsProps {
    categoryId?: string;
}

export default async function PromotedChannels({ categoryId }: PromotedChannelsProps) {
    const target = categoryId || 'homepage';
    const promotedItems = await getPromotedChannels(target);

    if (!promotedItems || promotedItems.length === 0) return null;

    // Get the label from the first item (all items in same target share same label)
    const sectionLabel = promotedItems[0]?.label || 'Çok Tıklananlar';

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

            {/* Horizontal Scroll Container */}
            <div className="relative">
                <div
                    className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory -mx-1 px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {promotedItems.map((item) => {
                        const ch = item.channel;
                        if (!ch) return null;
                        const categoryName = ch.categories?.name || '';

                        return (
                            <Link
                                key={item.id}
                                href={`/${ch.slug}`}
                                className="group flex-shrink-0 snap-start w-[200px] sm:w-[220px]"
                            >
                                <div className="relative bg-white border border-gray-100 rounded-2xl p-4 h-full transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-200 overflow-hidden">
                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Avatar */}
                                        <div className="flex justify-center mb-3">
                                            <div className="relative">
                                                {ch.image && ch.image !== '/images/logo.png' ? (
                                                    <Image
                                                        src={ch.image}
                                                        alt={ch.name}
                                                        width={64}
                                                        height={64}
                                                        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        {ch.name.charAt(0)}
                                                    </div>
                                                )}
                                                {/* Online indicator */}
                                                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <span className="text-[8px] text-white font-bold">✓</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <h3 className="font-bold text-gray-900 text-sm text-center truncate group-hover:text-blue-600 transition-colors">
                                            {ch.name}
                                        </h3>

                                        {/* Category */}
                                        <p className="text-[11px] text-gray-400 text-center truncate mt-0.5">
                                            {categoryName}
                                        </p>

                                        {/* Member Count */}
                                        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                                            <Users size={12} className="text-blue-400" />
                                            <span className="font-medium">
                                                {ch.member_count
                                                    ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(ch.member_count)
                                                    : '-'}
                                            </span>
                                        </div>

                                        {/* CTA Button */}
                                        <div className="mt-3">
                                            <span className="block w-full text-center text-xs font-bold py-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                İNCELE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
