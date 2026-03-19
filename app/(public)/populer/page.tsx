import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';
import Link from 'next/link';
import { Flame, TrendingUp, Award } from 'lucide-react';

export const metadata = {
    title: 'Popüler Telegram Kanalları - 2026 En Çok Takip Edilenler',
    description: 'Türkiye\'nin en popüler ve en çok takip edilen Telegram kanallarını keşfedin. Trend olan topluluklar.',
};

export default async function PopularPage() {
    // Fetch channels sorted by score/subscribers (getChannels does this by default)
    const { data: channels } = await getChannels(1, 30);

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                        <Flame size={18} />
                        TREND LİSTESİ
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4 text-gray-900 md:text-5xl">Popüler Kanallar</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Şu anda en çok ilgi gören, etkileşimi yüksek ve en kaliteli Telegram toplulukları.
                        Sürekli güncellenen popülerlik listemiz.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {channels.map((channel, index) => (
                        <div key={channel.id} className="relative">
                            {index < 3 && (
                                <div className="absolute -top-3 -left-3 z-10 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white shadow-lg">
                                    {index + 1}
                                </div>
                            )}
                            <ChannelCard channel={channel} />
                        </div>
                    ))}
                </div>

                <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                    <div className="relative z-10 md:flex items-center justify-between gap-8">
                        <div className="mb-8 md:mb-0 max-w-xl">
                            <h2 className="text-3xl font-bold mb-4">Kanalınız Burada Olsun İster misiniz?</h2>
                            <p className="text-blue-100 text-lg mb-6">
                                Popülerlik listesine girmek ve binlerce yeni üyeye ulaşmak için kanalınızı ekleyin veya reklam paketlerimizi inceleyin.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/kanal-ekle" className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                                    Ücretsiz Ekle
                                </Link>
                                <Link href="/reklam" className="bg-blue-500 text-white border border-blue-400 px-8 py-3 rounded-xl font-bold hover:bg-blue-400 transition-colors">
                                    Reklam Paketleri
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block opacity-20">
                            <TrendingUp size={240} />
                        </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>
            </main>
            <Footer />
        </>
    );
}
