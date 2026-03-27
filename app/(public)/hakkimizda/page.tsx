import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';

export const metadata: Metadata = {
    title: 'Hakkımızda | Telegram Kanalları',
    description: "Türkiye'nin en büyük Telegram kanal dizini hakkında bilgi alın. Misyonumuz, ekibimiz ve vizyonumuzla Telegram topluluklarına köprü oluyoruz.",
    alternates: {
        canonical: `${baseUrl}/hakkimizda`,
    },
    openGraph: {
        title: 'Hakkımızda | Telegram Kanalları',
        description: "Türkiye'nin en büyük Telegram kanal dizini hakkında bilgi alın.",
        url: `${baseUrl}/hakkimizda`,
        type: 'website',
    },
};

export default function AboutPage() {
    const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'name': 'Hakkımızda | Telegram Kanalları',
        'description': "Türkiye'nin en büyük Telegram kanal dizini hakkında bilgi alın.",
        'url': `${baseUrl}/hakkimizda`,
        'inLanguage': 'tr-TR',
        'isPartOf': {
            '@type': 'WebSite',
            'url': baseUrl,
            'name': 'Telegram Kanalları',
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Telegram Kanalları',
            'url': baseUrl,
            'logo': {
                '@type': 'ImageObject',
                'url': `${baseUrl}/images/logo.png`,
            },
        },
        'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Anasayfa', 'item': baseUrl },
                { '@type': 'ListItem', 'position': 2, 'name': 'Hakkımızda', 'item': `${baseUrl}/hakkimizda` },
            ],
        },
    };

    return (
        <>
            <JsonLd data={webPageSchema} />
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
                    <ol className="flex gap-2">
                        <li><a href="/" className="hover:text-blue-600">Anasayfa</a></li>
                        <li aria-hidden="true">&rsaquo;</li>
                        <li aria-current="page">Hakkımızda</li>
                    </ol>
                </nav>
                <h1 className="text-4xl font-bold mb-8">Telegram Kanalları Hakkında</h1>
                <article className="prose prose-blue max-w-none space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        <strong>TelegramKanali.com</strong>, Türkiye&apos;nin en kapsamlı ve güncel Telegram topluluk rehberidir.
                        Amacımız, kullanıcıların ilgi alanlarına en uygun Telegram kanallarını ve gruplarını kolayca keşfetmelerini sağlamaktır.
                    </p>
                    <p>
                        Platformumuzda haberden eğlenceye, kripto paradan eğitime kadar onlarca farklı kategoride binlerce onaylanmış kanal bulunmaktadır.
                        Her gün yenilenen listelerimizle Telegram dünyasının nabdını tutuyoruz.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Misyonumuz</h2>
                    <p>
                        Kullanıcılarımıza güvenli, temiz ve faydalı bir içerik havuzu sunarak Telegram deneyimlerini zenginleştirmek.
                        Aynı zamanda kanal sahiplerine kitlelerine ulaşmaları için profesyonel bir vitrin sağlamak.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Neden Biz?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Güncellik:</strong> Kanallarımızı düzenli olarak kontrol ediyor ve aktif olmayanları temizliyoruz.</li>
                        <li><strong>Güvenlik:</strong> Spam veya zararlı içerik barındıran kanalları platformumuza kabul etmiyoruz.</li>
                        <li><strong>Kolay Arama:</strong> Gelişmiş filtreleme ve arama seçenekleriyle aradığınızı saniyeler içinde bulun.</li>
                    </ul>
                </article>
            </main>
            <Footer />
        </>
    );
}
