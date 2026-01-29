import { getCategoryBySlug, getChannelsByCategory } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every minute
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Next.js 15: params is a Promise
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const channels = await getChannelsByCategory(category.id);

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
      </div>

      {/* Banner Grid - 6 Banners like homepage */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 h-28 rounded-lg flex items-center justify-between px-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10">
            <h3 className="font-bold text-sm text-blue-200">BLOOMBERG TRADING</h3>
            <h2 className="text-xl font-black italic">ÜCRETSİZ</h2>
            <p className="text-xs text-blue-300">RİSK YOK GETİRİ YÜKSEK</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-full font-bold text-xs z-10">Gruba Katıl</button>
        </div>

        <div className="bg-[#111] h-28 rounded-lg flex items-center justify-center px-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all border border-green-900">
          <div className="z-10 text-center">
            <h3 className="text-lg font-bold mb-1">İLK GELEN 50 KİŞİYE</h3>
            <div className="bg-green-600 text-black font-black text-lg py-0.5 px-2 transform -skew-x-12">BEDAVA İŞLEM</div>
          </div>
        </div>

        <div className="bg-gradient-to-l from-yellow-700 to-yellow-600 h-28 rounded-lg flex items-center justify-between px-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="bg-white text-yellow-800 rounded-full h-12 w-12 flex items-center justify-center font-bold text-xs border-2 border-yellow-800">Sohbet</div>
          <div className="text-right">
            <h2 className="text-xl font-black drop-shadow-md">DÜNYA SOHBET</h2>
            <button className="bg-white text-black font-bold px-4 py-0.5 mt-1 rounded text-xs shadow-lg">KATIL</button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-28 rounded-lg flex items-center justify-center px-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10 text-center">
            <h3 className="font-bold text-sm drop-shadow">FIRSATLARI KAÇIRMA</h3>
            <div className="bg-red-600 text-white font-bold inline-block px-2 transform rotate-2 mt-1 text-sm">HEMEN KATIL</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-700 to-pink-600 h-28 rounded-lg flex items-center justify-center px-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10 text-center">
            <h3 className="font-bold text-lg">KRİPTO SİNYALLERİ</h3>
            <p className="text-xs text-purple-200">Günlük Analiz & Haberler</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-teal-500 h-28 rounded-lg flex items-center justify-center px-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
          <div className="z-10 text-center">
            <h3 className="font-bold text-lg">VIP GRUP</h3>
            <p className="text-xs text-green-200">Premium İçerikler</p>
          </div>
        </div>
      </section>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
