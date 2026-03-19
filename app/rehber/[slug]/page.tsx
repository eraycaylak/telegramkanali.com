import { getSeoPageBySlug, getChannelsByCategory, getCategories, getAllSeoSlugs } from '@/lib/data';
import { getChannels } from '@/lib/data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChannelCard from '@/components/ChannelCard';
import TableOfContents from '@/components/TableOfContents';
import JsonLd, { generateFAQSchema, generateBreadcrumbSchema } from '@/components/JsonLd';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 3600; // 1 hour
export const dynamic = 'force-dynamic';

const baseUrl = 'https://telegramkanali.com';

interface PageProps {
    params: {
        slug: string;
    };
}

// Generate static paths for SEO pages
export async function generateStaticParams() {
    const slugs = await getAllSeoSlugs();
    return slugs.map((slug) => ({ slug }));
}

// Generate SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getSeoPageBySlug(slug);

    if (!page) {
        return { title: 'Sayfa Bulunamadı' };
    }

    return {
        title: page.title,
        description: page.meta_description,
        keywords: page.target_keywords?.join(', '),
        openGraph: {
            title: page.title,
            description: page.meta_description || '',
            url: `${baseUrl}/rehber/${page.slug}`,
            type: 'article',
        },
        alternates: {
            canonical: `${baseUrl}/rehber/${page.slug}`,
        },
    };
}

export default async function SeoLandingPage({ params }: PageProps) {
    const { slug } = await params;
    const page = await getSeoPageBySlug(slug);

    if (!page) {
        notFound();
    }

    const categories = await getCategories();
    const { data: allChannels } = await getChannels();

    // Get related channels based on related_categories
    const relatedChannels = page.related_categories
        ? allChannels.filter(ch => page.related_categories?.includes(ch.category_id)).slice(0, 12)
        : allChannels.slice(0, 12);

    // FAQs from content
    const faqs = page.content?.faqs || [];

    return (
        <>
            {/* Structured Data */}
            {faqs.length > 0 && <JsonLd data={generateFAQSchema(faqs)} />}
            <JsonLd data={generateBreadcrumbSchema([
                { name: 'Anasayfa', url: baseUrl },
                { name: 'Rehber', url: `${baseUrl}/rehber` },
                { name: page.h1, url: `${baseUrl}/rehber/${page.slug}` }
            ])} />

            <Header />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-6 flex gap-2" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-blue-600">Anasayfa</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{page.h1}</span>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <article className="lg:col-span-2 space-y-8">
                        {/* H1 */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                            {page.h1}
                        </h1>

                        {/* Last Updated - Google loves fresh content signal */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 border-b border-gray-100 pb-4">
                            <span className="flex items-center gap-1">
                                📅 Son güncelleme: {new Date(page.updated_at || page.created_at || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                                📖 ~{page.word_count || 500} kelime
                            </span>
                        </div>

                        {/* Intro Section */}
                        {page.content?.intro && (
                            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                                <p>{page.content.intro}</p>
                            </div>
                        )}

                        {/* Content Sections */}
                        {page.content?.sections?.map((section, index) => (
                            <section key={index} id={`section-${index}`} className="space-y-4 scroll-mt-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {section.heading}
                                </h2>
                                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                                    <p>{section.body}</p>
                                </div>
                            </section>
                        ))}

                        {/* Related Channels */}
                        <section id="related-channels" className="space-y-6 scroll-mt-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                📱 Önerilen Telegram Kanalları
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {relatedChannels.map((channel) => (
                                    <ChannelCard key={channel.id} channel={channel} />
                                ))}
                            </div>
                            <div className="text-center">
                                <Link
                                    href="/"
                                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                >
                                    Tüm Kanalları Gör →
                                </Link>
                            </div>
                        </section>

                        {/* FAQ Section */}
                        {faqs.length > 0 && (
                            <section id="faq-section" className="space-y-6 pt-8 border-t border-gray-100 scroll-mt-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    ❓ Sık Sorulan Sorular
                                </h2>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <details key={index} className="bg-gray-50 rounded-xl border border-gray-100 group">
                                            <summary className="p-5 font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                                                {faq.question}
                                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                            </summary>
                                            <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}
                    </article>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Table of Contents - Hub sayfalar için */}
                        <TableOfContents content={page.content} showProgress={true} />

                        {/* Related SEO Pages - Internal Linking Boost */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">📚 İlgili Rehberler</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/rehber/telegram-kanallari-2026" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                                        → Telegram Kanalları 2026 Güncel Liste
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/rehber/en-iyi-telegram-kanallari" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                                        → En İyi Telegram Kanalları TOP 100
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/rehber/telegram-nasil-kullanilir" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                                        → Telegram Nasıl Kullanılır? Rehber
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/rehber/telegram-guvenlik-rehberi" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                                        → Telegram Güvenlik Rehberi
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">📂 Kategoriler</h3>
                            <ul className="space-y-3">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/${category.slug}`}
                                            className="flex items-center justify-between text-gray-600 hover:text-blue-600 hover:pl-2 transition-all"
                                        >
                                            <span>{category.name}</span>
                                            <span className="text-xs bg-white px-2 py-1 rounded border border-gray-100 text-gray-400">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Box */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                            <h3 className="font-bold mb-2 text-lg">🚀 Kanalınızı Ekleyin</h3>
                            <p className="text-sm text-blue-100 mb-4">
                                Telegram kanalınızı binlerce kullanıcıya tanıtın.
                            </p>
                            <Link
                                href="/admin"
                                className="block w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-center hover:bg-blue-50 transition"
                            >
                                Hemen Başvur
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </>
    );
}
