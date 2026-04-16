import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

const baseUrl = 'https://telegramkanali.com';
const UPDATE_DATE = '17 Nisan 2026';

export const metadata: Metadata = {
    title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | telegramkanali.com',
    description: 'TelegramKanali.com KVKK kapsamında kişisel veri işleme, IP kaydı, yaş doğrulama ve veri sahibi hakları hakkında tam aydınlatma metni.',
    alternates: { canonical: `${baseUrl}/gizlilik` },
    openGraph: {
        title: 'Gizlilik Politikası | telegramkanali.com',
        url: `${baseUrl}/gizlilik`,
        type: 'website',
    },
};

export default function PrivacyPage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': 'Gizlilik Politikası | telegramkanali.com',
        'url': `${baseUrl}/gizlilik`,
        'inLanguage': 'tr-TR',
        'dateModified': '2026-04-17',
        'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Anasayfa', 'item': baseUrl },
                { '@type': 'ListItem', 'position': 2, 'name': 'Gizlilik Politikası', 'item': `${baseUrl}/gizlilik` },
            ],
        },
    };

    return (
        <>
            <JsonLd data={schema} />
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
                <p className="text-sm text-gray-400 mb-10">Son Güncelleme: {UPDATE_DATE}</p>

                <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm space-y-8">

                    {/* Giriş */}
                    <section>
                        <p>
                            <strong>telegramkanali.com</strong> ("Platform"), 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca
                            "Veri Sorumlusu" sıfatıyla hareket etmektedir. Bu metin, hangi verilerin toplandığını, neden toplandığını,
                            ne kadar süreyle saklandığını ve haklarınızı açıklamaktadır.
                        </p>
                        <p className="mt-2">
                            Platform, 5651 Sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen 
                            Suçlarla Mücadele Edilmesi Hakkında Kanun kapsamında <strong>yer sağlayıcı</strong> niteliği taşımaktadır.
                            Kullanıcılar tarafından Telegram üzerinde oluşturulmuş kanallara yalnızca dizin hizmeti sağlanmakta;
                            içerik üretilmemekte ve barındırılmamaktadır.
                        </p>
                    </section>

                    {/* 1 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. İşlenen Kişisel Veriler ve Toplama Amacı</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200 text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-200 px-4 py-2 text-left">Veri Kategorisi</th>
                                        <th className="border border-gray-200 px-4 py-2 text-left">Açıklama</th>
                                        <th className="border border-gray-200 px-4 py-2 text-left">İşleme Amacı</th>
                                        <th className="border border-gray-200 px-4 py-2 text-left">Hukuki Dayanak</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-2 font-medium">Log Verileri</td>
                                        <td className="border border-gray-200 px-4 py-2">IP adresi, ziyaret tarihi/saati, tarayıcı bilgisi, ziyaret edilen sayfa</td>
                                        <td className="border border-gray-200 px-4 py-2">5651 S.K. m.5 gereği yasal zorunluluk; güvenlik, hata takibi</td>
                                        <td className="border border-gray-200 px-4 py-2">KVKK m.5/2-a (Kanunlarda açıkça öngörülme)</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-200 px-4 py-2 font-medium">Yaş Doğrulama Kaydı</td>
                                        <td className="border border-gray-200 px-4 py-2">IP adresi, onay tarihi/saati, tarayıcı bilgisi, +18 kabul beyanı</td>
                                        <td className="border border-gray-200 px-4 py-2">TCK m.226/7 kapsamında çocukların +18 içeriğe erişimini engellemek; yasal yükümlülük ispatı</td>
                                        <td className="border border-gray-200 px-4 py-2">KVKK m.5/2-a (Kanunlarda açıkça öngörülme)</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-2 font-medium">Üyelik Verileri</td>
                                        <td className="border border-gray-200 px-4 py-2">E-posta adresi, kullanıcı adı, şifre özeti</td>
                                        <td className="border border-gray-200 px-4 py-2">Kanal ekleme ve yönetim paneline erişim</td>
                                        <td className="border border-gray-200 px-4 py-2">KVKK m.5/2-c (Sözleşme kurulması)</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-200 px-4 py-2 font-medium">Şikayet/İhbar Verileri</td>
                                        <td className="border border-gray-200 px-4 py-2">E-posta (opsiyonel), şikayet içeriği, kanal bilgisi</td>
                                        <td className="border border-gray-200 px-4 py-2">İçerik moderasyonu; hukuka aykırı içeriklerin tespiti ve kaldırılması</td>
                                        <td className="border border-gray-200 px-4 py-2">KVKK m.5/2-a ve m.5/2-f (Meşru menfaat)</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 px-4 py-2 font-medium">Analiz Verileri</td>
                                        <td className="border border-gray-200 px-4 py-2">Kanal tıklama sayıları (anonimleştirilmiş istatistik)</td>
                                        <td className="border border-gray-200 px-4 py-2">Platform kalitesini iyileştirme</td>
                                        <td className="border border-gray-200 px-4 py-2">KVKK m.5/2-f (Meşru menfaat)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Yaş Doğrulama Verilerinin İşlenmesi (TCK 226/7)</h2>
                        <p>
                            Platform, Türk Ceza Kanunu'nun 226/7. maddesi uyarınca +18 içerik barındıran kanallara erişim öncesinde
                            kullanıcıların 18 yaşından büyük olduklarını beyan etmelerini zorunlu kılmaktadır.
                        </p>
                        <ul className="list-disc pl-5 mt-3 space-y-2">
                            <li><strong>Kaydedilen Veriler:</strong> IP adresi, tarayıcı bilgisi, onay tarihi ve saati</li>
                            <li><strong>Saklama Süresi:</strong> Onay tarihinden itibaren <strong>30 gün</strong>. Süre sonunda otomatik olarak yenileme talep edilir veya onay geçersiz sayılır.</li>
                            <li><strong>Amaç:</strong> Çocukların (+18 yaş altı bireylerin) müstehcen içeriklere erişimini önlemek ve yasal uyumluluğu belgelemek.</li>
                            <li><strong>Paylaşım:</strong> Bu veriler yalnızca yetkili resmi makamların (mahkeme, savcılık, BTK) yasal talebi üzerine paylaşılır.</li>
                        </ul>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Verilerin Saklanma Süreleri</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Log verileri (IP, ziyaret):</strong> 5651 S.K. m.5 uyarınca <strong>2 yıl</strong> saklanır, bu süre sonunda silinir.</li>
                            <li><strong>Yaş doğrulama kayıtları:</strong> Onayın geçerli olduğu <strong>30 gün</strong> saklanır.</li>
                            <li><strong>Üyelik verileri:</strong> Hesap silindiğinde veya talep üzerine silinir.</li>
                            <li><strong>Şikayet kayıtları:</strong> İşlem tamamlanmasından itibaren <strong>1 yıl</strong> saklanır.</li>
                            <li><strong>Analiz verileri:</strong> Anonimleştirildiğinden süresiz tutulabilir.</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Üçüncü Taraflarla Veri Paylaşımı</h2>
                        <p>Kişisel verileriniz aşağıdaki durumlar dışında hiçbir üçüncü tarafla paylaşılmaz:</p>
                        <ul className="list-disc pl-5 mt-3 space-y-2">
                            <li><strong>Resmi Makam Talepleri:</strong> Mahkeme kararı, savcılık talebi, BTK bildirimi gibi yasal zorunluluklar kapsamında ilgili kurumlarla paylaşılır.</li>
                            <li><strong>Altyapı Sağlayıcılar:</strong> Barındırma (Vercel), veritabanı (Supabase) hizmetleri verinizi teknik altyapı olarak işler; pazarlama amaçlı erişimde bulunmaz.</li>
                            <li><strong>Pazarlama / Satış:</strong> Verileriniz asla üçüncü taraflara satılmaz veya kiralanmaz.</li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Veri Sahibi Hakları (KVKK Madde 11)</h2>
                        <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className="list-disc pl-5 mt-3 space-y-2">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                            <li>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                            <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme</li>
                            <li>Eksik veya yanlış işlenen verilerin düzeltilmesini talep etme</li>
                            <li>Verilerin silinmesini veya yok edilmesini talep etme</li>
                            <li>İşleme itiraz etme ve zararın tazminini talep etme</li>
                        </ul>
                        <p className="mt-3">
                            Taleplerinizi <strong>telegramkanaliiletisim@outlook.com</strong> adresine yazılı olarak iletebilirsiniz.
                            Başvurunuz <strong>30 gün</strong> içinde yanıtlanacaktır (KVKK m.13).
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Çerezler (Cookies)</h2>
                        <p>Platform yalnızca teknik zorunluluk kapsamında çerez kullanır:</p>
                        <ul className="list-disc pl-5 mt-3 space-y-2">
                            <li><strong>Oturum çerezleri:</strong> Giriş yapmış kullanıcıların oturumunu korumak için.</li>
                            <li><strong>Tercih çerezleri:</strong> Kullanıcı arayüz ayarları için.</li>
                        </ul>
                        <p className="mt-2">Reklam takip çerezi, üçüncü taraf profilleme çerezi veya davranışsal hedefleme çerezi <strong>kullanılmamaktadır</strong>.</p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. İçerik Moderasyonu ve Şikayet Süreci</h2>
                        <p>
                            Platform, 5651 S.K. kapsamında yer sağlayıcı olarak hukuka aykırı içeriklerin kaldırılması için
                            aktif bir şikayet mekanizması işletmektedir:
                        </p>
                        <ul className="list-disc pl-5 mt-3 space-y-2">
                            <li>Her kanal sayfasında <strong>"Şikayet Et"</strong> butonu mevcuttur.</li>
                            <li>Şikayetler <strong>48 saat</strong> içinde incelenir.</li>
                            <li>Hukuka aykırı bulunan içerikler gecikmeksizin kaldırılır veya erişime engellenir.</li>
                            <li>Acil ihbarlar için: <strong>telegramkanaliiletisim@outlook.com</strong></li>
                        </ul>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Güvenlik Önlemleri</h2>
                        <p>Verilerinizi korumak için aşağıdaki teknik ve idari tedbirler alınmıştır:</p>
                        <ul className="list-disc pl-5 mt-3 space-y-2">
                            <li>SSL/TLS şifreleme ile veri iletimi</li>
                            <li>Veritabanı erişim kontrolü (Row Level Security)</li>
                            <li>Servis rolü anahtarlarının güvenli saklanması</li>
                            <li>Periyodik güvenlik denetimleri</li>
                        </ul>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">9. Politika Değişiklikleri</h2>
                        <p>
                            Bu politika önemli değişiklik olduğunda güncellenir ve sayfa başındaki "Son Güncelleme" tarihi revize edilir.
                            Devam eden kullanım, güncel politikayı kabul ettiğiniz anlamına gelir.
                        </p>
                    </section>

                    {/* İletişim */}
                    <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">İletişim</h2>
                        <p className="text-gray-600 text-sm">
                            KVKK kapsamındaki başvurularınız ve gizlilik konusundaki sorularınız için:
                        </p>
                        <p className="mt-2 font-semibold text-blue-700">telegramkanaliiletisim@outlook.com</p>
                        <p className="text-xs text-gray-500 mt-1">Yanıt süresi: En geç 30 iş günü (KVKK m.13)</p>
                    </section>
                </article>
            </main>
            <Footer />
        </>
    );
}
