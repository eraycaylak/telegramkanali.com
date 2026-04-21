// Telegram Bot API utility
// Tüm Telegram işlemleri (bot mesajları + kanal bilgisi) bu dosya üzerinden yapılır

const TOKEN = process.env.ESCROW_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

export const ADMIN_ID = parseInt(process.env.TELEGRAM_ADMIN_CHAT_ID || '1248286205', 10);
export const USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || 'TKsknVNnQuQDsL8RYuL5tXSbaRxTURT4eg';
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
    let username = extractUsername(joinLink);
    if (!username) {
        console.warn('[TELEGRAM] Could not extract username from:', joinLink);
        return null;
    }

    // Try multiple URLs in order: t.me/username, then t.me/s/username (preview)
    const urls = [
        `https://t.me/${username}`,
        `https://t.me/s/${username}`,
    ];

    for (const url of urls) {
        // Retry up to 3 times per URL with 1s delay
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`[TELEGRAM] Fetching ${url} (attempt ${attempt}/3)`);
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                    cache: 'no-store',
                    signal: AbortSignal.timeout(10000), // 10s timeout
                });

                if (response.status === 429) {
                    console.warn(`[TELEGRAM] Rate limited (429) on ${url}, waiting ${attempt * 2}s...`);
                    await new Promise(r => setTimeout(r, attempt * 2000));
                    continue;
                }

                if (!response.ok) {
                    console.warn(`[TELEGRAM] HTTP ${response.status} for ${url}`);
                    break; // Try next URL
                }

                const html = await response.text();
                const result = parseChannelHTML(html, username);

                // Validate: if we got a meaningful title, return it
                if (result && result.title && result.title !== username) {
                    console.log(`[TELEGRAM] Success: ${result.title} (${result.member_count} members)`);
                    return result;
                }

                // If title equals username, the data might be minimal — still return it
                if (result) {
                    console.log(`[TELEGRAM] Partial data for ${username}`);
                    return result;
                }
            } catch (err: any) {
                const isTimeout = err?.name === 'AbortError' || err?.name === 'TimeoutError';
                console.warn(`[TELEGRAM] ${isTimeout ? 'Timeout' : 'Error'} on ${url} attempt ${attempt}:`, err?.message || err);

                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                }
            }
        }
    }

    console.error(`[TELEGRAM] All attempts failed for: ${joinLink}`);
    return null;
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

