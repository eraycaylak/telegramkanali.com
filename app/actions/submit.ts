'use server';

import { headers } from 'next/headers';
import { slugify } from '@/lib/utils';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────────────────────────────────────
// Otantikasyon için JWT'den user alır (cookies() sorununu bypass eder)
// ──────────────────────────────────────────────────────────────────────────────
async function getAuthUser() {
    try {
        const headersList = await headers();
        // Authorization: Bearer <token> header'ından al
        const authHeader = headersList.get('authorization') || headersList.get('Authorization');
        const cookieHeader = headersList.get('cookie') || '';

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Cookie'den sb- token'ı parse et
        const cookieMap: Record<string, string> = {};
        cookieHeader.split(';').forEach(c => {
            const [k, ...v] = c.trim().split('=');
            if (k) cookieMap[k.trim()] = v.join('=');
        });

        // Supabase auth token keys
        const tokenKey = Object.keys(cookieMap).find(k =>
            k.startsWith('sb-') && k.endsWith('-auth-token')
        );

        let accessToken: string | null = null;

        if (tokenKey && cookieMap[tokenKey]) {
            try {
                const decoded = decodeURIComponent(cookieMap[tokenKey]);
                // base64url veya JSON olabilir
                let parsed: any;
                if (decoded.startsWith('base64-')) {
                    parsed = JSON.parse(Buffer.from(decoded.slice(7), 'base64').toString());
                } else {
                    parsed = JSON.parse(decoded);
                }
                accessToken = parsed?.access_token || parsed?.[0]?.access_token || null;
            } catch {}
        }

        if (!accessToken && authHeader?.startsWith('Bearer ')) {
            accessToken = authHeader.slice(7);
        }

        if (!accessToken) return null;

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: `Bearer ${accessToken}` } }
        });

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        return user;
    } catch (err) {
        console.error('[Auth] getAuthUser error:', err);
        return null;
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Kanal Başvurusu
// ──────────────────────────────────────────────────────────────────────────────
export async function submitChannel(formData: FormData) {
    const contact_type = (formData.get('contact_type') as string) || 'kanal_ekle';

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

    const terms_accepted = formData.get('terms_accepted') === 'true';
    const privacy_accepted = formData.get('privacy_accepted') === 'true';

    if (!name || !join_link || !category_id || !telegram_contact || !email_contact) {
        return { error: 'Lütfen zorunlu alanları doldurun.' };
    }

    if (!terms_accepted || !privacy_accepted) {
        return { error: "İşleme devam edebilmek için Kullanım Şartları ve Gizlilik Politikası'nı onaylamalısınız." };
    }

    // Auth kontrolü
    const user = await getAuthUser();
    if (!user) {
        return { error: 'Oturum açmanız gerekiyor. Lütfen giriş yapın.' };
    }

    try {
        const adminClient = getAdminClient();

        // Duplicate check
        const { data: existing } = await adminClient
            .from('channels')
            .select('id')
            .eq('join_link', join_link)
            .maybeSingle();

        if (existing) {
            return { error: 'Bu kanal zaten sistemde mevcut!' };
        }

        const baseSlug = slugify(name) || 'channel';
        const slug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const { error: insertError } = await adminClient.from('channels').insert({
            name,
            description,
            join_link,
            category_id,
            contact_info,
            slug,
            owner_id: user.id,
            status: 'pending',
        });

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
    } catch (err) {
        console.error('submitChannel critical error:', err);
        return { error: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' };
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// İletişim mesajları (soru/öneri/diğer)
// ──────────────────────────────────────────────────────────────────────────────
async function submitContactMessage(formData: FormData, contact_type: string) {
    const contact_telegram = formData.get('contact_telegram') as string;
    const notes = (formData.get('notes') as string) || '';

    if (!contact_telegram || !notes) {
        return { error: 'Telegram kullanıcı adı ve mesajınızı doldurun.' };
    }

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
