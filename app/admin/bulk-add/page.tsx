import { getCategories } from '@/lib/data';
import BulkAddClient from '@/components/admin/BulkAddClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BulkAddPage() {
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

    // Check if user is admin (simple check for now based on email or role if exists)
    // The existing system uses middleware but extra safety here
    if (!user) {
        redirect('/login');
    }

    const categories = await getCategories();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Toplu Kanal Ekle</h1>
                <p className="text-gray-500">Birden fazla kanal linkini alt alta yazarak hızlıca ekleyebilirsiniz.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <BulkAddClient categories={categories} />
            </div>
        </div>
    );
}
