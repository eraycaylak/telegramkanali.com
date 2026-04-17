'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';
import { getAdminClient } from '@/lib/supabaseAdmin';

// ──────────────────────────────────────────────────────────────────────────────
// Kanal Başvurusu (kimlik doğrulaması gerektirir)
// ──────────────────────────────────────────────────────────────────────────────
export async function submitChannel(formData: FormData) {
    const contact_type = (formData.get('contact_type') as string) || 'kanal_ekle';

    // Soru / öneri / diğer akışı — kanal tablosuna değil, usdt_payments'a yazılır gibi ayrı bir kayıt
    // Ama şimdilik bunları usdt gerek olmadan basit bir şekilde handle edelim
    if (contact_type === 'soru_oneri' || contact_type === 'diger') {
        return await submitContactMessage(formData, contact_type);
    }

    const name = formData.get('name') as string;
    const description = (formData.get('description') as string) || '';
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const telegram_contact = formData.get('telegram_contact') as string;
    const email_contact = formData.get('email_contact') as string;
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

    // Server-side Supabase client
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        return { error: 'Oturum açmanız gerekiyor. Lütfen giriş yapın.' };
    }

    // Duplicate check
    const { data: existing } = await supabase
        .from('channels')
        .select('id')
        .eq('join_link', join_link)
        .single();

    if (existing) {
        return { error: 'Bu kanal zaten sistemde mevcut!' };
    }

    // Generate unique slug
    const baseSlug = slugify(name) || 'channel';
    const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

    let insertError;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

    // Admin bildirimi
    try {
        const botTok = process.env.TELEGRAM_BOT_TOKEN;
        const adminId = process.env.TELEGRAM_ADMIN_ID;
        if (botTok && adminId) {
            await fetch(`https://api.telegram.org/bot${botTok}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: `📡 *Yeni Kanal Başvurusu!*\n\n📺 Kanal: ${name}\n🔗 Link: ${join_link}\n👤 Telegram: @${telegram_contact}\n\n👉 https://telegramkanali.com/admin/dashboard`,
                    parse_mode: 'Markdown',
                }),
            });
        }
    } catch {}

    return { success: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// İletişim mesajları (soru/öneri/diğer) — usdt_payments tablosunu rehber olarak
// ──────────────────────────────────────────────────────────────────────────────
async function submitContactMessage(formData: FormData, contact_type: string) {
    const contact_telegram = formData.get('contact_telegram') as string;
    const notes = (formData.get('notes') as string) || '';

    if (!contact_telegram || !notes) {
        return { error: 'Telegram kullanıcı adı ve mesajınızı doldurun.' };
    }

    // Admin'e bildirim gönder
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminId = process.env.TELEGRAM_ADMIN_ID;
        if (botToken && adminId) {
            const typeLabel = contact_type === 'soru_oneri' ? '💬 Soru/Öneri' : '📋 Diğer';
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: `${typeLabel}\n\n👤 Telegram: @${contact_telegram.replace('@', '')}\n\n📝 Mesaj:\n${notes}`,
                    parse_mode: 'Markdown',
                }),
            });
        }
    } catch {}

    return { success: true };
}
