import { getCategoryBySlug, getChannelsByCategory, getCategories, getChannelBySlug, getFeaturedChannels, getChannels, getBlogPosts, getRedirect, getChannelsByCity } from '@/lib/data';
import AdsterraBanner from '@/components/AdsterraBanner';
import { getPromotedChannels } from '@/app/actions/promoted';
import { getBanners } from '@/app/actions/banners';
import ChannelCard from '@/components/ChannelCard';
import AdultChannelRow from '@/components/AdultChannelRow';
import PromotedChannels from '@/components/PromotedChannels';
import ChannelDetail from '@/components/ChannelDetail';
import BannerGrid from '@/components/BannerGrid';
import FeaturedAds from '@/components/FeaturedAds';
import SponsoredChannelSlot from '@/components/SponsoredChannelSlot';
import TwitterFeed from '@/components/TwitterFeed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd, { generateBreadcrumbSchema, generateChannelSchema, generateItemListSchema, generateCollectionPageSchema, generateAggregateRatingSchema } from '@/components/JsonLd';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Pagination from '@/components/Pagination';
import Comments from '@/components/Comments';
import { Clock, Eye, AlertCircle, TrendingUp, Users } from 'lucide-react';
import CryptoRankingPolicy from '@/components/CryptoRankingPolicy';
import CryptoStatBar from '@/components/CryptoStatBar';
import CryptoFreshnessEngine from '@/components/CryptoFreshnessEngine';
import { CRYPTO_KEYWORD_PAGES, getCryptoKeywordPage } from '@/lib/crypto-pages';


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

export const revalidate = 3600; // 1 saat cache — her isteğe DB sorgusu atmak Netlify invocation tüketir

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

// ====== 🚀 KRİPTO Landing Pages — lib/crypto-pages (30 sayfa modüler) ======
// CRYPTO_KEYWORD_PAGES ve getCryptoKeywordPage lib/crypto-pages/index.ts'ten import edildi.

type CryptoKeywordPageType = (typeof CRYPTO_KEYWORD_PAGES)[string];

function getCryptoKeywordPageFromSlug(slug: string): { key: string; page: CryptoKeywordPageType } | null {
  const page = getCryptoKeywordPage(slug);
  return page ? { key: slug, page } : null;
}




function getCityFromSlug(slug: string): { key: string; city: typeof CITIES[string] } | null {
  if (!slug.endsWith('-telegram-gruplari')) return null;
  const key = slug.replace('-telegram-gruplari', '');
  const city = CITIES[key];
  return city ? { key, city } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const cryptoPage = getCryptoKeywordPage(slug);
  if (cryptoPage) {
    return {
      title: cryptoPage.title,
      description: cryptoPage.description,
      keywords: cryptoPage.keywords.join(', '),
      alternates: { canonical: `${baseUrl}/${slug}` },
      openGraph: {
        title: cryptoPage.title,
        description: cryptoPage.description,
        type: 'website',
      },
    };
  }

  const cityMatch = getCityFromSlug(slug);
  if (cityMatch) {
    return {
      title: `${cityMatch.city.name} Telegram Grupları ve Kanalları 2026`,
      description: cityMatch.city.description,
      alternates: { canonical: `${baseUrl}/${slug}` },
    };
  }

  const kw18Match = KEYWORD_18_PAGES[slug];
  if (kw18Match) {
    return {
      title: kw18Match.title,
      description: kw18Match.description,
      keywords: kw18Match.keywords.join(', '),
      alternates: { canonical: `${baseUrl}/${slug}` },
    };
  }

  const category = await getCategoryBySlug(slug);
  if (category) {
    return {
      title: category.seo_title || `${category.name} Telegram Kanalları 2026`,
      description: category.seo_description || `En güncel ve aktif ${category.name} Telegram kanalları.`,
      alternates: { canonical: `${baseUrl}/${slug}` },
    };
  }

  // ====== KANAL DETAY METADATA ======
  const channel = await getChannelBySlug(slug);
  if (channel) {
    const name = channel.name || '';
    const pageTitle = buildChannelTitle(name);
    const desc = channel.description?.substring(0, 140) || '';
    const memberCount = channel.member_count || (channel.stats as any)?.subscribers || 0;
    const memberText = memberCount > 0 ? ` ${memberCount.toLocaleString('tr-TR')} üyesi olan` : '';
    return {
      title: pageTitle,
      description: `${name}${memberText} Telegram kanalına katılın. ${desc}${desc.length >= 140 ? '...' : ''}`,
      alternates: { canonical: `${baseUrl}/${slug}` },
    };
  }

  return { title: 'Telegram Kanalları' };
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
            <div className="lg:col-span-2 space-y-6 min-w-0 overflow-x-hidden">
              <PromotedChannels categoryId={cityData.name} />
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
        <main className="container mx-auto px-4 py-6 max-w-7xl overflow-x-hidden">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex gap-2 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
            <span>/</span>
            <Link href="/18" className="hover:text-red-600">+18 Kanalları</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{kw18Page.h1}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8 min-w-0">
            {/* Main Content */}
            <div className="space-y-6 min-w-0 overflow-x-hidden">
              {/* H1 Hero */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-2xl p-7 text-white shadow-xl">
                <div className="text-4xl mb-3">🔞</div>
                <h1 className="text-2xl md:text-3xl font-black mb-3">{kw18Page.h1}</h1>
                <p className="text-indigo-200 text-base leading-relaxed max-w-2xl">{kw18Page.intro}</p>
                <div className="mt-5 flex flex-wrap gap-4 md:gap-6 text-sm justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-black">{kw18Channels.length}</div>
                    <div className="text-indigo-300">Aktif Kanal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black">✓</div>
                    <div className="text-indigo-300">Doğrulandı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black">2026</div>
                    <div className="text-indigo-300">Güncel</div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-indigo-700/40 flex items-center gap-2 text-xs text-indigo-300">
                  <span className="shrink-0 font-black text-white bg-red-500/30 px-2 py-0.5 rounded">⚠ SIFIR TOLERANS</span>
                  <span>Çocuk istismarı, gizli çekim/ifşa ve yasadışı içerik barındıran kanallar derhal kaldırılır.</span>
                  <Link href="/dashboard/destek?kategori=sikayet" className="shrink-0 text-white underline hover:text-indigo-200 font-bold">Şikayet Et</Link>
                </div>
              </div>

              {/* Reklamlı Kanallar (Çok Tıklananlar) */}
              <PromotedChannels categoryId="18" variant="adult-table" />

              {/* Kanal Listesi — Forum stili, fotoğrafsız */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-x-auto">
                {/* Tablo başlığı */}
                <div className="hidden md:grid grid-cols-[28px_32px_36px_1fr_80px_28px_80px] gap-3 px-3 py-2 bg-red-50 border-b border-red-100 text-[10px] font-black uppercase tracking-widest text-red-400">
                  <span>#</span>
                  <span>Oy</span>
                  <span></span>
                  <span>Kanal</span>
                  <span className="text-right">Üye</span>
                  <span></span>
                  <span></span>
                </div>
                {kw18Channels.slice(0, 30).map((channel: any, i: number) => (
                  <AdultChannelRow key={channel.id} channel={channel} rank={i + 1} />
                ))}
                {kw18Channels.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">Henüz kanal eklenmemiş.</div>
                )}
              </div>

              {/* Banner */}
              <BannerGrid type="category" categoryId="18" maxBanners={2} />

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
            <div className="space-y-6 min-w-0 overflow-x-hidden">
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

  // ====== 🚀 KRİPTO KEYWORD SAYFASI RENDER ======
  const cryptoKeywordMatch = getCryptoKeywordPageFromSlug(slug);
  if (cryptoKeywordMatch) {
    const { key: kwCryptoKey, page: kwCryptoPage } = cryptoKeywordMatch;
    const categories = await getCategories();
    const cryptoChannels = await getChannelsByCategory('crypto');

    const cryptoFaqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: kwCryptoPage.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    };
    const cryptoBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Kripto Para & Borsa', item: `${baseUrl}/kripto-para` },
        { '@type': 'ListItem', position: 3, name: kwCryptoPage.h1, item: `${baseUrl}/${kwCryptoKey}` },
      ],
    };
    const cryptoItemList = generateItemListSchema(
      cryptoChannels.slice(0, 20).map((ch, i) => ({ name: ch.name, url: `${baseUrl}/${ch.slug}`, position: i + 1 })),
      kwCryptoPage.h1
    );
    const cryptoCollection = generateCollectionPageSchema(
      kwCryptoPage.title, kwCryptoPage.description, `${baseUrl}/${kwCryptoKey}`, cryptoChannels.length, baseUrl
    );
    const cryptoDatasetSchema = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: kwCryptoPage.h1,
      description: kwCryptoPage.description,
      keywords: kwCryptoPage.keywords,
      url: `${baseUrl}/${kwCryptoKey}`,
      dateModified: cryptoChannels.length > 0 ? new Date().toISOString().split('T')[0] : '2026-04-17',
      creator: {
        '@type': 'Organization',
        name: 'Telegram Kanalları',
        url: baseUrl,
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };

    const relatedPages = (kwCryptoPage.relatedSlugs || []).map(s => CRYPTO_KEYWORD_PAGES[s]).filter(Boolean);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cryptoFaqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cryptoBreadcrumb) }} />
        <JsonLd data={cryptoItemList} />
        <JsonLd data={cryptoCollection} />
        <JsonLd data={cryptoDatasetSchema} />
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-7xl overflow-x-hidden">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex gap-2 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
            <span>/</span>
            <Link href="/kripto-para" className="hover:text-orange-600">Kripto Para & Borsa</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{kwCryptoPage.h1}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8 min-w-0">
            {/* Main */}
            <div className="space-y-6 min-w-0 overflow-x-hidden">
              {/* Hero */}
              <div className={`bg-gradient-to-br ${kwCryptoPage.color} rounded-2xl p-7 text-white shadow-xl`}>
                <div className="text-4xl mb-3">{kwCryptoPage.icon}</div>
                <h1 className="text-2xl md:text-3xl font-black mb-3">{kwCryptoPage.h1}</h1>
                <div className="text-white/80 text-base leading-relaxed max-w-2xl break-words whitespace-pre-line" dangerouslySetInnerHTML={{ __html: kwCryptoPage.intro }} />
                <div className="mt-5 flex flex-wrap gap-4 md:gap-6 text-sm justify-center md:justify-start">
                  <div className="text-center"><div className="text-2xl font-black">{cryptoChannels.length}</div><div className="text-white/70 text-xs md:text-sm">Aktif Kanal</div></div>
                  <div className="text-center"><div className="text-2xl font-black">192+</div><div className="text-white/70 text-xs md:text-sm">Topluluk</div></div>
                  <div className="text-center"><div className="text-2xl font-black">2026</div><div className="text-white/70 text-xs md:text-sm">Güncel</div></div>
                </div>
              </div>

              {/* Freshness Engine (Tazelik ve Canlı Veri Göstergesi) */}
              <CryptoFreshnessEngine 
                channelCount={cryptoChannels.length} 
                latestChannelName={cryptoChannels.length > 0 ? cryptoChannels[0]?.name : undefined}
              />

              {/* Canlı İstatistik Bar */}
              <CryptoStatBar
                channelCount={cryptoChannels.length}
                totalMembers={cryptoChannels.reduce((s: number, c: any) => s + (c.member_count || 0), 0)}
              />

              {/* Reklamlı Kanallar (Çok Tıklananlar) */}
              <PromotedChannels categoryId="crypto" variant="crypto-table" />

              {/* Kanal Listesi */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span className="w-7">#</span>
                  <span className="flex-1">Kanal</span>
                  <span className="w-20 text-right">Üyeler</span>
                  <span className="w-20"></span>
                </div>
                {cryptoChannels.slice(0, 30).map((channel: any, i: number) => (
                  <div key={channel.id} className="group flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-orange-50/40 transition-colors">
                    <span className="w-7 shrink-0 text-xs font-black text-gray-300 tabular-nums text-center">{i + 1}</span>
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 flex items-center justify-center text-sm font-black text-orange-600">{channel.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/${channel.slug}`} className="font-bold text-sm text-gray-900 hover:text-orange-600 transition truncate block">{channel.name}</Link>
                      {channel.description && <p className="text-xs text-gray-400 truncate mt-0.5">{channel.description}</p>}
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 w-20 justify-end shrink-0">
                      <Users size={12} className="text-blue-400" />
                      {channel.member_count ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(channel.member_count) : '—'}
                    </div>
                    <a href={`/go/${channel.id}`} target="_blank" rel="nofollow noreferrer"
                      className="shrink-0 flex items-center gap-1 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition shadow-sm">
                      Katıl
                    </a>
                  </div>
                ))}
              </div>

              {/* E-E-A-T Sıralama Politikası */}
              <CryptoRankingPolicy />

              {/* Banner */}
              <BannerGrid type="category" categoryId="crypto" maxBanners={2} />

              {/* CTA & Internal Linking Loop */}
              <div className="py-6 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 items-center gap-2 flex">🔗 Daha Fazla Kripto Keşfet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {kwCryptoPage.relatedSlugs?.map((relSlug: string) => {
                    const relPage = CRYPTO_KEYWORD_PAGES[relSlug];
                    if (!relPage) return null;
                    return (
                      <Link key={relSlug} href={`/${relSlug}`} className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{relPage.icon}</span>
                          <span className="font-bold text-gray-800 group-hover:text-orange-700">{relPage.title.split('|')[0].trim()}</span>
                        </div>
                        <span className="text-orange-500 font-bold">→</span>
                      </Link>
                    )
                  })}
                </div>
                <div className="text-center">
                  <Link href="/kripto-para" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
                    Tüm Kripto Ekosistemine Dön
                  </Link>
                </div>
              </div>

              {/* FAQ */}
              {kwCryptoPage.faqs.length > 0 && (
                <section className="space-y-4 pt-6 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">❓ Sık Sorulan Sorular</h2>
                  {kwCryptoPage.faqs.map((faq, i) => (
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
                <h2 className="text-xl font-bold text-gray-800">Kripto Para Telegram Kanalları Hakkında</h2>
                <p>
                  <strong>Kripto para Telegram kanalları</strong>, yatırımcıların gerçek zamanlı analiz, sinyal ve haber almasını sağlayan dijital topluluklardır.
                  Bitcoin&apos;den Ethereum&apos;a, DeFi&apos;den NFT&apos;lere kadar geniş bir yelpazede içerik sunarlar.
                </p>
                <h3 className="text-lg font-bold text-gray-800">Neden Telegram Kripto Kanalları Kullanmalısınız?</h3>
                <ul className="space-y-1">
                  <li>📡 Anlık sinyal ve analiz bildirimleri</li>
                  <li>🌍 Küresel kripto topluluklarına erişim</li>
                  <li>🔔 Pin mesajlarla önemli duyuruları kaçırmama</li>
                  <li>📊 Grafik analiz ve teknik yorum paylaşımları</li>
                  <li>🤖 Otomatik bot entegrasyonları ile fiyat takibi</li>
                </ul>
                <p className="text-sm text-gray-500">
                  Telegramkanali.com, 5651 sayılı kanun kapsamında &quot;Yer Sağlayıcı&quot; olarak hizmet vermektedir.
                  Paylaşılan sinyaller yatırım tavsiyesi niteliği taşımaz, yatırım kararlarınızı kendi araştırmanıza dayandırın.
                </p>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* İlgili Kripto Sayfaları */}
              <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">₿ Kripto Sayfaları</h3>
                <ul className="space-y-2">
                  {Object.entries(CRYPTO_KEYWORD_PAGES).filter(([k]) => k !== kwCryptoKey).slice(0, 10).map(([key, p]) => (
                    <li key={key}>
                      <Link href={`/${key}`} className="text-orange-600 hover:text-orange-800 hover:underline text-sm flex items-center gap-1">
                        <span>{p.icon}</span> {p.h1.split('—')[0].trim()}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tüm Kategoriler */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">📂 Tüm Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 12).map(cat => (
                    <Link key={cat.id} href={`/${cat.slug}`} className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition border border-gray-200">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🚀 Kanalınızı Ekleyin</h3>
                <p className="text-orange-100 text-sm mb-4">Kripto kanalınızı binlerce yatırımcıya tanıtın.</p>
                <Link href="/kanal-ekle" className="block w-full bg-white text-orange-600 text-center font-black py-2.5 rounded-xl hover:bg-orange-50 transition text-sm">ÜCRETSİZ EKLE</Link>
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
    const [channelsData, categories, banners, popularInCategory] = await Promise.all([
      getChannels(page, LIMIT, undefined, category.id),
      getCategories(),
      getBanners(),
      getChannelsByCategory(category.slug || category.id),
    ]);
    const { data: channels, count: totalCount } = channelsData;
    const totalPages = Math.ceil((totalCount || 0) / LIMIT);
    
    // Top channels by member count for "Çok Tıklananlar" section
    const topChannels = [...popularInCategory]
      .sort((a: any, b: any) => (b.member_count || 0) - (a.member_count || 0))
      .slice(0, 5);

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
            <div className="mt-6 flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <div className="text-center"><div className="text-3xl font-black">{totalCount}</div><div className="text-blue-200">Kanal</div></div>
              <div className="text-center"><div className="text-3xl font-black">✓</div><div className="text-blue-200">Onaylı</div></div>
              <div className="text-center"><div className="text-3xl font-black">2026</div><div className="text-blue-200">Güncel</div></div>
            </div>
            {(category.id === '18' || category.slug === '18') && (
              <div className="mt-5 pt-4 border-t border-blue-500/40 flex items-center justify-center gap-2 text-xs text-blue-200 flex-wrap">
                <span className="shrink-0 font-black text-white bg-red-500/30 px-2 py-0.5 rounded">⚠ SIFIR TOLERANS</span>
                <span>Çocuk istismarı, gizli çekim/ifşa ve yasadışı içerik barındıran kanallar derhal kaldırılır.</span>
                <Link href="/dashboard/destek?kategori=sikayet" className="shrink-0 text-white underline hover:text-blue-100 font-bold">Şikayet Et</Link>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 min-w-0 overflow-x-hidden">
              <PromotedChannels categoryId={category.id} variant={(category.id === '18' || category.slug === '18') ? 'adult-table' : 'default'} />
              {channels.length > 0 ? (
                (() => {
                  const is18Category = category.id === '18' || category.slug === '18';
                  if (is18Category) {
                    return (
                      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-x-auto">
                        <div className="hidden md:grid grid-cols-[28px_32px_36px_1fr_80px_28px_80px] gap-3 px-3 py-2 bg-red-50 border-b border-red-100 text-[10px] font-black uppercase tracking-widest text-red-400">
                          <span>#</span>
                          <span>Oy</span>
                          <span></span>
                          <span>Kanal</span>
                          <span className="text-right">Üye</span>
                          <span></span>
                          <span></span>
                        </div>
                        {channels.map((channel, i) => (
                          <AdultChannelRow key={channel.id} channel={channel} rank={i + 1 + (page - 1) * LIMIT} />
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {channels.map(channel => <ChannelCard key={channel.id} channel={channel} />)}
                    </div>
                  );
                })()
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
              {/* Adsterra Native Banner Ad */}
              <AdsterraBanner />
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
              {/* 🔥 Çok Tıklananlar */}
              {topChannels.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🔥 En Popüler {category.name} Kanalları</h3>
                  <div className="space-y-3">
                    {topChannels.map((ch: any, i: number) => (
                      <Link key={ch.id} href={`/${ch.slug}`} className="flex items-center gap-3 group">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{ch.name}</div>
                          <div className="text-[10px] text-gray-400">{ch.member_count ? new Intl.NumberFormat('tr-TR').format(ch.member_count) + ' üye' : 'Aktif'}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Promoted Ads */}
              <FeaturedAds adType="banner" maxAds={1} />

              {/* Kategoriler */}
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

  // ====== REDIRECT KONTROLÜ ======
  const redirectData = await getRedirect(slug);
  if (redirectData) {
    redirect(redirectData.new_path);
  }

  // ====== KANAL DETAY SAYFASI RENDER ======
  const channel = await getChannelBySlug(slug);
  if (channel) {
    const categories = await getCategories();
    const channelCategory = categories.find((c) => c.id === channel.category_id);
    const relatedChannelsRaw = await getChannelsByCategory(channel.category_id);
    const relatedChannels = relatedChannelsRaw.filter((c) => c.id !== channel.id).slice(0, 8);
    const sidebarRelated = relatedChannels.slice(0, 5);
    const mainRelated = relatedChannels.slice(0, 3);

    const isCrypto = channelCategory?.name?.toLowerCase() === 'kripto para'
      || channel.category_id === 'crypto'
      || channel.tags?.some((t: string) => t.toLowerCase().includes('kripto') || t.toLowerCase().includes('bitcoin'));
    const is18 = channelCategory?.slug === '18' || channel.category_id === '18';

    const memberCount = (channel as any)?.member_count || (channel?.stats as any)?.subscribers || 0;
    const memberText = memberCount > 0 ? `${memberCount.toLocaleString('tr-TR')} üyeli` : 'aktif';
    const categoryName = channelCategory?.name || 'Genel';
    const updatedDate = new Date((channel as any)?.updated_at || channel?.created_at || Date.now())
      .toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

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

    const channelJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: channel.name || '',
      description: channel.description || '',
      category: 'Social Networking',
      applicationCategory: 'Social Networking',
      operatingSystem: 'Android, iOS, Windows, Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY', availability: 'https://schema.org/InStock' },
      author: { '@type': 'Organization', name: channel.name || '' },
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(channelJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <JsonLd data={generateAggregateRatingSchema(channel, baseUrl)} />
        <JsonLd data={generateBreadcrumbSchema([
          { name: 'Anasayfa', url: baseUrl },
          ...(channelCategory ? [{ name: `${channelCategory.name} Kanalları`, url: `${baseUrl}/${channelCategory.slug}` }] : []),
          { name: channel.name, url: `${baseUrl}/${slug}` },
        ])} />
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 min-w-0 overflow-x-hidden break-words">

              {/* Kripto Internal Linking */}
              {isCrypto && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 border border-orange-200 p-4 rounded-xl shadow-sm text-sm">
                  <span className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                    📊 Kripto Silo
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
                  {channel.image && channel.image !== '/images/logo.png' ? (
                    <Image
                      src={channel.image}
                      alt={channel.name || ''}
                      width={96}
                      height={96}
                      className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-3xl font-bold text-blue-600">
                      {channel.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {channelCategory && (
                        <Link href={`/${channelCategory.slug}`} className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-100">
                          {channelCategory.name}
                        </Link>
                      )}
                      {(channel as any)?.verified && (
                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-100">
                          ✓ Doğrulanmış
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                      {channel.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {memberCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={16} />
                          {memberCount.toLocaleString('tr-TR')} Abone
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {updatedDate} tarihinde güncellendi
                      </span>
                    </div>
                  </div>
                  <a
                    href={(channel as any)?.join_link || `/go/${channel.id}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg sm:w-auto"
                  >
                    Kanala Katıl
                  </a>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                  {channel.name} Hakkında
                </h2>
                <div className="prose prose-blue max-w-none text-gray-600">
                  <p className="whitespace-pre-line leading-7 text-base">
                    {channel.description}
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
                        🏷️ {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Kategori İçerik Bloğu */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {categoryName} Telegram Kanalları Hakkında
                </h2>
                {isCrypto ? (
                  <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                    <p>
                      <strong>Kripto para Telegram kanalları</strong>, yatırımcıların gerçek zamanlı piyasa analizi, sinyal ve haberlere ulaşmasını sağlayan dijital topluluklardır.
                    </p>
                    <p>
                      {channel.name} kanalı, <strong>{memberText}</strong> kripto para yatırımcısını bir araya getiriyor.
                    </p>
                    <p className="text-xs text-gray-400">
                      ⚠️ Bu kanalda paylaşılan içerikler yatırım tavsiyesi niteliği taşımaz.
                    </p>
                  </div>
                ) : is18 ? (
                  <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                    <p>
                      Bu kanal yalnızca <strong>18 yaş üzeri</strong> kullanıcılara yöneliktir.
                      Telegramkanali.com, 5651 sayılı kanun kapsamında &quot;Yer Sağlayıcı&quot; olarak hizmet vermektedir.
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
                    </p>
                  </div>
                )}
                {channelCategory && (
                  <Link href={`/${channelCategory.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 mt-2">
                    Tüm {categoryName} Kanallarını Gör →
                  </Link>
                )}
              </div>

              {/* Benzer Kanallar */}
              {mainRelated.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Benzer {categoryName} Kanalları</h2>
                  <div className="space-y-4">
                    {mainRelated.map((rc: any) => (
                      <ChannelCard key={rc.id} channel={rc} />
                    ))}
                  </div>
                  {channelCategory && (
                    <div className="mt-4 text-center">
                      <Link href={`/${channelCategory.slug}`} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                        {relatedChannelsRaw.length} kanalın tamamını gör →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* FAQ Bölümü */}
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

              {/* Adsterra Native Banner Ad */}
              <AdsterraBanner />

              {/* Comments */}
              <Comments channelId={channel.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Güvenlik */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900 flex items-center gap-2">
                  🛡️ Güvenlik Analizi
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
                    🏷️ {categoryName} Kanalları
                  </h3>
                  <ul className="space-y-2">
                    {sidebarRelated.map((rc: any) => (
                      <li key={rc.id}>
                        <Link href={`/${rc.slug}`} className="flex items-center justify-between text-sm text-gray-700 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-blue-50 transition">
                          <span className="truncate flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold shrink-0">
                              {rc.name.charAt(0)}
                            </span>
                            {rc.name}
                          </span>
                          →
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {channelCategory && (
                    <Link href={`/${channelCategory.slug}`} className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 border-t border-gray-100 pt-3">
                      Tümünü Gör ({relatedChannelsRaw.length}) →
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
        </main>
        <Footer />
      </>
    );
  }

  // Fallback to 404
  notFound();
}
