import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth-server';
import DestekClient from './DestekClient';

export const metadata = {
    title: 'Destek Talepleri | Dashboard',
};

interface Props {
    searchParams: Promise<{ kategori?: string }>;
}

export default async function DestekPage({ searchParams }: Props) {
    const user = await getServerUser();
    if (!user) redirect('/login');

    const params = await searchParams;
    const defaultCategory = params.kategori || undefined;

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>Destek</h2>
                <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                    Sorularınız veya sorunlarınız için destek talebi oluşturun. Ekibimiz en kısa sürede yanıtlar.
                </p>
            </div>
            <DestekClient userId={user.id} defaultCategory={defaultCategory} />
        </div>
    );
}
