import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { sendMessage, answerCallbackQuery, ADMIN_ID, USDT_ADDRESS, btn, linkBtn, fmtPrice } from '@/lib/telegram';

// Telegram bu URL'e her update'i POST eder
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    // Opsiyonel webhook secret doğrulama
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret) {
        const header = req.headers.get('x-telegram-bot-api-secret-token');
        if (header !== secret) {
            return NextResponse.json({ ok: false }, { status: 401 });
        }
    }

    let update: any;
    try {
        update = await req.json();
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const db = getAdminClient();

    try {
        // ── 1. Normal mesaj komutları ────────────────────────────────────────
        if (update.message) {
            const msg = update.message;
            const text: string = msg.text || '';
            const chatId: number = msg.chat.id;
            const telegramId: number = msg.from.id;
            const username: string = msg.from.username || '';

            // /start link_UUID → kullanıcı Telegram hesabını bağlıyor
            if (text.startsWith('/start link_')) {
                const uuid = text.replace('/start link_', '').trim();
                if (uuid && uuid.length === 36) {
                    const { error } = await db.from('profiles').update({
                        telegram_id: telegramId,
                        telegram_username: username || null,
                    }).eq('id', uuid);

                    if (!error) {
                        await sendMessage(chatId,
                            `✅ <b>Telegram hesabınız bağlandı!</b>\n\n` +
                            `🔔 Artık marketplace işlemleriniz için:\n` +
                            `• Teklif kabul/red bildirimleri\n` +
                            `• Ödeme talimatları\n` +
                            `• Transfer adımları\n\n` +
                            `gibi tüm bildirimleri buradan alacaksınız.\n\n` +
                            `🌐 <a href="https://telegramkanali.com/marketplace">Marketplace'e Git</a>`
                        );
                    } else {
                        await sendMessage(chatId, `❌ Bağlantı hatası. Lütfen tekrar deneyin.`);
                    }
                } else {
                    await sendMessage(chatId, `❌ Geçersiz link. Lütfen siteden tekrar deneyin.`);
                }
                return NextResponse.json({ ok: true });
            }

            // /start (parametresiz) → hoş geldin
            if (text === '/start') {
                await sendMessage(chatId,
                    `👋 <b>TelegramKanali.com Escrow Botu</b>\n\n` +
                    `Bu bot, kanal alım-satım işlemlerini güvenle yönetir.\n\n` +
                    `• Ödeme bildirimlerini buradan alırsınız\n` +
                    `• Transfer adımlarını buradan takip edersiniz\n` +
                    `• Tüm süreç Escrow güvencesindedir\n\n` +
                    `🌐 <a href="https://telegramkanali.com/marketplace">Marketplace'e Git</a>`,
                    [[linkBtn('🛒 Marketplace', 'https://telegramkanali.com/marketplace')]]
                );
                return NextResponse.json({ ok: true });
            }
        }

        // ── 2. Inline buton callback'leri ────────────────────────────────────
        if (update.callback_query) {
            const cq = update.callback_query;
            const callbackData: string = cq.data || '';
            const telegramId: number = cq.from.id;
            const colonIdx = callbackData.indexOf(':');

            if (colonIdx === -1) {
                await answerCallbackQuery(cq.id, '❌ Geçersiz işlem');
                return NextResponse.json({ ok: true });
            }

            const action = callbackData.slice(0, colonIdx);
            const orderId = callbackData.slice(colonIdx + 1);

            if (!orderId) {
                await answerCallbackQuery(cq.id, '❌ Sipariş ID eksik');
                return NextResponse.json({ ok: true });
            }

            // Siparişi ve tarafları getir
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

            if (!order) {
                await answerCallbackQuery(cq.id, '❌ Sipariş bulunamadı', true);
                return NextResponse.json({ ok: true });
            }

            const name = order.channel_listings?.channel_name || order.channel_listings?.title || 'Kanal';
            const priceStr = fmtPrice(order.agreed_price, order.currency);
            const netAmount = (parseFloat(order.agreed_price) * 0.95).toFixed(2);
            const commission = (parseFloat(order.agreed_price) * 0.05).toFixed(2);
            const shortId = `#${orderId.slice(0, 8)}`;
            const sohbetUrl = `https://telegramkanali.com/dashboard/mesajlar/${orderId}`;

            const addSystemMsg = async (content: string) => {
                await db.from('marketplace_messages').insert({
                    order_id: orderId,
                    listing_id: order.listing_id,
                    sender_id: order.buyer_id,
                    receiver_id: order.seller_id,
                    content,
                    is_system: true,
                });
            };

            switch (action) {
                // ─────────────────────────────────────────────────────────────
                // ep: ALICI → "Ödedim"
                // ─────────────────────────────────────────────────────────────
                case 'ep': {
                    if (order.buyer?.telegram_id !== telegramId) {
                        await answerCallbackQuery(cq.id, '❌ Bu işlem size ait değil', true);
                        break;
                    }
                    if (order.status !== 'accepted') {
                        await answerCallbackQuery(cq.id, `⚠️ Bu işlem zaten "${order.status}" durumunda`, true);
                        break;
                    }

                    await db.from('marketplace_orders').update({ status: 'escrow_funded' }).eq('id', orderId);
                    await addSystemMsg('💰 Alıcı ödeme gönderdiğini bildirdi. Admin doğruluyor...');
                    await answerCallbackQuery(cq.id, '✅ Ödeme bildiriminiz alındı!');

                    // Admine bildir
                    await sendMessage(ADMIN_ID,
                        `💰 <b>ÖDEME BİLDİRİMİ</b>\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `📦 Kanal: <b>${name}</b>\n` +
                        `💵 Tutar: <b>${priceStr}</b>\n` +
                        `🔑 Order: <b>${shortId}</b>\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `👤 Alıcı: ${order.buyer?.full_name || order.buyer?.email || '-'}\n\n` +
                        `⚡ Alıcı ödediğini bildirdi.\n` +
                        `<b>USDT TRC-20 adresinizi kontrol edin!</b>`,
                        [
                            [btn('✅ Ödemeyi Gördüm & Onayla', `ac:${orderId}`)],
                            [btn('❌ Ödeme Gelmedi', `pf:${orderId}`)],
                            [linkBtn('🔗 Sohbeti Görüntüle', sohbetUrl)],
                        ]
                    );
                    break;
                }

                // ─────────────────────────────────────────────────────────────
                // ac: ADMİN → "Ödemeyi doğruladım"
                // ─────────────────────────────────────────────────────────────
                case 'ac': {
                    if (telegramId !== ADMIN_ID) {
                        await answerCallbackQuery(cq.id, '❌ Sadece admin kullanabilir', true);
                        break;
                    }
                    if (!['accepted', 'escrow_funded'].includes(order.status)) {
                        await answerCallbackQuery(cq.id, `⚠️ Mevcut durum: ${order.status}`, true);
                        break;
                    }

                    await db.from('marketplace_orders').update({ status: 'transfer_started' }).eq('id', orderId);
                    await addSystemMsg('✅ Ödeme admin tarafından doğrulandı. Satıcı kanalı devrediyor...');
                    await answerCallbackQuery(cq.id, '✅ Onaylandı! Satıcıya bildirim gönderildi.');

                    // Satıcıya bildir
                    if (order.seller?.telegram_id) {
                        const buyerMention = order.buyer?.telegram_username
                            ? `@${order.buyer.telegram_username}`
                            : order.buyer?.full_name || 'Alıcı';

                        await sendMessage(order.seller.telegram_id,
                            `🚀 <b>HAREKETE GEÇ!</b>\n` +
                            `━━━━━━━━━━━━━━━━━━\n` +
                            `✅ Ödeme onaylandı!\n\n` +
                            `📦 Kanal: <b>${name}</b>\n` +
                            `💵 Size ödenecek: <b>$${netAmount} USDT</b>\n` +
                            `👤 Alıcı: ${buyerMention}\n` +
                            `━━━━━━━━━━━━━━━━━━\n` +
                            `<b>Yapmanız gerekenler:</b>\n` +
                            `1️⃣ Alıcıyı kanalınıza admin olarak ekleyin\n` +
                            `2️⃣ Kendiniz kanaldan ayrılın\n` +
                            `3️⃣ Aşağıdaki butona basın`,
                            [
                                [btn('✅ Kanalı Devrettim', `st:${orderId}`)],
                                [linkBtn('🔗 Sohbeti Görüntüle', sohbetUrl)],
                            ]
                        );
                    }

                    // Alıcıya bildir
                    if (order.buyer?.telegram_id) {
                        await sendMessage(order.buyer.telegram_id,
                            `✅ <b>Ödemeniz Doğrulandı!</b>\n\n` +
                            `📦 <b>${name}</b> kanalı için satıcı transfer sürecini başlatıyor.\n\n` +
                            `Kanaldan <b>admin daveti</b> gelecek, kabul etmeyi unutmayın! 📬`
                        );
                    }
                    break;
                }

                // ─────────────────────────────────────────────────────────────
                // pf: ADMİN → "Ödeme gelmedi"
                // ─────────────────────────────────────────────────────────────
                case 'pf': {
                    if (telegramId !== ADMIN_ID) {
                        await answerCallbackQuery(cq.id, '❌ Sadece admin', true);
                        break;
                    }
                    await answerCallbackQuery(cq.id, 'ℹ️ Alıcıya bildirim gönderildi');
                    await addSystemMsg('⚠️ Admin ödemeyi doğrulayamadı. Destek ekibiyle iletişime geçin.');

                    if (order.buyer?.telegram_id) {
                        await sendMessage(order.buyer.telegram_id,
                            `⚠️ <b>Ödeme Doğrulanamadı</b>\n\n` +
                            `${shortId} numaralı işlem için ödemeniz henüz görülmedi.\n\n` +
                            `Lütfen <a href="https://t.me/comtelegramkanali">destek ekibimizle</a> iletişime geçin.\n` +
                            `İşlem referansı: <code>${shortId}</code>`
                        );
                    }
                    break;
                }

                // ─────────────────────────────────────────────────────────────
                // st: SATICI → "Kanalı devrettim"
                // ─────────────────────────────────────────────────────────────
                case 'st': {
                    if (order.seller?.telegram_id !== telegramId) {
                        await answerCallbackQuery(cq.id, '❌ Bu işlem size ait değil', true);
                        break;
                    }
                    if (order.status !== 'transfer_started') {
                        await answerCallbackQuery(cq.id, `⚠️ Mevcut durum: ${order.status}`, true);
                        break;
                    }

                    await db.from('marketplace_orders').update({ status: 'transfer_completed' }).eq('id', orderId);
                    await addSystemMsg('🔄 Satıcı kanalı devrettiğini bildirdi. Admin son kontrol yapıyor...');
                    await answerCallbackQuery(cq.id, '✅ Bildiriminiz alındı! Admin kontrol edecek.');

                    // Admine bildir
                    await sendMessage(ADMIN_ID,
                        `🔄 <b>TRANSFER BİLDİRİMİ</b>\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `📦 Kanal: <b>${name}</b>\n` +
                        `💵 Tutar: <b>${priceStr}</b>\n` +
                        `🔑 Order: <b>${shortId}</b>\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `Satıcı kanalı devrettiğini bildirdi.\n` +
                        `Alıcıdan onay alın, ardından satıcıya <b>$${netAmount} USDT</b> gönderin.`,
                        [
                            [btn('✅ Tamamlandı - Satıcıya Ödeme Yap', `co:${orderId}`)],
                            [btn('⚠️ Anlaşmazlık Var', `di:${orderId}`)],
                            [linkBtn('🔗 Sohbeti Görüntüle', sohbetUrl)],
                        ]
                    );

                    // Alıcıya bildir
                    if (order.buyer?.telegram_id) {
                        await sendMessage(order.buyer.telegram_id,
                            `🔔 <b>Satıcı Kanalı Devretti!</b>\n\n` +
                            `📦 <b>${name}</b> kanalını kontrol edin.\n` +
                            `Admin haklarınız aktif olmalı.\n\n` +
                            `Sorun varsa <a href="${sohbetUrl}">sohbetten</a> bildirin.`
                        );
                    }
                    break;
                }

                // ─────────────────────────────────────────────────────────────
                // co: ADMİN → "Tamamlandı - Satıcıya ödeme yap"
                // ─────────────────────────────────────────────────────────────
                case 'co': {
                    if (telegramId !== ADMIN_ID) {
                        await answerCallbackQuery(cq.id, '❌ Sadece admin', true);
                        break;
                    }
                    if (order.status !== 'transfer_completed') {
                        await answerCallbackQuery(cq.id, `⚠️ Mevcut durum: ${order.status}`, true);
                        break;
                    }

                    await db.from('marketplace_orders').update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                    }).eq('id', orderId);

                    // İlanı "satıldı" olarak işaretle
                    await db.from('channel_listings').update({ status: 'sold' }).eq('id', order.listing_id);
                    await addSystemMsg('🎉 İşlem başarıyla tamamlandı! Escrow güvencesiyle sonuçlandı.');
                    await answerCallbackQuery(cq.id, '🎉 Tamamlandı!');

                    // Alıcıya tebrik
                    if (order.buyer?.telegram_id) {
                        await sendMessage(order.buyer.telegram_id,
                            `🎉 <b>İŞLEM TAMAMLANDI!</b>\n\n` +
                            `📦 <b>${name}</b> kanalı başarıyla size devredildi.\n\n` +
                            `İyi kullanımlar! Herhangi bir sorun için:\n` +
                            `<a href="https://t.me/comtelegramkanali">Destek Hattı</a> 🚀`
                        );
                    }

                    // Satıcıya ödeme bildirimi
                    if (order.seller?.telegram_id) {
                        await sendMessage(order.seller.telegram_id,
                            `💸 <b>ÖDEMENİZ YAPILDI!</b>\n\n` +
                            `📦 Kanal: <b>${name}</b>\n` +
                            `💵 Net kazanç: <b>$${netAmount} USDT</b>\n` +
                            `📊 Komisyon (%5): <b>$${commission} USDT</b>\n\n` +
                            `İşbirliği için teşekkürler! 🙏\n` +
                            `Yeni kanallar için: <a href="https://telegramkanali.com/marketplace">Marketplace</a>`
                        );
                    }
                    break;
                }

                // ─────────────────────────────────────────────────────────────
                // di: ADMİN → "Anlaşmazlık var"
                // ─────────────────────────────────────────────────────────────
                case 'di': {
                    if (telegramId !== ADMIN_ID) {
                        await answerCallbackQuery(cq.id, '❌ Sadece admin', true);
                        break;
                    }

                    await db.from('marketplace_orders').update({ status: 'disputed' }).eq('id', orderId);
                    await addSystemMsg('⚠️ Bu işlem anlaşmazlık sürecine alındı. Admin inceleme başladı.');
                    await answerCallbackQuery(cq.id, '⚠️ Anlaşmazlık kaydedildi');

                    const disputeMsg = `⚠️ <b>Anlaşmazlık Bildirimi</b>\n\n` +
                        `${shortId} numaralı işleminiz incelemeye alındı.\n` +
                        `Admin ekibimiz sizinle iletişime geçecek.\n\n` +
                        `<a href="https://t.me/comtelegramkanali">Destek Hattı →</a>`;

                    if (order.buyer?.telegram_id) await sendMessage(order.buyer.telegram_id, disputeMsg);
                    if (order.seller?.telegram_id) await sendMessage(order.seller.telegram_id, disputeMsg);
                    break;
                }

                default:
                    await answerCallbackQuery(cq.id, '❓ Bilinmeyen işlem');
            }
        }
    } catch (err) {
        console.error('[Bot Webhook Error]', err);
    }

    return NextResponse.json({ ok: true });
}
