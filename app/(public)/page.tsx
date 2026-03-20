import Link from 'next/link';
import { ShieldCheck, Zap, Globe, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getCategories, getChannels, getFeaturedChannels, getPopularChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import BannerGrid from '@/components/BannerGrid';
import SearchFilter from '@/components/SearchFilter';
import PopularTicker from '@/components/PopularTicker';
import Pagination from '@/components/Pagination';
import JsonLd, { generateFAQSchema, generateItemListSchema } from '@/components/JsonLd';
import FeaturedAds from '@/components/FeaturedAds';
import { Channel, Category } from '@/lib/types';
import { Suspense } from 'react';
import { Metadata } from 'next';

// Always dynamic so search params work correctly
export const dynamic = 'force-dynamic';


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

  if (search) {
    return {
      title: `"${search}" Arama Sonuçları | Telegram Kanalları`,
      description: `"${search}" kelimesi ile ilgili en iyi Telegram kanalları, grupları ve botları.`,
    };
  }

  if (categoryId) {
    // Determine category metadata dynamically if possible, or provide a robust fallback
    return {
      title: `Telegram Kanalları | Kategori Filtresi`,
      description: `Seçili kategorideki en popüler Telegram kanallarını keşfedin.`,
      openGraph: {
        title: `Telegram Kanalları | Kategori Filtresi`,
        description: `Seçili kategorideki en popüler Telegram kanallarını keşfedin.`,
      }
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

      {/* Dynamic ItemList Schema (GÖREV 3) */}
      {allChannels.length > 0 && (
        <JsonLd data={generateItemListSchema(
          allChannels.map((ch, i) => ({ name: ch.name, url: `https://telegramkanali.com/${ch.slug}`, position: i + 1 })),
          search ? `Arama Sonuçları: ${search}` : "En İyi Telegram Kanalları ve Grupları"
        )} />
      )}

      {/* Breadcrumb Schema (GÖREV 3) */}
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

      {/* SEO H1 Hierarchy (Main Page Title) */}
      <div className="text-center pb-2 pt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Telegram Kanalları ve Grupları (2026)</h1>
        <p className="text-gray-500 text-sm tracking-wide">Güncel ve Aktif Telegram Kanalları - Şubat 2026</p>
      </div>

      {/* Banner Grid (Dynamic from DB - Only show if no search) */}
      {!search && !categoryId && <BannerGrid />}

      {/* Banner Ads */}
      <FeaturedAds adType="banner" maxAds={100} />

      {/* Sponsored Featured Channels */}
      <FeaturedAds adType="featured" maxAds={100} />

      {/* MASSIVE Channels Grid */}
      <section id="channels-list" className="scroll-mt-20">
        <h2 className="sr-only">Kanal Listesi</h2>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500 font-medium">Toplam {totalCount} kanal listeleniyor</span>
        </div>

        {allChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {allChannels.map((channel, index) => (
              <div key={channel.id} className="contents">
                <ChannelCard channel={channel} />

                {/* Ad Placeholder after 6th item */}
                {index === 5 && (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 my-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
                    <span className="text-gray-400 font-bold tracking-widest text-sm z-10">REKLAM ALANI</span>
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Aradığınız kriterlere uygun kanal bulunamadı.</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 font-medium underline hover:text-blue-800">Filtreleri Temizle</Link>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
        </div>
      </section>

      {/* SEO / Blog Content Section */}
      <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100 mt-12">
        <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">
          <article className="prose prose-blue max-w-none">
            {/* Changed from H3 to H2 */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">Telegram</span> Kanalları (2026)
            </h2>
            <p className="mb-4 text-lg">
              Telegram, güvenli ve hızlı mesajlaşma deneyimi sunan popüler bir uygulamadır. Sitemizdeki <Link href="/rehber/en-iyi-telegram-kanallari" className="text-blue-600 font-bold hover:underline">En iyi Telegram kanalları</Link> listesi ile ilgi alanlarınıza uygun toplulukları kolayca keşfedebilirsiniz. Aktif olarak güncellenen dizinimiz sayesinde binlerce farklı kategoride en kaliteli gruplara ulaşmak artık çok daha kolay.
            </p>

            {/* Changed from H4 to H3 */}
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
                {/* Changed from H4 to H3 */}
                <h3 className="font-bold text-gray-900 text-lg mb-2">Telegram Kanallarına Nasıl Katılınır?</h3>
                <p className="text-sm">
                  Sitemiz üzerinden "Kanala Git" veya "Katıl" butonlarına tıklayarak doğrudan Telegram uygulamasına yönlendirilirsiniz. Öncesinde bir hesaba ihtiyacınız varsa uygulamasını indirip kısa sürede kullanmaya başlayabilirsiniz.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mt-4">
              * Not: Sitemizde yer alan listeler topluluk paylaşımlarıyla oluşturulmaktadır. Herhangi bir kanala/gruba katılırken platform kurallarına uymayı unutmayınız.
            </p>
          </article>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Kategoriler</h3>
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/${c.slug}`} className="flex items-center justify-between text-gray-600 hover:text-blue-600 hover:pl-2 transition-all">
                    <span>{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
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
