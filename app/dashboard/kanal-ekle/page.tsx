import { getCategories } from '@/lib/data';
import KanalEkleClient from '@/app/(public)/kanal-ekle/KanalEkleClient'; // Reuse the existing client form
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardAddChannelPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    const categories = await getCategories();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Kanal Ekle</h1>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <KanalEkleClient categories={categories} />
            </div>
        </div>
    );
}
