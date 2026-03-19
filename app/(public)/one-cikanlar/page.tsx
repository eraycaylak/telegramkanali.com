import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFeaturedChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';

export const metadata = {
    title: 'Öne Çıkan Telegram Kanalları - 2026 Özel Seçkiler',
    description: 'Editörlerimiz tarafından seçilen en kaliteli ve popüler Telegram kanalları.',
};

export default async function FeaturedPage() {
    const channels = await getFeaturedChannels();

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">⭐ Öne Çıkan Kanallar</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Yüksek kaliteli içerik üreten, aktif ve güvenilir topluluklar.
                        Editörlerimiz tarafından doğrulanmış en iyi Telegram kanalları listesi.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map((channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}
