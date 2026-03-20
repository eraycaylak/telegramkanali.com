import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Gizlilik Politikası ve KVKK - Telegram Kanalları',
    description: 'TelegramKanali.com gizlilik politikası, KVKK aydınlatma metni ve veri kullanımı hakkında bilgiler.',
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Gizlilik Politikası (KVKK)</h1>
                <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm space-y-6">
                    <p className="italic text-gray-500">Son Güncelleme: 20 Mart 2026</p>
                    <p>
                        TelegramKanali.com ("Biz"), 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca "Veri Sorumlusu" sıfatıyla, kullanıcılarımızın kişisel verilerinin güvenliğini ciddiye alıyoruz.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">1. İşlenen Veriler ve Toplanma Amacı</h2>
                        <p>Sitemizi kullandığınızda aşağıdaki veriler toplanabilir:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Log Verileri:</strong> IP adresiniz, giriş tarih-saat bilgileriniz, ziyaret ettiğiniz sayfalar (5651 S.K. gereği zorunludur).</li>
                            <li><strong>Üyelik Verileri:</strong> Giriş yapmanız durumunda e-posta adresiniz ve kullanıcı adınız.</li>
                            <li><strong>Analiz Verileri:</strong> Kanal tıklama sayıları ve topluluk katılım hareketleri (Sadece anonim istatistik amaçlı).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">2. Verilerin İşlenme Hukuki Sebebi</h2>
                        <p>Kişisel verileriniz, Kanun'un 5. maddesinde yer alan "kanunlarda açıkça öngörülmesi" ve "ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması" hukuki sebeplerine dayanılarak işlenmektedir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">3. Üçüncü Taraflarla Paylaşım</h2>
                        <p>Kişisel verileriniz, ancak resmi makamların (Emniyet, BTK, Mahkemeler vb.) yasal talebi doğrultusunda ilgili mercilerle paylaşılır. Bunun dışında verileriniz asla 3. taraflara pazarlama amaçlı satılmaz veya devredilmez.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">4. Haklarınız (KVKK Madde 11)</h2>
                        <p>Veri sahibi olarak; verilerinizin işlenip işlenmediğini öğrenme, yanlış işlenmişse düzeltilmesini isteme ve silinmesini talep etme hakkına sahipsiniz. Taleplerinizi <strong>iletisim@telegramkanali.com</strong> adresine iletebilirsiniz.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">5. Çerezler (Cookies)</h2>
                        <p>Sitemiz, sadece oturum yönetimi ve kullanıcı deneyimini iyileştirmek için temel çerezler kullanır. Reklam profili oluşturmak veya sizi dış sitelerde takip etmek için çerez kullanmıyoruz.</p>
                    </section>
                </article>
            </main>
            <Footer />
        </>
    );
}
