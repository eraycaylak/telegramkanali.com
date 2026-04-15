import { getCategoryBySlug, getChannelsByCategory, getCategories, getChannelBySlug, getFeaturedChannels, getChannels, getBlogPosts, getRedirect, getChannelsByCity } from '@/lib/data';
import { getPromotedChannels } from '@/app/actions/promoted';
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

// ====== İfşa SEO Programatik Sayfalar ======
const IFSA_PAGES: Record<string, { h1: string; title: string; description: string; intro: string; faqs: { question: string; answer: string }[] }> = {
  'telegram-ifsa-kanallari': {
    h1: 'Telegram İfşa Kanalları (2026)',
    title: 'Telegram İfşa Kanalları 2026 - Güncel Yetişkin Kanal Listesi',
    description: 'Telegram ifşa kanalları 2026 güncel listesi. En popüler ve aktif Telegram ifşa gruplarını keşfedin. +18 yetişkin içerik kanalları rehberi.',
    intro: 'Telegram ifşa kanalları, yetişkin içerik arayan kullanıcıların en çok tercih ettiği kanal türlerinden biridir. 2026 yılında güncellenen listemizde en aktif ve popüler ifşa kanallarını bulabilirsiniz. Tüm kanallar düzenli olarak kontrol edilmekte ve güncel tutulmaktadır.',
    faqs: [
      { question: 'Telegram ifşa kanalları nedir?', answer: 'Telegram ifşa kanalları, yetişkinlere yönelik özel içeriklerin paylaşıldığı +18 Telegram kanallarıdır. Bu kanallara yalnızca 18 yaş üstü kullanıcılar erişebilir.' },
      { question: 'Telegram ifşa kanallarına nasıl katılınır?', answer: 'Listedeki kanallardan ilginizi çekeni seçin ve "Kanala Git" butonuna tıklayın. Telegram uygulaması açılacak ve doğrudan kanala katılabileceksiniz.' },
      { question: 'Telegram ifşa kanalları güvenli mi?', answer: 'Telegram şifreli mesajlaşma sunar ve telefon numaranız diğer üyeler tarafından görülmez. Ancak her zaman güvenilir ve aktif kanalları tercih etmeniz önerilir.' },
    ],
  },
  'telegram-unlu-ifsa-kanallari': {
    h1: 'Telegram Ünlü İfşa Kanalları (2026)',
    title: 'Telegram Ünlü İfşa Kanalları 2026 - En Güncel Liste',
    description: 'Telegram ünlü ifşa kanalları 2026. Türk ünlü ifşa Telegram grupları ve kanalları güncel listesi. Popüler yetişkin kanalları.',
    intro: 'Telegram ünlü ifşa kanalları, özellikle fenomen ve tanınmış isimlerin yetişkin içeriklerinin paylaşıldığı özel kanallardır. 2026 yılına ait en güncel ve aktif Telegram ünlü ifşa kanallarını aşağıdaki listemizde bulabilirsiniz.',
    faqs: [
      { question: 'Telegram ünlü ifşa kanalları nelerdir?', answer: 'Telegram ünlü ifşa kanalları, tanınmış fenomen ve sosyal medya ünlülerinin yetişkin içeriklerinin paylaşıldığı +18 Telegram kanallarıdır.' },
      { question: 'Ünlü ifşa kanalları gerçek mi?', answer: 'Listemizde yer alan kanallar düzenli olarak kontrol edilmektedir. Ancak içeriklerin doğruluğu kanal yöneticilerinin sorumluluğundadır.' },
    ],
  },
  'telegram-18-ifsa-kanallari': {
    h1: 'Telegram +18 İfşa Kanalları (2026)',
    title: 'Telegram +18 İfşa Kanalları 2026 | Yetişkin İçerik Listesi',
    description: 'Telegram +18 ifşa kanalları 2026 güncel liste. En iyi yetişkin Telegram ifşa grupları ve kanallarını keşfedin.',
    intro: 'Telegram +18 ifşa kanalları, yalnızca yetişkin kullanıcılara yönelik özel içeriklerin paylaşıldığı Telegram kanallarıdır. Güncel ve aktif kanallarımızı aşağıdaki listede inceleyebilirsiniz.',
    faqs: [
      { question: 'Telegram +18 ifşa kanallarına kimler katılabilir?', answer: 'Bu kanallar yalnızca 18 yaş ve üzeri kullanıcılara açıktır. 18 yaş altı kişilerin katılması yasaktır.' },
      { question: '+18 ifşa kanalları ücretli mi?', answer: 'Listemizde yer alan çoğu kanal ücretsizdir. Bazı VIP kanallar ücretli içerik sunabilir.' },
    ],
  },
  'telegram-turk-ifsa-kanallari': {
    h1: 'Telegram Türk İfşa Kanalları (2026)',
    title: 'Telegram Türk İfşa Kanalları 2026 - Güncel Türk +18 Listesi',
    description: 'Telegram Türk ifşa kanalları 2026. En güncel Türk ifşa Telegram grupları ve yetişkin kanal listesi.',
    intro: 'Telegram Türk ifşa kanalları, özellikle Türk içerik üreticilerinin yetişkinlere yönelik paylaşımlarının bulunduğu Telegram kanallarıdır. 2026 güncel listemizde en aktif Türk ifşa kanallarına ulaşabilirsiniz.',
    faqs: [
      { question: 'Türk ifşa Telegram kanalları güvenli mi?', answer: 'Telegram üzerinde telefon numaranız gizli kalır. Listelediğimiz kanallar düzenli olarak kontrol edilmektedir.' },
      { question: 'Türk ifşa kanallarına nasıl ulaşabilirim?', answer: 'Aşağıdaki listeden bir kanal seçip "Kanala Git" butonuna tıklayarak doğrudan Telegram uygulamasında kanala katılabilirsiniz.' },
    ],
  },
  'telegram-ifsa': {
    h1: 'Telegram İfşa (2026)',
    title: 'Telegram İfşa 2026 - En İyi İfşa Kanalları ve Grupları',
    description: 'Telegram ifşa 2026. Güncel Telegram ifşa kanalları, grupları ve yetişkin toplulukları. En popüler ifşa kanal listesi.',
    intro: 'Telegram ifşa kanalları ve grupları 2026 yılında en çok aranan Telegram kategorilerinden biridir. Güncel ve aktif ifşa kanallarını aşağıdaki listemizde bulabilirsiniz.',
    faqs: [
      { question: 'Telegram ifşa nedir?', answer: 'Telegram ifşa, yetişkinlere yönelik özel içeriklerin paylaşıldığı Telegram kanalları ve gruplarının genel adıdır. Bu kanallar +18 kategorisinde yer alır.' },
      { question: 'Telegram ifşa kanallarına nasıl katılınır?', answer: 'Sitemizde listelenen kanallardan birini seçin, "Kanala Git" butonuna tıklayın ve Telegram uygulamasında kanala katılın.' },
    ],
  },
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
};

type Keyword18PageType = typeof KEYWORD_18_PAGES[string];

function getCityFromSlug(slug: string): { key: string; city: typeof CITIES[string] } | null {
  if (!slug.endsWith('-telegram-gruplari')) return null;
  const key = slug.replace('-telegram-gruplari', '');
  const city = CITIES[key];
  return city ? { key, city } : null;
}

function getIfsaPageFromSlug(slug: string): { key: string; page: typeof IFSA_PAGES[string] } | null {
  const page = IFSA_PAGES[slug];
  return page ? { key: slug, page } : null;
}

function getKeyword18PageFromSlug(slug: string): { key: string; page: Keyword18PageType } | null {
  const page = KEYWORD_18_PAGES[slug];
  return page ? { key: slug, page } : null;
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

  // 0.5 +18 Ana Keyword Hedef Sayfaları (İfşa'dan önce kontrol et)
  const keyword18Match = getKeyword18PageFromSlug(slug);
  if (keyword18Match) {
    const { page: kw18Page } = keyword18Match;
    return {
      title: kw18Page.title,
      description: kw18Page.description,
      keywords: kw18Page.keywords,
      alternates: { canonical: `${baseUrl}/${slug}` },
      openGraph: {
        title: kw18Page.title,
        description: kw18Page.description,
        url: `${baseUrl}/${slug}`,
        type: 'website',
        locale: 'tr_TR',
      },
      twitter: {
        card: 'summary_large_image',
        title: kw18Page.title,
        description: kw18Page.description,
      },
    };
  }

  // 0.6 İfşa Programatik Sayfalar
  const ifsaMatch = getIfsaPageFromSlug(slug);
  if (ifsaMatch) {
    const { page: ifsaPage } = ifsaMatch;
    return {
      title: ifsaPage.title,
      description: ifsaPage.description,
      alternates: { canonical: `${baseUrl}/${slug}` },
      openGraph: {
        title: ifsaPage.title,
        description: ifsaPage.description,
        url: `${baseUrl}/${slug}`,
        type: 'website',
      },
      twitter: {
        title: ifsaPage.title,
        description: ifsaPage.description,
      },
    };
  }

  // 1. Try Category
  const category = await getCategoryBySlug(slug);
  if (category) {
    // Resolve page parameter for pagination SEO
    const resolvedParams = await params;
    // Note: searchParams may need resolving too, but category metadata doesn't depend on it
    // We need to handle pagination in the main function instead

    // Özel /18 sayfası için exact keyword match metadata
    if (category.slug === '18') {
      return {
        title: 'Telegram +18 Kanalları 2026 | En İyi +18 Telegram Grupları',
        description: 'Telegram +18 kanalları 2026 güncel listesi. En popüler +18 telegram grupları, yetişkin içerik kanalları ve aktif topluluklara katılın. Türkiye\'nin en büyük +18 telegram kanal dizini.',
        keywords: ['telegram +18 kanalları', '+18 telegram kanalları', '+18 telegram', 'telegram 18 kanalları', 'yetişkin telegram kanalları', '+18 telegram grupları', 'türk ifşa telegram', 'telegram ifşa kanalları'],
        alternates: { canonical: `${baseUrl}/18` },
        openGraph: {
          title: 'Telegram +18 Kanalları 2026 | En İyi +18 Telegram Grupları',
          description: 'Telegram +18 kanalları 2026 güncel listesi. En popüler +18 telegram grupları ve yetişkin içerik kanalları.',
          url: `${baseUrl}/18`,
          type: 'website',
          locale: 'tr_TR',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Telegram +18 Kanalları 2026 | En İyi +18 Telegram Grupları',
          description: 'Telegram +18 kanalları 2026 güncel listesi.',
        },
      };
    }

    return {
      title: `${category.name} Telegram Kanalları 2026 | En İyi ${category.name} Grupları`,
      description: `${category.name} telegram kanalları 2026 güncel listesi. En iyi ve popüler ${category.name} telegram grupları. Güvenilir ${category.name} kanalları listesi.`,
      alternates: {
        canonical: `${baseUrl}/${category.slug}`,
      },
      openGraph: {
        title: `${category.name} Telegram Kanalları 2026`,
        description: `${category.name} kategorisindeki en iyi ve popüler Telegram kanallarını keşfedin. Güvenilir ${category.name} grupları ve listeleri.`,
        url: `${baseUrl}/${category.slug}`,
        type: 'website',
      },
      twitter: {
        title: `${category.name} Telegram Kanalları 2026`,
        description: `${category.name} kategorisindeki en iyi ve popüler Telegram kanallarını keşfedin.`,
      }
    };
  }

  // 2. Try Channel
  const channel = await getChannelBySlug(slug);
  if (channel) {
    const ch = channel as any;
    const metaDesc = ch.seo_description || `${channel.name} Telegram kanalına katılın. ${channel.description?.slice(0, 150)}... En güncel ${channel.categoryName || 'Telegram'} kanalları.`;
    const pageTitle = buildChannelTitle(channel.name);
    return {
      title: pageTitle,
      description: metaDesc,
      alternates: {
        canonical: `${baseUrl}/${channel.slug}`,
      },
      openGraph: {
        title: pageTitle,
        description: metaDesc,
        url: `${baseUrl}/${channel.slug}`,
        images: channel.image ? [{ url: channel.image }] : undefined,
        type: 'article',
      },
      twitter: {
        title: pageTitle,
        description: metaDesc,
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
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>

              {/* Banner */}
              <BannerGrid type="category" categoryId="18" maxBanners={2} />

              {/* Remaining Channels */}
              {remaining18.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {remaining18.map((channel: any) => (
                    <ChannelCard key={channel.id} channel={channel} />
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
                  <li><Link href="/telegram-ifsa-kanallari" className="text-red-600 hover:text-red-800 hover:underline text-sm">→ Telegram İfşa Kanalları</Link></li>
                  <li><Link href="/telegram-turk-ifsa-kanallari" className="text-red-600 hover:text-red-800 hover:underline text-sm">→ Türk İfşa Kanalları</Link></li>
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

  // ====== İFŞA PROGRAMATIK SAYFA RENDER ======
  const ifsaMatch = getIfsaPageFromSlug(slug);
  if (ifsaMatch) {

    const { key: ifsaKey, page: ifsaPage } = ifsaMatch;
    const categories = await getCategories();
    // +18 kanallarını getir
    const ifsaChannels = await getChannelsByCategory('18');
    const firstBatch = ifsaChannels.slice(0, 6);
    const remainingChannels = ifsaChannels.slice(6, 30);

    // FAQ Schema
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ifsaPage.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: '+18 Kanalları', item: `${baseUrl}/18` },
        { '@type': 'ListItem', position: 3, name: ifsaPage.h1, item: `${baseUrl}/${ifsaKey}` },
      ],
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
            <span>/</span>
            <Link href="/18" className="hover:text-blue-600">+18 Kanalları</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{ifsaPage.h1}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Content */}
            <div className="space-y-6">
              {/* H1 */}
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                {ifsaPage.h1}
              </h1>

              {/* Intro */}
              <p className="text-gray-600 leading-relaxed">
                {ifsaPage.intro}
              </p>

              {/* First Batch: 6 kanallar */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {firstBatch.map((channel: any) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>

              {/* Bannerlar */}
              <BannerGrid type="category" categoryId="18" maxBanners={2} />

              {/* Kalan kanallar */}
              {remainingChannels.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {remainingChannels.map((channel: any) => (
                    <ChannelCard key={channel.id} channel={channel} />
                  ))}
                </div>
              )}

              {/* CTA: Tüm +18 kanallarını gör */}
              <div className="text-center py-4">
                <Link href="/18" className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                  Tüm +18 Kanalları Gör →
                </Link>
              </div>

              {/* FAQ */}
              {ifsaPage.faqs.length > 0 && (
                <section className="space-y-4 pt-6 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">❓ Sık Sorulan Sorular</h2>
                  {ifsaPage.faqs.map((faq, i) => (
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

              {/* SEO Alt Metin */}
              <section className="prose prose-sm max-w-none text-gray-500 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-700">Telegram İfşa Kanalları Hakkında</h2>
                <p>
                  Telegram ifşa kanalları, yetişkinlere yönelik özel içeriklerin paylaşıldığı ve yalnızca 18 yaş üstü 
                  kullanıcılara açık olan Telegram kanallarıdır. Bu kanallar +18 kategorisinde yer almakta olup, 
                  telegramkanali.com olarak en güncel ve aktif kanalları düzenli olarak listelemekteyiz.
                </p>
                <p>
                  Sitemiz 5651 sayılı kanun kapsamında &quot;Yer Sağlayıcı&quot; olarak hizmet vermektedir. 
                  Tüm kanallar topluluk tarafından eklenmekte olup içerikler kanal yöneticilerinin sorumluluğundadır.
                </p>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* İlgili İfşa Sayfaları */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">🔥 İlgili Sayfalar</h3>
                <ul className="space-y-2">
                  {Object.entries(IFSA_PAGES).filter(([k]) => k !== ifsaKey).map(([key, p]) => (
                    <li key={key}>
                      <Link href={`/${key}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                        → {p.h1}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/18" className="text-red-600 hover:text-red-800 hover:underline text-sm font-bold">
                      → Tüm +18 Telegram Kanalları
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Kategoriler */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">📂 Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 15).map(cat => (
                    <Link key={cat.id} href={`/${cat.slug}`} className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition border border-gray-200">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🚀 Kanalınızı Ekleyin</h3>
                <p className="text-red-100 text-sm mb-4">Telegram kanalınızı binlerce kullanıcıya tanıtın.</p>
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
    const promotedData = page === 1 ? await getPromotedChannels(category.id) : [];
    const popularChannels = promotedData.filter(p => p.channel).map(p => ({
      id: p.channel!.id,
      name: p.channel!.name,
      slug: p.channel!.slug,
      image: p.channel!.image,
      description: p.channel!.description,
      member_count: p.channel!.member_count,
      category_id: p.channel!.category_id,
      categoryName: p.channel!.categories?.name,
    } as any)).slice(0, 4);

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
        {/* CollectionPage Schema */}
        <JsonLd data={generateCollectionPageSchema(
          category.slug === '18'
            ? 'Telegram +18 Kanalları 2026 | En İyi +18 Telegram Grupları'
            : `${category.name} Telegram Kanalları`,
          category.slug === '18'
            ? 'Telegram +18 kanalları 2026 güncel listesi. En popüler +18 telegram grupları ve yetişkin kanallar.'
            : `${category.name} kategorisindeki en iyi Telegram kanalları.`,
          `${baseUrl}/${category.slug}`,
          totalCount,
          baseUrl
        )} />
        <JsonLd data={generateBreadcrumbSchema([
          { name: 'Anasayfa', url: baseUrl },
          { name: category.name, url: `${baseUrl}/${category.slug}` }
        ])} />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": category.slug === '18' ? [
            {
              "@type": "Question",
              "name": "Telegram +18 kanalları nedir?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Telegram +18 kanalları, yalnızca 18 yaş ve üzeri kullanıcılara yönelik özel içeriklerin paylaşıldığı Telegram kanallarıdır. Bu kanallara katılmak için Telegram uygulamasının yüklü olması yeterlidir. telegramkanali.com/18 adresinden en güncel listeye ulaşabilirsiniz."
              }
            },
            {
              "@type": "Question",
              "name": "Telegram +18 kanallarına nasıl katılınır?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "telegramkanali.com/18 adresindeki listeden ilginizi çeken kanalı seçin ve 'Kanala Git' butonuna tıklayın. Telegram uygulaması otomatik açılacak ve 'Katıl' butonuyla anında kanala erişim sağlayabilirsiniz. Katılım tamamen ücretsizdir."
              }
            },
            {
              "@type": "Question",
              "name": "Telegram +18 kanalları güvenli mi?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Evet, Telegram uçtan uca şifreleme teknolojisi kullanan güvenli bir mesajlaşma uygulamasıdır. +18 kanallara katıldığınızda telefon numaranız diğer üyeler tarafından görülmez. Gizlilik ayarlarınızı Telegram uygulama ayarlarından kontrol edebilirsiniz."
              }
            },
            {
              "@type": "Question",
              "name": "Telegram +18 kanalları ücretsiz mi?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Listelenen Telegram +18 kanallarının büyük çoğunluğuna ücretsiz katılabilirsiniz. Bazı VIP kanallarda premium içerik için ücret talep edilebilir, ancak bu tamamen isteğe bağlıdır."
              }
            },
            {
              "@type": "Question",
              "name": "En aktif +18 Telegram kanalları hangileri?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "En aktif +18 Telegram kanalları telegramkanali.com/18 adresinde üye sayısı ve aktivite skoruna göre sıralanmaktadır. Listede üst sıralarda yer alan kanallar en aktif ve en çok takipçiye sahip kanallardır. Liste düzenli olarak güncellenmektedir."
              }
            }
          ] : [
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
                {category.slug === '18'
                  ? 'Telegram +18 Kanalları (2026)'
                  : `${category.name} Telegram Kanalları`}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{category.description}</p>
              {/* /18 için keyword sayfalarına internal linking */}
              {category.slug === '18' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/telegram-18-kanallari" className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition">Telegram +18 Kanalları</Link>
                  <Link href="/18-telegram-kanallari" className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition">+18 Telegram Kanalları</Link>
                  <Link href="/18-telegram" className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition">+18 Telegram</Link>
                  <Link href="/turk-18-telegram-kanallari" className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition">Türk +18 Telegram</Link>
                  <Link href="/telegram-ifsa-kanallari" className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:bg-red-100 transition">İfşa Kanalları</Link>
                </div>
              )}
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
          {page === 1 && <FeaturedAds adType="featured" maxAds={3} categoryId={category.id} />}

          {/* First 2 Banners */}
          <BannerGrid type="category" categoryId={category.id} maxBanners={2} />

          {/* Sponsored Banner Ad */}
          <FeaturedAds adType="banner" maxAds={1} categoryId={category.id} />

          {/* Kanal Listesi — 1. sıraya featured reklam (round-robin rotasyon) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {/* 1. Pozisyon: Rotating Featured Ad (sadece page 1) */}
            {page === 1 && (
              <SponsoredChannelSlot
                categoryId={category.id}
              />
            )}
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
                {category.slug === '18' ? (
                  <>
                    <h2 className="text-3xl font-black text-gray-900 mb-6">
                      Telegram +18 Kanalları 2026 — En Kapsamlı Rehber
                    </h2>
                    <p className="mb-4 text-lg">
                      <strong>Telegram +18 kanalları</strong>, yetişkinlere yönelik özel içeriklerin paylaşıldığı ve yalnızca 18 yaş üstü kullanıcılara açık olan popüler Telegram topluluklarıdır. 2026 yılında güncellenen bu kapsamlı listemizde, Türkiye&apos;nin en aktif ve en çok tercih edilen <strong>+18 Telegram kanallarını</strong> bulabilirsiniz. Her kanal düzenli olarak kontrol edilmekte, aktif olmayan kanallar listeden çıkarılmaktadır.
                    </p>
                    <p className="mb-4">
                      <strong>+18 Telegram grupları</strong> ve kanalları, Telegram&apos;ın sunduğu güçlü gizlilik altyapısı sayesinde kullanıcı kimliklerini korurken zengin içerik deneyimi sunar. Telegramkanali.com olarak, en popüler <Link href="/telegram-ifsa-kanallari" className="text-red-600 hover:underline font-bold">Telegram ifşa kanalları</Link>, <Link href="/telegram-turk-ifsa-kanallari" className="text-red-600 hover:underline font-bold">Türk ifşa kanalları</Link> ve <Link href="/telegram-unlu-ifsa-kanallari" className="text-red-600 hover:underline font-bold">ünlü ifşa kanalları</Link> dahil tüm yetişkin kategorileri tek çatı altında listeliyoruz.
                    </p>

                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 my-8">
                      <h3 className="font-bold text-red-900 mb-3 uppercase tracking-wider text-sm">+18 Telegram Kanallarının Özellikleri</h3>
                      <ul className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-red-800">
                        <li className="flex items-center gap-2">🔞 Yalnızca 18+ Kullanıcılara Açık</li>
                        <li className="flex items-center gap-2">🔒 Telegram Şifreli Altyapı</li>
                        <li className="flex items-center gap-2">⚡ Günlük Güncellenen İçerikler</li>
                        <li className="flex items-center gap-2">✅ Aktiflik Kontrolü Yapılmış</li>
                        <li className="flex items-center gap-2">🆓 Çoğu Kanala Ücretsiz Katılım</li>
                        <li className="flex items-center gap-2">📱 Mobil Uyumlu Erişim</li>
                      </ul>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-3">Telegram +18 Kanallarına Nasıl Katılınır?</h3>
                    <p className="mb-4">
                      <strong>Telegram +18 kanallarına</strong> katılmak oldukça basittir. Aşağıdaki adımları takip ederek saniyeler içinde istediğiniz kanala ücretsiz erişim sağlayabilirsiniz:
                    </p>
                    <ol className="list-decimal pl-6 mb-6 space-y-2">
                      <li>Telefonunuza <strong>Telegram uygulamasını</strong> indirin ve hesap oluşturun</li>
                      <li>Bu sayfadaki listeden ilginizi çeken <strong>+18 kanalını</strong> seçin</li>
                      <li>&quot;Kanala Git&quot; butonuna tıklayın — doğrudan Telegram açılacaktır</li>
                      <li>Açılan sayfada &quot;Katıl&quot; butonuna basarak kanala anında erişin</li>
                    </ol>

                    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-3">En Popüler +18 Telegram Kanal Türleri</h3>
                    <p className="mb-4">
                      Telegram platformunda yetişkinlere yönelik birçok <strong>+18 kanal türü</strong> bulunmaktadır. İşte en çok tercih edilenler:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-1">
                      <li><Link href="/telegram-ifsa-kanallari" className="text-red-600 hover:underline">Telegram İfşa Kanalları</Link> — En yoğun ilgi gören kategori</li>
                      <li><Link href="/telegram-turk-ifsa-kanallari" className="text-red-600 hover:underline">Türk İfşa Kanalları</Link> — Türkçe yetişkin içerik</li>
                      <li><Link href="/telegram-unlu-ifsa-kanallari" className="text-red-600 hover:underline">Ünlü İfşa Kanalları</Link> — Tanınmış isimlerle ilgili içerikler</li>
                      <li><Link href="/turk-18-telegram-kanallari" className="text-red-600 hover:underline">Türk +18 Telegram Kanalları</Link> — Türk kullanıcılara yönelik</li>
                      <li><Link href="/ucretsiz-18-telegram-kanallari" className="text-red-600 hover:underline">Ücretsiz +18 Telegram Kanalları</Link> — Bedava erişim</li>
                    </ul>

                    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-3">Telegram +18 Kanalları Güvenli mi?</h3>
                    <p className="mb-4">
                      <strong>Telegram</strong>, uçtan uca şifreleme teknolojisi kullanan dünyanın en güvenli mesajlaşma uygulamalarından biridir. +18 Telegram kanallarına katıldığınızda telefon numaranız diğer üyeler tarafından görülmez. Gizlilik ayarlarınızı Telegram uygulama ayarlarından detaylı şekilde kontrol edebilirsiniz.
                    </p>
                    <p className="mb-4">
                      Daha fazla bilgi için <Link href="/rehber/en-iyi-telegram-kanallari" className="text-blue-600 hover:underline font-bold">en iyi Telegram kanalları rehberimizi</Link> ve <Link href="/rehber/turk-telegram-kanallari" className="text-blue-600 hover:underline font-bold">Türk Telegram kanalları listemizi</Link> inceleyebilirsiniz. Ayrıca <Link href="/rehber/aktif-telegram-kanallari" className="text-blue-600 hover:underline font-bold">aktif Telegram kanalları</Link> sayfamızdan tüm kategorilerdeki en aktif toplulukları keşfedebilirsiniz.
                    </p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
                <p className="mb-4">
                  Bu kategoride bulunan grup yöneticileri ve kullanıcılar, {category.name.toLowerCase()} hakkında genel veya özel tavsiyeler verir, güncel haberler ve bilgiler anlık olarak paylaşılır. Siz de kendi kanalınızı tanıtmak isterseniz <Link href="/kanal-ekle" className="text-blue-600 hover:underline font-bold">ücretsiz kanal ekle</Link> sayfamızı ziyaret edebilirsiniz.
                </p>
              </article>

              {/* Internal Linking Strategy - Recommendation Block */}
              <div className="border-t pt-8">
                <h3 className="font-bold text-gray-900 mb-4">İlginizi Çekebilecek Diğer Kategoriler</h3>
                {/* İfşa sayfaları linkleri - sadece +18 kategorisinde */}
                {category.slug === '18' && (
                  <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-900 mb-3 text-sm uppercase tracking-wider">🔥 İfşa Kanalları</h4>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/telegram-ifsa-kanallari" className="bg-red-100 hover:bg-red-600 hover:text-white text-red-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">Telegram İfşa Kanalları</Link>
                      <Link href="/telegram-unlu-ifsa-kanallari" className="bg-red-100 hover:bg-red-600 hover:text-white text-red-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">Ünlü İfşa Kanalları</Link>
                      <Link href="/telegram-18-ifsa-kanallari" className="bg-red-100 hover:bg-red-600 hover:text-white text-red-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">+18 İfşa Kanalları</Link>
                      <Link href="/telegram-turk-ifsa-kanallari" className="bg-red-100 hover:bg-red-600 hover:text-white text-red-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">Türk İfşa Kanalları</Link>
                      <Link href="/telegram-ifsa" className="bg-red-100 hover:bg-red-600 hover:text-white text-red-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">Telegram İfşa</Link>
                    </div>
                  </div>
                )}
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
    const featuredChannels = await getFeaturedChannels(false);

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
        {/* AggregateRating Schema — SERP'te yıldız göstergesi için */}
        {channel.score !== undefined && (
          <JsonLd data={generateAggregateRatingSchema({
            name: channel.name,
            slug: channel.slug,
            description: channel.description,
            score: channel.score,
            voteCount: (channel as any).vote_count,
          }, baseUrl)} />
        )}

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
              {/* İlgili Kanallar (same category) */}
              {similarChannels.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-wider">
                    📺 Benzer {channel.categoryName} Kanalları
                  </h3>
                  <div className="space-y-3">
                    {similarChannels.slice(0, 5).map(sc => (
                      <Link key={sc.id} href={`/${sc.slug}`} className="flex items-center gap-3 group">
                        {sc.image ? (
                          <img src={sc.image} alt={sc.name} className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{sc.name[0]}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 truncate">{sc.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{(sc.member_count || (sc as any).stats?.subscribers) ? `${(sc.member_count || (sc as any).stats?.subscribers)?.toLocaleString()} abone` : sc.categoryName}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href={`/${(channel as any).categories?.slug}`} className="block mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-bold">
                    Tüm {channel.categoryName} Kanalları →
                  </Link>
                </div>
              )}

              {/* Öne Çıkan Kanallar */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-wider">⭐ Öne Çıkan Kanallar</h3>
                <div className="space-y-3">
                  {featuredChannels.slice(0, 4).map(featured => (
                    <Link key={featured.id} href={`/${featured.slug}`} className="flex items-center gap-3 group">
                      {featured.image ? (
                        <img src={featured.image} alt={featured.name} className="w-10 h-10 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{featured.name[0]}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 truncate">{featured.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{(featured.member_count || (featured as any).stats?.subscribers) ? `${(featured.member_count || (featured as any).stats?.subscribers)?.toLocaleString()} abone` : featured.categoryName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* İfşa Sayfaları - sadece +18 kanalları için */}
              {channel.category_id === '18' && (
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                  <h3 className="font-bold text-red-900 mb-3 text-sm uppercase tracking-wider">🔥 İlgili Sayfalar</h3>
                  <ul className="space-y-2">
                    <li><Link href="/telegram-ifsa-kanallari" className="text-red-700 hover:text-red-900 hover:underline text-sm">→ Telegram İfşa Kanalları 2026</Link></li>
                    <li><Link href="/telegram-unlu-ifsa-kanallari" className="text-red-700 hover:text-red-900 hover:underline text-sm">→ Ünlü İfşa Kanalları</Link></li>
                    <li><Link href="/telegram-turk-ifsa-kanallari" className="text-red-700 hover:text-red-900 hover:underline text-sm">→ Türk İfşa Kanalları</Link></li>
                    <li><Link href="/telegram-18-ifsa-kanallari" className="text-red-700 hover:text-red-900 hover:underline text-sm">→ +18 İfşa Kanalları</Link></li>
                    <li><Link href="/18" className="text-red-700 hover:text-red-900 hover:underline text-sm font-bold">→ Tüm +18 Kanalları</Link></li>
                  </ul>
                </div>
              )}

              {/* Banner Alanı */}
              <BannerGrid type="category" categoryId={channel.category_id || ''} maxBanners={1} />

              {/* Kategori Linkleri */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3 text-sm uppercase tracking-wider">📂 Popüler Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  <Link href="/teknoloji" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Teknoloji</Link>
                  <Link href="/kripto-para" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Kripto Para</Link>
                  <Link href="/egitim-ders" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Eğitim</Link>
                  <Link href="/haber" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Haber</Link>
                  <Link href="/spor" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Spor</Link>
                  <Link href="/sohbet" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">Sohbet</Link>
                  <Link href="/18" className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all">+18</Link>
                </div>
              </div>

              {/* Kanal Ekle CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                <h3 className="font-bold text-lg mb-2">🚀 Kanalınızı Ekleyin</h3>
                <p className="text-blue-100 text-sm mb-4">Telegram kanalınızı binlerce kullanıcıya tanıtın.</p>
                <Link href="/kanal-ekle" className="block w-full bg-white text-blue-600 text-center font-black py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">
                  ÜCRETSİZ EKLE
                </Link>
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
