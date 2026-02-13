import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNewChannels } from '@/lib/data';
import ChannelCard from '@/components/ChannelCard';

export const metadata = {
    title: 'Yeni Eklenen Telegram Kanalları - 2026',
    description: 'En yeni ve taze Telegram kanallarını keşfedin. Dizine yeni eklenen topluluklar ve gruplar.',
};

export default async function NewChannelsPage() {
    const channels = await getNewChannels();

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">🚀 Yeni Eklenenler</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Telegram dizinimize en son eklenen en güncel kanalları aşağıda bulabilirsiniz.
                        Kanalınızın burada görünmesini istiyorsanız ücretsiz kanal ekleyebilirsiniz.
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
