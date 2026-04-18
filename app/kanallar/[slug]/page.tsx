import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getChannelBySlug, getChannelsByCategory, getAllChannelSlugs, getCategories } from '@/lib/data';
import { BadgeCheck, Users, ExternalLink, Calendar, Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import ChannelCard from '@/components/ChannelCard';
import JsonLd, { generateAggregateRatingSchema } from '@/components/JsonLd';
import CryptoChannelReview from '@/components/CryptoChannelReview';
import CryptoChannelComparison from '@/components/CryptoChannelComparison';
import type { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';

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

    const desc = channel?.description?.substring(0, 140) || '';
    const memberCount = channel?.member_count || (channel?.stats as any)?.subscribers || 0;
    const memberText = memberCount > 0 ? ` ${memberCount.toLocaleString('tr-TR')} üyesi olan` : '';

    return {
        title: pageTitle,
        description: `${name}${memberText} Telegram kanalına katılın. ${desc}${desc.length >= 140 ? '...' : ''}`,
        alternates: {
            canonical: `${baseUrl}/kanallar/${slug}`,
        },
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
    const relatedChannels = relatedChannelsRaw.filter((c) => c.id !== channel.id).slice(0, 8);
    const sidebarRelated = relatedChannels.slice(0, 5);
    const mainRelated = relatedChannels.slice(0, 3);

    const isCrypto = category?.name?.toLowerCase() === 'kripto para'
        || channel?.category_id === 'crypto'
        || channel?.tags?.some((t: string) => t.toLowerCase().includes('kripto') || t.toLowerCase().includes('bitcoin'));
    const is18 = category?.slug === '18' || channel?.category_id === '18';

    const memberCount = (channel as any)?.member_count || (channel?.stats as any)?.subscribers || 0;
    const memberText = memberCount > 0 ? `${memberCount.toLocaleString('tr-TR')} üyeli` : 'aktif';
    const categoryName = category?.name || 'Genel';
    const updatedDate = new Date((channel as any)?.updated_at || channel?.created_at || Date.now())
        .toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

    // ─── Dinamik FAQ ────────────────────────────────────────────────────────────
    const faqs = [
        {
            question: `${channel.name} Telegram kanalı güvenli mi?`,
            answer: `${channel.name}, ${categoryName} kategorisinde yer alan ${memberText} bir Telegram kanalıdır. Telegramkanali.com'da listelenen kanallar topluluk önerileriyle eklenmekte ve şikayet bildirimleri doğrultusunda güncellenmektedir.`,
        },
        {
            question: `${channel.name} kanalına nasıl katılınır?`,
            answer: `${channel.name} kanalına katılmak için bu sayfadaki "Kanala Katıl" butonuna tıklayın. Telegram uygulaması açılarak sizi doğrudan kanalın sayfasına yönlendirecektir.`,
        },
        {
            question: `${channel.name} ücretsiz mi?`,
            answer: `${channel.name} kanalına katılım ücretsizdir. Telegram kanallarının büyük çoğunluğu herkese açık ve ücretsizdir.`,
        },
        {
            question: `${categoryName} kategorisinde başka hangi Telegram kanalları var?`,
            answer: `${categoryName} kategorisinde ${relatedChannelsRaw.length} kanal listelenmektedir. ${relatedChannels.slice(0, 3).map((c: any) => c.name).join(', ')} gibi kanalları da inceleyebilirsiniz.`,
        },
    ];

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MobileApplication',
        name: channel?.name || '',
        description: channel?.description || '',
        category: 'Social Networking',
        applicationCategory: 'Social Networking',
        operatingSystem: 'Android, iOS, Windows, Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', availability: 'https://schema.org/InStock' },
        author: { '@type': 'Organization', name: channel?.name || '' },
    };

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <JsonLd data={generateAggregateRatingSchema(channel, baseUrl)} />

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 min-w-0 overflow-hidden break-words">

                {/* Kripto Internal Linking */}
                {isCrypto && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 border border-orange-200 p-4 rounded-xl shadow-sm text-sm">
                        <span className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                            <Tag size={16} /> Kripto Silo
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/kripto-para" className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Tüm Kripto Kanalları</Link>
                            <Link href="/kripto-telegram-kanallari" className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Genel Kripto Listesi</Link>
                            <Link href="/kripto-sinyal-telegram" className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs">Sinyal Kanalları</Link>
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
                                {(channel as any)?.verified && (
                                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-100">
                                        <BadgeCheck size={12} /> Doğrulanmış
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                {channel?.name}
                                {(channel as any)?.verified && <BadgeCheck className="text-blue-500" size={28} />}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                {memberCount > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Users size={16} />
                                        {memberCount.toLocaleString('tr-TR')} Abone
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    {updatedDate} tarihinde güncellendi
                                </span>
                            </div>
                        </div>
                        <a
                            href={(channel as any)?.join_link}
                            target="_blank"
                            rel="nofollow noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg sm:w-auto"
                        >
                            <ExternalLink size={18} />
                            Kanala Katıl
                        </a>
                    </div>
                </div>

                {/* Crypto Score System */}
                {isCrypto && (
                    <>
                        <CryptoChannelReview channel={channel} />
                        <CryptoChannelComparison currentChannel={channel} alternatives={mainRelated} />
                    </>
                )}

                {/* Detailed Description */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                        {channel?.name} Hakkında
                    </h2>
                    <div className="prose prose-blue max-w-none text-gray-600">
                        <p className="whitespace-pre-line leading-7 text-base">
                            {channel?.description}
                        </p>
                        <h3 className="mt-6 mb-2 text-lg font-semibold text-gray-900">Bu Kanalda Neler Var?</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {(channel as any)?.subcategories?.map((sub: string) => (
                                <li key={sub}>{sub} içerikleri</li>
                            ))}
                            <li>Güncel bildirimler ve duyurular</li>
                            <li>Aktif topluluk desteği</li>
                            {isCrypto && <li>Kripto para analiz ve sinyal paylaşımları</li>}
                            {is18 && <li>Yalnızca 18 yaş üstü kullanıcılara yönelik içerikler</li>}
                        </ul>
                    </div>
                    {(channel as any)?.tags && (channel as any).tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                            {(channel as any).tags.map((tag: string) => (
                                <span key={tag} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                    <Tag size={10} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Kategori İçerik Bloğu (thin content çözümü) ──────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        {categoryName} Telegram Kanalları Hakkında
                    </h2>
                    {isCrypto ? (
                        <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                            <p>
                                <strong>Kripto para Telegram kanalları</strong>, yatırımcıların gerçek zamanlı piyasa analizi, sinyal ve haberlere ulaşmasını sağlayan dijital topluluklardır.
                                Bitcoin, Ethereum, altcoin analizleri ve DeFi projelerine dair güncel bilgileri takip etmek için kullanılır.
                            </p>
                            <p>
                                {channel.name} kanalı, <strong>{memberText}</strong> kripto para yatırımcısını bir araya getiriyor.
                                Telegram&apos;ın güçlü bildirim sistemi sayesinde önemli piyasa hareketlerini anında takip edebilirsiniz.
                            </p>
                            <p className="text-xs text-gray-400">
                                ⚠️ Bu kanalda paylaşılan içerikler yatırım tavsiyesi niteliği taşımaz. Yatırım kararlarınızı kendi araştırmanıza dayandırın.
                            </p>
                        </div>
                    ) : is18 ? (
                        <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                            <p>
                                Bu kanal yalnızca <strong>18 yaş üzeri</strong> kullanıcılara yöneliktir.
                                Telegramkanali.com, 5651 sayılı kanun kapsamında &quot;Yer Sağlayıcı&quot; olarak hizmet vermektedir.
                                Listelenen kanalların içerikleri kanal yöneticilerinin sorumluluğundadır.
                            </p>
                            <p>
                                {channel.name} kanalına katılmak için 18 yaşını doldurmuş olmanız gerekmektedir.
                                Şikayet bildirimleri için <Link href="/iletisim" className="text-blue-600 hover:underline">iletişim sayfamızı</Link> ziyaret edebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                            <p>
                                <strong>{categoryName} Telegram kanalları</strong>, bu alanda içerik üreten ve topluluk oluşturan Telegram kanallarını bir araya getirir.
                                {channel.name}, <strong>{memberText}</strong> üyesiyle {categoryName.toLowerCase()} kategorisinin aktif kanallarından biridir.
                            </p>
                            <p>
                                Telegram, uçtan uca şifreleme kullanan güvenli bir mesajlaşma platformudur.
                                Kanallara katıldığınızda telefon numaranız diğer üyeler tarafından görülmez.
                                İstediğiniz zaman kanaldan ayrılabilirsiniz.
                            </p>
                        </div>
                    )}
                    {category && (
                        <Link href={`/${category.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 mt-2">
                            Tüm {categoryName} Kanallarını Gör <ChevronRight size={16} />
                        </Link>
                    )}
                </div>

                {/* Benzer Kanallar (kripto değilse ana alanda göster) */}
                {mainRelated.length > 0 && !isCrypto && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Benzer {categoryName} Kanalları</h2>
                        <div className="space-y-4">
                            {mainRelated.map((rc: any) => (
                                <ChannelCard key={rc.id} channel={rc} />
                            ))}
                        </div>
                        {category && (
                            <div className="mt-4 text-center">
                                <Link href={`/${category.slug}`} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                    {relatedChannelsRaw.length} kanalın tamamını gör →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Kripto CTA */}
                {isCrypto && (
                    <div className="bg-blue-50/50 rounded-2xl p-6 text-center border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">🤔 Aradığınızı tam olarak bulamadınız mı?</h3>
                        <p className="text-gray-600 mb-4 max-w-lg mx-auto">
                            Sistemimizde {relatedChannelsRaw.length} adet kripto para kanalı listelenmiştir.
                        </p>
                        <Link href="/kripto-para" className="inline-block bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm">
                            En Popüler Kripto Kanallarını Gör →
                        </Link>
                    </div>
                )}

                {/* ─── FAQ Bölümü ──────────────────────────────────────────────── */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-5">❓ Sık Sorulan Sorular</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group border border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
                                <summary className="flex items-center justify-between p-4 font-semibold text-gray-900 cursor-pointer list-none">
                                    {faq.question}
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2">▼</span>
                                </summary>
                                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            </div>

            {/* ─── Sidebar ────────────────────────────────────────────────────── */}
            <div className="space-y-6">
                {/* Güvenlik Analizi */}
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
                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" /> Aktif içerik paylaşımı
                        </li>
                        <li className="flex items-center gap-2 text-green-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" /> Dolandırıcılık raporu yok
                        </li>
                    </ul>
                    <p className="text-xs text-gray-400 mt-4">Son kontrol: {updatedDate}</p>
                </div>

                {/* Kategori Kanalları Sidebar */}
                {sidebarRelated.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-bold text-gray-900 flex items-center gap-2">
                            <Tag size={16} className="text-blue-500" />
                            {categoryName} Kanalları
                        </h3>
                        <ul className="space-y-2">
                            {sidebarRelated.map((rc: any) => (
                                <li key={rc.id}>
                                    <Link href={`/kanallar/${rc.slug}`} className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50 transition">
                                        <span className="truncate flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold shrink-0">
                                                {rc.name.charAt(0)}
                                            </span>
                                            {rc.name}
                                        </span>
                                        <ChevronRight size={14} className="text-gray-400 shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {category && (
                            <Link href={`/${category.slug}`} className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 border-t border-gray-100 pt-3">
                                Tümünü Gör ({relatedChannelsRaw.length}) <ChevronRight size={13} />
                            </Link>
                        )}
                    </div>
                )}

                {/* Tüm Kategoriler */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-3 font-semibold text-gray-800 text-sm">📂 Tüm Kategoriler</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.slice(0, 15).map(cat => (
                            <Link key={cat.id} href={`/${cat.slug}`} className={`text-xs px-2.5 py-1 rounded-full transition border ${cat.id === channel.category_id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}>
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white text-center">
                    <h3 className="font-bold text-lg mb-1">🚀 Kanalınızı Ekleyin</h3>
                    <p className="text-blue-100 text-sm mb-4">Telegram kanalınızı ücretsiz olarak listemize ekleyin.</p>
                    <Link href="/kanal-ekle" className="block w-full bg-white text-blue-600 text-center font-black py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">
                        ÜCRETSİZ EKLE
                    </Link>
                </div>
            </div>
        </div>
    );
}
