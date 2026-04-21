import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import { getCategories } from '@/lib/data';
import KanalEkleClient from '@/app/(public)/kanal-ekle/KanalEkleClient';

export default async function DashboardAddChannelPage() {
    const user = await getServerUser();
    if (!user) redirect('/login');

    const categories = await getCategories();

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>Kanal Ekle</h2>
                <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                    Telegram kanalınızı dizine ekleyin, reklam başvurusu yapın veya bize ulaşın.
                </p>
            </div>
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#E2E8F0' }}>
                <KanalEkleClient categories={categories} />
            </div>
        </div>
    );
}
