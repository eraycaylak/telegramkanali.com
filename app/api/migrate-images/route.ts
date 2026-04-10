import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';

// Telegram CDN URL'lerini Supabase Storage'a taşıyan API
// Bir kere çağır: /api/migrate-images?secret=...
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Netlify 60s limit

export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.SETUP_SECRET && secret !== process.env.INTERNAL_API_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();

    // Telegram CDN URL'si olan kanalları bul
    const { data: channels, error } = await supabase
        .from('channels')
        .select('id, name, image, join_link')
        .or('image.like.%telesco.pe%,image.like.%telegram-cdn%,image.like.%cdn%.telegram%');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!channels || channels.length === 0) {
        return NextResponse.json({ message: 'Tüm resimler zaten migrate edilmiş', count: 0 });
    }

    let migrated = 0;
    let failed = 0;
    const results: any[] = [];

    for (const ch of channels) {
        try {
            // Resmi indir
            const res = await fetch(ch.image, { signal: AbortSignal.timeout(10000) });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

            const buffer = Buffer.from(await res.arrayBuffer());
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            const ext = contentType.split('/').pop() || 'jpg';
            const fileName = `channel_${ch.id}_${Date.now()}.${ext}`;

            // Supabase Storage'a yükle
            const { error: upErr } = await supabase.storage
                .from('assets')
                .upload(fileName, buffer, { contentType, upsert: true });

            if (upErr) throw upErr;

            // Public URL al
            const { data: urlData } = supabase.storage
                .from('assets')
                .getPublicUrl(fileName);

            // DB güncelle
            await supabase
                .from('channels')
                .update({ image: urlData.publicUrl })
                .eq('id', ch.id);

            migrated++;
            results.push({ name: ch.name, status: 'ok' });
        } catch (err: any) {
            failed++;
            results.push({ name: ch.name, status: 'fail', error: err.message });

            // Eğer CDN expire olduysa, scraping ile taze fotoğraf çekmeyi dene
            try {
                const username = ch.join_link?.replace('https://t.me/', '').replace('http://t.me/', '').replace('@', '');
                if (username && !username.includes('+') && !username.includes('joinchat')) {
                    const pageRes = await fetch(`https://t.me/${username}`, {
                        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
                    });
                    const html = await pageRes.text();
                    const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
                    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('placeholder')) {
                        const freshUrl = imgMatch[1];
                        const freshRes = await fetch(freshUrl, { signal: AbortSignal.timeout(10000) });
                        if (freshRes.ok) {
                            const freshBuf = Buffer.from(await freshRes.arrayBuffer());
                            const freshType = freshRes.headers.get('content-type') || 'image/jpeg';
                            const freshExt = freshType.split('/').pop() || 'jpg';
                            const freshName = `channel_${ch.id}_fresh_${Date.now()}.${freshExt}`;

                            const { error: freshUpErr } = await supabase.storage
                                .from('assets')
                                .upload(freshName, freshBuf, { contentType: freshType, upsert: true });

                            if (!freshUpErr) {
                                const { data: freshUrlData } = supabase.storage
                                    .from('assets')
                                    .getPublicUrl(freshName);

                                await supabase
                                    .from('channels')
                                    .update({ image: freshUrlData.publicUrl })
                                    .eq('id', ch.id);

                                migrated++;
                                failed--;
                                results[results.length - 1] = { name: ch.name, status: 'ok_fallback' };
                            }
                        }
                    }
                }
            } catch { /* ignore fallback error */ }
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 300));
    }

    return NextResponse.json({ migrated, failed, total: channels.length, results });
}
