'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { getServerUser } from '@/lib/auth-server';
import { sendTicketReplyNotification } from '@/lib/email-notifications';
import { revalidatePath } from 'next/cache';

// ─── Admin Yanıt Gönder ──────────────────────────────────────────────────────
// Admin bir destek talebini yanıtladığında çağrılır
export async function sendAdminReply(formData: FormData) {
    const user = await getServerUser();
    if (!user) return { error: 'Giriş yapmanız gerekiyor.' };

    const db = getAdminClient();

    // Admin kontrolü
    const { data: profile } = await db
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: 'Yetkiniz yok.' };
    }

    const ticketId = (formData.get('ticket_id') as string || '').trim();
    const content = (formData.get('content') as string || '').trim();

    if (!ticketId || !content) return { error: 'Mesaj boş olamaz.' };

    // Mesajı kaydet
    const { error: msgErr } = await db.from('support_messages').insert({
        ticket_id: ticketId,
        sender_id: user.id,
        content,
        is_admin: true,
    });

    if (msgErr) {
        console.error('[sendAdminReply] msg insert:', msgErr);
        return { error: 'Mesaj gönderilemedi: ' + msgErr.message };
    }

    // Ticket durumunu güncelle
    await db
        .from('support_tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

    // 📧 Kullanıcıya e-posta bildirimi gönder (arka planda)
    sendTicketReplyNotification(ticketId, content, true).catch(err => {
        console.error('[sendAdminReply] Email notification failed:', err);
    });

    revalidatePath('/admin/destek');
    return { success: true };
}

// ─── Admin Ticket Durumunu Güncelle ──────────────────────────────────────────
export async function updateTicketStatus(ticketId: string, status: string) {
    const user = await getServerUser();
    if (!user) return { error: 'Giriş yapmanız gerekiyor.' };

    const db = getAdminClient();

    const { data: profile } = await db
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: 'Yetkiniz yok.' };
    }

    await db
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

    revalidatePath('/admin/destek');
    return { success: true };
}
