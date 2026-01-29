const https = require('https');
const fs = require('fs');

const urls = [
    'https://t.me/haberconnect',
    'https://t.me/joinchat/VAaLDHtVSPhjZDBk',
    'https://t.me/teknodiib',
    'https://t.me/politizasyoN',
    'https://t.me/habergezgini',
    // 'https://telegramkanallari.net/telegram-spor-haberleri-kanali/', // Skipping non-telegram link
    'https://t.me/turkiyesondakika',
    'https://t.me/abdpost',
    'https://t.me/pilyonhaber',
    'https://t.me/ProBilgi',
    'https://t.me/HaberPortalim',
    'https://t.me/isthaber',
    'https://t.me/haberpaylasim',
    'https://t.me/haberozetleri',
    'https://t.me/bilgiyorum',
    'https://t.me/pr0spektus',
    'https://t.me/habercinizgeldicom',
    'https://t.me/+_KvVwqxs3nM2NmNk',
    'https://t.me/+IZmOjdbHazQwNzc0',
    'https://t.me/habertv1',
    'https://t.me/balik_hafizasi',
    'https://t.me/plus1haber',
    'https://t.me/guncel_haberler_kanali',
    'https://t.me/hafiza_kutusu',
    'https://t.me/+CoE0gGWsmIk1ZmVk',
    'https://t.me/+8sCRFjEhOH40ZGNk',
    'https://t.me/dakika_son',
    'https://t.me/PulseGundem',
    'https://t.me/anlikhaberdarol',
    'https://t.me/siyah_ordu',
    'https://t.me/GunlukHaber',
    'https://t.me/spor_haber',
    'https://t.me/mutevellit',
    'https://t.me/+lcu6rcrChNFlZjZk',
    'https://t.me/gundemhaber18',
    'https://t.me/elonbakma',
    'https://t.me/manda_gozu',
    'https://t.me/haberinizolsuntr',
    'https://t.me/+0YaAMui5NLEwMTBh',
    'https://t.me/depremlerturkey',
    'https://t.me/haberimyoktu',
    'https://t.me/+HOZEvRbR3FVhOWE8',
    'https://t.me/worldhaberone',
    'https://t.me/+QZf5HFQ5i7RhYTNk',
    'https://t.me/haberler_sondakika',
    'https://t.me/hataycanlihaber',
    'https://t.me/+HxBIxCZT-XAwNmEx',
    'https://t.me/+TdXVZLvz7Bo2ZTJk',
    'https://t.me/sondakika111',
    'https://t.me/haberlerisondakika',
    'https://t.me/dunyadanveriler',
    'https://t.me/yenibirhaber',
    'https://t.me/KonseyHaber',
    'https://t.me/PulseGundem',
    'https://t.me/haberkulesitr',
    'https://t.me/gundemexpress',
    'https://t.me/son_dakikaf',
    'https://t.me/turkiyedenhaberler24',
    'https://t.me/+rG7rtVSlb_xlMjdk',
    'https://t.me/gundemedairhersey',
    'https://t.me/+nRcJpjSJQR40OTg0'
];

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function extractMeta(html) {
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)">/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);

    return {
        title: titleMatch ? titleMatch[1] : null,
        description: descMatch ? descMatch[1] : '',
        image: imageMatch ? imageMatch[1] : null
    };
}

function cleanText(text) {
    if (!text) return '';
    return text.replace(/'/g, "''").trim();
}

async function main() {
    console.log(`-- Seeding ${urls.length} channels`);

    const values = [];

    for (const url of urls) {
        try {
            // Process URL to get slug
            let slug = '';
            if (url.includes('/joinchat/')) {
                slug = 'join-' + url.split('/joinchat/')[1];
            } else if (url.includes('/+')) {
                slug = 'invite-' + url.split('/+')[1];
            } else {
                slug = url.split('t.me/')[1].replace('/', '');
            }

            // Fetch content
            const html = await fetchUrl(url);
            const meta = extractMeta(html);

            let name = meta.title || slug;
            // Remove "Telegram: Contact @" prefix if present
            name = name.replace('Telegram: Contact @', '').replace('Telegram: Join Group Chat', name).trim();
            if (name.includes('Telegram:')) name = slug; // Fallback

            const description = cleanText(meta.description);
            const image = meta.image || '';

            const sqlVal = `('${cleanText(name)}', '${slug}', '${description}', '${image}', (SELECT id FROM categories WHERE slug = 'haber'), '${url}', false, 0)`;
            values.push(sqlVal);

            // console.error(`Processed: ${name}`); 

            // Rate limit slightly
            await new Promise(r => setTimeout(r, 100));

        } catch (e) {
            console.error(`Error processing ${url}: ${e.message}`);
        }
    }

    const sqlContent = values.join(',\n') + ';';
    const fileContent = `-- Created by Antigravity Scraper\nINSERT INTO public.channels (name, slug, description, image, category_id, join_link, verified, score) VALUES\n${sqlContent}\n\n-- Done\n-- Rate limit bypass`;

    fs.writeFileSync('seed_haber.sql', fileContent, 'utf8');
    console.log('Successfully wrote to seed_haber.sql');
}

main();
