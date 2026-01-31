import Link from 'next/link';
import { ShieldCheck, Zap, Globe, HelpCircle } from 'lucide-react';
import { getCategories, getChannels, getFeaturedChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import BannerGrid from '@/components/BannerGrid';
import JsonLd, { generateFAQSchema } from '@/components/JsonLd';
import { Channel } from '@/lib/types';

// Cache for 60 seconds - improves performance
export const revalidate = 60;

const faqs = [
  {
    question: "Telegram Kanalları nedir?",
    answer: "Telegram kanalları, yöneticilerin sınırsız sayıda aboneye mesaj, fotoğraf, video ve dosya paylaşabildiği tek yönlü iletişim platformlarıdır. Detaylı liste için en iyi Telegram kanalları sayfamızı inceleyebilirsiniz.",
    link: { href: "/rehber/en-iyi-telegram-kanallari", text: "en iyi Telegram kanalları" }
  },
  {
    question: "Telegram kanallarına nasıl katılabilirim?",
    answer: "Sitemizde listelenen herhangi bir kanalın 'Kanala Git' butonuna tıklayarak doğrudan Telegram uygulamasında kanala katılabilirsiniz. Telegram kanal listemizi inceleyerek size uygun kanalları bulabilirsiniz.",
    link: { href: "/rehber/telegram-kanal-listesi", text: "Telegram kanal listesi" }
  },
  {
    question: "Telegram güvenli mi?",
    answer: "Telegram, uçtan uca şifreleme, gizli sohbetler ve kendini imha eden mesajlar gibi güvenlik özellikleri sunar. Güvenilir Türk Telegram kanalları için listemize göz atın.",
    link: { href: "/rehber/turk-telegram-kanallari", text: "Türk Telegram kanalları" }
  },
  {
    question: "Kendi kanalımı nasıl ekleyebilirim?",
    answer: "Kanalınızı sitemize eklemek için bizimle iletişime geçebilirsiniz. Ücretsiz Telegram kanalları bölümümüzde yer alabilirsiniz.",
    link: { href: "/rehber/ucretsiz-telegram-kanallari", text: "Ücretsiz Telegram kanalları" }
  }
];

export default async function Home() {
  const featuredChannels = await getFeaturedChannels();
  const allChannelsRaw = await getChannels(); // Fetches all for list
  const categories = await getCategories();

  // Replicate channels to simulate 100+ items for "infinite scroll" feel if needed, 
  // or just use raw data if we seeded enough. 
  // We seeded 4 * 25 = 100 items via script? No, we seeded from data.ts which had ~4 items.
  // The seed script used `channels` array.
  // So DB has 4 items.
  // We should client-side duplicate or server-side duplicate to keep the "Massive" look user likes.

  const allChannels = allChannelsRaw;

  return (
    <div className="space-y-12">

      {/* SEO H1-H2 Hierarchy */}
      <div className="text-center border-b border-gray-200 pb-6 pt-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">En İyi Telegram Kanalları ve Grupları (2026)</h1>
        <h2 className="text-gray-500 font-light text-lg tracking-wider">Güncel ve Aktif Telegram Kanalları - Ocak 2026</h2>
      </div>

      {/* Banner Grid (Dynamic from DB) */}
      <BannerGrid />


      {/* MASSIVE Channels Grid */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {allChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <button className="bg-gray-800 text-white px-8 py-3 rounded font-bold hover:bg-gray-700 transition">DAHA FAZLA GÖSTER</button>
        </div>
      </section>

      {/* SEO / Blog Content Section (Mimicking the reference visuals) */}
      <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100">

        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">

          {/* Article 1 */}
          <article className="prose prose-blue max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">Telegram</span> Kanalları
            </h2>
            <p className="mb-4">
              Son zamanlarda ismini çok sık duyduğunuz Telegram sadece ülkemizde değil, dünya genelinde artan bir popülerliğe sahip.
              Telegram müşteri hizmetleri de pek çok avantajlar sağlayan harika bir mesajlaşma aracı. <Link href="/rehber/en-iyi-telegram-kanallari" className="text-blue-600 hover:underline">En iyi Telegram kanalları</Link> listemizde
              güncel ve aktif kanalları bulabilirsiniz. WhatsApp ve Messenger gibi geçmişe dayalı lider mesajlaşma uygulamalarına göre çok daha hızlı, güvenli ve kolay kullanılması da ilerleyen
              zamanlarda onları zorlayabilecek birtakım teknik özelliklere sahip olmasını sağlıyor.
            </p>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-6 flex items-start gap-4">
              <Globe className="text-blue-500 flex-shrink-0 mt-1" size={32} />
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Telegram Kanalları ile İletişim Eğlencesi</h3>
                <p className="text-sm">
                  Telegram kanalları üzerinde aylık 200 milyon gibi bir rakamdan bahsediliyor. Özellikle İran, Rusya, İtalya,
                  ABD ve Türkiye gibi ülkelerde hızlı büyüyen bir kitleye sahip. <Link href="/rehber/telegram-gruplari" className="text-blue-600 hover:underline">Telegram grupları</Link> ve kanallarımızı keşfedin.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Neden Telegram Kullanmalısınız?</h3>
            <p className="mb-4">
              Geleceğin mesajlaşma uygulaması olmaya aday Telegram'ı neden kullanmalısınız? Telegram gizliliği ön planda tutan bir
              uygulama olmasından ötürü bu konudaki hassas kişiler için tercih ediliyor. <Link href="/rehber/ucretsiz-telegram-kanallari" className="text-blue-600 hover:underline">Ücretsiz Telegram kanalları</Link> listemizi inceleyin.
            </p>
          </article>

          {/* Article 2 */}
          <article className="prose prose-blue max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Telegram Kanalları ve Önemi (2025-2026)</h2>
            <p className="mb-4">
              Çevrimiçi mesajlaşma uygulaması olan Telegram, gün itibariyle 100 milyonu aşkın olan kullanıcı sayısıyla, dünyanın en popüler
              iletişim araçlarından biri olarak yerini alıyor. Ünlü analistlere göre Telegram, gelecek yıllarda zirvede olan Whatsapp
              uygulamasının yerini alacak.
            </p>
            <ul className="space-y-4 mt-6">
              <li className="flex gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 h-fit"><ShieldCheck size={20} /></div>
                <div>
                  <strong className="block text-gray-900">Güvenlik ve Gizlilik</strong>
                  <span className="text-sm">Telefon numaralarını gizli tutabilmeleri, birçok kanala girmelerine imkan sağlıyor.</span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 h-fit"><Zap size={20} /></div>
                <div>
                  <strong className="block text-gray-900">Esneklik ve Hız</strong>
                  <span className="text-sm">Whatsapp üzerinden birkaç MB'lık fotoğraf ve videolar paylaşmak bile oldukça güçken, Telegram 1.5 GB'a kadar dosya izni verir.</span>
                </div>
              </li>
            </ul>
          </article>

        </div>

        {/* Sidebar / Categories Column */}
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Diğer Telegram Kategorileri</h3>
            <ul className="space-y-3">
              {categories.map((c, i) => (
                <li key={c.id}>
                  <Link href={`/${c.slug}`} className="flex items-center justify-between text-gray-600 hover:text-blue-600 hover:pl-2 transition-all">
                    <span>{c.name}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded border border-gray-100 text-gray-400">
                      {10 + i * 5} kanal
                    </span>
                  </Link>
                </li>
              ))}
              {[...Array(5)].map((_, i) => (
                <li key={i}>
                  <Link href="#" className="flex items-center justify-between text-gray-600 hover:text-blue-600 hover:pl-2 transition-all">
                    <span>Örnek Kategori {i + 1}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded border border-gray-100 text-gray-400">
                      {Math.floor(Math.random() * 50)} kanal
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Reklam & İletişim</h3>
            <p className="text-sm text-yellow-700 mb-4">
              Kanalınızı tanıtmak veya reklam vermek için bizimle iletişime geçin.
            </p>
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 rounded transition-colors">
              İLETİŞİME GEÇ
            </button>
          </div>
        </div>

      </section>

      {/* FAQ Section with Schema */}
      <section className="pt-12 border-t border-gray-100">
        <JsonLd data={generateFAQSchema(faqs)} />
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HelpCircle className="text-blue-500" />
          Sık Sorulan Sorular
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {faq.answer.split(faq.link?.text || '').map((part, i, arr) => (
                  i === arr.length - 1 ? part : (
                    <span key={i}>{part}<Link href={faq.link?.href || '#'} className="text-blue-600 hover:underline">{faq.link?.text}</Link></span>
                  )
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
