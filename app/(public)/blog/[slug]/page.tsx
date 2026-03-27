import { getBlogPostBySlug, getRecentBlogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TwitterEmbed from '@/components/TwitterEmbed';
import JsonLd from '@/components/JsonLd';
import { Clock, Eye, Calendar, ArrowLeft, Tag, User, Share2, MessageCircle, Repeat2, Heart, BarChart2, BadgeCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { convertTwitterLinksToEmbeds } from '@/lib/utils';

const baseUrl = 'https://telegramkanali.com';

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
        alternates: {
            canonical: `${baseUrl}/blog/${slug}`,
        },
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }] : [],
            type: 'article',
            publishedTime: post.created_at,
            modifiedTime: post.updated_at || post.created_at,
            authors: [post.author],
            tags: post.tags,
            siteName: 'Telegram Kanalları',
            locale: 'tr_TR',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            images: post.cover_image ? [post.cover_image] : [],
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

    const formatTwitterTime = (d?: string) => {
        if (!d) return '';
        const date = new Date(d);
        const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dayMonthYear = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${time} · ${dayMonthYear}`;
    };

    const getInitials = (name: string) => name ? name.slice(0, 2).toUpperCase() : 'AD';

    if (post.category === 'x') {
        return (
            <div className="max-w-2xl mx-auto border border-gray-200 bg-white min-h-[80vh] my-6 rounded-2xl shadow-sm pb-12">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200 p-4 flex items-center gap-6">
                    <Link href={`/blog?category=${post.category}`} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={20} className="text-gray-900" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Gönderi</h1>
                </div>

                <article className="p-4">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex justify-center items-center font-bold text-lg flex-shrink-0">
                            {getInitials(post.author || 'Admin')}
                        </div>
                        <div>
                            <div className="flex items-center gap-1 group cursor-pointer">
                                <span className="font-bold text-gray-900 group-hover:underline text-[15px]">
                                    {post.author || 'Admin'}
                                </span>
                                <BadgeCheck className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-[15px] text-gray-500">
                                @{post.author ? post.author.toLowerCase().replace(/\s+/g, '') : 'admin'}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-gray-900 text-[17px] leading-normal whitespace-pre-wrap break-words mb-4 font-normal">
                        <strong className="block mb-2 text-[19px]">{post.title}</strong>
                        {post.excerpt && <div className="mb-4">{post.excerpt}</div>}
                        <div 
                            className="[&>p]:mb-4 [&_a]:text-blue-500 hover:[&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: convertTwitterLinksToEmbeds(post.content) }} 
                        />
                    </div>

                    {/* Media */}
                    {post.cover_image && (
                        <div className="rounded-2xl border border-gray-200 overflow-hidden aspect-video bg-gray-100 mb-4">
                            <img 
                                src={post.cover_image} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Date */}
                    <div className="text-[15px] text-gray-500 mb-4 hover:underline cursor-pointer">
                        {formatTwitterTime(post.created_at)}
                    </div>

                    {/* Stats */}
                    <div className="border-t border-b border-gray-200 py-3 mb-4 flex gap-4 text-[15px]">
                        <div><span className="font-bold text-gray-900">{post.view_count || 1}</span> <span className="text-gray-500">Görüntülenme</span></div>
                        <div className="cursor-pointer hover:underline"><span className="font-bold text-gray-900">0</span> <span className="text-gray-500">Yeniden Gönderi</span></div>
                        <div className="cursor-pointer hover:underline"><span className="font-bold text-gray-900">0</span> <span className="text-gray-500">Beğeni</span></div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-around text-gray-500 py-1">
                        <button className="flex items-center group transition">
                            <div className="p-2 -m-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                        </button>
                        <button className="flex items-center group transition">
                            <div className="p-2 -m-2 rounded-full group-hover:bg-green-50 group-hover:text-green-500 transition">
                                <Repeat2 className="w-5 h-5" />
                            </div>
                        </button>
                        <button className="flex items-center group transition">
                            <div className="p-2 -m-2 rounded-full group-hover:bg-pink-50 group-hover:text-pink-500 transition">
                                <Heart className="w-5 h-5" />
                            </div>
                        </button>
                        <button className="flex items-center group transition">
                            <div className="p-2 -m-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                                <Share2 className="w-5 h-5" />
                            </div>
                        </button>
                    </div>
                </article>
            </div>
        );
    }

    // BlogPosting JSON-LD Schema
    const blogPostingSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.meta_description || post.excerpt || '',
        'image': post.cover_image || `${baseUrl}/images/logo.png`,
        'datePublished': post.created_at,
        'dateModified': post.updated_at || post.created_at,
        'author': {
            '@type': 'Person',
            'name': post.author || 'Telegram Kanalları Editörü',
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Telegram Kanalları',
            'logo': {
                '@type': 'ImageObject',
                'url': `${baseUrl}/images/logo.png`,
            },
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${post.slug}`,
        },
        'url': `${baseUrl}/blog/${post.slug}`,
        'keywords': post.tags?.join(', ') || 'telegram, kanal',
        'wordCount': post.content?.split(' ').length || 0,
        'inLanguage': 'tr-TR',
    };

    return (
        <div className="max-w-4xl mx-auto">
            <JsonLd data={blogPostingSchema} />
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
                dangerouslySetInnerHTML={{ __html: convertTwitterLinksToEmbeds(post.content) }}
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

            {/* Twitter Embed Support */}
            <TwitterEmbed url={post.slug} />
        </div>
    );
}
