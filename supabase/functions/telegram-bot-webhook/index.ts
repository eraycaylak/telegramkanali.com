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
        const msg = payload.message || payload.channel_post || payload.edited_channel_post;
        console.log("Detected Message Payload:", msg ? "YES" : "NO", msg?.text);
        if (msg && msg.text?.startsWith('/verify')) {
            console.log("Found verify command!");

            if (!BOT_TOKEN) {
                console.error("CRITICAL: TELEGRAM_BOT_TOKEN is missing in environment variables!");
                return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500 });
            }

            const token = msg.text.split(' ')[1];
            const chat_id = msg.chat.id.toString();
            console.log(`Verifying token: ${token} for chat_id: ${chat_id}`);

            const { data: channel, error } = await supabase
                .from('channels')
                .update({ bot_enabled: true, telegram_chat_id: chat_id })
                .eq('bot_token', token)
                .select();

            if (error) {
                console.error("Supabase Update Error:", error);
            }

            console.log("Update Result:", channel);

            if (channel && channel.length > 0) {
                console.log("Success! Sending confirmation to Telegram...");
                // Send success message
                const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat_id,
                        text: `✅ Kanal başarıyla doğrulandı: ${channel[0].name}\nArtık istatistikler kaydedilmeye başlandı.`
                    })
                });
                const tgData = await tgRes.json();
                console.log("Telegram API Response:", tgData);

                // Fetch initial member count immediately
                try {
                    const countRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${chat_id}`);
                    const countData = await countRes.json();
                    if (countData.ok && typeof countData.result === 'number') {
                        await supabase
                            .from('channels')
                            .update({ member_count: countData.result })
                            .eq('id', channel[0].id);
                        console.log("Initial member count set to:", countData.result);
                    }
                } catch (countErr) {
                    console.error("Failed to fetch initial member count:", countErr);
                }
            } else {
                console.log("Failure! Token not found or invalid.");
                const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chat_id,
                        text: `❌ Geçersiz veya kullanılmış doğrulama kodu. Lütfen panelden yeni kod oluşturun.`
                    })
                });
                console.log("Telegram API Send Result:", await tgRes.json());
            }
        }

        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
