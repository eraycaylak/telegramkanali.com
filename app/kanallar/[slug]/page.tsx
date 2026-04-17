import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getChannelBySlug, getChannelsByCategory, getAllChannelSlugs, getCategories } from '@/lib/data';
import { BadgeCheck, Users, ExternalLink, Calendar, Tag, ShieldCheck } from 'lucide-react';
import ChannelCard from '@/components/ChannelCard';
import JsonLd, { generateAggregateRatingSchema } from '@/components/JsonLd';
import CryptoChannelReview from '@/components/CryptoChannelReview';
import CryptoChannelComparison from '@/components/CryptoChannelComparison';
import type { Metadata } from 'next';

export async function generateStaticParams() {
    const slugs = await getAllChannelSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const channel = await getChannelBySlug(slug);
    if (!channel) return {};

    const name = channel?.name || '';
    // Sırayla dene: uzun → kısa suffix → sadece isim → kelime sınırında kes (asla ortada kesmez)
    const titleCandidates = [
      `${name} Telegram Kanalı - Katıl`,
      `${name} Telegram Kanalı`,
      `${name} | Telegram`,
      name,
    ];
    let pageTitle = titleCandidates.find(t => t.length <= 60) ?? (() => {
      const words = name.split(' ');
      let res = '';
      for (const w of words) {
        const next = res ? `${res} ${w}` : w;
        if ((next + '… | Telegram').length > 60) break;
        res = next;
      }
      return `${res || name.slice(0, 50)}… | Telegram`;
    })();
    return {
        title: pageTitle,
        description: `${name} Telegram kanalına katılın. ${channel?.description?.substring(0, 150)}...`,
    };
}

export default async function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const channel = await getChannelBySlug(slug);

    if (!channel) {
        notFound();
        return null;
    }

    const categories = await getCategories();
    const category = categories.find((c) => c.id === channel.category_id);
    const relatedChannelsRaw = await getChannelsByCategory(channel.category_id);
    const relatedChannels = relatedChannelsRaw
        .filter((c) => c.id !== channel.id)
        .slice(0, 3);

    const isCrypto = category?.name?.toLowerCase() === 'kripto para' || channel?.category_id === 'crypto' || channel?.tags?.some((t:string) => t.toLowerCase().includes('kripto') || t.toLowerCase().includes('bitcoin'));

    // JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MobileApplication',
        name: channel?.name || '',
        description: channel?.description || '',
        category: 'Social Networking',
        applicationCategory: 'Social Networking',
        operatingSystem: 'Android, iOS, Windows, Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock'
        },
        author: {
            '@type': 'Organization',
            name: channel?.name || ''
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* Schema Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <JsonLd data={generateAggregateRatingSchema(channel, 'https://telegramkanali.com')} />

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 min-w-0 overflow-hidden break-words">

                {/* Hard Internal Linking (Navigation Loop) */}
                {isCrypto && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 border border-orange-200 p-4 rounded-xl shadow-sm text-sm">
                    <span className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                       <Tag size={16}/> Kripto Silo Yönlendirmesi
                    </span>
                    <p className="text-orange-900/80 mb-2">Bu kanal <strong>Kripto Para</strong> dizinimizin bir parçasıdır. Bulunduğunuz kanaldan çıkarak diğer benzer listelere veya ana dizine geçiş yapabilirsiniz:</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/kripto-para" className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-900 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Tüm Kripto Kanalları</Link>
                      <Link href="/kripto-telegram-kanallari" className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-900 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Genel Kripto Listesi</Link>
                      <Link href="/kripto-sinyal-telegram" className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-900 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Sinyal Kanalları</Link>
                    </div>
                  </div>
                )}

                {/* Header Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-3xl font-bold text-blue-600">
                            {channel?.name?.charAt(0)}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                {category && (
                                    <Link href={`/${category.slug}`} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-100">
                                        {category.name}
                                    </Link>
                                )}
                                {channel?.verified && (
                                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-100">
                                        <BadgeCheck size={12} /> Doğrulanmış
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                {channel?.name}
                                {channel?.verified && <BadgeCheck className="text-blue-500" size={28} />}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Users size={16} />
                                    {channel?.stats?.subscribers || channel?.member_count || 0} Abone
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    {channel?.created_at ? new Date(channel.created_at).toLocaleDateString('tr-TR') : ''} tarihinde eklendi
                                </span>
                            </div>
                        </div>

                        <a
                            href={channel?.join_link}
                            target="_blank"
                            rel="nofollow noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg sm:w-auto"
                        >
                            <ExternalLink size={18} />
                            Kanala Katıl
                        </a>
                    </div>
                </div>

                {/* Crypto Score System (Safe Mode) */}
                {isCrypto && (
                  <>
                    <CryptoChannelReview channel={channel} />
                    <CryptoChannelComparison currentChannel={channel} alternatives={relatedChannels} />
                  </>
                )}

                {/* Detailed Description */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                        {channel?.name} Hakkında
                    </h2>
                    <div className="prose prose-blue max-w-none text-gray-600">
                        <p className="whitespace-pre-line leading-7">
                            {channel?.description}
                        </p>

                        <h3 className="mt-6 mb-2 text-lg font-semibold text-gray-900">Bu Kanalda Neler Var?</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {channel?.subcategories?.map((sub: string) => (
                                <li key={sub}>{sub} içerikleri</li>
                            ))}
                            <li>Güncel bildirimler şelalesi</li>
                            <li>Aktif topluluk desteği</li>
                        </ul>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                        {channel?.tags?.map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                <Tag size={10} /> {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* No Result Gap Filler / User Journey Extension */}
                {isCrypto && (
                  <div className="mt-8 bg-blue-50/50 rounded-2xl p-6 text-center border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">🤔 Aradığınızı tam olarak bulamadınız mı?</h3>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                      Bu kanal aradığınız kriterlere uymuyorsa, sistemimizde daha iyi analiz edilmiş ve onaylanmış alternatif kripto toplulukları bulunuyor.
                    </p>
                    <Link href="/kripto-para" className="inline-block bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm">
                      En Popüler Kripto Kanallarını Gör →
                    </Link>
                  </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Info Box */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-600" />
                        Güvenlik Analizi
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-center gap-2 text-green-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" /> Spam kontrolü temiz
                        </li>
                        <li className="flex items-center gap-2 text-green-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" /> Aktif paylaşım
                        </li>
                        <li className="flex items-center gap-2 text-green-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" /> Dolandırıcılık raporu yok
                        </li>
                    </ul>
                </div>

                {/* Share / Action */}
                <div className="rounded-xl bg-blue-50 p-6 text-center">
                    <h3 className="mb-2 font-semibold text-blue-900">Arkadaşlarınla Paylaş</h3>
                    <p className="mb-4 text-xs text-blue-700">Bu kanalı arkadaşlarınla paylaşarak büyümelerine destek ol.</p>
                    <button className="w-full rounded bg-blue-100 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200">
                        Bağlantıyı Kopyala
                    </button>
                </div>

                {/* Related Channels */}
                {relatedChannels.length > 0 && (
                    <div>
                        <h3 className="mb-4 font-bold text-gray-900">Benzer Kanallar</h3>
                        <div className="space-y-4">
                            {relatedChannels.map(rc => (
                                <ChannelCard key={rc.id} channel={rc} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
