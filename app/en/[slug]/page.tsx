import { getCategoryBySlug, getChannelsByCategory, getCategories, getChannelBySlug, getFeaturedChannels, getChannels, getBlogPosts } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import ChannelDetail from '@/components/ChannelDetail';
import BannerGrid from '@/components/BannerGrid';
import FeaturedAds from '@/components/FeaturedAds';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd, { generateBreadcrumbSchema, generateChannelSchema, generateItemListSchema } from '@/components/JsonLd';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Pagination from '@/components/Pagination';
import Comments from '@/components/Comments';
import { translateText } from '@/lib/translate';
import { Clock, Eye } from 'lucide-react';

const baseUrl = 'https://telegramkanali.com';

export const revalidate = 86400; // Cache English pages for 24 hours (content rarely changes)
export const dynamic = 'force-static';

interface PageProps {
    params: { slug: string; };
    searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    const category = await getCategoryBySlug(slug);
    if (category) {
        const nameEn = category.name_en || await translateText(category.name);
        const descEn = category.description_en || await translateText(category.description || '');
        return {
            title: `${nameEn} Telegram Channels - ${new Date().getFullYear()}`,
            description: `Discover the best and most popular Telegram channels in the ${nameEn} category. Trusted ${nameEn} groups and lists.`,
            alternates: {
                canonical: `${baseUrl}/en/${category.slug}`,
                languages: { 'tr': `${baseUrl}/${category.slug}`, 'x-default': `${baseUrl}/${category.slug}` }
            },
            openGraph: {
                title: `${nameEn} Telegram Channels - ${new Date().getFullYear()}`,
                description: descEn || `Top Telegram channels for ${nameEn}.`,
                url: `${baseUrl}/en/${category.slug}`,
                type: 'website',
            },
        };
    }

    const channel = await getChannelBySlug(slug);
    if (channel) {
        const nameEn = channel.name_en || await translateText(channel.name);
        const descEn = channel.description_en || (channel.description ? await translateText(channel.description) : '');
        return {
            title: `${nameEn} Telegram Channel - Join (${new Date().getFullYear()})`,
            description: `Join the ${nameEn} Telegram channel. ${descEn?.slice(0, 150)}... Top ${channel.categoryName || 'Telegram'} channels.`,
            alternates: {
                canonical: `${baseUrl}/en/${channel.slug}`,
                languages: { 'tr': `${baseUrl}/${channel.slug}`, 'x-default': `${baseUrl}/${channel.slug}` }
            },
            openGraph: {
                title: `${nameEn} Telegram Channel - Join`,
                description: descEn?.slice(0, 160),
                url: `${baseUrl}/en/${channel.slug}`,
                images: channel.image ? [{ url: channel.image }] : undefined,
                type: 'article',
            },
        };
    }

    return { title: 'Page Not Found - Telegram Channels' };
}

export default async function EnglishDynamicPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const pageParam = resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam as string) : 1;
    const LIMIT = 20;

    // 1. Try Category
    const category = await getCategoryBySlug(slug);
    if (category) {
        const allCategories = await getCategories();
        const { data: channels, count: totalCount } = await getChannels(page, LIMIT, undefined, category.id);
        const totalPages = Math.ceil(totalCount / LIMIT);

        const { data: blogPosts } = await getBlogPosts(1, 6, category.slug);

        // Translate category content (with cache fallback)
        const nameEn = category.name_en || await translateText(category.name);
        const descEn = category.description_en || await translateText(category.description || '');

        return (
            <>
                <JsonLd data={generateItemListSchema(
                    channels.map((ch, i) => ({ name: ch.name, url: `${baseUrl}/en/${ch.slug}`, position: i + 1 })),
                    `${nameEn} Telegram Channels`
                )} />
                <JsonLd data={generateBreadcrumbSchema([
                    { name: 'Home', url: baseUrl },
                    { name: nameEn, url: `${baseUrl}/en/${category.slug}` }
                ])} />
                {/* hreflang */}
                <link rel="alternate" hrefLang="tr" href={`${baseUrl}/${category.slug}`} />
                <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/${category.slug}`} />
                <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/${category.slug}`} />

                <Header />
                <main className="container mx-auto px-4 py-8 space-y-8">
                    <div className="bg-gradient-to-br from-gray-50 to-white border rounded-xl p-8 shadow-sm">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                🔥 {nameEn} Telegram Channels ({new Date().getFullYear()})
                            </h1>
                            <p className="text-gray-600 max-w-2xl mx-auto text-lg">{descEn}</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed">
                                Discover Turkey&apos;s most popular and trusted Telegram channels in the {nameEn} category.
                                All channels have been reviewed and approved by our editors. Join with one click!
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center gap-6 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                                <div className="text-gray-500">Channels</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">✓</div>
                                <div className="text-gray-500">Verified</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{new Date().getFullYear()}</div>
                                <div className="text-gray-500">Updated</div>
                            </div>
                        </div>
                    </div>

                    <BannerGrid type="category" categoryId={category.id} />
                    <FeaturedAds adType="banner" maxAds={1} categoryId={category.id} />
                    <FeaturedAds adType="featured" maxAds={6} categoryId={category.id} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {channels.length > 0 ? (
                            channels.map((channel) => (
                                <ChannelCard key={channel.id} channel={channel} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                No channels in this category yet.
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSearchParams} />
                        </div>
                    )}

                    {/* Category Blog Posts */}
                    {blogPosts && blogPosts.length > 0 && (
                        <div className="mt-12 relative">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{nameEn} Blog Posts</h2>
                                    <p className="text-gray-500 text-sm mt-1">Our latest articles and insights about {nameEn}.</p>
                                </div>
                                <Link href={`/en/blog?category=${category.slug}`} className="hidden md:flex text-blue-600 bg-blue-50 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition items-center gap-1">
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogPosts.map((post) => (
                                    <Link key={post.id} href={`/en/blog/${post.slug}`} className="group">
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
                                                    <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                        {nameEn}
                                                    </span>
                                                    {post.reading_time && (
                                                        <span className="text-gray-400 text-xs flex items-center gap-1">
                                                            <Clock size={12} /> {post.reading_time} min
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
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Eye size={12} /> {post.view_count || 0}
                                                    </span>
                                                    <span className="text-xs font-medium text-blue-600 group-hover:underline">Read More &rarr;</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-6 md:hidden text-center">
                                <Link href={`/en/blog?category=${category.slug}`} className="inline-block text-blue-600 bg-blue-50 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition items-center gap-1">
                                    View All Articles
                                </Link>
                            </div>
                        </div>
                    )}

                    <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100">
                        <div className="lg:col-span-2 space-y-8 text-gray-700 leading-relaxed">
                            <article className="prose prose-blue max-w-none">
                                <h2 className="text-3xl font-black text-gray-900 mb-6">
                                    Join {nameEn} Telegram Channels
                                </h2>
                                <p className="mb-4 text-lg">
                                    Telegram is used by millions of people every day for channels and groups in dozens of different topics including food, sports, economics, education, and entertainment.
                                    <strong> {nameEn}</strong> Telegram channels are highly popular due to their up-to-date and rich content.
                                </p>
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                                    <h3 className="font-bold text-blue-900 mb-3 uppercase tracking-wider text-sm">Why Follow These Channels?</h3>
                                    <ul className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-blue-800">
                                        <li className="flex items-center gap-2">🔹 Instant & Free Information</li>
                                        <li className="flex items-center gap-2">🔹 Reliable Content Sources</li>
                                        <li className="flex items-center gap-2">🔹 Access to Niche Communities</li>
                                        <li className="flex items-center gap-2">🔹 Ad-Free & Clean Broadcasts</li>
                                    </ul>
                                </div>
                                <p className="text-sm text-gray-500 mt-6 p-6 bg-red-50 rounded-xl border border-red-100">
                                    <strong className="text-red-700">Legal Notice:</strong> Our site management is not responsible for the content shared within Telegram groups or channels listed on the site. We accept no liability for any grievances. Please be careful with all Telegram channels and groups and do not share personal information.
                                </p>
                            </article>

                            <div className="border-t pt-8">
                                <h3 className="font-bold text-gray-900 mb-4">Other Categories You May Like</h3>
                                <div className="flex flex-wrap gap-3">
                                    {allCategories.filter(c => c.id !== category.id).slice(0, 8).map(c => (
                                        <Link key={c.id} href={`/en/${c.slug}`} className="bg-gray-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                            {c.name_en || c.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">All Categories</h3>
                                <ul className="space-y-1">
                                    {allCategories.map((c) => (
                                        <li key={c.id}>
                                            <Link
                                                href={`/en/${c.slug}`}
                                                className={`block px-3 py-2.5 rounded-xl transition-all text-sm ${c.id === category.id ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                                            >
                                                {c.name_en || c.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                                <h3 className="font-extrabold mb-2 text-lg">Feature Your Channel</h3>
                                <p className="text-sm text-purple-100 mb-6 opacity-90">
                                    Buy tokens to move your channel to the top of this category and gain thousands of new subscribers.
                                </p>
                                <Link href="/dashboard/ads" className="block w-full bg-white text-purple-600 text-center font-black py-3 rounded-xl hover:bg-purple-50 transition-colors">
                                    GET STARTED
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </>
        );
    }

    // 2. Try Channel
    const channel = await getChannelBySlug(slug);
    if (channel) {
        const featuredChannels = await getFeaturedChannels();
        const similarChannels = channel.category_id
            ? (await getChannelsByCategory(channel.category_id)).filter(c => c.id !== channel.id).slice(0, 6)
            : [];

        // Translate channel content
        const nameEn = channel.name_en || await translateText(channel.name);
        const descEn = channel.description_en || (channel.description ? await translateText(channel.description) : 'No description available for this channel. Find more information on Telegram.');
        const categoryNameEn = (channel as any).categories?.name_en || await translateText(channel.categoryName || 'General');

        return (
            <>
                <JsonLd data={generateChannelSchema(channel, baseUrl)} />
                <JsonLd data={generateBreadcrumbSchema([
                    { name: 'Home', url: baseUrl },
                    { name: categoryNameEn, url: `${baseUrl}/en/${(channel as any).categories?.slug || ''}` },
                    { name: nameEn, url: `${baseUrl}/en/${channel.slug}` }
                ])} />
                {/* hreflang */}
                <link rel="alternate" hrefLang="tr" href={`${baseUrl}/${channel.slug}`} />
                <link rel="alternate" hrefLang="en" href={`${baseUrl}/en/${channel.slug}`} />
                <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/${channel.slug}`} />

                <Header />
                <main className="container mx-auto px-4 py-8 max-w-6xl">
                    <nav className="text-sm text-gray-500 mb-6 flex gap-2" aria-label="Breadcrumb">
                        <Link href="/en" className="hover:text-blue-600">Home</Link>
                        <span>/</span>
                        <Link href={`/en/${(channel as any).categories?.slug}`} className="hover:text-blue-600">{categoryNameEn}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{nameEn}</span>
                    </nav>

                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2 space-y-8">
                            {/* We render ChannelDetail but override the exposed description for EN */}
                            <ChannelDetail channel={{ ...channel, name: nameEn, description: descEn, categoryName: categoryNameEn }} />
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-4">
                                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Featured Channels</h3>
                                <div className="space-y-4">
                                    {featuredChannels.map(featured => (
                                        <Link key={featured.id} href={`/en/${featured.slug}`} className="flex items-center gap-3 group">
                                            {featured.image ? (
                                                <img src={featured.image} alt={featured.name} className="w-10 h-10 rounded-lg object-cover border" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{featured.name[0]}</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 truncate">{featured.name_en || featured.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{featured.member_count?.toLocaleString()} subscribers</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {similarChannels.length > 0 && (
                        <section className="mt-16 pt-12 border-t">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900">
                                    🔗 Similar {categoryNameEn} Channels
                                </h2>
                                <Link href={`/en/${(channel as any).categories?.slug}`} className="text-blue-600 font-bold hover:underline">
                                    View All &rarr;
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {similarChannels.map(c => (
                                    <ChannelCard key={c.id} channel={c} />
                                ))}
                            </div>
                        </section>
                    )}

                    <Comments channelId={channel.id} />

                    <section className="mt-16 bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Explore the Telegram World</h2>
                        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                            Visit our guides to learn how to use Telegram channels, the best bots, and privacy settings.
                        </p>
                        <Link href="/blog" className="inline-block bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black transition-all">
                            BLOG & GUIDES
                        </Link>
                    </section>
                </main>
                <Footer />
            </>
        );
    }

    notFound();
}
