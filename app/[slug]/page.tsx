import { getCategoryBySlug, getChannelsByCategory, getCategories, getChannelBySlug, getFeaturedChannels, getChannels, getBlogPosts, getRedirect, getChannelsByCity, getPopularChannelsByCategory } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import ChannelDetail from '@/components/ChannelDetail';
import BannerGrid from '@/components/BannerGrid';
import FeaturedAds from '@/components/FeaturedAds';
import TwitterFeed from '@/components/TwitterFeed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd, { generateBreadcrumbSchema, generateChannelSchema, generateItemListSchema } from '@/components/JsonLd';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Pagination from '@/components/Pagination';
import Comments from '@/components/Comments';
import { Clock, Eye, AlertCircle, TrendingUp } from 'lucide-react';

const baseUrl = 'https://telegramkanali.com';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ====== Şehir Bazlı Programatik SEO Verileri ======
const CITIES: Record<string, { name: string; description: string }> = {
  'istanbul': { name: 'İstanbul', description: 'İstanbul\'a özel Telegram grupları ve kanalları. İstanbul haber, etkinlik, sohbet ve mahalle toplulukları.' },
  'ankara': { name: 'Ankara', description: 'Ankara\'ya özel Telegram grupları ve kanalları. Ankara haber, etkinlik ve mahalle toplulukları.' },
  'izmir': { name: 'İzmir', description: 'İzmir\'e özel Telegram grupları ve kanalları. İzmir haber, etkinlik ve ege yaşamı toplulukları.' },
  'bursa': { name: 'Bursa', description: 'Bursa\'ya özel Telegram grupları ve kanalları. Bursa haber ve topluluk kanalları.' },
  'antalya': { name: 'Antalya', description: 'Antalya\'ya özel Telegram grupları ve kanalları. Antalya turizm, haber ve sohbet toplulukları.' },
  'adana': { name: 'Adana', description: 'Adana\'ya özel Telegram grupları ve kanalları. Adana haber ve şehir toplulukları.' },
  'konya': { name: 'Konya', description: 'Konya\'ya özel Telegram grupları ve kanalları. Konya haber ve şehir toplulukları.' },
  'gaziantep': { name: 'Gaziantep', description: 'Gaziantep\'e özel Telegram grupları. Gaziantep kültür ve haber toplulukları.' },
  'mersin': { name: 'Mersin', description: 'Mersin\'e özel Telegram grupları ve kanalları. Mersin haber ve şehir toplulukları.' },
  'kayseri': { name: 'Kayseri', description: 'Kayseri\'ye özel Telegram grupları ve kanalları. Kayseri haber ve şehir toplulukları.' },
};

function getCityFromSlug(slug: string): { key: string; city: typeof CITIES[string] } | null {
  if (!slug.endsWith('-telegram-gruplari')) return null;
  const key = slug.replace('-telegram-gruplari', '');
  const city = CITIES[key];
  return city ? { key, city } : null;
}

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Generate SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 0. Şehir Sayfası Kontrolü
  const cityMatch = getCityFromSlug(slug);
  if (cityMatch) {
    const { city } = cityMatch;
    return {
      title: `${city.name} Telegram Grupları ve Kanalları 2026 | En İyi Liste`,
      description: `${city.name} Telegram grupları 2026. ${city.description} Hemen katılın!`,
      alternates: { canonical: `${baseUrl}/${slug}` },
      openGraph: {
        title: `${city.name} Telegram Grupları 2026`,
        description: city.description,
        url: `${baseUrl}/${slug}`,
        type: 'website',
      },
    };
  }

  // Özel X Route Kontrolü
  if (slug === 'x') {
    return {
      title: 'X Akışı - Telegram Mikro Blog',
      description: 'Özel mikro-blog yayınları ve anlık duyurularımızın yer aldığı X akış formatı.',
    };
  }

  // 1. Try Category
  const category = await getCategoryBySlug(slug);
  if (category) {
    return {
      title: `${category.name} Telegram Kanalları - 2026`,
      description: `${category.name} kategorisindeki en iyi ve popüler Telegram kanallarını keşfedin. Güvenilir ${category.name} grupları ve listeleri.`,
      alternates: {
        canonical: `${baseUrl}/${category.slug}`,
      },
      openGraph: {
        title: `${category.name} Telegram Kanalları - 2026`,
        description: `${category.name} kategorisindeki en iyi ve popüler Telegram kanallarını keşfedin. Güvenilir ${category.name} grupları ve listeleri.`,
        url: `${baseUrl}/${category.slug}`,
        type: 'website',
      },
      twitter: {
        title: `${category.name} Telegram Kanalları - 2026`,
        description: `${category.name} kategorisindeki en iyi ve popüler Telegram kanallarını keşfedin.`,
      }
    };
  }

  // 2. Try Channel
  const channel = await getChannelBySlug(slug);
  if (channel) {
    return {
      title: `${channel.name} Telegram Kanalı - Katıl (2026)`,
      description: `${channel.name} Telegram kanalına katılın. ${channel.description?.slice(0, 150)}... En güncel ${channel.categoryName || 'Telegram'} kanalları.`,
      alternates: {
        canonical: `${baseUrl}/${channel.slug}`,
      },
      openGraph: {
        title: `${channel.name} Telegram Kanalı - Katıl (2026)`,
        description: `${channel.name} Telegram kanalına katılın. ${channel.description?.slice(0, 150)}...`,
        url: `${baseUrl}/${channel.slug}`,
        images: channel.image ? [{ url: channel.image }] : undefined,
        type: 'article',
      },
      twitter: {
        title: `${channel.name} Telegram Kanalı - Katıl (2026)`,
        description: `${channel.name} Telegram kanalına katılın.`,
        images: channel.image ? [channel.image] : undefined,
      }
    };
  }

  return {
    title: 'Sayfa Bulunamadı - Telegram Kanalları',
  };
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageParam = resolvedSearchParams?.page;
  const page = pageParam ? parseInt(pageParam as string) : 1;
  const LIMIT = 20;

  // === RENDER CITY VIEW ===
  const cityMatch = getCityFromSlug(slug);
  if (cityMatch) {
    const { key: cityKey, city: cityData } = cityMatch;
    const [{ data: channels, count: totalCount }, categories] = await Promise.all([
      getChannelsByCity(cityData.name, page, LIMIT),
      getCategories(),
    ]);
    const totalPages = Math.ceil(totalCount / LIMIT);

    return (
      <>
        <JsonLd data={generateBreadcrumbSchema([
          { name: 'Anasayfa', url: baseUrl },
          { name: `${cityData.name} Telegram Grupları`, url: `${baseUrl}/${slug}` }
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
              "acceptedAnswer": { "@type": "Answer", "text": `${cityData.name} Telegram gruplarını bulmak için telegramkanali.com/${slug} adresini ziyaret edebilirsiniz.` }
            },
            {
              "@type": "Question",
              "name": `${cityData.name} Telegram kanalları ücretsiz mi?`,
              "acceptedAnswer": { "@type": "Answer", "text": `Evet, listelenen ${cityData.name} Telegram kanallarının büyük çoğunluğuna ücretsiz katılabilirsiniz.` }
            }
          ]
        }} />

        <Header />
        <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
          {/* Hero */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center shadow-xl">
            <div className="text-5xl mb-3">🏙️</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">{cityData.name} Telegram Grupları (2026)</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">{cityData.description}</p>
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="text-center"><div className="text-3xl font-black">{totalCount}</div><div className="text-blue-200">Kanal</div></div>
              <div className="text-center"><div className="text-3xl font-black">✓</div><div className="text-blue-200">Onaylı</div></div>
              <div className="text-center"><div className="text-3xl font-black">2026</div><div className="text-blue-200">Güncel</div></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {channels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channels.map(channel => <ChannelCard key={channel.id} channel={channel} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div className="text-5xl mb-4">🏙️</div>
                  <h2 className="text-xl font-bold text-gray-700 mb-2">{cityData.name} için henüz kanal eklenmemiş</h2>
                  <p className="text-gray-500 mb-6">Bu şehre ait bir kanalınızı ekleyebilirsiniz.</p>
                  <Link href="/kanal-ekle" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Kanal Ekle</Link>
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
                </div>
              )}
              {/* SEO Metin Bloğu */}
              <div className="mt-10 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-4">{cityData.name} Telegram Grupları Hakkında</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {cityData.name} Telegram grupları, şehrin dört bir yanındaki insanları bir araya getiren aktif topluluklardır.
                  Bu gruplar; mahalle sohbetlerinden yerel etkinlik duyurularına, iş ilanlarından ikinci el alım satım ilanlarına kadar geniş içerik sunar.
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">Neden {cityData.name} Telegram Gruplarına Katılmalısınız?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">✅ Yerel haberler ve gelişmeleri anlık takip edin</li>
                  <li className="flex items-center gap-2">✅ Şehirdeki etkinlik ve organizasyonlardan haberdar olun</li>
                  <li className="flex items-center gap-2">✅ Komşularınız ve şehirdeki insanlarla iletişim kurun</li>
                  <li className="flex items-center gap-2">✅ İkinci el alım satım ilanlarına kolayca ulaşın</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Kendi {cityData.name} Telegram kanalınızı ücretsiz <Link href="/kanal-ekle" className="text-blue-600 font-bold hover:underline">ekleyebilirsiniz</Link>.</p>
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Diğer Şehirler</h3>
                <ul className="space-y-1">
                  {Object.entries(CITIES).filter(([k]) => k !== cityKey).map(([key, c]) => (
                    <li key={key}><Link href={`/${key}-telegram-gruplari`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition text-sm">🏙️ {c.name} Telegram Grupları</Link></li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Tüm Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 12).map(cat => (
                    <Link key={cat.id} href={`/${cat.slug}`} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition">{cat.name}</Link>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">{cityData.name} Kanalınızı Ekleyin</h3>
                <p className="text-blue-100 text-sm mb-4">Kanalınızı ücretsiz olarak {cityData.name} listemize ekleyin.</p>
                <Link href="/kanal-ekle" className="block w-full bg-white text-blue-600 text-center font-black py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">ÜCRETSİZ EKLE</Link>
              </div>
            </div>
          </div>

          {/* Diğer Şehirler Grid */}
          <section className="border-t pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">Türkiye Geneli Telegram Grupları</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(CITIES).map(([key, c]) => (
                <Link key={key} href={`/${key}-telegram-gruplari`} className={`text-center p-4 rounded-xl border transition-all hover:shadow-md ${ key === cityKey ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300' }`}>
                  <div className="text-2xl mb-1">🏙️</div>
                  <div className="text-xs font-bold">{c.name}</div>
                </Link>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Özel X sayfası render'ı
  if (slug === 'x') {
    const { data: xPosts } = await getBlogPosts(1, 100, 'x');
    return (
      <>
        <Header />
        <main className="container mx-auto px-0 sm:px-4 min-h-screen bg-gray-50/30">
          <TwitterFeed posts={xPosts} />
        </main>
        <Footer />
      </>
    );
  }

  // 1. Attempt to fetch Category
  const category = await getCategoryBySlug(slug);

  // === RENDER CATEGORY VIEW ===
  if (category) {
    const allCategories = await getCategories();
    const { data: channels, count: totalCount } = await getChannels(page, LIMIT, undefined, category.id);
    const totalPages = Math.ceil(totalCount / LIMIT);
    const popularChannels = page === 1 ? await getPopularChannelsByCategory(category.id, 4) : [];

    const { data: blogPosts } = await getBlogPosts(1, 6, category.slug);

    const catNameLower = category.name.toLowerCase();
    const isRestrictedCategory = catNameLower.includes('18') || catNameLower.includes('iddaa') || catNameLower.includes('kripto');

    // Split channels into batches for interleaving with banners
    const firstBatch = channels.slice(0, 6);
    const remainingChannels = channels.slice(6);

    return (
      <>
        {/* Category Structured Data */}
        <JsonLd data={generateItemListSchema(
          channels.map((ch, i) => ({ name: ch.name, url: `${baseUrl}/${ch.slug}`, position: i + 1 })),
          `${category.name} Telegram Kanalları`
        )} />
        <JsonLd data={generateBreadcrumbSchema([
          { name: 'Anasayfa', url: baseUrl },
          { name: category.name, url: `${baseUrl}/${category.slug}` }
        ])} />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `${category.name} Telegram kanalları güvenli mi?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sitemizde listelenen kanallar topluluk tarafından paylaşılan kanallardır. Katılmadan önce kanal açıklamalarını ve kullanıcı yorumlarını incelemenizi öneririz."
              }
            },
            {
              "@type": "Question",
              "name": `${category.name} kanallarına nasıl katılabilirim?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "İlginizi çeken kanalın detay sayfasındaki 'Kanala Katıl' butonuna tıklayarak Telegram uygulamasında kanala doğrudan giriş yapabilirsiniz."
              }
            }
          ]
        }} />

        <Header />
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Compact Hero Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                {category.name} Telegram Kanalları
              </h1>
              <p className="text-gray-500 text-sm mt-1">{category.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-bold">
                <span>{totalCount}</span> <span className="text-blue-500 font-normal">kanal</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold text-xs">
                ✓ Doğrulanmış
              </div>
              <div className="hidden md:flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-bold text-xs">
                2026 Güncel
              </div>
            </div>
          </div>

          {/* 🔥 Çok Tıklananlar — Above the Fold (Only on page 1) */}
          {page === 1 && popularChannels.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Çok Tıklananlar</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {popularChannels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} miniCompact />
                ))}
              </div>
            </section>
          )}

          {/* Sponsored Featured Channels */}
          <FeaturedAds adType="featured" maxAds={6} categoryId={category.id} />

          {/* First 2 Banners */}
          <BannerGrid type="category" categoryId={category.id} maxBanners={2} />

          {/* Sponsored Banner Ad */}
          <FeaturedAds adType="banner" maxAds={1} categoryId={category.id} />

          {/* First Batch of Channels (6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {firstBatch.length > 0 ? (
              firstBatch.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                Bu kategoride henüz kanal bulunmuyor.
              </div>
            )}
          </div>

          {/* Remaining Banners (after 6th channel) */}
          {remainingChannels.length > 0 && (
            <BannerGrid type="category" categoryId={category.id} offset={2} />
          )}

          {/* Remaining Channels */}
          {remainingChannels.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {remainingChannels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
            </div>
          )}

          {/* Category Blog Posts */}
          {blogPosts && blogPosts.length > 0 && (
            <div className="mt-12 relative">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{category.name} Kategorisi Blog Yazıları</h2>
                  <p className="text-gray-500 text-sm mt-1">{category.name} hakkında yazdığımız son güncel makaleler ve incelemeler.</p>
                </div>
                <Link href={`/blog?category=${category.slug}`} className="hidden md:flex text-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition items-center gap-1">
                  Tümünü Gör →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      {post.cover_image ? (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-4xl font-black text-gray-300">📝</span>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {category.name}
                          </span>
                          {post.reading_time && (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <Clock size={12} /> {post.reading_time} dk
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-500 text-sm line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Eye size={12} /> {post.view_count || 0}
                          </span>
                          <span className="text-xs font-medium text-blue-600 group-hover:underline">Devamını Oku &rarr;</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
              <div className="mt-6 md:hidden text-center">
                <Link href={`/blog?category=${category.slug}`} className="inline-block text-blue-600 bg-blue-50 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition items-center gap-1">
                  Tüm Blog Yazılarını İncele
                </Link>
              </div>
            </div>
          )}

          {/* SEO Content Section — Below Channels */}
          <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100">
            <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">
              {/* SEO Intro (moved from hero) */}
              {category.seo_intro && (
                <div className="prose prose-blue max-w-none">
                  <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: category.seo_intro }} />
                </div>
              )}

              <article className="prose prose-blue max-w-none">
                <h2 className="text-3xl font-black text-gray-900 mb-6">
                  {category.name} Telegram Kanallarına Katılın
                </h2>
                <p className="mb-4 text-lg">
                  Her gün milyonlarca insanın kullandığı Telegram; yemek, spor, ekonomi, eğitim ve eğlence gibi onlarca farklı konuda toplu mesaj yayınlayabilmek ve kullanıcılarına geniş bilgi yelpazesi sunabilmek için kanal ve grup imkanı sunar. <strong>{category.name}</strong> kategorisindeki Telegram kanalları da güncelliği ve zengin içeriğiyle yoğun ilgi görmektedir.
                </p>
                <p className="mb-4">
                  Popüler <strong>{category.name.toLowerCase()}</strong> toplulukları, kullanıcıların ilgi duydukları alanlarda anlık bildirim almalarını, güncel gelişmeleri takip etmelerini ve benzer ilgi alanlarına sahip binlerce kişiyle aynı paydada buluşmalarını sağlar. Diziniimizde yer alan tüm kanallar, aktiflik ve içerik kalitesi açısından düzenli olarak kontrol edilmektedir.
                </p>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                  <h3 className="font-bold text-blue-900 mb-3 uppercase tracking-wider text-sm">Neden Bu Kanalları Takip Etmelisiniz?</h3>
                  <ul className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-blue-800">
                    <li className="flex items-center gap-2">🔹 Anlık ve Ücretsiz Bilgi</li>
                    <li className="flex items-center gap-2">🔹 Güvenilir İçerik Kaynakları</li>
                    <li className="flex items-center gap-2">🔹 Niş Topluluklara Erişim</li>
                    <li className="flex items-center gap-2">🔹 Reklamsız ve Temiz Yayınlar</li>
                  </ul>
                </div>
                <p className="mb-4">
                  Bu kategoride bulunan grup yöneticileri ve kullanıcılar, {category.name.toLowerCase()} hakkında genel veya özel tavsiyeler verir, güncel haberler ve bilgiler anlık olarak paylaşılır. Siz de kendi kanalınızı tanıtmak isterseniz <Link href="/kanal-ekle" className="text-blue-600 hover:underline font-bold">ücretsiz kanal ekle</Link> sayfamızı ziyaret edebilirsiniz.
                </p>
              </article>

              {/* Internal Linking Strategy - Recommendation Block */}
              <div className="border-t pt-8">
                <h3 className="font-bold text-gray-900 mb-4">İlginizi Çekebilecek Diğer Kategoriler</h3>
                <div className="flex flex-wrap gap-3">
                  {allCategories.filter(c => c.id !== category.id).slice(0, 8).map(c => (
                    <Link key={c.id} href={`/${c.slug}`} className="bg-gray-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Tüm Kategoriler</h3>
                <ul className="space-y-1">
                  {allCategories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/${c.slug}`}
                        className={`block px-3 py-2.5 rounded-xl transition-all text-sm ${c.id === category.id ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                <h3 className="font-extrabold mb-2 text-lg">Kanalınızı Öne Çıkarın</h3>
                <p className="text-sm text-purple-100 mb-6 opacity-90">
                  Jeton satın alarak kanalınızı bu kategoride en üst sıraya taşıyın ve binlerce yeni abone kazanın.
                </p>
                <Link href="/dashboard/ads" className="block w-full bg-white text-purple-600 text-center font-black py-3 rounded-xl hover:bg-purple-50 transition-colors">
                  HEMEN BAŞLA
                </Link>
              </div>
            </div>
          </section>

          {/* Disclaimer — Compact, at the very bottom */}
          {isRestrictedCategory && (
            <aside className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-500">⚠️ Yasal Uyarı:</strong> Bu kategoride (<strong>{category.name}</strong>) listelenen Telegram kanalları topluluk tarafından eklenmektedir. 18 yaşından küçüklerin şans oyunları, bahis veya müstehcenlik içeren kanallara erişimi yasaktır. Finansal ve kripto bilgileri yatırım tavsiyesi niteliği taşımaz. Sitemiz 5651 sayılı kanun kapsamında "Yer Sağlayıcı" olarak hizmet vermektedir. Detaylar için <Link href="/kullanim-sartlari" className="underline text-gray-500 hover:text-blue-600">Kullanım Şartları</Link> sayfamızı inceleyebilirsiniz.
              </p>
            </aside>
          )}
        </main>
        <Footer />
      </>
    );
  }

  // 2. Attempt to fetch Channel (if not Category)
  const channel = await getChannelBySlug(slug);

  // === RENDER CHANNEL VIEW ===
  if (channel) {
    // Fetch related/featured channels for sidebar or bottom
    const featuredChannels = await getFeaturedChannels();

    // Fetch similar channels (same category)
    const similarChannels = channel.category_id
      ? (await getChannelsByCategory(channel.category_id)).filter(c => c.id !== channel.id).slice(0, 6)
      : [];

    return (
      <>
        {/* Channel Structured Data */}
        <JsonLd data={generateChannelSchema(channel, baseUrl)} />
        <JsonLd data={generateBreadcrumbSchema([
          { name: 'Anasayfa', url: baseUrl },
          { name: channel.categoryName || 'Kategori', url: `${baseUrl}/${(channel as any).categories?.slug || ''}` },
          { name: channel.name, url: `${baseUrl}/${channel.slug}` }
        ])} />

        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6 flex gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
            <span>/</span>
            <Link href={`/${(channel as any).categories?.slug}`} className="hover:text-blue-600">{channel.categoryName}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{channel.name}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <ChannelDetail channel={channel} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-4">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Öne Çıkan Kanallar</h3>
                <div className="space-y-4">
                  {featuredChannels.map(featured => (
                    <Link key={featured.id} href={`/${featured.slug}`} className="flex items-center gap-3 group">
                      {featured.image ? (
                        <img src={featured.image} alt={featured.name} className="w-10 h-10 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{featured.name[0]}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 truncate">{featured.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{featured.member_count?.toLocaleString()} abone</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Internal Link Block */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3 text-sm">Popüler Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                                    <Link href="/teknoloji" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Teknoloji</Link>
                                    <Link href="/kripto-para" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Kripto Para</Link>
                                    <Link href="/egitim-ders" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Eğitim</Link>
                                    <Link href="/haber" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Haber</Link>
                                    <Link href="/spor" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Spor</Link>
                                    <Link href="/sohbet" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Sohbet</Link>
                                </div>
              </div>
            </div>
          </div>

          {/* Similar Channels Section (Internal Linking Strength) */}
          {similarChannels.length > 0 && (
            <section className="mt-16 pt-12 border-t">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">
                  🔗 Benzer {channel.categoryName} Kanalları
                </h2>
                <Link href={`/${(channel as any).categories?.slug}`} className="text-blue-600 font-bold hover:underline">
                  Tümünü Gör &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {similarChannels.map(c => (
                  <ChannelCard key={c.id} channel={c} />
                ))}
              </div>
            </section>
          )}

          {/* User Comments Component for SEO & Engagement */}
          <Comments channelId={channel.id} />

          {/* User Guide Internal Link */}
          <section className="mt-16 bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Telegram Dünyasını Keşfedin</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Telegram kanallarını nasıl kullanacağınızı, en iyi botları ve gizlilik ayarlarını öğrenmek için rehberlerimizi ziyaret edin.
            </p>
            <Link href="/blog" className="inline-block bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black transition-all">
              BLOG & REHBERLER
            </Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // 3. Attempt Redirect
  const rdr = await getRedirect(`/${slug}`);
  if (rdr) {
    redirect(rdr.new_path);
  }

  // 4. Fallback to 404
  notFound();
}
