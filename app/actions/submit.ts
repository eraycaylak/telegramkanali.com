'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function submitChannel(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const contact_info = formData.get('contact_info') as string;

    if (!name || !join_link || !category_id) {
        return { error: 'Lütfen zorunlu alanları doldurun.' };
    }

    // Create server-side Supabase client to get authenticated user reliably
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

    // Get authenticated user from server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        return { error: 'Oturum açmanız gerekiyor. Lütfen giriş yapın.' };
    }

    // Check for existing channel
    const { data: existing } = await supabase
        .from('channels')
        .select('id')
        .eq('join_link', join_link)
        .single();

    if (existing) {
        return { error: 'Bu kanal zaten sistemde mevcut!' };
    }

    // Generate slug from name
    let baseSlug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    if (baseSlug.length < 2) baseSlug = 'channel';

    const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Use admin client for insert to bypass RLS, but set owner_id from the authenticated user
    const { getAdminClient } = await import('@/lib/supabaseAdmin');
    const adminClient = getAdminClient();

    const { error } = await adminClient.from('channels').insert({
        name,
        description,
        join_link,
        category_id,
        contact_info,
        slug,
        owner_id: user.id, // Server-side authenticated user ID - always reliable
        status: 'pending'
    });

    if (error) {
        console.error('Submission error:', error);
        return { error: 'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
    }

    return { success: true };
}
