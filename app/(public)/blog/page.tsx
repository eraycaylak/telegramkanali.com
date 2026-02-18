import Link from 'next/link';
import { getBlogPosts, getFeaturedBlogPosts } from '@/lib/data';
import { Clock, Eye, ArrowRight, Tag } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog | Telegram Kanal Rehberi',
    description: 'Telegram dünyasından haberler, rehberler, ipuçları ve güncel gelişmeler. En son Telegram blog yazılarını keşfedin.',
};

interface BlogPageProps {
    searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const sp = await searchParams;
    const page = parseInt(sp.page || '1');
    const category = sp.category;

    const [{ data: posts, count }, featuredPosts] = await Promise.all([
        getBlogPosts(page, 12, category),
        page === 1 ? getFeaturedBlogPosts(1) : Promise.resolve([]),
    ]);

    const totalPages = Math.ceil(count / 12);
    const featuredPost = featuredPosts[0];

    const categories = ['Haber', 'Rehber', 'İpucu', 'Duyuru', 'Güncel', 'Teknoloji', 'Kripto', 'Eğitim'];

    const formatDate = (d?: string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero */}
            <div className="text-center pt-4 pb-2">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">Blog</h1>
                <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                    Telegram dünyasından haberler, rehberler ve ipuçları
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
                <Link
                    href="/blog"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${!category ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Tümü
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat}
                        href={`/blog?category=${cat}`}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {cat}
                    </Link>
                ))}
            </div>

            {/* Featured Post */}
            {featuredPost && page === 1 && !category && (
                <Link href={`/blog/${featuredPost.slug}`} className="block group">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                        {featuredPost.cover_image && (
                            <img
                                src={featuredPost.cover_image}
                                alt={featuredPost.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                            />
                        )}
                        <div className="relative p-8 md:p-12">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                                    ⭐ Öne Çıkan
                                </span>
                                {featuredPost.category && (
                                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                                        {featuredPost.category}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-3 group-hover:underline decoration-2 underline-offset-4">
                                {featuredPost.title}
                            </h2>
                            {featuredPost.excerpt && (
                                <p className="text-white/80 max-w-2xl line-clamp-2 mb-4">{featuredPost.excerpt}</p>
                            )}
                            <div className="flex items-center gap-4 text-white/60 text-sm">
                                <span>{formatDate(featuredPost.created_at)}</span>
                                {featuredPost.reading_time && (
                                    <span className="flex items-center gap-1"><Clock size={14} /> {featuredPost.reading_time} dk</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            )}

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-lg">Henüz blog yazısı yok</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
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
                                        {post.category && (
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                {post.category}
                                            </span>
                                        )}
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
                                        <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Eye size={12} /> {post.view_count}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pb-8">
                    {(() => {
                        const maxVisible = 5;
                        let pages = [];

                        if (totalPages <= maxVisible + 2) {
                            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                        } else {
                            if (page <= 4) {
                                pages = [1, 2, 3, 4, 5, '...', totalPages];
                            } else if (page >= totalPages - 3) {
                                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                            } else {
                                pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                            }
                        }

                        return pages.map((p, i) => (
                            p === '...' ? (
                                <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                            ) : (
                                <Link
                                    key={p}
                                    href={`/blog?page=${p}${category ? `&category=${category}` : ''}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition ${p === page
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {p}
                                </Link>
                            )
                        ));
                    })()}
                </div>
            )}
        </div>
    );
}
