/**
 * Telegram API Utilities
 * Kanal bilgilerini Telegram'dan otomatik çeker
 * NOT: Bu fonksiyonlar sadece server-side'da çalışır (admin.ts içinden çağrılır)
 */

interface TelegramChannelInfo {
    title: string;
    description: string;
    photo_url: string | null;
    member_count: number;
    username: string;
}

/**
 * Telegram kanal/grup username'inden bilgileri çeker
 * t.me/username veya @username formatını kabul eder
 */
export async function fetchTelegramChannelInfo(joinLink: string): Promise<TelegramChannelInfo | null> {
    try {
        // Username'i link'ten çıkar
        let username = extractUsername(joinLink);
        if (!username) {
            console.log('[TELEGRAM] Username bulunamadı:', joinLink);
            return null;
        }

        console.log('[TELEGRAM] Fetching info for:', username);

        // Telegram Widget API kullanarak bilgi çek (public kanallar için)
        // Bu API resmi olmasa da çalışır
        const widgetUrl = `https://t.me/${username}`;

        const response = await fetch(widgetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            },
            cache: 'no-store' // Her seferinde taze veri çek
        });

        if (!response.ok) {
            console.log('[TELEGRAM] Fetch failed:', response.status);
            return null;
        }

        const html = await response.text();

        // HTML'den bilgileri parse et
        const info = parseChannelHTML(html, username);

        console.log('[TELEGRAM] Parsed info:', info);
        return info;

    } catch (error) {
        console.error('[TELEGRAM] Error fetching channel info:', error);
        return null;
    }
}

/**
 * Join link'ten username'i çıkarır
 */
function extractUsername(joinLink: string): string | null {
    // Desteklenen formatlar:
    // https://t.me/username
    // https://telegram.me/username
    // t.me/username
    // @username
    // +invite_hash (joinchat)

    if (!joinLink) return null;

    // @ ile başlıyorsa direkt username
    if (joinLink.startsWith('@')) {
        return joinLink.slice(1);
    }

    // Private link (joinchat) - bu durumda bilgi çekemeyiz
    if (joinLink.includes('joinchat') || joinLink.includes('+')) {
        console.log('[TELEGRAM] Private channel, cannot fetch info');
        return null;
    }

    // t.me/username formatı
    const tmeMatch = joinLink.match(/(?:https?:\/\/)?(?:t|telegram)\.me\/([a-zA-Z0-9_]+)/);
    if (tmeMatch) {
        return tmeMatch[1];
    }

    return null;
}

/**
 * Telegram HTML sayfasından kanal bilgilerini parse eder
 */
function parseChannelHTML(html: string, username: string): TelegramChannelInfo {
    let title = '';
    let description = '';
    let photo_url: string | null = null;
    let member_count = 0;

    // Başlık (og:title veya tgme_page_title)
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    if (titleMatch) {
        title = decodeHTMLEntities(titleMatch[1]);
    }

    // Açıklama (og:description veya tgme_page_description)
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    if (descMatch) {
        description = decodeHTMLEntities(descMatch[1]);
    }

    // Fotoğraf URL (og:image)
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (imageMatch) {
        photo_url = imageMatch[1];
        // Telegram bazen placeholder resim döner, kontrol et
        if (photo_url.includes('telegram-placeholder') || photo_url.includes('default')) {
            photo_url = null;
        }
    }

    // Üye sayısı (tgme_page_extra veya subscribers)
    // Örnek: "15 234 members" veya "12K subscribers"
    const memberMatch = html.match(/(\d[\d\s,\.]*(?:K|M)?)\s*(?:members|subscribers|üye|abone)/i);
    if (memberMatch) {
        member_count = parseSubscriberCount(memberMatch[1]);
    }

    // Alternatif: tgme_page_extra class içinden
    const extraMatch = html.match(/class="tgme_page_extra">([^<]+)</);
    if (extraMatch && member_count === 0) {
        member_count = parseSubscriberCount(extraMatch[1]);
    }

    return {
        title: title || username,
        description,
        photo_url,
        member_count,
        username
    };
}

/**
 * "15K", "1.2M", "15 234" gibi formatları sayıya çevirir
 */
function parseSubscriberCount(str: string): number {
    if (!str) return 0;

    // Boşluk ve virgülleri temizle
    let clean = str.replace(/[\s,]/g, '');

    // K ve M suffix'lerini işle
    if (clean.includes('K') || clean.includes('k')) {
        const num = parseFloat(clean.replace(/[Kk]/g, ''));
        return Math.round(num * 1000);
    }

    if (clean.includes('M') || clean.includes('m')) {
        const num = parseFloat(clean.replace(/[Mm]/g, ''));
        return Math.round(num * 1000000);
    }

    // Noktalı sayılar (Türkçe format: 15.234)
    clean = clean.replace(/\./g, '');

    return parseInt(clean) || 0;
}

/**
 * HTML entities'leri decode eder
 */
function decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    };

    return text.replace(/&[^;]+;/g, (match) => entities[match] || match);
}

/**
 * Telegram Bot API'sini kullanarak resmi verileri çeker
 * Bot yönetici olduğunda scraping'den çok daha güvenilirdir.
 */
export async function fetchChannelInfoViaBot(chatId: string): Promise<TelegramChannelInfo | null> {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) {
        console.error('[BOT] TELEGRAM_BOT_TOKEN environment variable is missing');
        return null;
    }

    try {
        console.log('[BOT] Fetching official info for chat:', chatId);

        // 1. Get Chat Info (title, description, image file_id)
        const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`);
        const chatData = await chatRes.json();

        if (!chatData.ok) {
            console.error('[BOT] getChat error:', chatData.description);
            return null;
        }

        const chat = chatData.result;

        // 2. Get Member Count
        const countRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${chatId}`);
        const countData = await countRes.json();
        const member_count = countData.ok ? countData.result : 0;

        // 3. Get Photo URL if exists
        let photo_url: string | null = null;
        if (chat.photo?.big_file_id) {
            const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${chat.photo.big_file_id}`);
            const fileData = await fileRes.json();
            if (fileData.ok) {
                photo_url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
            }
        }

        return {
            title: chat.title || chat.username || 'Kanal',
            description: chat.description || '',
            photo_url,
            member_count,
            username: chat.username || ''
        };
    } catch (err) {
        console.error('[BOT] API Error:', err);
        return null;
    }
}
