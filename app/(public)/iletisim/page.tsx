import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { Mail, Send } from 'lucide-react';
import type { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';

export const metadata: Metadata = {
    title: 'İletişim | Telegram Kanalları',
    description: 'Bizimle iletişime geçin. Soru, öneri ve reklam talepleriniz için buradayız. Telegram üzerinden veya e-posta ile ulaşabilirsiniz.',
    alternates: {
        canonical: `${baseUrl}/iletisim`,
    },
    openGraph: {
        title: 'İletişim | Telegram Kanalları',
        description: 'Soru, öneri ve reklam talepleriniz için bizimle iletişime geçin.',
        url: `${baseUrl}/iletisim`,
        type: 'website',
    },
};

export default function ContactPage() {
    const contactSchema = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'name': 'İletişim | Telegram Kanalları',
        'description': 'Soru, öneri ve reklam talepleriniz için bizimle iletişime geçin.',
        'url': `${baseUrl}/iletisim`,
        'inLanguage': 'tr-TR',
        'publisher': {
            '@type': 'Organization',
            'name': 'Telegram Kanalları',
            'url': baseUrl,
            'email': 'telegramkanaliiletisim@outlook.com',
            'sameAs': ['https://t.me/sibelliee'],
            'logo': {
                '@type': 'ImageObject',
                'url': `${baseUrl}/images/logo.png`,
            },
        },
        'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Anasayfa', 'item': baseUrl },
                { '@type': 'ListItem', 'position': 2, 'name': 'İletişim', 'item': `${baseUrl}/iletisim` },
            ],
        },
    };

    return (
        <>
            <JsonLd data={contactSchema} />
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">İletişim</h1>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-gray-600 leading-relaxed text-lg">
                            TelegramKanali.com ekibine ulaşmak için aşağıdaki kanalları kullanabilirsiniz.
                            Mesajlarınıza genellikle 24-48 saat içinde yanıt veriyoruz.
                        </p>

                        <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100 group hover:shadow-md transition">
                            <div className="bg-blue-500 p-4 rounded-xl text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition">
                                <Send size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Resmi Telegram Hesabı</h3>
                                <a href="https://t.me/sibelliee" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline text-xl">@sibelliee</a>
                                <p className="text-xs text-gray-500 mt-1">Soru, öneri ve reklam talepleri için buradan ulaşabilirsiniz.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 group hover:shadow-md transition">
                            <div className="bg-gray-800 p-4 rounded-xl text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition">
                                <Mail size={28} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg">Uyar-Kaldır & Hukuk Deplasmanı</h3>
                                <a href="mailto:telegramkanaliiletisim@outlook.com" className="text-gray-800 font-bold hover:underline font-mono text-sm truncate block">telegramkanaliiletisim@outlook.com</a>
                                <p className="text-xs text-gray-500 mt-1">Telif hakkı bildirimleri ve yasal talepler için bu adresi kullanınız.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border rounded-2xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Reklam Talepleri</h2>
                        <p className="text-gray-600 mb-6 italic text-sm">
                            * Kanalınızı öne çıkarmak veya sitemizde reklam alanlarını kullanmak için lütfen "Reklam" konusuyla iletişime geçin.
                        </p>
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm">
                            <strong>Not:</strong> Biz Telegram değiliz. Uygulama ile ilgili teknik sorunlar için lütfen Telegram'ın resmi destek birimiyle iletişime geçin.
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
