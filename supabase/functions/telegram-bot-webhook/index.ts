import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")

serve(async (req) => {
    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    try {
        const payload = await req.json()
        console.log("Telegram update:", payload)

        // Handle Join/Leave events (chat_member updates)
        if (payload.chat_member) {
            const { chat, new_chat_member, old_chat_member } = payload.chat_member
            const channelId = chat.id.toString()

            // Check status changes
            const isJoin = (new_chat_member.status === 'member' || new_chat_member.status === 'administrator') &&
                (old_chat_member.status === 'left' || old_chat_member.status === 'kicked');
            const isLeave = (new_chat_member.status === 'left' || new_chat_member.status === 'kicked') &&
                (old_chat_member.status === 'member' || old_chat_member.status === 'administrator');

            if (isJoin || isLeave) {
                // Find channel in DB via join_link or bot_token logic
                // This is a simplified version
                const { data: channel } = await supabase
                    .from('channels')
                    .select('id')
                    .filter('join_link', 'ilike', `%${chat.username}%`) // Fallback to username check
                    .single();

                if (channel) {
                    const field = isJoin ? 'joins' : 'leaves';
                    await supabase.rpc('increment_bot_stat', {
                        chan_id: channel.id,
                        stat_date: new Date().toISOString().split('T')[0],
                        col: field
                    });
                }
            }
        }

        // Handle /verify command
        if (payload.message && payload.message.text?.startsWith('/verify')) {
            const token = payload.message.text.split(' ')[1];
            const chat_id = payload.message.chat.id.toString();

            const { data: channel, error } = await supabase
                .from('channels')
                .update({ bot_enabled: true, telegram_chat_id: chat_id })
                .eq('bot_token', token)
                .select();

            if (channel && channel.length > 0) {
                // Send success message
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat_id,
                        text: `✅ Kanal başarıyla doğrulandı: ${channel[0].name}\nArtık istatistikler kaydedilmeye başlandı.`
                    })
                });
            } else {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat_id,
                        text: `❌ Geçersiz veya kullanılmış doğrulama kodu.`
                    })
                });
            }
        }

        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
