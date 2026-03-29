import Link from 'next/link';
import { ShieldCheck, Zap, Globe, HelpCircle } from 'lucide-react';
import { getCategories, getChannels, getFeaturedChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import BannerGrid from '@/components/BannerGrid';
import Pagination from '@/components/Pagination';
import JsonLd, { generateFAQSchema, generateItemListSchema } from '@/components/JsonLd';
import FeaturedAds from '@/components/FeaturedAds';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Channel, Category } from '@/lib/types';
import { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

const faqsEn = [
    {
        question: 'What are Telegram Channels?',
        answer: 'Telegram channels are one-way communication platforms where admins can broadcast messages, photos, videos, and files to unlimited subscribers.',
    },
    {
        question: 'How do I join a Telegram channel?',
        answer: 'Simply click the "JOIN CHANNEL" button on any channel page and you will be redirected to Telegram to complete the process.',
    },
    {
        question: 'Is Telegram safe?',
        answer: 'Yes, Telegram is a secure messaging app. Your phone number is not visible to other members when you join a channel.',
    },
    {
        question: 'How do I add my own channel?',
        answer: 'Visit the "Add Channel" page to submit your Telegram channel to our directory.',
        link: { href: '/dashboard/kanal-ekle', text: 'Add Channel', className: 'underline' }
    }
];

interface EnHomeProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
    title: 'Telegram Channels & Groups (2026) — Best Turkish Telegram Directory',
    description: 'Discover the best and most popular Telegram channels and groups. Browse by category: Crypto, News, Education, Entertainment and more.',
    alternates: {
        canonical: `${baseUrl}/en`,
        languages: { 'tr': baseUrl, 'x-default': baseUrl }
    },
    openGraph: {
        title: 'Telegram Channels & Groups (2026)',
        description: 'Discover the best Telegram channels and groups. Browse crypto, news, education, entertainment categories.',
        url: `${baseUrl}/en`,
        type: 'website',
    },
};

export default async function EnHome({ searchParams }: EnHomeProps) {
    const resolvedSp = searchParams ? await searchParams : {};
    const pageParam = resolvedSp?.page;
    const page = pageParam ? parseInt(pageParam as string) : 1;
    const LIMIT = 20;

    let allChannels: Channel[] = [];
    let totalCount = 0;
    let categories: Category[] = [];

    try {
        const [channelsRes, categoriesRes] = await Promise.all([
            getChannels(page, LIMIT),
            getCategories(),
        ]);
        allChannels = channelsRes.data;
        totalCount = channelsRes.count;
        categories = categoriesRes;
    } catch (err) {
        console.error('EN Homepage fetch error:', err);
    }

    const totalPages = Math.ceil(totalCount / LIMIT);

    return (
        <>
            {/* hreflang */}
            {/* Removed inline link rel="alternate" tags to prevent React Hydration #418 error */}

            {allChannels.length > 0 && (
                <JsonLd data={generateItemListSchema(
                    allChannels.map((ch, i) => ({ name: ch.name, url: `${baseUrl}/en/${ch.slug}`, position: i + 1 })),
                    'Best Telegram Channels & Groups'
                )} />
            )}

            <Header />
            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Hero */}
                <div className="text-center py-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white px-6 shadow-2xl shadow-blue-200 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                    <div className="relative z-10">
                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 border border-white/30">
                            🇬🇧 English Directory · {new Date().getFullYear()}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                            Best Telegram Channels<br />& Groups
                        </h1>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                            Discover {totalCount.toLocaleString()}+ verified channels. Crypto, news, education, entertainment, and more — all in one place.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                                <ShieldCheck size={16} className="text-green-300" /> All channels verified
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                                <Zap size={16} className="text-yellow-300" /> Updated daily
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                                <Globe size={16} className="text-blue-200" /> {totalCount.toLocaleString()}+ channels
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 16).map(c => (
                        <Link
                            key={c.id}
                            href={`/en/${c.slug}`}
                            className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                        >
                            {c.name_en || c.name}
                        </Link>
                    ))}
                </div>

                <BannerGrid />
                <FeaturedAds adType="banner" maxAds={2} />
                <FeaturedAds adType="featured" maxAds={6} />

                {/* Channel Grid */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">All Telegram Channels</h2>
                        <span className="text-sm text-gray-500">{totalCount.toLocaleString()} channels listed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {allChannels.map(channel => (
                            <ChannelCard key={channel.id} channel={channel} />
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <Pagination totalPages={totalPages} currentPage={page} searchParams={resolvedSp} />
                    </div>
                </section>

                {/* SEO Content */}
                <section className="grid gap-12 lg:grid-cols-3 pt-12 border-t border-gray-100">
                    <div className="lg:col-span-2 space-y-6 text-gray-700 leading-relaxed">
                        <article className="prose prose-blue max-w-none">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                <span className="text-blue-600">Telegram</span> Channels ({new Date().getFullYear()})
                            </h2>
                            <p className="mb-4 text-lg">
                                Telegram is one of the world&apos;s fastest-growing messaging platforms with over 900 million users.
                                Our directory lists the best Telegram channels across dozens of categories — crypto, news, education, entertainment, and more.
                                All channels are manually reviewed and regularly updated.
                            </p>
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-6 flex items-start gap-4">
                                <Globe className="text-blue-500 flex-shrink-0 mt-1" size={32} />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">How to Join a Telegram Channel?</h3>
                                    <p className="text-sm">
                                        Click the &quot;JOIN CHANNEL&quot; or &quot;JOIN&quot; button on any channel page.
                                        You will be redirected to the Telegram app where you can tap &quot;Subscribe&quot; to join instantly. No account required to browse.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mt-4">
                                * Disclaimer: Telegramkanali.com is not affiliated with Telegram Messenger. The content within channels is the sole responsibility of their respective administrators.
                            </p>
                        </article>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Browse Categories</h3>
                            <ul className="space-y-2">
                                {categories.slice(0, 12).map(c => (
                                    <li key={c.id}>
                                        <Link href={`/en/${c.slug}`} className="flex items-center justify-between text-gray-600 hover:text-blue-600 hover:pl-2 transition-all text-sm py-1">
                                            <span>{c.name_en || c.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <JsonLd data={generateFAQSchema(faqsEn)} />
                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                        <HelpCircle className="text-blue-600" />
                        Frequently Asked Questions
                    </h2>
                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {faqsEn.map((faq, i) => (
                            <details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md">
                                <summary className="flex items-center justify-between p-5 font-medium text-gray-800 list-none">
                                    {faq.question}
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                                    {faq.answer}
                                    {faq.link && (
                                        <div className="mt-2">
                                            <Link href={faq.link.href} className={`text-blue-600 hover:text-blue-800 ${faq.link.className || ''}`}>
                                                {faq.link.text}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
