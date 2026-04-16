import { getCategoryBySlug, getChannelsByCategory, getCategories, getChannelBySlug, getFeaturedChannels, getChannels, getBlogPosts, getRedirect, getChannelsByCity } from '@/lib/data';
import { getPromotedChannels } from '@/app/actions/promoted';
import { getBanners } from '@/app/actions/banners';
import ChannelCard from '@/components/ChannelCard';
import ChannelDetail from '@/components/ChannelDetail';
import BannerGrid from '@/components/BannerGrid';
import FeaturedAds from '@/components/FeaturedAds';
import SponsoredChannelSlot from '@/components/SponsoredChannelSlot';
import TwitterFeed from '@/components/TwitterFeed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd, { generateBreadcrumbSchema, generateChannelSchema, generateItemListSchema, generateCollectionPageSchema, generateAggregateRatingSchema } from '@/components/JsonLd';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Pagination from '@/components/Pagination';
import Comments from '@/components/Comments';
import { Clock, Eye, AlertCircle, TrendingUp } from 'lucide-react';

const baseUrl = 'https://telegramkanali.com';

/**
 * SEO title üret: 60 karakter limitini aşmadan en anlamlı başlığı oluştur.
 * Sırayla dener: uzun suffix → kısa suffix → sadece isim → kelime sınırında kes
 * Kelime ORTASINDA KEsme yapılmaz.
 */
function buildChannelTitle(name: string): string {
  const candidates = [
    `${name} Telegram Kanalı - Katıl`,   // ideal
    `${name} Telegram Kanalı`,            // kısa
    `${name} | Telegram`,                 // minimal
    name,                                 // sadece isim
  ];

  for (const title of candidates) {
    if (title.length <= 60) return title;
  }

  // Hepsi 60'ı aştıysa (isim >56 chr): kelime sınırında kes, "…" ekle
  const words = name.split(' ');
  let result = '';
  for (const word of words) {
    const next = result ? `${result} ${word}` : word;
    if ((next + '… | Telegram').length > 60) break;
    result = next;
  }
  return `${result || name.slice(0, 50)}… | Telegram`;
}

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


// ====== +18 Ana Keyword Hedef Sayfaları ======
const KEYWORD_18_PAGES: Record<string, { h1: string; title: string; description: string; intro: string; keywords: string[]; faqs: { question: string; answer: string }[] }> = {
  'telegram-18-kanallari': {
    h1: 'Telegram +18 Kanalları (2026)',
    title: 'Telegram +18 Kanalları 2026 | En İyi +18 Telegram Grupları Listesi',
    description: 'Telegram +18 kanalları 2026 güncel ve aktif listesi. En popüler +18 telegram grupları, yetişkin içerik kanalları. Türkiye\'nin en kapsamlı +18 telegram kanal rehberi.',
    keywords: ['telegram +18 kanalları', '+18 telegram kanalları', '+18 telegram', 'telegram 18 kanalları', 'telegram yetişkin kanalları'],
    intro: 'Telegram +18 kanalları, yetişkinlere özel içeriklerin paylaşıldığı ve yalnızca 18 yaş üstü kullanıcılara açık olan Telegram topluluklarıdır. 2026 yılına ait en güncel ve aktif Telegram +18 kanallarını aşağıdaki listede bulabilirsiniz. Sitemizde yer alan tüm +18 Telegram kanalları düzenli olarak kontrol edilmekte, aktif olmayan kanallar listeden çıkarılmaktadır.',
    faqs: [
      { question: 'Telegram +18 kanalları nedir?', answer: 'Telegram +18 kanalları, yalnızca 18 yaş ve üzeri kullanıcılara yönelik içeriklerin paylaşıldığı özel Telegram kanallarıdır. Bu kanallara katılmak için Telegram uygulamasının yüklü olması yeterlidir.' },
      { question: 'Telegram +18 kanallarına nasıl katılınır?', answer: 'Listemizden ilginizi çeken kanalı seçin ve \'Kanala Git\' butonuna tıklayın. Telegram uygulaması açılacak ve doğrudan kanala katılabileceksiniz. Ücretsiz ve anında erişim sağlayabilirsiniz.' },
      { question: 'Telegram +18 kanalları güvenli mi?', answer: 'Telegram, world-class şifreleme teknolojisi kullanan güvenli bir mesajlaşma uygulamasıdır. Kanallara katıldığınızda telefon numaranız diğer üyeler tarafından görülmez. Güvenilir kanalları tercih etmenizi öneririz.' },
      { question: 'Telegram +18 kanalları ücretsiz mi?', answer: 'Listemizde yer alan Telegram +18 kanallarının büyük çoğunluğuna ücretsiz katılabilirsiniz. Bazı kanallarda VIP üyelik seçenekleri sunulabilir, ancak bunlar zorunlu değildir.' },
      { question: 'En aktif Telegram +18 kanalları hangileri?', answer: 'Sitemizde listelenen kanallar üye sayısı ve aktivite skoruna göre sıralanmaktadır. En üstteki kanallar genellikle en aktif ve en çok takipçiye sahip +18 Telegram kanallarıdır.' },
    ],
  },
  '18-telegram-kanallari': {
    h1: '+18 Telegram Kanalları (2026)',
    title: '+18 Telegram Kanalları 2026 | Güncel Yetişkin Telegram Kanal Listesi',
    description: '+18 telegram kanalları 2026 güncel liste. En iyi yetişkin telegram grupları ve kanalları. Türkiye\'nin en kapsamlı +18 telegram kanal dizini.',
    keywords: ['+18 telegram kanalları', 'telegram +18 kanalları', '+18 telegram', 'yetişkin telegram kanalları', 'türk +18 telegram'],
    intro: '+18 Telegram kanalları; yetişkinlere yönelik özel içeriklerin paylaşıldığı, katılımı kolay ve tamamen ücretsiz erişilebilen Telegram topluluklarıdır. 2026 güncel listemizdeki tüm +18 telegram kanalları aktiflik kriterlerine göre seçilmiş ve düzenli olarak güncellenmektedir.',
    faqs: [
      { question: '+18 Telegram kanalları neler içeriyor?', answer: '+18 Telegram kanalları, yetişkinlere yönelik çeşitli içerikler sunmaktadır. Bu kanallar yalnızca 18 yaş ve üzeri kullanıcılara açıktır.' },
      { question: '+18 Telegram kanallarına nasıl ulaşabilirim?', answer: 'telegramkanali.com\'daki +18 kategori sayfasını ziyaret ederek veya bu listedeki kanallardan birini seçerek doğrudan Telegram uygulamasında ilgili kanala ulaşabilirsiniz.' },
      { question: '+18 Telegram kanallarına katılmak için ne gerekiyor?', answer: 'Telefonunuzda Telegram uygulamasının kurulu olması ve 18 yaşından büyük olmanız yeterlidir. Listemizden kanalı seçin ve \'Kanala Git\' butonuna tıklayın.' },
    ],
  },
  '18-telegram': {
    h1: '+18 Telegram (2026) — Yetişkin Kanallar ve Gruplar',
    title: '+18 Telegram 2026 | En İyi Yetişkin Telegram Kanalları ve Grupları',
    description: '+18 telegram 2026. Güncel +18 telegram kanalları, yetişkin telegram grupları ve aktif topluluklar. Türkiye\'nin en büyük +18 telegram dizini.',
    keywords: ['+18 telegram', 'telegram +18 kanalları', '+18 telegram kanalları', '+18 telegram grupları', 'telegram yetişkin'],
    intro: '+18 Telegram; Telegram platformundaki yetişkin içerik kanalları, gruplar ve toplulukların genel adıdır. 2026 yılında güncellenen kapsamlı listemizde en aktif +18 Telegram kanallarına ve gruplarına kolayca ulaşabilirsiniz. Tüm içerikler yalnızca 18 yaş ve üzeri kullanıcılara yöneliktir.',
    faqs: [
      { question: '+18 Telegram nedir?', answer: '+18 Telegram, Telegram platformunda yetişkinlere yönelik içeriklerin paylaşıldığı kanal ve grupların bütününü ifade eder. Yalnızca 18 yaş üzeri kullanıcılara açıktır.' },
      { question: '+18 Telegram kanallarına güvenli şekilde katılabilir miyim?', answer: 'Evet. Telegram, uçtan uca şifreleme kullanan güvenli bir uygulamadır. Kanallara katıldığınızda kimlik bilgileriniz gizli kalır.' },
      { question: '+18 Telegram kanallarını nerede bulabilirim?', answer: 'telegramkanali.com/18 adresinde Türkiye\'nin en kapsamlı +18 Telegram kanal listesini ücretsiz olarak bulabilirsiniz.' },
    ],
  },
  'turk-18-telegram-kanallari': {
    h1: 'Türk +18 Telegram Kanalları (2026)',
    title: 'Türk +18 Telegram Kanalları 2026 | Güncel Türkçe Yetişkin Kanal Listesi',
    description: 'Türk +18 telegram kanalları 2026 güncel liste. En iyi Türkçe yetişkin telegram grupları ve kanalları. Aktif Türk +18 telegram toplulukları.',
    keywords: ['türk +18 telegram kanalları', 'türkçe +18 telegram', 'türk yetişkin telegram', '+18 türk telegram'],
    intro: 'Türk +18 Telegram kanalları, Türkçe içerik üreten yöneticiler tarafından yönetilen ve Türk kullanıcılara yönelik yetişkin içeriklerin paylaşıldığı Telegram topluluklarıdır. 2026 güncel listemizde en aktif Türk +18 Telegram kanallarını bulabilirsiniz.',
    faqs: [
      { question: 'Türk +18 Telegram kanalları nelerdir?', answer: 'Türk +18 Telegram kanalları, Türkçe içerik sunan ve Türk kullanıcılara yönelik yetişkin içeriklerin paylaşıldığı Telegram kanallarıdır.' },
      { question: 'Türk +18 Telegram kanallarına nasıl katılınır?', answer: 'Listemizden ilginizi çeken Türk +18 kanalını seçin ve \'Kanala Git\' butonuna tıklayın. Telegram uygulaması üzerinden anında katılabilirsiniz.' },
    ],
  },
  'ucretsiz-18-telegram-kanallari': {
    h1: 'Ücretsiz +18 Telegram Kanalları (2026)',
    title: 'Ücretsiz +18 Telegram Kanalları 2026 | Bedava Yetişkin Telegram',
    description: 'Ücretsiz +18 telegram kanalları 2026. Bedava katılabileceğiniz en iyi yetişkin telegram grupları ve kanalları. Ücretsiz +18 telegram listesi.',
    keywords: ['ücretsiz +18 telegram kanalları', 'bedava +18 telegram', 'ücretsiz yetişkin telegram'],
    intro: 'Ücretsiz +18 Telegram kanalları, herhangi bir ücret ödemeden katılabileceğiniz yetişkin içerik topluluklarıdır. 2026 güncel listemizde tamamen ücretsiz erişilebilen +18 Telegram kanallarını bulabilirsiniz.',
    faqs: [
      { question: 'Ücretsiz +18 Telegram kanalları var mı?', answer: 'Evet. Listemizde yer alan Telegram +18 kanallarının büyük çoğunluğu ücretsizdir. Katılmak için herhangi bir ücret ödemenize gerek yoktur.' },
      { question: 'Ücretsiz ve ücretli +18 Telegram kanalları arasındaki fark nedir?', answer: 'Ücretsiz kanallar herkese açıkken, bazı VIP kanallar premium içerik için ücret talep edebilir. Listemizde her iki türde kanalı bulabilirsiniz.' },
    ],
  },
  '18': {
    h1: '+18 Telegram Kanalları (2026) — Yetişkin İçerik Rehberi',
    title: '+18 Telegram Kanalları 2026 | Yetişkin Telegram Kanal Listesi',
    description: '+18 Telegram kanalları 2026 güncel ve kapsamlı listesi. Yetişkinlere yönelik Telegram kanalları, grupları ve toplulukları. Türkiye\'nin en büyük +18 Telegram rehberi.',
    keywords: ['+18 telegram', '+18 telegram kanalları', 'telegram 18 kanalları', 'yetişkin telegram kanalları', 'türk +18 telegram'],
    intro: '+18 Telegram kanalları kategorisi; yalnızca 18 yaş ve üzeri kullanıcılara yönelik Telegram topluluklarını bir araya getirir. Bu sayfada Türkiye\'nin en kapsamlı +18 Telegram kanal rehberini bulabilirsiniz. Sitemizde yer alan tüm kanallar topluluğun önerileriyle oluşturulmakta, şikayet bildirimleri doğrultusunda güncellenmektedir. Tüm kanallar yalnızca 18 yaş üstü kullanıcılara açıktır.',
    faqs: [
      { question: '+18 Telegram kanalları nedir?', answer: '+18 Telegram kanalları, yalnızca 18 yaş ve üzeri yetişkinlere yönelik içeriklerin paylaşıldığı Telegram topluluklarıdır. Bu kanallara katılmak için Telegram uygulamasının yüklü ve kullanıcının 18 yaşını doldurmuş olması gerekmektedir.' },
      { question: '+18 Telegram kanallarına nasıl katılınır?', answer: 'Listemizden ilginizi çeken kanalı seçin, kanal sayfasını açın ve "Kanala Git" butonuna tıklayın. Telegram uygulaması açılarak sizi doğrudan ilgili kanala yönlendirecektir.' },
      { question: '+18 Telegram kanalları güvenli mi?', answer: 'Telegram, uçtan uca şifreleme kullanan güvenli bir mesajlaşma platformudur. Kanallara katıldığınızda telefon numaranız diğer üyeler tarafından görülmez.' },
      { question: '+18 Telegram kanallarını nasıl şikayet edebilirim?', answer: 'Herhangi bir kanalı şikayet etmek için kanal sayfasındaki "Şikayet Et" butonunu kullanabilir ya da telegramkanaliiletisim@outlook.com adresine e-posta gönderebilirsiniz. Tüm şikayetler incelenerek gerekli işlem yapılır.' },
      { question: 'Kanal bulunamıyorsa ne yapmalıyım?', answer: 'Telegram kanalları zaman zaman silinebilir veya özel hale gelebilir. Listemiz düzenli güncellense de bazı kanallar aktif olmayabilir. Alternatif kanalları listemizde bulabilirsiniz.' },
    ],
  },
};

type Keyword18PageType = typeof KEYWORD_18_PAGES[string];

function getKeyword18PageFromSlug(slug: string): { key: string; page: Keyword18PageType } | null {
  const page = KEYWORD_18_PAGES[slug];
  return page ? { key: slug, page } : null;
}

function getCityFromSlug(slug: string): { key: string; city: typeof CITIES[string] } | null {
  if (!slug.endsWith('-telegram-gruplari')) return null;
  const key = slug.replace('-telegram-gruplari', '');
  const city = CITIES[key];
  return city ? { key, city } : null;
}


export default async function DynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  // ====== +18 KEYWORD SAYFASI RENDER ======
  const keyword18Match = getKeyword18PageFromSlug(slug);
  if (keyword18Match) {
    const { key: kw18Key, page: kw18Page } = keyword18Match;
    const categories = await getCategories();
    const kw18Channels = await getChannelsByCategory('18');
    const firstBatch18 = kw18Channels.slice(0, 6);
    const remaining18 = kw18Channels.slice(6, 30);

    const kw18FaqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: kw18Page.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    };

    const kw18BreadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: '+18 Kanalları', item: `${baseUrl}/18` },
        { '@type': 'ListItem', position: 3, name: kw18Page.h1, item: `${baseUrl}/${kw18Key}` },
      ],
    };

    const kw18CollectionSchema = generateCollectionPageSchema(
      kw18Page.title,
      kw18Page.description,
      `${baseUrl}/${kw18Key}`,
      kw18Channels.length,
      baseUrl
    );

    const kw18ItemListSchema = generateItemListSchema(
      kw18Channels.slice(0, 20).map((ch, i) => ({ name: ch.name, url: `${baseUrl}/${ch.slug}`, position: i + 1 })),
      kw18Page.h1
    );

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(kw18FaqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(kw18BreadcrumbSchema) }} />
        <JsonLd data={kw18CollectionSchema} />
        <JsonLd data={kw18ItemListSchema} />
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex gap-2 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
            <span>/</span>
            <Link href="/18" className="hover:text-red-600">+18 Kanalları</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{kw18Page.h1}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Content */}
            <div className="space-y-6">
              {/* H1 Hero */}
              <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-7 text-white shadow-xl">
                <div className="text-4xl mb-3">🔞</div>
                <h1 className="text-2xl md:text-3xl font-black mb-3">{kw18Page.h1}</h1>
                <p className="text-red-100 text-base leading-relaxed max-w-2xl">{kw18Page.intro}</p>
                <div className="mt-5 flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-black">{kw18Channels.length}</div>
                    <div className="text-red-200">Aktif Kanal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black">✓</div>
                    <div className="text-red-200">Doğrulandı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black">2026</div>
                    <div className="text-red-200">Güncel</div>
                  </div>
                </div>
              </div>

              {/* First 6 Channels */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {firstBatch18.map((channel: any) => (
                  <ChannelCard key={channel.id} channel={channel} isAdult={true} />
                ))}
              </div>

              {/* Banner */}
              <BannerGrid type="category" categoryId="18" maxBanners={2} />

              {/* Remaining Channels */}
              {remaining18.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {remaining18.map((channel: any) => (
                    <ChannelCard key={channel.id} channel={channel} isAdult={true} />
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="text-center py-4">
                <Link href="/18" className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/20">
                  Tüm +18 Kanalları Gör →
                </Link>
              </div>

              {/* FAQ */}
              {kw18Page.faqs.length > 0 && (
                <section className="space-y-4 pt-6 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">❓ Sık Sorulan Sorular</h2>
                  {kw18Page.faqs.map((faq, i) => (
                    <details key={i} className="bg-gray-50 rounded-xl border border-gray-100 group">
                      <summary className="p-4 font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                        {faq.question}
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 text-gray-600 leading-relaxed">{faq.answer}</div>
                    </details>
                  ))}
                </section>
              )}

              {/* SEO Metin Bloğu */}
              <section className="prose prose-sm max-w-none text-gray-600 pt-6 border-t border-gray-100 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Telegram +18 Kanalları Hakkında Bilmeniz Gerekenler</h2>
                <p>
                  <strong>Telegram +18 kanalları</strong>, yetişkinlere yönelik içeriklerin paylaşıldığı ve yalnızca 18 yaş üstü kullanıcılara açık olan Telegram topluluklarıdır.
                  Bu kanallar; Telegram&apos;ın güçlü gizlilik özellikleri sayesinde kullanıcıların kimliklerini ifşa etmeden içeriklere erişebildiği platformlardır.
                </p>
                <h3 className="text-lg font-bold text-gray-800">+18 Telegram Kanallarına Nasıl Katılınır?</h3>
                <p>
                  <strong>+18 Telegram kanallarına</strong> katılmak için telegramkanali.com/18 adresini ziyaret edin.
                  Listeden ilginizi çeken kanalı seçin ve &quot;Kanala Git&quot; butonuna tıklayın. Telegram uygulaması açılacak ve doğrudan kanala katılabileceksiniz.
                </p>
                <p className="text-sm text-gray-500">
                  Sitemiz 5651 sayılı kanun kapsamında &quot;Yer Sağlayıcı&quot; olarak hizmet vermektedir.
                  Tüm kanallar topluluk tarafından eklenmekte olup içerikler kanal yöneticilerinin sorumluluğundadır.
                  18 yaş altı kullanıcıların bu içeriklere erişimi yasaktır.
                </p>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* İlgili +18 Sayfaları */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">🔥 İlgili +18 Sayfaları</h3>
                <ul className="space-y-2">
                  {Object.entries(KEYWORD_18_PAGES).filter(([k]) => k !== kw18Key).map(([key, p]) => (
                    <li key={key}>
                      <Link href={`/${key}`} className="text-red-600 hover:text-red-800 hover:underline text-sm">
                        → {p.h1}
                      </Link>
                    </li>
                  ))}
                  <li><Link href="/18" className="text-red-600 hover:text-red-800 hover:underline text-sm font-bold">→ Tüm +18 Telegram Kanalları</Link></li>
                  <li><Link href="/telegram-18-kanallari" className="text-red-600 hover:text-red-800 hover:underline text-sm">→ Telegram +18 Kanalları</Link></li>
                  <li><Link href="/telegram-18-kanallari" className="text-red-600 hover:text-red-800 hover:underline text-sm">→ Türk +18 Kanalları</Link></li>
                </ul>
              </div>

              {/* Kategoriler */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">📂 Tüm Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 12).map(cat => (
                    <Link key={cat.id} href={`/${cat.slug}`} className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition border border-gray-200">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🚀 Kanalınızı Ekleyin</h3>
                <p className="text-red-100 text-sm mb-4">+18 Telegram kanalınızı binlerce kullanıcıya tanıtın.</p>
                <Link href="/kanal-ekle" className="block w-full bg-white text-red-600 text-center font-black py-2.5 rounded-xl hover:bg-red-50 transition text-sm">
                  ÜCRETSİZ EKLE
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ====== KATEGORİ SAYFASI RENDER ======
  const category = await getCategoryBySlug(slug);
  if (category) {
    const [channelsData, categories, banners] = await Promise.all([
      getChannels(page, LIMIT, undefined, category.id),
      getCategories(),
      getBanners(),
    ]);
    const { data: channels, count: totalCount } = channelsData;
    const totalPages = Math.ceil((totalCount || 0) / LIMIT);

    return (
      <>
        <JsonLd data={generateBreadcrumbSchema([
          { name: 'Anasayfa', url: baseUrl },
          { name: `${category.name} Telegram Kanalları`, url: `${baseUrl}/${slug}` }
        ])} />
        {channels.length > 0 && (
          <JsonLd data={generateItemListSchema(
            channels.map((ch, i) => ({ name: ch.name, url: `${baseUrl}/kanallar/${ch.slug}`, position: i + 1 })),
            `${category.name} Telegram Kanalları`
          )} />
        )}
        <Header />
        <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
          {/* Hero */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center shadow-xl">
            <div className="text-5xl mb-3">📡</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">{category.name} Telegram Kanalları (2026)</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              {category.name} kategorisindeki en güncel ve aktif Telegram kanalları. {totalCount} kanal listeleniyor.
            </p>
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="text-center"><div className="text-3xl font-black">{totalCount}</div><div className="text-blue-200">Kanal</div></div>
              <div className="text-center"><div className="text-3xl font-black">✓</div><div className="text-blue-200">Onaylı</div></div>
              <div className="text-center"><div className="text-3xl font-black">2026</div><div className="text-blue-200">Güncel</div></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {channels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channels.map(channel => <ChannelCard key={channel.id} channel={channel} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div className="text-5xl mb-4">📭</div>
                  <h2 className="text-xl font-bold text-gray-700 mb-2">{category.name} için henüz kanal eklenmemiş</h2>
                  <p className="text-gray-500 mb-6">Bu kategoriye ait bir kanalınızı ekleyebilirsiniz.</p>
                  <Link href="/kanal-ekle" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Kanal Ekle</Link>
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
                </div>
              )}
              <BannerGrid type="category" categoryId={category.id} maxBanners={2} banners={banners} />
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-4">{category.name} Telegram Kanalları Hakkında</h2>
                <p className="text-gray-600 leading-relaxed">
                  {category.name} kategorisindeki Telegram kanalları, bu alanda içerik üreten ve paylaşan toplulukları bir araya getirmektedir.
                  Güncel ve aktif kanalları keşfetmek için listemizi inceleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">📂 Tüm Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Link key={cat.id} href={`/${cat.slug}`} className={`text-xs px-3 py-1.5 rounded-full transition border ${cat.id === category.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-600 hover:text-white'}`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🚀 Kanalınızı Ekleyin</h3>
                <p className="text-blue-100 text-sm mb-4">{category.name} kanalınızı ücretsiz ekleyin.</p>
                <Link href="/kanal-ekle" className="block w-full bg-white text-blue-600 text-center font-black py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">ÜCRETSİZ EKLE</Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fallback to 404
  notFound();
}
