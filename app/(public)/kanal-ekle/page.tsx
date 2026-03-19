import { getCategories } from '@/lib/data';
import KanalEkleClient from './KanalEkleClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function KanalEklePage() {
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
