import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';

export const metadata: Metadata = {
    title: 'Kullanım Şartları | Telegram Kanalları',
    description: 'TelegramKanali.com sitesini kullanırken uymanız gereken kurallar, şartlar ve sorumluluk reddi beyanı.',
    alternates: { canonical: `${baseUrl}/kullanim-sartlari` },
    openGraph: {
        title: 'Kullanım Şartları | Telegram Kanalları',
        url: `${baseUrl}/kullanim-sartlari`,
        type: 'website',
    },
};

export default function TermsPage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': 'Kullanım Şartları | Telegram Kanalları',
        'url': `${baseUrl}/kullanim-sartlari`,
        'inLanguage': 'tr-TR',
        'dateModified': '2026-03-20',
        'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Anasayfa', 'item': baseUrl },
                { '@type': 'ListItem', 'position': 2, 'name': 'Kullanım Şartları', 'item': `${baseUrl}/kullanim-sartlari` },
            ],
        },
    };

    return (
        <>
            <JsonLd data={schema} />
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Kullanım Şartları</h1>
                <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm space-y-6">
                    <p className="italic text-gray-500">Son Güncelleme: 20 Mart 2026</p>
                    <p>
                        Bu web sitesini (telegramkanali.com) kullanarak aşağıdaki şartları peşinen kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız lütfen siteyi kullanmayınız.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Hizmet Tanımı ve Kapsamı</h2>
                        <p>TelegramKanali.com, Telegram kanallarını, gruplarını ve botlarını listeleyen bağımsız bir dizin servisidir. Sitemiz Telegram FZ-LLC ile doğrudan veya dolaylı bir bağlantıya sahip değildir.</p>
                    </section>

                    <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h2 className="text-xl font-bold text-red-900 mb-2">2. Sorumluluk Reddi (5651 Sayılı Kanun Madde 4)</h2>
                        <p className="text-red-800">
                            <strong>ÖNEMLİ:</strong> Sitemiz, bağlantı (link) sağladığı başkasına ait içeriklerden (Telegram kanallarındaki paylaşımlar, fikirler, dosyalar vb.) sorumlu değildir. 5651 Sayılı Kanun gereği "İçerik Sağlayıcı" sıfatıyla, sadece kendi ürettiğimiz içeriklerden sorumluyuz. Kanallardaki yasa dışı faaliyetler tamamen ilgili kanal yönetiminin sorumluluğundadır. Sitemiz sadece bir erişim kolaylaştırıcıdır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Yasaklı İçerikler ve Kanal Ekleme</h2>
                        <p>Kanal ekleyen kullanıcılar, kanalın T.C. yasalarına (Özellikle müstehcenlik, yasa dışı bahis, telif hakları vb.) uygun olduğunu beyan ederler. Aşağıdaki türdeki kanallar sitemizde kesinlikle barındırılamaz ve tespit edildiği an silinir:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Yasa dışı bahis ve şans oyunları (7258 S.K. muhalefet)</li>
                            <li>Müstehcenlik ve pornografi (TCK 226 muhalefet)</li>
                            <li>Telif hakkını ihlal eden film, dizi, yazılım paylaşımı</li>
                            <li>Şiddet, nefret söylemi ve terör propagandası</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Uyar-Kaldır Sistemi</h2>
                        <p>Hukuka aykırı olduğunu düşündüğünüz bir içeriğin veya telif haklarınızın ihlal edildiği bir kanalın sitemizden kaldırılmasını istiyorsanız, <strong>telegramkanaliiletisim@outlook.com</strong> veya <strong>@sibelliee</strong> (Telegram) üzerinden bizimle iletişime geçmelisiniz. Bildiriminiz en geç 48 saat içinde değerlendirilecektir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">5. Fikri Mülkiyet</h2>
                        <p>Sitemizin tasarımı, kodları ve özgün metinleri telif hakları ile korunmaktadır. İzinsiz kopyalanması durumunda yasal işlem başlatılacaktır.</p>
                    </section>
                </article>
            </main>
            <Footer />
        </>
    );
}
