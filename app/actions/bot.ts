'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

// Set webhook URL for the Telegram bot
export async function setupTelegramWebhook() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return { error: 'TELEGRAM_BOT_TOKEN çevre değişkeni eksik.' };
    }

    const webhookUrl = `https://bzitsygzrfkdqmuiolbe.supabase.co/functions/v1/telegram-bot-webhook`;

    try {
        // Set webhook with allowed_updates to receive chat_member events
        const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: webhookUrl,
                allowed_updates: ['message', 'channel_post', 'chat_member'],
                drop_pending_updates: false,
            }),
        });

        const data = await res.json();
        console.log('[WEBHOOK] Setup result:', data);

        if (data.ok) {
            return { success: true, message: 'Webhook başarıyla ayarlandı!' };
        } else {
            return { error: `Telegram API hatası: ${data.description}` };
        }
    } catch (err: any) {
        console.error('[WEBHOOK] Setup error:', err);
        return { error: `Webhook ayarlama hatası: ${err.message}` };
    }
}

// Get current webhook info
export async function getWebhookInfo() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        return { error: 'Bot token eksik' };
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
        const data = await res.json();
        return data.result || {};
    } catch (err: any) {
        return { error: err.message };
    }
}

// Get channel statistics
export async function getChannelStats(channelId: string) {
    const adminClient = getAdminClient();

    // Last 30 days stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dailyStats } = await adminClient
        .from('bot_analytics')
        .select('date, joins, leaves')
        .eq('channel_id', channelId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

    // Recent member events (last 50)
    const { data: recentEvents } = await adminClient
        .from('member_events')
        .select('telegram_user_id, username, first_name, last_name, event_type, created_at')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(50);

    // Summary totals
    const totalJoins = dailyStats?.reduce((sum, d) => sum + (d.joins || 0), 0) || 0;
    const totalLeaves = dailyStats?.reduce((sum, d) => sum + (d.leaves || 0), 0) || 0;

    return {
        dailyStats: dailyStats || [],
        recentEvents: recentEvents || [],
        totalJoins,
        totalLeaves,
        netGrowth: totalJoins - totalLeaves,
    };
}
