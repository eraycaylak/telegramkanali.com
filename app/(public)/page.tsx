import Link from 'next/link';
import { Globe, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getCategories, getChannels, getFeaturedChannels, getPopularChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import BannerGrid from '@/components/BannerGrid';
import SearchFilter from '@/components/SearchFilter';
import PopularTicker from '@/components/PopularTicker';
import Pagination from '@/components/Pagination';
import JsonLd, { generateFAQSchema, generateItemListSchema, generateSiteLinksSearchBoxSchema } from '@/components/JsonLd';
import FeaturedAds from '@/components/FeaturedAds';
import PromotedChannels from '@/components/PromotedChannels';
import SponsoredChannelSlot from '@/components/SponsoredChannelSlot';
import { Channel, Category } from '@/lib/types';
import { Suspense } from 'react';
import { Metadata } from 'next';

// 5 dakika cache — her request'te DB sorgusu yapmak Netlify function invocation tüketiyor
export const revalidate = 300;


const faqs = [
  {
    question: "Telegram Kanalları nedir?",
    answer: "Telegram kanalları, yöneticilerin sınırsız sayıda aboneye mesaj, fotoğraf, video ve dosya paylaşabildiği tek yönlü iletişim platformlarıdır. Detaylı liste için en iyi Telegram kanalları sayfamızı inceleyebilirsiniz.",
    link: { href: "/rehber/en-iyi-telegram-kanallari", text: "en iyi Telegram kanalları", className: "underline" }
  },
  {
    question: "Telegram kanallarına nasıl katılabilirim?",
    answer: "Sitemizdeki listelerden ilginizi çeken kanalı seçin, 'KANALA GİT' butonuna tıklayın ve açılan Telegram uygulamasında 'Katıl' butonuna basın.",
  },
  {
    question: "Telegram güvenli mi?",
    answer: "Evet, Telegram güvenli bir mesajlaşma uygulamasıdır. Kanallara katıldığınızda telefon numaranız diğer üyeler tarafından görülmez.",
  },
  {
    question: "Kendi kanalımı nasıl ekleyebilirim?",
    answer: "Kanalınızı sitemize eklemek için 'Kanal Ekle' sayfasını ziyaret edebilir veya iletişim bölümünden bize ulaşabilirsiniz.",
    link: { href: "/kanal-ekle", text: "Kanal Ekle", className: "underline" }
  }
];

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Dinamik Meta Data (GÖREV 3: Anasayfa dinamik meta)
export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const sp = await searchParams;
  const { q: search, category: categoryId, page: pageParam } = sp || {};
  const page = pageParam ? parseInt(pageParam as string) : 1;

  if (search) {
    return {
      title: `"${search}" Arama Sonuçları | Telegram Kanalları`,
      description: `"${search}" kelimesi ile ilgili en iyi Telegram kanalları, grupları ve botları.`,
    };
  }

  if (categoryId) {
    return {
      title: `Telegram Kanalları | Kategori Filtresi`,
      description: `Seçili kategorideki en popüler Telegram kanallarını keşfedin.`,
      openGraph: {
        title: `Telegram Kanalları | Kategori Filtresi`,
        description: `Seçili kategorideki en popüler Telegram kanallarını keşfedin.`,
      }
    };
  }

  // Pagination: unique title/desc for each page
  if (page > 1) {
    return {
      title: `Telegram Kanalları ve Grupları — Sayfa ${page} (2026)`,
      description: `Telegram kanalları ve grupları listesi sayfa ${page}. En iyi ve en aktif Telegram topluluklarını keşfedin.`,
      alternates: {
        canonical: `https://telegramkanali.com/?page=${page}`,
      },
      openGraph: {
        title: `Telegram Kanalları — Sayfa ${page}`,
        description: `Telegram kanalları listesi sayfa ${page}. En aktif kanalları keşfedin.`,
      },
    };
  }

  return {
    title: "Telegram Kanalları ve Grupları (2026)",
    description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
    openGraph: {
      title: "Telegram Kanalları ve Grupları (2026)",
      description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
    },
    twitter: {
      title: "Telegram Kanalları ve Grupları (2026)",
      description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
    }
  };
}

export default async function Home({ searchParams }: HomeProps) {
  // Await searchParams properly (Next 15+)
  const resolvedSearchParams = await searchParams;
  const { q: search, category: categoryId, page: pageParam } = resolvedSearchParams || {};
  const page = pageParam ? parseInt(pageParam as string) : 1;
  const LIMIT = 20;

  let featuredChannels: Channel[] = [];
  let allChannels: Channel[] = [];
  let totalCount = 0;
  let categories: Category[] = [];
  let popularChannels: Channel[] = [];
  let errorMsg = '';

  try {
    // Parallel data fetching for performance
    const [featuredRes, channelsRes, categoriesRes, popularRes] = await Promise.all([
      getFeaturedChannels(),
      getChannels(page, LIMIT, search as string, categoryId as string),
      getCategories(),
      (!search && !categoryId) ? getPopularChannels(5) : Promise.resolve([])
    ]);

    featuredChannels = featuredRes;
    allChannels = channelsRes.data;
    totalCount = channelsRes.count;
    categories = categoriesRes;
    popularChannels = popularRes as Channel[];

  } catch (err: any) {
    console.error('Homepage Data Fetch Error:', err);
    // In production, we might want to log this deeper
    errorMsg = 'Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }

  const totalPages = Math.ceil(totalCount / LIMIT);

  // Split channels into batches for interleaving with banners
  const firstBatch = allChannels.slice(0, 6);
  const remainingChannels = allChannels.slice(6);

  // Sayfalama (Pagination) SEO URL Builder
  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search as string);
    if (categoryId) params.set('category', categoryId as string);
    if (targetPage > 1) params.set('page', targetPage.toString());

    const qs = params.toString();
    // Vercel/Next.js canonical structure absolute URL could be better, but relative is also fine for rel="next/prev"
    return qs ? `/?${qs}` : '/';
  };

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-xl border border-red-200 m-8">
        <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Bir Hata Oluştu</h2>
        <p className="text-red-600 mb-6">{errorMsg}</p>
        <button onClick={() => { }} className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
          <RefreshCw size={18} />
          Lütfen Sayfayı Yenileyin
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Dynamic ItemList Schema */}
      {allChannels.length > 0 && (
        <JsonLd data={generateItemListSchema(
          allChannels.map((ch, i) => ({ name: ch.name, url: `https://telegramkanali.com/${ch.slug}`, position: i + 1 })),
          search ? `Arama Sonuçları: ${search}` : "En İyi Telegram Kanalları ve Grupları"
        )} />
      )}

      {/* WebSite Search Box Schema */}
      <JsonLd data={generateSiteLinksSearchBoxSchema('https://telegramkanali.com')} />

      {/* Breadcrumb Schema */}
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Anasayfa",
            "item": "https://telegramkanali.com/"
          }
        ]
      }} />

      {/* Popular Ticker (Editor's Picks) */}
      <PopularTicker channels={popularChannels} />

      {/* Story Ads */}
      <FeaturedAds adType="story" maxAds={10} />

      {/* Compact Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Telegram Kanalları ve Grupları
          </h1>
          <p className="text-gray-500 text-sm mt-1">Güncel ve aktif Telegram kanalları dizini</p>
        </div>
      </div>

      {/* 🔥 Öne Çıkanlar — Above the Fold */}
      <PromotedChannels />

      {/* First 2 Banners */}
      {!search && !categoryId && <BannerGrid maxBanners={2} />}

      {/* Sponsored Banner Ads */}
      <FeaturedAds adType="banner" maxAds={1} />

      {/* First Batch of Channels (6) — 1. sıraya featured reklam eklendi */}
      <section id="channels-list" className="scroll-mt-20">
        <h2 className="sr-only">Kanal Listesi</h2>

        {allChannels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {/* 1. Pozisyon: Rotating Featured Ad (sadece page 1, filtre yoksa) */}
              {page === 1 && !search && !categoryId && (
                <SponsoredChannelSlot />
              )}
              {firstBatch.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>

            {/* Remaining Banners */}
            {remainingChannels.length > 0 && !search && !categoryId && (
              <div className="my-6">
                <BannerGrid offset={2} />
              </div>
            )}

            {/* Remaining Banner Ads */}
            {remainingChannels.length > 0 && (
              <div className="my-6">
                <FeaturedAds adType="banner" maxAds={2} />
              </div>
            )}

            {/* 🛒 Marketplace Promo Strip */}
            {!search && !categoryId && page === 1 && (
              <Link
                href="/marketplace"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  margin: '20px 0',
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #10b981 100%)',
                  borderRadius: 14,
                  textDecoration: 'none',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 24px rgba(5,150,105,0.25)',
                }}
              >
                {/* Dekoratif arka plan daireler */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: '40%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🛒</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Telegram Kanal Alım & Satım
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Escrow güvencesiyle güvenli kanal ticareti
                    </div>
                  </div>
                </div>

                <span style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.25)',
                  position: 'relative',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                }}>
                  Marketplace →
                </span>
              </Link>
            )}

            {/* Remaining Channels */}
            {remainingChannels.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-6">
                {remainingChannels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Aradığınız kriterlere uygun kanal bulunamadı.</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 font-medium underline hover:text-blue-800">Filtreleri Temizle</Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
          </div>
        )}
      </section>

      {/* 🚀 KRİPTO HUB SECTION — SEO Internal Linking */}
      {!search && !categoryId && page === 1 && (
        <section className="py-2">
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
            {/* Dekoratif arka plan */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-24 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">₿</span>
                <div>
                  <h2 className="text-xl md:text-2xl font-black">Kripto Para &amp; Borsa Telegram Kanalları</h2>
                  <p className="text-orange-100 text-sm">192+ aktif kripto, borsa ve bitcoin sinyal kanalı</p>
                </div>
              </div>

              {/* Kripto keyword linkleri — iç linkler için kritik */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-5">
                {[
                  { href: '/kripto-telegram-kanallari', label: '₿ Kripto Kanallar' },
                  { href: '/bitcoin-telegram-kanallari', label: '🪙 Bitcoin' },
                  { href: '/borsa-telegram-kanallari', label: '📈 Borsa' },
                  { href: '/ethereum-telegram-kanallari', label: '⟠ Ethereum' },
                  { href: '/kripto-sinyal-telegram', label: '📡 Sinyaller' },
                  { href: '/binance-telegram-kanallari', label: '🟡 Binance' },
                  { href: '/altcoin-telegram-kanallari', label: '🚀 Altcoin' },
                  { href: '/futures-telegram-kanallari', label: '⚡ Futures' },
                  { href: '/bist-telegram-kanallari', label: '🏦 BİST 100' },
                  { href: '/defi-telegram-kanallari', label: '🔗 DeFi' },
                  { href: '/nft-telegram-kanallari', label: '🎨 NFT' },
                  { href: '/solana-telegram-kanallari', label: '◎ Solana' },
                  { href: '/usdt-telegram-kanallari', label: '💵 USDT' },
                  { href: '/bist-telegram-kanallari', label: '📊 Hisse' },
                  { href: '/kripto-para', label: '💎 Tüm Kripto' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs font-bold text-center bg-white/15 hover:bg-white/25 backdrop-blur-sm px-2 py-2 rounded-xl transition border border-white/20 truncate"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/kripto-para"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-6 py-2.5 rounded-xl hover:bg-orange-50 transition text-sm shadow-lg"
              >
                Tüm Kripto Kanallarını Gör →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SEO Content Section — Below Channels */}
      <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100 mt-12">
        <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">
          <article className="prose prose-blue max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">Telegram</span> Kanalları (2026)
            </h2>
            <p className="mb-4 text-lg">
              Telegram, güvenli ve hızlı mesajlaşma deneyimi sunan popüler bir uygulamadır. Sitemizdeki <Link href="/teknoloji" className="text-blue-600 font-bold hover:underline">Teknoloji Telegram kanalları</Link> listesi ile ilgi alanlarınıza uygun toplulukları kolayca keşfedebilirsiniz. Aktif olarak güncellenen dizinimiz sayesinde binlerce farklı kategoride en kaliteli gruplara ulaşmak artık çok daha kolay.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-3">Popüler Telegram Kanalları ve Kategorileri</h3>
            <p className="mb-4">
              Kullanıcılarımızın ilgi alanlarına göre özenle listelediğimiz kategoriler sayesinde, aradığınız içeriğe hızlıca ulaşabilirsiniz. Örneğin, internet dünyasındaki son gelişmeleri takip etmek ve yeni bilgiler öğrenmek isterseniz <Link href="/teknoloji" className="text-blue-600 font-bold hover:underline">Teknoloji Kanalları</Link> kategorimizi inceleyebilirsiniz. Yatırım araçları, borsa ve dijital varlıklarla ilgilenen kullanıcılarımız içinse özel olarak derlenmiş <Link href="/kripto-para" className="text-blue-600 font-bold hover:underline">Kripto Para Kanalları</Link> bölümümüz oldukça yoğun ilgi görmektedir.
            </p>
            <p className="mb-4">
              Ayrıca yabancı dil öğrenmek, soru çözmek veya sınavlara hazırlanan öğrencilerin sıklıkla tercih ettiği <Link href="/egitim-ders" className="text-blue-600 font-bold hover:underline">Eğitim ve Ders Kanalları</Link> sayesinde binlerce ücretsiz kaynağa, çalışma notlarına ve online denemelerle ilgili detaylara Telegram üzerinden hızlıca erişim sağlayabilirsiniz. Günün stresini atmak için ise <Link href="/sohbet" className="text-blue-600 font-bold hover:underline">Sohbet Grupları</Link> ideal bir tercih olacaktır.
            </p>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-6 flex items-start gap-4">
              <Globe className="text-blue-500 flex-shrink-0 mt-1" size={32} />
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Telegram Kanallarına Nasıl Katılınır?</h3>
                <p className="text-sm">
                  Sitemiz üzerinden "Kanala Git" veya "Katıl" butonlarına tıklayarak doğrudan Telegram uygulamasına yönlendirilirsiniz. Öncesinde bir hesaba ihtiyacınız varsa uygulamasını indirip kısa sürede kullanmaya başlayabilirsiniz.
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Kategoriler</h3>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/${c.slug}`}
                    className="block px-3 py-2.5 rounded-xl transition-all text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600"
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
              Jeton satın alarak kanalınızı en üst sıraya taşıyın ve binlerce yeni abone kazanın.
            </p>
            <Link href="/dashboard/ads" className="block w-full bg-white text-purple-600 text-center font-black py-3 rounded-xl hover:bg-purple-50 transition-colors">
              HEMEN BAŞLA
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Schema */}
      <JsonLd data={generateFAQSchema(faqs)} />

      {/* Visual FAQ Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="text-blue-600" />
          Sık Sorulan Sorular
        </h2>
        <div className="grid gap-4 max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md">
              <summary className="flex items-center justify-between p-5 font-medium text-gray-800 list-none">
                {faq.question}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.answer}
                {faq.link && (
                  <div className="mt-2">
                    <Link href={faq.link.href} className={`text-blue-600 hover:text-blue-800 ${faq.link.className || ''}`}>
                      {faq.link.text}
                    </Link>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
