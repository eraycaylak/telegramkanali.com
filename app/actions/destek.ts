'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { getServerUser } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

// ─── Ticket Oluştur ──────────────────────────────────────────────────────────
export async function createSupportTicket(formData: FormData) {
    const user = await getServerUser();
    if (!user) return { error: 'Giriş yapmanız gerekiyor.' };

    const subject  = (formData.get('subject')  as string || '').trim();
    const category = (formData.get('category') as string || 'genel').trim();
    const message  = (formData.get('message')  as string || '').trim();

    if (!subject || !message) return { error: 'Konu ve mesaj zorunludur.' };

    const db = getAdminClient();

    const { data: ticket, error: ticketErr } = await db
        .from('support_tickets')
        .insert({ user_id: user.id, subject, category, status: 'open', priority: 'normal' })
        .select('id')
        .single();

    if (ticketErr || !ticket) {
        console.error('[createSupportTicket]', ticketErr);
        return { error: 'Ticket oluşturulamadı, lütfen tekrar deneyin.' };
    }

    const { error: msgErr } = await db
        .from('support_messages')
        .insert({ ticket_id: ticket.id, sender_id: user.id, content: message, is_admin: false });

    if (msgErr) {
        console.error('[createSupportTicket] msg insert', msgErr);
    }

    revalidatePath('/dashboard/destek');
    return { success: true, ticketId: ticket.id };
}

// ─── Mesaj Gönder (kullanıcı) ────────────────────────────────────────────────
export async function sendUserMessage(formData: FormData) {
    const user = await getServerUser();
    if (!user) return { error: 'Giriş yapmanız gerekiyor.' };

    const ticketId = (formData.get('ticket_id') as string || '').trim();
    const content  = (formData.get('content')   as string || '').trim();
    if (!ticketId || !content) return { error: 'Mesaj boş olamaz.' };

    const db = getAdminClient();

    // Ticket bu kullanıcıya ait mi?
    const { data: ticket } = await db
        .from('support_tickets')
        .select('id, status')
        .eq('id', ticketId)
        .eq('user_id', user.id)
        .single();

    if (!ticket) return { error: 'Ticket bulunamadı.' };
    if (ticket.status === 'closed') return { error: 'Kapalı ticket\'a mesaj gönderilemez.' };

    await db.from('support_messages').insert({
        ticket_id: ticketId,
        sender_id: user.id,
        content,
        is_admin: false,
    });

    await db
        .from('support_tickets')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

    revalidatePath('/dashboard/destek');
    return { success: true };
}
