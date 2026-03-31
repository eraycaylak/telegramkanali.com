'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';

export async function submitChannel(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const telegram_contact = formData.get('telegram_contact') as string;
    const email_contact = formData.get('email_contact') as string;
    // Telegram ve email'i contact_info olarak birleştir
    const contact_info = `Telegram: @${telegram_contact} | E-posta: ${email_contact}`;
    
    // Legal check
    const terms_accepted = formData.get('terms_accepted') === 'true';
    const privacy_accepted = formData.get('privacy_accepted') === 'true';

    if (!name || !join_link || !category_id || !telegram_contact || !email_contact) {
        return { error: 'Lütfen zorunlu alanları doldurun.' };
    }

    if (!terms_accepted || !privacy_accepted) {
        return { error: 'İşleme devam edebilmek için Kullanım Şartları ve Gizlilik Politikası\'nı onaylamalısınız.' };
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

    // Generate unique slug from name
    const baseSlug = slugify(name) || 'channel';
    const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Generate a unique bot token for this channel at creation time
    const botToken = 'TK_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const channelData = {
        name,
        description,
        join_link,
        category_id,
        contact_info,
        slug,
        owner_id: user.id,
        status: 'pending',
        bot_token: botToken,
    };

    // Service role key varsa admin client kullan (RLS bypass), yoksa user client ile dene
    let insertError;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { getAdminClient } = await import('@/lib/supabaseAdmin');
        const adminClient = getAdminClient();
        const { error } = await adminClient.from('channels').insert(channelData);
        insertError = error;
    } else {
        const { error } = await supabase.from('channels').insert(channelData);
        insertError = error;
    }

    if (insertError) {
        console.error('Submission error:', insertError);
        return { error: 'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.' };
    }

    return { success: true };
}
