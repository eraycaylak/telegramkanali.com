import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSeoPages } from '@/lib/data';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export const metadata = {
    title: 'Telegram Rehberi & Blog - TelegramKanali.com',
    description: 'Telegram kullanımı, en iyi kanal listeleri ve ipuçları hakkında detaylı rehberler.',
};

export default async function BlogPage() {
    const posts = await getSeoPages();

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Blog & Rehberler</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Telegram dünyası hakkında merak ettiğiniz her şey. En iyi kanal listeleri,
                        ipuçları ve kullanım rehberleri burada.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/rehber/${post.slug}`}
                            className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {post.title}
                            </h2>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                {post.meta_description}
                            </p>
                            <span className="text-blue-600 font-bold text-sm">Devamını Oku &rarr;</span>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}
