import { notFound } from 'next/navigation';
import { categories, channels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import Link from 'next/link';

// Generate static params for SSG
export function generateStaticParams() {
    return categories.map((category) => ({
        category: category.slug,
    }));
}

export async function generateMetadata({ params }: { params: { category: string } }) {
    const category = categories.find((c) => c.slug === params.category);
    if (!category) return {};

    return {
        title: `${category.name} Telegram Kanalları | En İyi ${category.name} Grupları`,
        description: `${category.name} kategorisindeki en popüler ve güvenilir Telegram kanallarını keşfedin. ${category.description}`,
    };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
    const category = categories.find((c) => c.slug === params.category);

    if (!category) {
        notFound();
    }

    const categoryChannels = channels.filter((c) => c.category === category.id);

    return (
        <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500">
                <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
                <span className="mx-2">/</span>
                <span className="font-medium text-gray-900">{category.name}</span>
            </nav>

            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                    {category.name} Telegram Kanalları
                </h1>
                <p className="max-w-3xl text-lg text-gray-600 leading-relaxed">
                    {category.description}
                </p>
            </div>

            {/* Filter/Tags (Optional Visualization) */}
            <div className="flex flex-wrap gap-2">
                {category.subcategories.map((sub) => (
                    <span key={sub} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                        {sub}
                    </span>
                ))}
            </div>

            {/* Channel Grid */}
            {categoryChannels.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryChannels.map((channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center">
                    <p className="text-gray-500">Bu kategoride henüz kanal bulunmuyor.</p>
                </div>
            )}

            {/* SEO Content Box */}
            <div className="mt-12 rounded-xl bg-gray-50 p-6 text-sm text-gray-600">
                <h2 className="mb-3 text-lg font-bold text-gray-900">{category.name} Hakkında</h2>
                <p>
                    Telegram'da {category.name.toLowerCase()} takibi yapmak isteyenler için özenle derlenmiş bu listede,
                    sektörün öncü topluluklarına ulaşabilirsiniz. {category.name} grupları sayesinde bilgi alışverişinde bulunabilir,
                    son gelişmelerden haberdar olabilirsiniz. Listemizde yer alan tüm kanallar düzenli olarak kontrol edilmekte
                    ve güncellenmektedir.
                </p>
            </div>
        </div>
    );
}
