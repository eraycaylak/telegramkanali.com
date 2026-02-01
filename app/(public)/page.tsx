import Link from 'next/link';
import { ShieldCheck, Zap, Globe, HelpCircle, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { getCategories, getChannels, getFeaturedChannels, getPopularChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import BannerGrid from '@/components/BannerGrid';
import SearchFilter from '@/components/SearchFilter';
import Pagination from '@/components/Pagination';
import JsonLd, { generateFAQSchema } from '@/components/JsonLd';
import { Channel, Category } from '@/lib/types';
import { Suspense } from 'react';

// Cache for 60 seconds - improves performance
export const revalidate = 60;
export const dynamic = 'force-dynamic';

const faqs = [
  {
    question: "Telegram Kanalları nedir?",
    answer: "Telegram kanalları, yöneticilerin sınırsız sayıda aboneye mesaj, fotoğraf, video ve dosya paylaşabildiği tek yönlü iletişim platformlarıdır. Detaylı liste için en iyi Telegram kanalları sayfamızı inceleyebilirsiniz.",
    link: { href: "/rehber/en-iyi-telegram-kanallari", text: "en iyi Telegram kanalları" }
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
    link: { href: "/kanal-ekle", text: "Kanal Ekle" }
  }
];

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: HomeProps) {
  // Await searchParams properly (Next 15+)
  const { q: search, category: categoryId, page: pageParam } = (await searchParams) || {};
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
    <div className="space-y-8">

      {/* SEO H1-H2 Hierarchy */}
      <div className="text-center border-b border-gray-200 pb-6 pt-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">En İyi Telegram Kanalları ve Grupları (2026)</h1>
        <h2 className="text-gray-500 font-light text-lg tracking-wider">Güncel ve Aktif Telegram Kanalları - Şubat 2026</h2>
      </div>

      {/* POPULAR CHANNELS (Only show on first page & no filters) */}
      {popularChannels.length > 0 && (
        <section className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={120} className="text-gray-900" />
          </div>

          <div className="text-center md:text-left mb-6 relative z-10">
            <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
              <TrendingUp className="text-blue-600" />
              Editörün Seçimi: Popüler Kanallar
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
            {popularChannels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} compact={true} />
            ))}
          </div>
        </section>
      )}

      {/* SEARCH AND FILTER */}
      <section id="filter-section" className="sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 border-b border-gray-100 shadow-sm -mx-4 px-4 md:mx-0 md:px-0 md:rounded-xl">
        <Suspense fallback={<div className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>}>
          <SearchFilter categories={categories} />
        </Suspense>
      </section>

      {/* Banner Grid (Dynamic from DB - Only show if no search) */}
      {!search && !categoryId && <BannerGrid />}

      {/* MASSIVE Channels Grid */}
      <section id="channels-list" className="scroll-mt-20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500 font-medium">Toplam {totalCount} kanal listeleniyor</span>
        </div>

        {allChannels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
            <Link href="/" className="mt-4 inline-block text-blue-600 font-medium hover:underline">Filtreleri Temizle</Link>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={page} searchParams={searchParams} />
        </div>
      </section>

      {/* SEO / Blog Content Section */}
      <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100 mt-12">
        <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">
          <article className="prose prose-blue max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">Telegram</span> Kanalları
            </h2>
            <p className="mb-4">
              Telegram, güvenli ve hızlı mesajlaşma deneyimi sunan popüler bir uygulamadır. Sitemizdeki <Link href="/rehber/en-iyi-telegram-kanallari" className="text-blue-600 hover:underline">En iyi Telegram kanalları</Link> listesi ile ilgi alanlarınıza uygun toplulukları keşfedebilirsiniz.
            </p>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-6 flex items-start gap-4">
              <Globe className="text-blue-500 flex-shrink-0 mt-1" size={32} />
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Telegram Kanalları ile İletişim</h3>
                <p className="text-sm">
                  Milyonlarca kullanıcıya hitap eden Telegram kanalları; haber, eğlence, eğitim ve kripto gibi birçok kategoride içerik sunar.
                </p>
              </div>
            </div>
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
              </div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
