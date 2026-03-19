import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Globe, Code, Shield } from 'lucide-react';

export const metadata = {
    title: 'Webmaster & İş Ortaklığı - Telegram Kanalları',
    description: 'Web sitesi sahipleri için iş birliği, API ve link değişimi fırsatları.',
};

export default function WebmasterPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center">Webmaster Dünyası</h1>

                <div className="prose prose-blue max-w-none text-gray-700 space-y-8">
                    <section className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Globe className="text-blue-600" size={32} />
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Link Değişimi & Tanıtım Yazısı</h2>
                        </div>
                        <p>
                            Telegram sektörüyle ilişkili veya teknoloji haberleri paylaşan kaliteli web siteleriyle link değişimi yapmaya açığız.
                            Sitenizin otoritesini artırmak ve karşılıklı trafik sağlamak için bizimle iletişime geçebilirsiniz.
                        </p>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="border border-gray-200 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Code className="text-green-600" size={24} />
                                <h3 className="font-bold text-lg m-0">API & Veri Paylaşımı</h3>
                            </div>
                            <p className="text-sm">
                                Telegram kanallarımızı kendi sitenizde veya uygulamanızda listelemek mi istiyorsunuz?
                                Profesyonel iş birliği talepleri için veri paylaşımı yapabiliriz.
                            </p>
                        </div>
                        <div className="border border-gray-200 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="text-purple-600" size={24} />
                                <h3 className="font-bold text-lg m-0">Doğrudan Reklam</h3>
                            </div>
                            <p className="text-sm">
                                Sitemiz aylık binlerce organik ziyaretçi almaktadır. Webmaster araçları, hosting veya sosyal medya panelleri
                                için doğrudan banner alanlarımızı kiralayabilirsiniz.
                            </p>
                        </div>
                    </section>

                    <div className="text-center bg-gray-900 text-white p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-4">Bize Ulaşın</h2>
                        <p className="mb-6 opacity-80">Webmaster iş birlikleri için lütfen aşağıdaki adresi kullanın:</p>
                        <a href="mailto:webmaster@telegramkanali.com" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-bold transition">
                            iletisim@telegramkanali.com
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
