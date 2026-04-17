'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ──────────────────────────────────────────────────────────────────────────────
// Paket Tanımları
// ──────────────────────────────────────────────────────────────────────────────
export const USDT_PACKAGES = {
    neon: {
        id: 'neon',
        name: 'NEON',
        tagline: 'Kategori Banner',
        amount_usdt: 15,
        total_views: 10000,
        description: 'Kanalınız hedef kategoride üst banner alanında gösterilir.',
        emoji: '⚡',
    },
    prime: {
        id: 'prime',
        name: 'PRIME',
        tagline: 'Kategori 1. Sıra',
        amount_usdt: 9,
        total_views: 5000,
        description: 'Kanalınız seçilen kategorinin kanal listesinin 1. pozisyonuna pin\'lenir.',
        emoji: '👑',
    },
    apex: {
        id: 'apex',
        name: 'APEX',
        tagline: 'Anasayfa Banner',
        amount_usdt: 39,
        total_views: 50000,
        description: 'Siteye giren her ziyaretçinin ilk gördüğü anasayfa banner alanı.',
        emoji: '🔱',
    },
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Yeni USDT Ödeme Başvurusu Oluştur (Public — giriş gerekmez)
// ──────────────────────────────────────────────────────────────────────────────
export async function createUsdtPayment(formData: FormData) {
    const package_id = formData.get('package_id') as string;
    const contact_name = formData.get('contact_name') as string;
    const contact_telegram = formData.get('contact_telegram') as string;
    const contact_email = (formData.get('contact_email') as string) || '';
    const tx_hash = (formData.get('tx_hash') as string) || '';
    const channel_name = (formData.get('channel_name') as string) || '';
    const channel_link = (formData.get('channel_link') as string) || '';
    const ad_message = (formData.get('ad_message') as string) || '';
    const notes = (formData.get('notes') as string) || '';

    if (!package_id || !contact_name || !contact_telegram) {
        return { error: 'Lütfen zorunlu alanları doldurun.' };
    }

    const pkg = USDT_PACKAGES[package_id as keyof typeof USDT_PACKAGES];
    if (!pkg) {
        return { error: 'Geçersiz paket seçimi.' };
    }

    const db = getAdminClient();

    const { data, error } = await db.from('usdt_payments').insert({
        contact_name,
        contact_telegram: contact_telegram.replace('@', ''),
        contact_email,
        package_id,
        package_name: pkg.name,
        amount_usdt: pkg.amount_usdt,
        tx_hash: tx_hash || null,
        channel_name: channel_name || null,
        channel_link: channel_link || null,
        ad_message: ad_message || null,
        notes: notes || null,
        total_views: pkg.total_views,
        status: 'pending',
    }).select('id').single();

    if (error) {
        console.error('[USDT] Insert error:', error);
        return { error: 'Başvuru kaydedilemedi. Lütfen tekrar deneyin.' };
    }

    // Admin'e Telegram bildirimi gönder
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminId = process.env.TELEGRAM_ADMIN_ID;

        if (botToken && adminId) {
            const msg =
                `🔔 *Yeni USDT Reklam Başvurusu!*\n\n` +
                `📦 Paket: ${pkg.emoji} ${pkg.name} — $${pkg.amount_usdt}\n` +
                `👁️ Gösterim: ${pkg.total_views.toLocaleString('tr-TR')}\n` +
                `👤 Ad: ${contact_name}\n` +
                `📱 Telegram: @${contact_telegram.replace('@', '')}\n` +
                (contact_email ? `📧 E-posta: ${contact_email}\n` : '') +
                (channel_name ? `📺 Kanal: ${channel_name}\n` : '') +
                (tx_hash ? `💰 TX Hash: \`${tx_hash}\`\n` : '') +
                `\n👉 https://telegramkanali.com/admin/usdt-payments`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: msg,
                    parse_mode: 'Markdown',
                }),
            });
        }
    } catch (err) {
        console.error('[USDT] Telegram notification error:', err);
    }

    return { success: true, paymentId: data.id };
}

// ──────────────────────────────────────────────────────────────────────────────
// Admin — Tüm Ödemeleri Listele
// ──────────────────────────────────────────────────────────────────────────────
export async function getUsdtPayments(statusFilter?: 'pending' | 'approved' | 'rejected') {
    const db = getAdminClient();
    let query = db
        .from('usdt_payments')
        .select('*')
        .order('created_at', { ascending: false });

    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[USDT] Fetch error:', error);
        return [];
    }
    return data || [];
}

// ──────────────────────────────────────────────────────────────────────────────
// Admin — Ödemeyi Onayla (kampanya oluştur)
// ──────────────────────────────────────────────────────────────────────────────
export async function approveUsdtPayment(paymentId: string, adminNote?: string) {
    const db = getAdminClient();

    const { data: payment, error: fetchErr } = await db
        .from('usdt_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

    if (fetchErr || !payment) {
        return { error: 'Ödeme bulunamadı.' };
    }

    if (payment.status !== 'pending') {
        return { error: 'Bu ödeme zaten işlenmiş.' };
    }

    const pkg = USDT_PACKAGES[payment.package_id as keyof typeof USDT_PACKAGES];
    if (!pkg) return { error: 'Geçersiz paket.' };

    // ad_type mapping
    const adTypeMap: Record<string, string> = {
        neon: 'banner',
        prime: 'featured',
        apex: 'banner',
    };
    const adType = adTypeMap[payment.package_id] || 'banner';

    // Kampanya oluştur (channel_id olmadan — manual placement)
    // Önce sistem/dummy user id bul ya da boş bırak — ad_campaigns user_id zorunlu
    // Alternatif: admin'in user_id'sini kullan, ya da campaigns tablosunu esnet
    // Burada kampanyayı status=active olarak el ile oluşturuyoruz:

    const { data: campaign, error: campErr } = await db
        .from('ad_campaigns')
        .insert({
            // user_id sistem admin olarak placeholder (campaigns tablosunda zorunlu)
            // admin panelden manuel atama yapılabilir
            user_id: process.env.SUPABASE_ADMIN_USER_ID || '00000000-0000-0000-0000-000000000000',
            channel_id: '00000000-0000-0000-0000-000000000001', // placeholder — admin atayacak
            ad_type: adType,
            total_views: payment.total_views,
            current_views: 0,
            tokens_spent: 0,
            status: 'pending', // admin kampanya detayını girdikten sonra active yapar
        })
        .select('id')
        .single();

    // Kampanya oluşturma başarısız olsa bile ödemeyi onaylayalım
    const campaignId = campaign?.id || null;

    const { error: updateErr } = await db
        .from('usdt_payments')
        .update({
            status: 'approved',
            admin_notes: adminNote || 'Onaylandı.',
            campaign_id: campaignId,
        })
        .eq('id', paymentId);

    if (updateErr) {
        console.error('[USDT] Approve update error:', updateErr);
        return { error: 'Onay güncellenemedi.' };
    }

    // Kullanıcıya Telegram bildirimi gönder
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken && payment.contact_telegram) {
            // Kullanıcı ID'si bilmediğimiz için bu bildirim opsiyonel —
            // ileride kullanıcının telegram_id kaydedebiliriz
        }
    } catch {}

    revalidatePath('/admin/usdt-payments');
    return { success: true, campaignId };
}

// ──────────────────────────────────────────────────────────────────────────────
// Admin — Ödemeyi Reddet
// ──────────────────────────────────────────────────────────────────────────────
export async function rejectUsdtPayment(paymentId: string, adminNote: string) {
    const db = getAdminClient();

    const { error } = await db
        .from('usdt_payments')
        .update({
            status: 'rejected',
            admin_notes: adminNote || 'Ödeme doğrulanamadı.',
        })
        .eq('id', paymentId);

    if (error) {
        console.error('[USDT] Reject update error:', error);
        return { error: 'Red işlemi başarısız.' };
    }

    revalidatePath('/admin/usdt-payments');
    return { success: true };
}
