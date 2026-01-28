import { getCategoryBySlug, getChannelsByCategory } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every minute

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
