import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const BOT_SECRET = Deno.env.get("TELEGRAM_BOT_SECRET") || ""

Deno.serve(async (req: Request) => {
    // Only accept POST
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    // Optional: validate secret token from Telegram webhook header
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token')
    if (BOT_SECRET && secretHeader !== BOT_SECRET) {
        console.error('Invalid secret token:', secretHeader)
        if (BOT_SECRET && secretHeader) {
            return new Response('Unauthorized', { status: 401 })
        }
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    try {
        const payload = await req.json()
        console.log("[BOT] Update received:", JSON.stringify(payload).substring(0, 500))

        // =============================================
        // 1. Handle /verify command (channel_post or message)
        // =============================================
        const msg = payload.message || payload.channel_post || payload.edited_channel_post
        if (msg && msg.text?.startsWith('/verify')) {
            console.log("[BOT] Verify command detected!")

            if (!BOT_TOKEN) {
                console.error("[BOT] CRITICAL: TELEGRAM_BOT_TOKEN is missing!")
                return new Response(JSON.stringify({ error: "No bot token" }), { status: 500 })
            }

            const token = msg.text.split(' ')[1]?.trim()
            const chatId = msg.chat.id.toString()
            console.log(`[BOT] Verifying token: ${token} for chat: ${chatId}`)

            if (!token) {
                await sendTelegramMessage(chatId, '❌ Doğrulama kodu eksik. Örnek: /verify TK_XXXX')
                return okResponse()
            }

            // Find channel by bot_token and update
            const { data: channel, error } = await supabase
                .from('channels')
                .update({ bot_enabled: true, telegram_chat_id: chatId })
                .eq('bot_token', token)
                .select('id, name')

            if (error) {
                console.error("[BOT] DB Update Error:", error)
            }

            if (channel && channel.length > 0) {
                console.log(`[BOT] ✅ Channel verified: ${channel[0].name}`)
                await sendTelegramMessage(chatId,
                    `✅ Kanal başarıyla doğrulandı: ${channel[0].name}\n\n` +
                    `📊 İstatistikler kaydedilmeye başlandı.\n` +
                    `👥 Giren/çıkan üye takibi aktif.\n\n` +
                    `Bu mesajı silebilirsiniz.`
                )

                // Fetch initial member count
                try {
                    const countRes = await fetch(
                        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${chatId}`
                    )
                    const countData = await countRes.json()
                    if (countData.ok && typeof countData.result === 'number') {
                        await supabase
                            .from('channels')
                            .update({ member_count: countData.result })
                            .eq('id', channel[0].id)
                        console.log(`[BOT] Member count set: ${countData.result}`)
                    }
                } catch (e) {
                    console.error("[BOT] Failed to get member count:", e)
                }
            } else {
                console.log(`[BOT] ❌ Token not found: ${token}`)
                await sendTelegramMessage(chatId,
                    '❌ Geçersiz veya kullanılmış doğrulama kodu.\n' +
                    'Lütfen panelden yeni kod oluşturup tekrar deneyin.'
                )
            }

            return okResponse()
        }

        // =============================================
        // 2. Handle member join/leave events
        // =============================================
        if (payload.chat_member) {
            const { chat, new_chat_member, old_chat_member } = payload.chat_member
            const telegramChatId = chat.id.toString()
            const user = new_chat_member.user

            console.log(`[BOT] Chat member update in ${chat.title || telegramChatId}:`,
                `${user.username || user.first_name} ${old_chat_member.status} -> ${new_chat_member.status}`)

            // Determine if join or leave
            const joinStatuses = ['member', 'administrator', 'creator']
            const leaveStatuses = ['left', 'kicked', 'banned', 'restricted']

            const wasOut = leaveStatuses.includes(old_chat_member.status)
            const isIn = joinStatuses.includes(new_chat_member.status)
            const wasIn = joinStatuses.includes(old_chat_member.status)
            const isOut = leaveStatuses.includes(new_chat_member.status)

            const isJoin = wasOut && isIn
            const isLeave = wasIn && isOut

            if (!isJoin && !isLeave) {
                console.log("[BOT] Not a join/leave event, skipping")
                return okResponse()
            }

            // Find channel by telegram_chat_id
            const { data: channel } = await supabase
                .from('channels')
                .select('id')
                .eq('telegram_chat_id', telegramChatId)
                .eq('bot_enabled', true)
                .single()

            if (!channel) {
                console.log(`[BOT] No verified channel for chat_id: ${telegramChatId}`)
                return okResponse()
            }

            const eventType = isJoin ? 'join' : 'leave'
            const today = new Date().toISOString().split('T')[0]

            // Log individual member event
            await supabase.from('member_events').insert({
                channel_id: channel.id,
                telegram_user_id: user.id,
                username: user.username || null,
                first_name: user.first_name || null,
                last_name: user.last_name || null,
                event_type: eventType
            })

            // Update daily aggregate stats
            await supabase.rpc('increment_bot_stat', {
                chan_id: channel.id,
                stat_date: today,
                col: isJoin ? 'joins' : 'leaves'
            })

            console.log(`[BOT] ✅ ${eventType}: @${user.username || user.first_name} in channel ${channel.id}`)

            // Update member count
            if (BOT_TOKEN) {
                try {
                    const countRes = await fetch(
                        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${telegramChatId}`
                    )
                    const countData = await countRes.json()
                    if (countData.ok) {
                        await supabase
                            .from('channels')
                            .update({ member_count: countData.result })
                            .eq('id', channel.id)
                    }
                } catch (_) { /* non-critical */ }
            }

            return okResponse()
        }

        // =============================================
        // 3. Handle /start command (bot DM)
        // =============================================
        if (msg && msg.text === '/start') {
            const chatId = msg.chat.id.toString()
            await sendTelegramMessage(chatId,
                '👋 Merhaba! Ben telegramkanali.com resmi istatistik ve doğrulama botuyum.\n\n' +
                'ℹ️ *telegramkanali.com Nedir?*\n' +
                'Türkiye\'nin en aktif ve güncel Telegram kanal dizinidir. Kanalınızı sitemize ekleyerek binlerce organik yeni üyeye ulaşabilirsiniz.\n\n' +
                '🤖 *Bu Bot Ne İşe Yarar?*\n' +
                'Beni kanalınıza yönetici olarak eklediğinizde:\n' +
                '✅ Kanalınız sitemizde "Doğrulanmış" (Verified) rozeti alır.\n' +
                '✅ Giren ve çıkan üyelerin istatistikleri sitemizde günlük/haftalık olarak otomatik tutulur.\n' +
                '✅ Kategorilerde daha üst sıralarda listelenirsiniz.\n\n' +
                '🛠 *Nasıl Kullanılır?*\n' +
                '1. Beni kanalınıza **Yönetici** olarak ekleyin.\n' +
                '2. telegramkanali.com/dashboard/bot adresinden size özel üretilen **Doğrulama Kodunu** hesaba giriş yaparak kopyalayın.\n' +
                '3. O kodu kanalınıza mesaj olarak gönderin (Örn: `/verify TK_12345`).\n' +
                '4. Bot kodunuzu görür görmez onaylar. Ardından mesajı silebilirsiniz!\n\n' +
                '📢 *Reklam ve VIP Avantajları*\n' +
                'Platformumuzda kanalınızı öne çıkarmak, "Öne Çıkanlar" vitrininde yer almak, anasayfa banner reklamı vermek ve token bakiyesiyle işlemler yapmak için sitemizdeki **Reklam** (telegramkanali.com/reklam) sayfasını veya **VIP Paketleri** inceleyebilirsiniz.\n\n' +
                '📞 *İletişim Bilgilerimiz*\n' +
                'Soru, destek ve reklam anlaşmaları için bizimle doğrudan iletişime geçebilirsiniz:\n' +
                '💬 Telegram: @sibelliee\n\n' +
                '🚀 Kanalınızı büyütmeye hazırsanız hemen başlayalım!'
            )
            return okResponse()
        }

        return okResponse()
    } catch (err) {
        console.error("[BOT] Error:", err)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})

async function sendTelegramMessage(chatId: string, text: string) {
    if (!BOT_TOKEN) return
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text })
        })
        const data = await res.json()
        if (!data.ok) console.error('[BOT] Telegram send error:', data)
    } catch (e) {
        console.error('[BOT] Telegram send failed:', e)
    }
}

function okResponse() {
    return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
    })
}
