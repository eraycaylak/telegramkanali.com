import { getCategoryBySlug, getChannelsByCategory, getCategories, getChannelBySlug, getFeaturedChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import ChannelDetail from '@/components/ChannelDetail';
import BannerGrid from '@/components/BannerGrid';
import FeaturedAds from '@/components/FeaturedAds';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd, { generateBreadcrumbSchema, generateChannelSchema, generateItemListSchema } from '@/components/JsonLd';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Try Category
  const category = await getCategoryBySlug(slug);
  if (category) {
    return {
      title: `${category.name} Telegram Kanalları - 2026`,
      description: `${category.name} kategorisindeki en iyi ve popüler Telegram kanallarını keşfedin. Güvenilir ${category.name} grupları ve listeleri.`,
      alternates: {
        canonical: `${baseUrl}/${category.slug}`,
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
      }
    };
  }

  return {
    title: 'Sayfa Bulunamadı - Telegram Kanalları',
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Attempt to fetch Category
  const category = await getCategoryBySlug(slug);

  // === RENDER CATEGORY VIEW ===
  if (category) {
    const allCategories = await getCategories();
    const channels = await getChannelsByCategory(category.id);

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
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Category Header with SEO Intro */}
          <div className="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                🔥 {category.name} Telegram Kanalları (2026)
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">{category.description}</p>
            </div>

            {/* SEO Intro Section */}
            {category.seo_intro ? (
              <div className="mt-6 pt-6 border-t border-gray-100 prose prose-blue max-w-none">
                <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: category.seo_intro }} />
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">
                  {category.name} kategorisinde Türkiye'nin en popüler ve güvenilir Telegram kanallarını keşfedin.
                  Her kanal editörlerimiz tarafından incelenmiş ve onaylanmıştır. Tek tıkla katılın!
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{channels.length}</div>
                <div className="text-gray-500">Kanal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-gray-500">Doğrulanmış</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2026</div>
                <div className="text-gray-500">Güncel</div>
              </div>
            </div>
          </div>

          {/* Banner Grid */}
          <BannerGrid type="category" categoryId={category.id} />

          {/* Sponsored Banner Ads */}
          <FeaturedAds adType="banner" maxAds={1} categoryId={category.id} />

          {/* Sponsored Featured Channels */}
          <FeaturedAds adType="featured" maxAds={6} categoryId={category.id} />

          {/* Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {channels.length > 0 ? (
              channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                Bu kategoride henüz kanal bulunmuyor.
              </div>
            )}
          </div>

          {/* SEO Content Section */}
          <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100">
            <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">
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
                <p className="text-sm text-gray-500 mt-6 p-6 bg-red-50 rounded-xl border border-red-100">
                  <strong className="text-red-700">Yasal Uyarı:</strong> Sitemizde bulunan Telegram grubu veya kanalları içerisindeki paylaşımlardan site yönetimimiz mesul değildir. Herhangi bir mağduriyette sorumluluk kabul etmemektedir. Tüm Telegram kanalları ve gruplarına karşı dikkatli olunuz ve kişisel bilgilerinizi paylaşmayınız.
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
                  {featuredChannels.slice(0, 6).map(featured => (
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
                  <Link href="/rehber/teknoloji" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Teknoloji</Link>
                  <Link href="/rehber/kripto" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Kripto Para</Link>
                  <Link href="/rehber/egitim" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Eğitim</Link>
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

  // 3. Fallback to 404
  notFound();
}
