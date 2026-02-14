import { getBlogPostBySlug, getRecentBlogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Eye, Calendar, ArrowLeft, Tag, User, Share2 } from 'lucide-react';
import type { Metadata } from 'next';

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) return { title: 'Yazı Bulunamadı' };

    return {
        title: post.meta_title || `${post.title} | Blog`,
        description: post.meta_description || post.excerpt || post.title,
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            images: post.cover_image ? [{ url: post.cover_image }] : [],
            type: 'article',
            publishedTime: post.created_at,
            modifiedTime: post.updated_at,
            authors: [post.author],
            tags: post.tags,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const recentPosts = await getRecentBlogPosts(4);
    const relatedPosts = recentPosts.filter(p => p.id !== post.id).slice(0, 3);

    const formatDate = (d?: string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <div className="mb-6">
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition font-medium">
                    <ArrowLeft size={16} /> Blog&apos;a Dön
                </Link>
            </div>

            {/* Cover Image */}
            {post.cover_image && (
                <div className="rounded-3xl overflow-hidden mb-8">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-64 md:h-96 object-cover"
                    />
                </div>
            )}

            {/* Article Header */}
            <header className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {post.category && (
                        <Link
                            href={`/blog?category=${post.category}`}
                            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-blue-100 transition"
                        >
                            {post.category}
                        </Link>
                    )}
                    {post.featured && (
                        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">⭐ Öne Çıkan</span>
                    )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                    {post.title}
                </h1>
                {post.excerpt && (
                    <p className="text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-6 py-4 border-t border-b border-gray-100 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.created_at)}</span>
                    {post.reading_time && (
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {post.reading_time} dk okuma</span>
                    )}
                    <span className="flex items-center gap-1.5"><Eye size={14} /> {post.view_count} görüntülenme</span>
                </div>
            </header>

            {/* Article Content */}
            <article
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-100">
                    <Tag size={16} className="text-gray-400" />
                    {post.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-black text-gray-900 mb-6">Diğer Yazılar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {relatedPosts.map((rp) => (
                            <Link key={rp.id} href={`/blog/${rp.slug}`} className="group">
                                <article className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full">
                                    {rp.cover_image ? (
                                        <div className="aspect-video overflow-hidden">
                                            <img src={rp.cover_image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <span className="text-2xl">📝</span>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition">{rp.title}</h3>
                                        <span className="text-xs text-gray-400 mt-2 block">{formatDate(rp.created_at)}</span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
