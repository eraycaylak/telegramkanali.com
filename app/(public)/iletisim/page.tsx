import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Send, MessageCircle } from 'lucide-react';

export const metadata = {
    title: 'İletişim - Telegram Kanalları',
    description: 'Bizimle iletişime geçin. Soru, öneri ve reklam talepleriniz için buradayız.',
};

export default function ContactPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">İletişim</h1>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-gray-600 leading-relaxed text-lg">
                            TelegramKanali.com ekibine ulaşmak için aşağıdaki kanalları kullanabilirsiniz.
                            Mesajlarınıza genellikle 24-48 saat içinde yanıt veriyoruz.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="bg-green-500 p-3 rounded-lg text-white">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">WhatsApp</h3>
                                    <a href="https://wa.me/905427879595" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">0542 787 95 95</a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="bg-blue-400 p-3 rounded-lg text-white">
                                    <Send size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Telegram</h3>
                                    <a href="https://t.me/Errccyy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@Errccyy</a>
                                </div>
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
