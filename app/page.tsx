import Link from 'next/link';
import { ShieldCheck, Zap, Globe } from 'lucide-react';
import { getCategories, getChannels, getFeaturedChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import { Channel } from '@/lib/types';

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

  const allChannels: Channel[] = [];
  if (allChannelsRaw.length > 0) {
    for (let i = 0; i < 20; i++) {
      allChannelsRaw.forEach(c => {
        allChannels.push({
          ...c,
          id: `${c.id}-${i}`,
          name: i > 0 ? `${c.name} ${i + 1}` : c.name
        });
      });
    }
  }

  return (
    <div className="space-y-12">

      {/* Title Divider */}
      <div className="text-center border-b border-gray-200 pb-4 pt-4">
        <h2 className="text-gray-500 font-light text-xl tracking-wider">OCAK 2026 - EN İYİ 100 TELEGRAM KANALLARI VE GRUPLARI</h2>
      </div>

      {/* Banner Grid (4-up like reference) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 h-32 rounded-lg flex items-center justify-between px-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10">
            <h3 className="font-bold text-lg text-blue-200">BLOOMBERG TRADING</h3>
            <h2 className="text-3xl font-black italic">ÜCRETSİZ</h2>
            <p className="text-xs text-blue-300">RİSK YOK GETİRİ YÜKSEK</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-1 rounded-full font-bold text-sm z-10">Gruba Katıl</button>
        </div>

        <div className="bg-[#111] h-32 rounded-lg flex items-center justify-between px-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all border border-green-900">
          <div className="z-10 text-center w-full">
            <h3 className="text-2xl font-bold mb-1">İLK GELEN 50 KİŞİYE</h3>
            <div className="bg-green-600 text-black font-black text-2xl py-1 transform -skew-x-12">BEDAVA İŞLEM</div>
          </div>
        </div>

        <div className="bg-gradient-to-l from-yellow-700 to-yellow-600 h-32 rounded-lg flex items-center justify-between px-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10 flex items-center w-full justify-between">
            <div className="bg-white text-yellow-800 rounded-full h-16 w-16 flex items-center justify-center font-bold border-4 border-yellow-800">Sohbet</div>
            <div>
              <h2 className="text-3xl font-black drop-shadow-md">DÜNYA SOHBET</h2>
              <button className="bg-white text-black font-bold px-6 py-1 mt-2 rounded shadow-lg float-right">KATIL</button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-32 rounded-lg flex items-center justify-between px-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10 text-center w-full">
            <h3 className="font-bold text-lg drop-shadow">FIRSATLARI KAÇIRMA</h3>
            <div className="bg-red-600 text-white font-bold inline-block px-2 transform rotate-2 mt-1">HEMEN KATIL</div>
          </div>
        </div>
      </section>


      {/* MASSIVE Channels Grid */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              Telegram müşteri hizmetleri de pek çok avantajlar sağlayan harika bir mesajlaşma aracı. WhatsApp ve Messenger gibi
              geçmişe dayalı lider mesajlaşma uygulamalarına göre çok daha hızlı, güvenli ve kolay kullanılması da ilerleyen
              zamanlarda onları zorlayabilecek birtakım teknik özelliklere sahip olmasını sağlıyor.
            </p>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-6 flex items-start gap-4">
              <Globe className="text-blue-500 flex-shrink-0 mt-1" size={32} />
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Telegram Kanalları ile İletişim Eğlencesi</h3>
                <p className="text-sm">
                  Telegram kanalları üzerinde aylık 200 milyon gibi bir rakamdan bahsediliyor. Özellikle İran, Rusya, İtalya,
                  ABD ve Türkiye gibi ülkelerde hızlı büyüyen bir kitleye sahip. Telegram bir çok alanda kullanıldığı gibi
                  KPSS eğitiminde de kullanılıyor.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Neden Telegram Kullanmalısınız?</h3>
            <p className="mb-4">
              Geleceğin mesajlaşma uygulaması olmaya aday Telegram'ı neden kullanmalısınız? Telegram gizliliği ön planda tutan bir
              uygulama olmasından ötürü bu konudaki hassas kişiler için tercih ediliyor. Bulut tabanlı olmasına rağmen herhangi bir
              saldırıya karşı çok sağlam koşullara sahiptir.
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
                      {10 + i * 5}
                    </span>
                  </Link>
                </li>
              ))}
              {[...Array(5)].map((_, i) => (
                <li key={i}>
                  <Link href="#" className="flex items-center justify-between text-gray-600 hover:text-blue-600 hover:pl-2 transition-all">
                    <span>Örnek Kategori {i + 1}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded border border-gray-100 text-gray-400">
                      {Math.floor(Math.random() * 50)}
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
    </div>
  );
}
