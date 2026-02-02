import { getCategories } from '@/lib/data';
import KanalEkleClient from './KanalEkleClient';

export const dynamic = 'force-dynamic';

export default async function KanalEklePage() {
    const categories = await getCategories();

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanalınızı Ekleyin</h1>
                <p className="text-gray-600">
                    Telegram kanalınızı veya grubunuzu sitemize ekleyerek binlerce kişiye ulaşın.
                    Başvurunuz incelendikten sonra yayına alınacaktır.
                </p>
            </div>

            <KanalEkleClient categories={categories} />
        </div>
    );
}
