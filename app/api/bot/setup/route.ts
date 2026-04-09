import { NextRequest, NextResponse } from 'next/server';

// Telegram webhook'unu kayıt eden setup endpoint
// Sadece bir kez çağrılır: GET /api/bot/setup?secret=SETUP_SECRET
export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.SETUP_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return NextResponse.json({ error: 'BOT_TOKEN missing' }, { status: 500 });

    const webhookUrl = `https://telegramkanali.com/api/bot/webhook`;
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '';

    const res = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: webhookUrl,
                secret_token: webhookSecret || undefined,
                allowed_updates: ['message', 'callback_query'],
                drop_pending_updates: true,
            }),
        }
    );

    const data = await res.json();

    // Bot info da getir
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const me = await meRes.json();

    return NextResponse.json({
        webhook: data,
        bot: me.result,
        webhookUrl,
    });
}
