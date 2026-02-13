import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Kullanım Şartları - Telegram Kanalları',
    description: 'TelegramKanali.com sitesini kullanırken uymanız gereken kurallar ve şartlar.',
};

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Kullanım Şartları</h1>
                <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm">
                    <p>Son Güncelleme: 13 Şubat 2026</p>
                    <p>
                        Bu web sitesini kullanarak aşağıdaki şartları peşinen kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız lütfen siteyi kullanmayınız.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Hizmet Tanımı</h2>
                    <p>TelegramKanali.com, Telegram kanallarını listeleyen bir dizin servisidir. Sitemiz Telegram FZ-LLC ile doğrudan veya dolaylı bir bağlantıya sahip değildir.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Sorumluluk Reddi</h2>
                    <p>Listelenen kanalların içeriğinden sitemiz sorumlu değildir. Kanallardaki paylaşımlar, fikirler veya yasa dışı içerikler tamamen kanal yönetiminin sorumluluğundadır. Sitemiz sadece bir aracıdır.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Kanal Ekleme Kuralları</h2>
                    <p>Kanal ekleyen kullanıcılar, kanalın yasal olduğunu ve başkalarının haklarını ihlal etmediğini beyan ederler. Uygunsuz bulunan kanallar (yetişkin içerik, yasa dışı bahis, şiddet vb.) önceden haber verilmeksizin silinebilir.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Telif Hakları</h2>
                    <p>Sitemizdeki içeriklerin izinsiz kopyalanması ve başka mecralarda yayınlanması yasaktır. İsim ve marka haklarımız saklıdır.</p>
                </article>
            </main>
            <Footer />
        </>
    );
}
