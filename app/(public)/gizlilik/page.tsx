import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Gizlilik Politikası - Telegram Kanalları',
    description: 'TelegramKanali.com gizlilik politikası ve veri kullanımı hakkında bilgiler.',
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Gizlilik Politikası</h1>
                <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm">
                    <p>Son Güncelleme: 13 Şubat 2026</p>
                    <p>
                        TelegramKanali.com olarak gizliliğinize önem veriyoruz. Bu politika, sitemizi kullandığınızda hangi verileri topladığımızı ve bunları nasıl kullandığımızı açıklar.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. Toplanan Bilgiler</h2>
                    <p>Sitemiz otomatik olarak IP adresiniz, tarayıcı türünüz ve ziyaret ettiğiniz sayfalar gibi anonim kullanım verilerini (Log Dosyaları) toplayabilir. Bu veriler yalnızca istatistiksel analizler ve site performansını iyileştirmek için kullanılır.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Çerezler (Cookies)</h2>
                    <p>Kullanıcı deneyimini iyileştirmek için çerezler kullanmaktayız. Çerezler, tarayıcınız tarafından bilgisayarınıza kaydedilen küçük dosyalardır. Reklam ortaklarımız (örneğin Google AdSense) de ilgi alanına dayalı reklamlar sunmak için çerez kullanabilir.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Üçüncü Taraf Linkler</h2>
                    <p>Sitemizde Telegram kanallarına veya diğer web sitelerine linkler bulunmaktadır. Bu dış sitelerin gizlilik politikalarından sorumlu değiliz. Herhangi bir kanala katılırken kendi gizliliğinizi korumak sizin sorumluluğunuzdadır.</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Veri Güvenliği</h2>
                    <p>Verilerinizi yetkisiz erişime karşı korumak için endüstri standardı güvenlik önlemleri almaktayız. Ancak internet üzerinden iletilen verilerin %100 güvenli olduğunu garanti edemeyiz.</p>
                </article>
            </main>
            <Footer />
        </>
    );
}
