import { getChannelsByCity, getCategories } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Pagination from '@/components/Pagination';
import JsonLd, { generateBreadcrumbSchema, generateItemListSchema } from '@/components/JsonLd';

const baseUrl = 'https://telegramkanali.com';

export const revalidate = 3600; // 1 saat cache
export const dynamic = 'force-static';

// Desteklenen şehirler ve SEO verileri
const CITIES: Record<string, { name: string; slug: string; description: string; keywords: string }> = {
    'istanbul': {
        name: 'İstanbul',
        slug: 'istanbul',
        description: 'İstanbul\'a özel Telegram grupları ve kanalları. İstanbul haber, etkinlik, sohbet ve mahalle toplulukları.',
        keywords: 'İstanbul telegram grupları, İstanbul telegram kanalları, İstanbul sohbet grupları'
    },
    'ankara': {
        name: 'Ankara',
        slug: 'ankara',
        description: 'Ankara\'ya özel Telegram grupları ve kanalları. Ankara haber, etkinlik, sohbet ve mahalle toplulukları.',
        keywords: 'Ankara telegram grupları, Ankara telegram kanalları, Ankara sohbet grupları'
    },
    'izmir': {
        name: 'İzmir',
        slug: 'izmir',
        description: 'İzmir\'e özel Telegram grupları ve kanalları. İzmir haber, etkinlik, ege yaşamı toplulukları.',
        keywords: 'İzmir telegram grupları, İzmir telegram kanalları, İzmir sohbet grupları'
    },
    'bursa': {
        name: 'Bursa',
        slug: 'bursa',
        description: 'Bursa\'ya özel Telegram grupları ve kanalları. Bursa haber, etkinlik ve mahalle toplulukları.',
        keywords: 'Bursa telegram grupları, Bursa telegram kanalları'
    },
    'antalya': {
        name: 'Antalya',
        slug: 'antalya',
        description: 'Antalya\'ya özel Telegram grupları ve kanalları. Antalya turizm, haber ve sohbet toplulukları.',
        keywords: 'Antalya telegram grupları, Antalya telegram kanalları'
    },
    'adana': {
        name: 'Adana',
        slug: 'adana',
        description: 'Adana\'ya özel Telegram grupları ve kanalları. Adana haber, etkinlik ve şehir toplulukları.',
        keywords: 'Adana telegram grupları, Adana telegram kanalları'
    },
    'konya': {
        name: 'Konya',
        slug: 'konya',
        description: 'Konya\'ya özel Telegram grupları ve kanalları. Konya haber ve şehir toplulukları.',
        keywords: 'Konya telegram grupları, Konya telegram kanalları'
    },
    'gaziantep': {
        name: 'Gaziantep',
        slug: 'gaziantep',
        description: 'Gaziantep\'e özel Telegram grupları ve kanalları. Gaziantep kültür ve haber toplulukları.',
        keywords: 'Gaziantep telegram grupları, Gaziantep telegram kanalları'
    },
    'mersin': {
        name: 'Mersin',
        slug: 'mersin',
        description: 'Mersin\'e özel Telegram grupları ve kanalları. Mersin haber ve şehir toplulukları.',
        keywords: 'Mersin telegram grupları, Mersin telegram kanalları'
    },
    'kayseri': {
        name: 'Kayseri',
        slug: 'kayseri',
        description: 'Kayseri\'ye özel Telegram grupları ve kanalları. Kayseri haber ve şehir toplulukları.',
        keywords: 'Kayseri telegram grupları, Kayseri telegram kanalları'
    },
};

interface PageProps {
    params: { city: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams() {
    return Object.keys(CITIES).map(city => ({ city: `${city}-telegram-gruplari` }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { city: citySlug } = await params;
    const cityKey = citySlug.replace('-telegram-gruplari', '');
    const cityData = CITIES[cityKey];

    if (!cityData) return { title: 'Sayfa Bulunamadı' };

    return {
        title: `${cityData.name} Telegram Grupları ve Kanalları 2026 | En İyi Liste`,
        description: `${cityData.name} Telegram grupları 2026. ${cityData.description} Hemen katılın!`,
        keywords: cityData.keywords,
        alternates: {
            canonical: `${baseUrl}/${citySlug}`,
        },
        openGraph: {
            title: `${cityData.name} Telegram Grupları 2026`,
            description: cityData.description,
            url: `${baseUrl}/${citySlug}`,
            type: 'website',
        },
    };
}

export default async function CityPage({ params, searchParams }: PageProps) {
    const { city: citySlug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const pageParam = resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam as string) : 1;
    const LIMIT = 20;

    const cityKey = citySlug.replace('-telegram-gruplari', '');
    const cityData = CITIES[cityKey];

    if (!cityData) notFound();

    const [{ data: channels, count: totalCount }, categories] = await Promise.all([
        getChannelsByCity(cityData.name, page, LIMIT),
        getCategories()
    ]);
    const totalPages = Math.ceil(totalCount / LIMIT);

    return (
        <>
            <JsonLd data={generateBreadcrumbSchema([
                { name: 'Anasayfa', url: baseUrl },
                { name: `${cityData.name} Telegram Grupları`, url: `${baseUrl}/${citySlug}` }
            ])} />
            {channels.length > 0 && (
                <JsonLd data={generateItemListSchema(
                    channels.map((ch, i) => ({ name: ch.name, url: `${baseUrl}/${ch.slug}`, position: i + 1 })),
                    `${cityData.name} Telegram Grupları`
                )} />
            )}
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": `${cityData.name} Telegram grupları nasıl bulunur?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `${cityData.name} Telegram gruplarını bulmak için telegramkanali.com/${citySlug} adresini ziyaret edebilirsiniz. İlginizi çeken grubun detay sayfasındaki "Kanala Katıl" butonuna tıklayarak Telegram uygulamasında gruba katılabilirsiniz.`
                        }
                    },
                    {
                        "@type": "Question",
                        "name": `${cityData.name} Telegram kanalları ücretsiz mi?`,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `Evet, listelenen ${cityData.name} Telegram kanallarının büyük çoğunluğuna ücretsiz katılabilirsiniz. Bazı özel gruplar davetiye gerektirebilir.`
                        }
                    }
                ]
            }} />

            <Header />
            <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center shadow-xl">
                    <div className="text-5xl mb-3">🏙️</div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">
                        {cityData.name} Telegram Grupları (2026)
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">{cityData.description}</p>
                    <div className="mt-6 flex justify-center gap-6 text-sm">
                        <div className="text-center">
                            <div className="text-3xl font-black">{totalCount}</div>
                            <div className="text-blue-200">Kanal</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black">✓</div>
                            <div className="text-blue-200">Onaylı</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black">2026</div>
                            <div className="text-blue-200">Güncel</div>
                        </div>
                    </div>
                </div>

                {/* SEO Rich Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* Channels Grid */}
                        {channels.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {channels.map(channel => (
                                    <ChannelCard key={channel.id} channel={channel} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="text-5xl mb-4">🏙️</div>
                                <h2 className="text-xl font-bold text-gray-700 mb-2">{cityData.name} için henüz kanal eklenmemiş</h2>
                                <p className="text-gray-500 mb-6">Bu şehire ait bir kanalınızı ekleyebilirsiniz.</p>
                                <Link href="/kanal-ekle" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                                    Kanal Ekle
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
                            </div>
                        )}

                        {/* SEO Content Block */}
                        <div className="mt-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-4">{cityData.name} Telegram Grupları Hakkında</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {cityData.name} Telegram grupları, şehrin dört bir yanındaki insanları bir araya getiren aktif topluluklardır.
                                Bu gruplar; mahalle sohbetlerinden yerel etkinlik duyurularına, iş ilanlarından ikinci el alım satım ilanlarına
                                kadar geniş bir yelpazede içerik sunar.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                <strong>{cityData.name}</strong>liyet sakinleri ve bu şehire ilgi duyanlar için hazırladığımız bu dizin,
                                düzenli olarak güncellenmekte ve yeni kanallar eklenmektedir. Kanallar editörlerimiz tarafından
                                içerik kalitesi ve aktifliği açısından değerlendirilerek listeye alınmaktadır.
                            </p>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">Neden {cityData.name} Telegram Gruplarına Katılmalısınız?</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center gap-2">✅ Yerel haberler ve gelişmeleri anlık takip edin</li>
                                <li className="flex items-center gap-2">✅ Şehirdeki etkinlik ve organizasyonlardan haberdar olun</li>
                                <li className="flex items-center gap-2">✅ Komşularınız ve şehirdeki insanlarla iletişim kurun</li>
                                <li className="flex items-center gap-2">✅ İkinci el alım satım ilanlarına kolayca ulaşın</li>
                                <li className="flex items-center gap-2">✅ Yardımlaşma ve dayanışma ağına dahil olun</li>
                            </ul>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-500">
                                    Kendi {cityData.name} Telegram kanalınızı ücretsiz olarak{' '}
                                    <Link href="/kanal-ekle" className="text-blue-600 font-bold hover:underline">kanal ekle</Link>{' '}
                                    sayfamızdan listeleyebilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Diğer Şehirler */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Diğer Şehirler</h3>
                            <ul className="space-y-2">
                                {Object.entries(CITIES).filter(([key]) => key !== cityKey).map(([key, city]) => (
                                    <li key={key}>
                                        <Link
                                            href={`/${city.slug}-telegram-gruplari`}
                                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition text-sm"
                                        >
                                            🏙️ {city.name} Telegram Grupları
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kategoriler */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Tüm Kategoriler</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.slice(0, 12).map(cat => (
                                    <Link
                                        key={cat.id}
                                        href={`/${cat.slug}`}
                                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">{cityData.name} Kanalınızı Ekleyin</h3>
                            <p className="text-blue-100 text-sm mb-4">Kanalınızı ücretsiz olarak {cityData.name} listemize ekleyin.</p>
                            <Link href="/kanal-ekle" className="block w-full bg-white text-blue-600 text-center font-black py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">
                                ÜCRETSIZ EKLE
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Internal linking - Diğer şehirler grid */}
                <section className="border-t pt-8">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Türkiye Geneli Telegram Grupları</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.entries(CITIES).map(([key, city]) => (
                            <Link
                                key={key}
                                href={`/${city.slug}-telegram-gruplari`}
                                className={`text-center p-4 rounded-xl border transition-all hover:shadow-md ${key === cityKey ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}
                            >
                                <div className="text-2xl mb-1">🏙️</div>
                                <div className="text-xs font-bold">{city.name}</div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
