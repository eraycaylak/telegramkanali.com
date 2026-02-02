// Supabase Edge Function to update Telegram channel info
// Updates: member_count, image (photo), description
// Runs daily via cron job

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChannelInfo {
    memberCount: number;
    title: string;
    description: string;
    photoUrl: string | null;
}

// Telegram HTML sayfasından bilgi çeker
async function fetchChannelInfo(username: string): Promise<ChannelInfo | null> {
    try {
        const response = await fetch(`https://t.me/${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            }
        });

        if (!response.ok) return null;

        const html = await response.text();

        // Title
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
        const title = titleMatch ? decodeEntities(titleMatch[1]) : username;

        // Description
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
        const description = descMatch ? decodeEntities(descMatch[1]) : '';

        // Photo URL
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        let photoUrl = imageMatch ? imageMatch[1] : null;
        if (photoUrl?.includes('telegram-placeholder') || photoUrl?.includes('default')) {
            photoUrl = null;
        }

        // Member count
        let memberCount = 0;
        const memberMatch = html.match(/(\d[\d\s,\.]*(?:K|M)?)\s*(?:members|subscribers|üye|abone)/i);
        if (memberMatch) {
            memberCount = parseCount(memberMatch[1]);
        }
        // Alternatif
        if (memberCount === 0) {
            const extraMatch = html.match(/class="tgme_page_extra">([^<]+)</);
            if (extraMatch) {
                memberCount = parseCount(extraMatch[1]);
            }
        }

        return { memberCount, title, description, photoUrl };
    } catch (error) {
        console.error(`[FETCH] Error for ${username}:`, error);
        return null;
    }
}

async function persistImage(supabase: any, url: string, slug: string): Promise<string> {
    if (!url || !url.startsWith('http') || url.includes('supabase.co')) return url;
    if (!url.includes('telesco.pe') && !url.includes('telegram') && !url.includes('t.me')) return url;

    try {
        const res = await fetch(url);
        if (!res.ok) return url;

        const blob = await res.blob();
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.split('/').pop() || 'jpg';
        const fileName = `channel_${slug}_${Date.now()}.${ext}`;

        const { error } = await supabase.storage
            .from('assets')
            .upload(fileName, blob, { contentType, upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('assets')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (err) {
        console.error(`[STORAGE] Persistence error for ${slug}:`, err);
        return url;
    }
}

function decodeEntities(text: string): string {
    const entities: Record<string, string> = {
        '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' '
    };
    return text.replace(/&[^;]+;/g, (m) => entities[m] || m);
}

function parseCount(str: string): number {
    if (!str) return 0;
    let clean = str.replace(/[\s,]/g, '');
    if (clean.includes('K') || clean.includes('k')) {
        return Math.round(parseFloat(clean.replace(/[Kk]/g, '')) * 1000);
    }
    if (clean.includes('M') || clean.includes('m')) {
        return Math.round(parseFloat(clean.replace(/[Mm]/g, '')) * 1000000);
    }
    clean = clean.replace(/\./g, '');
    return parseInt(clean) || 0;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: channels, error: fetchError } = await supabase
            .from('channels')
            .select('id, name, join_link, member_count, image, description')
            .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        console.log(`[UPDATE] Processing ${channels?.length || 0} channels`);

        let updated = 0;
        let failed = 0;
        const results: any[] = [];

        for (const channel of channels || []) {
            const username = channel.join_link
                ?.replace('https://t.me/', '')
                ?.replace('http://t.me/', '')
                ?.replace('@', '');

            if (!username || username.includes('+') || username.includes('joinchat')) {
                failed++;
                results.push({ name: channel.name, status: 'skipped_private' });
                continue;
            }

            const info = await fetchChannelInfo(username);

            if (info && info.memberCount > 0) {
                const updateData: any = {
                    member_count: info.memberCount,
                    updated_at: new Date().toISOString()
                };

                // Fotoğraf varsa güncelle
                const isTempImage = channel.image?.includes('telesco.pe') || !channel.image?.includes('supabase.co');
                if (info.photoUrl && (info.photoUrl !== channel.image || isTempImage)) {
                    updateData.image = await persistImage(supabase, info.photoUrl, channel.id);
                }

                // Açıklama varsa güncelle
                if (info.description) {
                    updateData.description = info.description;
                }

                const { error: updateError } = await supabase
                    .from('channels')
                    .update(updateData)
                    .eq('id', channel.id);

                if (!updateError) {
                    updated++;
                    results.push({
                        name: channel.name,
                        status: 'updated',
                        members: info.memberCount,
                        hasPhoto: !!info.photoUrl
                    });
                } else {
                    failed++;
                    results.push({ name: channel.name, status: 'db_error', error: updateError.message });
                }
            } else {
                failed++;
                results.push({ name: channel.name, status: 'fetch_failed' });
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`[UPDATE] Complete: ${updated} updated, ${failed} failed`);

        return new Response(
            JSON.stringify({ success: true, updated, failed, total: channels?.length || 0, results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[UPDATE] Error:', error);
        return new Response(
            JSON.stringify({ error: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
