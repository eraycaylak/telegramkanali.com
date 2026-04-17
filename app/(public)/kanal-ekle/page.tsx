import { getCategories } from '@/lib/data';
import KanalEkleClient from './KanalEkleClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://telegramkanali.com';

export const metadata: Metadata = {
    title: 'Kanal Ekle & İletişim | TelegramKanali.com',
    description: 'Telegram kanalınızı veya grubunuzu ekleyin, reklam verin ya da bize ulaşın. Tüm başvurularınız için tek adres.',
    alternates: {
        canonical: `${baseUrl}/kanal-ekle`,
    },
    openGraph: {
        title: 'Kanal Ekle & İletişim | TelegramKanali.com',
        description: 'Telegram kanalınızı ekleyin veya reklam paketlerinden birini seçin.',
        url: `${baseUrl}/kanal-ekle`,
        type: 'website',
    },
};

export default async function KanalEklePage() {
    const categories = await getCategories();

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-10 max-w-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanal Ekle & İletişim</h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Kanalınızı ekleyin, reklam paketlerinden birini satın alın ya da bize soru sorun.
                        Tek form, tek nokta.
                    </p>
                </div>

                <KanalEkleClient categories={categories} />
            </main>
            <Footer />
        </>
    );
}
