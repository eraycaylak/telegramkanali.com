// Telegram Bot API utility
// Tüm Telegram işlemleri (bot mesajları + kanal bilgisi) bu dosya üzerinden yapılır

const TOKEN = process.env.ESCROW_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

export const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_CHAT_ID || '1248286205', 10);
export const USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || 'USDT_ADRESINIZI_BURAYA_GIRIN';
export const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || '';

// ─── Temel mesaj gönderme ────────────────────────────────────────────────────

export async function sendMessage(
    chatId: number | string,
    text: string,
    inline_keyboard?: { text: string; callback_data?: string; url?: string }[][]
): Promise<{ ok: boolean; result?: { message_id: number } }> {
    const body: any = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    };
    if (inline_keyboard) {
        body.reply_markup = { inline_keyboard };
    }
    const res = await fetch(`${API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

export async function answerCallbackQuery(id: string, text?: string, show_alert = false) {
    await fetch(`${API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: id, text, show_alert }),
    });
}

// ─── Buton yardımcıları ──────────────────────────────────────────────────────

export function btn(text: string, callback_data: string) {
    return { text, callback_data };
}

export function linkBtn(text: string, url: string) {
    return { text, url };
}

// ─── Fiyat formatlayıcı ──────────────────────────────────────────────────────

export function fmtPrice(amount: number, currency: string) {
    if (currency === 'STARS') return `${amount} ⭐ Yıldız`;
    return `$${parseFloat(String(amount)).toFixed(2)} USDT`;
}

// ─── Kanal bilgisi çekme (eski fonksiyonlar — admin.ts tarafından kullanılır) ─

interface TelegramChannelInfo {
    title: string;
    description: string;
    photo_url: string | null;
    member_count: number;
    username: string;
}

export async function fetchTelegramChannelInfo(joinLink: string): Promise<TelegramChannelInfo | null> {
    try {
        let username = extractUsername(joinLink);
        if (!username) return null;

        const response = await fetch(`https://t.me/${username}`, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
            cache: 'no-store',
        });
        if (!response.ok) return null;

        const html = await response.text();
        return parseChannelHTML(html, username);
    } catch {
        return null;
    }
}

export async function fetchChannelInfoViaBot(chatId: string): Promise<TelegramChannelInfo | null> {
    if (!process.env.ESCROW_BOT_TOKEN) return null;
    try {
        const chatRes = await fetch(`${API}/getChat?chat_id=${chatId}`);
        const chatData = await chatRes.json();
        if (!chatData.ok) return null;

        const chat = chatData.result;
        const countRes = await fetch(`${API}/getChatMemberCount?chat_id=${chatId}`);
        const countData = await countRes.json();
        const member_count = countData.ok ? countData.result : 0;

        let photo_url: string | null = null;
        if (chat.photo?.big_file_id) {
            const fileRes = await fetch(`${API}/getFile?file_id=${chat.photo.big_file_id}`);
            const fileData = await fileRes.json();
            if (fileData.ok) photo_url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
        }

        return { title: chat.title || chat.username || 'Kanal', description: chat.description || '', photo_url, member_count, username: chat.username || '' };
    } catch {
        return null;
    }
}

function extractUsername(joinLink: string): string | null {
    if (!joinLink) return null;
    if (joinLink.startsWith('@')) return joinLink.slice(1);
    if (joinLink.includes('joinchat') || joinLink.includes('+')) return null;
    const m = joinLink.match(/(?:https?:\/\/)?(?:t|telegram)\.me\/([a-zA-Z0-9_]+)/);
    return m ? m[1] : null;
}

function parseChannelHTML(html: string, username: string): TelegramChannelInfo {
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const memberMatch = html.match(/(\d[\d\s,\.]*(?:K|M)?)\s*(?:members|subscribers|üye|abone)/i);

    const title = titleMatch ? decodeHTMLEntities(titleMatch[1]) : username;
    const description = descMatch ? decodeHTMLEntities(descMatch[1]) : '';
    let photo_url = imageMatch ? imageMatch[1] : null;
    if (photo_url?.includes('placeholder')) photo_url = null;

    return { title, description, photo_url, member_count: memberMatch ? parseSubscriberCount(memberMatch[1]) : 0, username };
}

function parseSubscriberCount(str: string): number {
    if (!str) return 0;
    const clean = str.replace(/[\s,]/g, '');
    if (/[Kk]/.test(clean)) return Math.round(parseFloat(clean) * 1000);
    if (/[Mm]/.test(clean)) return Math.round(parseFloat(clean) * 1000000);
    return parseInt(clean.replace(/\./g, '')) || 0;
}

function decodeHTMLEntities(text: string): string {
    const e: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
    return text.replace(/&[^;]+;/g, m => e[m] || m);
}

