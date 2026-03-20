import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Künye - Telegram Kanalları',
    description: 'TelegramKanali.com resmi iletişim ve tanıtıcı bilgileri.',
};

export default function KunyePage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Künye</h1>
                <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-8">
                    <p className="text-lg">
                        5651 Sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun uyarınca, sitemizin tanıtıcı bilgileri aşağıdadır.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Scre Adı / Ünvan</h3>
                            <p className="text-gray-900 font-medium">TelegramKanali.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Yer Sağlayıcı</h3>
                            <p className="text-gray-900 font-medium">Amazon (AWS) / Vercel Inc. (Global)</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">İletişim (E-Posta)</h3>
                            <p className="text-gray-900 font-medium font-mono text-sm underline decoration-blue-200">telegramkanaliiletisim@outlook.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Resmi Destek Kanalı</h3>
                            <p className="text-gray-900 font-medium">Telegram: @sibelliee</p>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">Tebligat Adresi</h3>
                            <p className="text-gray-900 font-medium text-sm">Uyar-Kaldır talepleriniz ve resmi yazışmalarınız için lütfen yukarıdaki e-posta veya Telegram adresi üzerinden irtibata geçiniz.</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                        <h2 className="text-lg font-bold text-blue-900 mb-2">Uyar-Kaldır Bildirimi</h2>
                        <p className="text-blue-800 text-sm">
                            Sitemizde yer alan içeriklerin (kanalların) telif haklarını ihlal ettiğini veya yasalara aykırı olduğunu düşünüyorsanız, lütfen durumu bize bildirin. Bildirimleriniz 24-48 saat içerisinde incelenerek gerekli aksiyonlar alınacaktır.
                        </p>
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
}
