import { getCategoryBySlug, getChannelsByCategory, getCategories } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import BannerGrid from '@/components/BannerGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const allCategories = await getCategories();

  if (!category) {
    notFound();
  }

  const channels = await getChannelsByCategory(category.id);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Category Header */}
        <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        </div>

        {/* Banner Grid - 6 Banners */}
        <BannerGrid type="category" categoryId={category.id} />

        {/* Channels Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
          <div className="lg:col-span-2 space-y-6 text-gray-700 leading-relaxed">
            <article className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Telegram {category.name}
              </h2>
              <p className="mb-4">
                Telegram; yemek, spor, elektronik gibi konularda toplu mesaj yayınlayabilmek ve kullanıcılarına geniş bilgi yelpazesi sunabilmek için kanal ve grup imkanı sunar. {category.name} kategorisindeki Telegram kanalları da yoğun ilgi görmektedir.
              </p>
              <p className="mb-4">
                Bu kategoride bulunan grup yöneticileri ve kullanıcılar, {category.name.toLowerCase()} hakkında genel veya özel tavsiyeler verir, güncel haberler ve bilgiler anlık olarak paylaşılır.
              </p>
              <p className="text-sm text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg border">
                <strong>Yasal Uyarı:</strong> Sitemizde bulunan Telegram grubu veya kanalları içerisindeki paylaşımlardan site yönetimimiz mesul değildir. Herhangi bir mağduriyette sorumluluk kabul etmemektedir. Tüm Telegram kanalları ve gruplarına karşı dikkatli olunuz.
              </p>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Diğer Kategoriler</h3>
              <ul className="space-y-2">
                {allCategories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/${c.slug}`}
                      className={`block px-3 py-2 rounded-lg transition-all ${c.id === category.id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'}`}
                    >
                      {c.name}
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
      </main>
      <Footer />
    </>
  );
}
