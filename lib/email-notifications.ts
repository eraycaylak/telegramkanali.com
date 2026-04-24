'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

// ─── E-posta Gönder (Resend API) ─────────────────────────────────────────────
// RESEND_API_KEY env'de yoksa sessizce atla (hata verme, sadece logla)
async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('[sendEmail] RESEND_API_KEY not set, skipping email');
        return false;
    }

    const fromEmail = process.env.SUPPORT_FROM_EMAIL || 'destek@telegramkanali.com';
    const fromName = process.env.SUPPORT_FROM_NAME || 'Telegram Kanalları Destek';

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: `${fromName} <${fromEmail}>`,
                to: [to],
                subject,
                html,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[sendEmail] Resend error:', res.status, err);
            return false;
        }

        console.log(`[sendEmail] Sent to ${to}: ${subject}`);
        return true;
    } catch (err) {
        console.error('[sendEmail] Exception:', err);
        return false;
    }
}

// ─── Destek Bildirimi Yanıtlandı E-postası ──────────────────────────────────
// Admin bir destek bildirimini yanıtladığında kullanıcıya e-posta gönder
export async function sendTicketReplyNotification(ticketId: string, replyContent: string, isAdmin: boolean) {
    const db = getAdminClient();

    // 1) Ticket bilgilerini al (user_id ile birlikte)
    const { data: ticket, error: ticketErr } = await db
        .from('support_tickets')
        .select('id, subject, category, user_id')
        .eq('id', ticketId)
        .single();

    if (ticketErr || !ticket) {
        console.error('[sendTicketReplyNotification] Ticket not found:', ticketErr);
        return;
    }

    if (isAdmin) {
        // Admin yanıt verdi → Kullanıcıya e-posta gönder
        const { data: userProfile } = await db
            .from('profiles')
            .select('email, full_name')
            .eq('id', ticket.user_id)
            .single();

        if (!userProfile?.email) {
            console.warn('[sendTicketReplyNotification] User has no email');
            return;
        }

        const previewText = replyContent.length > 200
            ? replyContent.substring(0, 200) + '...'
            : replyContent;

        await sendEmail({
            to: userProfile.email,
            subject: `✅ Destek Bildiriminiz Yanıtlandı — ${ticket.subject}`,
            html: buildReplyEmail({
                userName: userProfile.full_name || 'Kullanıcı',
                ticketSubject: ticket.subject,
                replyContent: previewText,
                ticketId: ticket.id,
            }),
        });
    } else {
        // Kullanıcı mesaj gönderdi → Admin'e e-posta gönder
        const adminEmail = process.env.ADMIN_EMAIL || 'telegramkanaliiletisim@outlook.com';

        // Kullanıcı bilgisini al
        const { data: userProfile } = await db
            .from('profiles')
            .select('email, full_name')
            .eq('id', ticket.user_id)
            .single();

        const senderName = userProfile?.full_name || userProfile?.email || 'Anonim';

        await sendEmail({
            to: adminEmail,
            subject: `🔔 Yeni Destek Mesajı — ${ticket.subject}`,
            html: buildAdminNotifyEmail({
                senderName,
                ticketSubject: ticket.subject,
                messageContent: replyContent.length > 300 ? replyContent.substring(0, 300) + '...' : replyContent,
                ticketId: ticket.id,
            }),
        });
    }
}

// ─── Yeni Ticket Oluşturulduğunda Admin'e Bildirim ──────────────────────────
export async function sendNewTicketNotification(ticketId: string, subject: string, category: string, userId: string) {
    const adminEmail = process.env.ADMIN_EMAIL || 'telegramkanaliiletisim@outlook.com';
    const db = getAdminClient();

    const { data: userProfile } = await db
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

    const senderName = userProfile?.full_name || userProfile?.email || 'Anonim';

    await sendEmail({
        to: adminEmail,
        subject: `🆕 Yeni Destek Talebi — ${subject}`,
        html: buildNewTicketEmail({
            senderName,
            ticketSubject: subject,
            category,
            ticketId,
        }),
    });
}

// ─── HTML E-posta Şablonları ─────────────────────────────────────────────────

function buildReplyEmail({ userName, ticketSubject, replyContent, ticketId }: {
    userName: string;
    ticketSubject: string;
    replyContent: string;
    ticketId: string;
}) {
    return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 24px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;margin:0;font-weight:800;">✅ Destek Bildiriminiz Yanıtlandı</h1>
  </div>
  <!-- Body -->
  <div style="padding:28px 24px;">
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Merhaba <strong>${userName}</strong>,
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
      <strong>"${ticketSubject}"</strong> konulu destek talebinize yeni bir yanıt geldi:
    </p>
    <!-- Reply Card -->
    <div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="color:#1e3a5f;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(replyContent)}</p>
    </div>
    <!-- CTA -->
    <div style="text-align:center;margin:24px 0;">
      <a href="https://telegramkanali.com/dashboard/destek" style="display:inline-block;background:#2563eb;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 32px;border-radius:10px;">
        Yanıtı Görüntüle
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:16px 0 0;">
      Bu e-posta telegramkanali.com destek sistemi tarafından otomatik olarak gönderilmiştir.
    </p>
  </div>
</div>
</body>
</html>`;
}

function buildAdminNotifyEmail({ senderName, ticketSubject, messageContent, ticketId }: {
    senderName: string;
    ticketSubject: string;
    messageContent: string;
    ticketId: string;
}) {
    return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;text-align:center;">
    <h1 style="color:#fff;font-size:18px;margin:0;font-weight:800;">🔔 Yeni Destek Mesajı</h1>
  </div>
  <div style="padding:24px;">
    <p style="color:#374151;font-size:14px;margin:0 0 12px;">
      <strong>${escapeHtml(senderName)}</strong> kullanıcısından <strong>"${escapeHtml(ticketSubject)}"</strong> konulu destek talebine yeni mesaj:
    </p>
    <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:14px;margin:0 0 16px;">
      <p style="color:#92400e;font-size:13px;margin:0;white-space:pre-wrap;">${escapeHtml(messageContent)}</p>
    </div>
    <div style="text-align:center;">
      <a href="https://telegramkanali.com/admin/destek" style="display:inline-block;background:#f59e0b;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 28px;border-radius:8px;">
        Admin Paneli'nde Görüntüle
      </a>
    </div>
  </div>
</div>
</body>
</html>`;
}

function buildNewTicketEmail({ senderName, ticketSubject, category, ticketId }: {
    senderName: string;
    ticketSubject: string;
    category: string;
    ticketId: string;
}) {
    const categoryLabels: Record<string, string> = {
        genel: '💬 Genel', teknik: '🔧 Teknik', reklam: '📢 Reklam',
        kanal: '📺 Kanal', odeme: '💳 Ödeme', sikayet: '⚠️ Şikâyet', oneri: '💡 Öneri',
    };
    return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <div style="background:linear-gradient(135deg,#10b981,#059669);padding:24px;text-align:center;">
    <h1 style="color:#fff;font-size:18px;margin:0;font-weight:800;">🆕 Yeni Destek Talebi</h1>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
      <tr><td style="padding:6px 0;font-weight:700;">Gönderen:</td><td style="padding:6px 0;">${escapeHtml(senderName)}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Konu:</td><td style="padding:6px 0;">${escapeHtml(ticketSubject)}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Kategori:</td><td style="padding:6px 0;">${categoryLabels[category] || category}</td></tr>
    </table>
    <div style="text-align:center;margin:20px 0 0;">
      <a href="https://telegramkanali.com/admin/destek" style="display:inline-block;background:#10b981;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 28px;border-radius:8px;">
        Yanıtla
      </a>
    </div>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
