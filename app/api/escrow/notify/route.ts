import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { sendMessage, ADMIN_ID, USDT_ADDRESS, btn, linkBtn, fmtPrice } from '@/lib/telegram';

// Bu endpoint web app'ten çağrılır: teklif kabul edildiğinde alıcıya ödeme talimatı gönderir
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Sadece internal çağrı (API secret kontrolü)
    const authHeader = req.headers.get('authorization');
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { orderId } = await req.json();
        if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

        const db = getAdminClient();
        const { data: order } = await db
            .from('marketplace_orders')
            .select(`
                *,
                channel_listings ( id, title, channel_name ),
                buyer:profiles!marketplace_orders_buyer_id_fkey ( id, full_name, email, telegram_id, telegram_username ),
                seller:profiles!marketplace_orders_seller_id_fkey ( id, full_name, email, telegram_id, telegram_username )
            `)
            .eq('id', orderId)
            .single();

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        const name = order.channel_listings?.channel_name || order.channel_listings?.title || 'Kanal';
        const priceStr = fmtPrice(order.agreed_price, order.currency);
        const shortId = `#${orderId.slice(0, 8)}`;
        const sohbetUrl = `https://telegramkanali.com/dashboard/mesajlar/${orderId}`;
        const hasBuyerTg = Boolean(order.buyer?.telegram_id);
        const hasSellerTg = Boolean(order.seller?.telegram_id);

        // 1. Alıcıya ödeme talimatı gönder
        if (hasBuyerTg) {
            await sendMessage(
                order.buyer.telegram_id,
                `🎉 <b>Teklifiniz Kabul Edildi!</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `📦 Kanal: <b>${name}</b>\n` +
                `💵 Tutar: <b>${priceStr}</b>\n` +
                `🔑 Referans: <b>${shortId}</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `<b>💳 ÖDEME TALİMATLARI</b>\n\n` +
                `Ağ: <b>USDT TRC-20 (Tron)</b>\n` +
                `Adres:\n<code>${USDT_ADDRESS}</code>\n\n` +
                `⚠️ Açıklama/Not: <code>${shortId.slice(1)}</code>\n\n` +
                `Ödemeyi gönderdikten sonra aşağıdaki butona basın 👇`,
                [
                    [btn('✅ Ödedim, Para Gönderildi', `ep:${orderId}`)],
                    [linkBtn('🔗 Sohbeti Görüntüle', sohbetUrl)],
                ]
            );
        }

        // 2. Her durumda admine bildir
        await sendMessage(
            ADMIN_ID,
            `🤝 <b>YENİ ANLAŞMA!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `📦 Kanal: <b>${name}</b>\n` +
            `💵 Tutar: <b>${priceStr}</b>\n` +
            `🔑 Order: <b>${shortId}</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👤 Alıcı: ${order.buyer?.full_name || order.buyer?.email || '-'} ${hasBuyerTg ? '✅ TG' : '❌ TG bağlı değil'}\n` +
            `👤 Satıcı: ${order.seller?.full_name || order.seller?.email || '-'} ${hasSellerTg ? '✅ TG' : '❌ TG bağlı değil'}\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `${hasBuyerTg ? '✅ Alıcıya ödeme talimatı gönderildi.' : '⚠️ Alıcının Telegram\'ı bağlı değil! Manuel takip gerekli.'}`,
            [
                [linkBtn('🔗 Sohbeti Görüntüle', sohbetUrl)],
            ]
        );

        // 3. notify_sent_at güncelle
        await db.from('marketplace_orders').update({ notify_sent_at: new Date().toISOString() }).eq('id', orderId);

        return NextResponse.json({ ok: true, hasBuyerTg, hasSellerTg });
    } catch (err) {
        console.error('[Notify Error]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
