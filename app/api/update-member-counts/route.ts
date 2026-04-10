import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabaseAdmin';

// This API route updates member counts for all channels
// Can be called manually or via cron job service like cron-job.org

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

function isTelegramCdn(url: string | null): boolean {
    if (!url) return false;
    return url.includes('telesco.pe') || url.includes('telegram-cdn') || (url.includes('cdn') && url.includes('telegram'));
}

async function persistImage(url: string, channelId: string): Promise<string | null> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;

        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.split('/').pop() || 'jpg';
        const fileName = `channel_${channelId}_${Date.now()}.${ext}`;

        const supabase = getAdminClient();
        const { error } = await supabase.storage
            .from('assets')
            .upload(fileName, buffer, { contentType, upsert: true });

        if (error) return null;

        const { data: urlData } = supabase.storage
            .from('assets')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch {
        return null;
    }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function getChannelData(username: string): Promise<{ memberCount: number | null, photoUrl: string | null }> {
    if (!telegramBotToken) return { memberCount: null, photoUrl: null };

    try {
        const cleanUsername = username
            .replace('@', '')
            .replace('https://t.me/', '')
            .replace('http://t.me/', '');

        // 1. Get Chat details (includes profile photo)
        const chatRes = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/getChat?chat_id=@${cleanUsername}`
        );
        const chatData = await chatRes.json();
        
        let photoUrl: string | null = null;
        if (chatData.ok && chatData.result?.photo?.big_file_id) {
            const fileRes = await fetch(
                `https://api.telegram.org/bot${telegramBotToken}/getFile?file_id=${chatData.result.photo.big_file_id}`
            );
            const fileData = await fileRes.json();
            if (fileData.ok && fileData.result?.file_path) {
                photoUrl = `https://api.telegram.org/file/bot${telegramBotToken}/${fileData.result.file_path}`;
            }
        }

        // 2. Get Member Count
        const countRes = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/getChatMemberCount?chat_id=@${cleanUsername}`
        );
        const countData = await countRes.json();

        let memberCount: number | null = null;
        if (countData.ok && typeof countData.result === 'number') {
            memberCount = countData.result;
        }

        return { memberCount, photoUrl };
    } catch (error) {
        console.error(`[GET_DATA] Error for ${username}:`, error);
        return { memberCount: null, photoUrl: null };
    }
}

export async function GET(request: NextRequest) {
    if (!telegramBotToken) {
        return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 200 });
    }

    try {
        const supabase = getAdminClient();

        // Sadece 25 kanalı seç (Serverless fonksiyon timeout süresini aşmamak için)
        // En eski güncellenenleri (updated_at ASC) seçiyoruz ki sırayla hepsi güncellensin
        const { data: channels, error: fetchError } = await supabase
            .from('channels')
            .select('id, name, join_link, image')
            .order('updated_at', { ascending: true, nullsFirst: true })
            .limit(25);

        if (fetchError) {
            console.error('Supabase Fetch Error:', fetchError);
            throw fetchError;
        }

        console.log(`[MEMBER_COUNT] Processing ${channels?.length || 0} channels`);

        let updated = 0;
        let failed = 0;
        let imagesMigrated = 0;
        const results = [];

        for (const channel of channels || []) {
            // Extract username from link
            const username = channel.join_link
                ?.replace('https://t.me/', '')
                ?.replace('http://t.me/', '')
                ?.replace('@', '');

            if (!username) {
                failed++;
                results.push({ name: channel.name, status: 'skipped_no_username' });
                continue;
            }

            const { memberCount, photoUrl } = await getChannelData(username);

            // Build update payload
            const updatePayload: any = {};

            if (memberCount !== null) {
                updatePayload.member_count = memberCount;
                updatePayload.updated_at = new Date().toISOString();
            }

            // Persist Telegram CDN image to Supabase Storage
            if (photoUrl) {
                // Her zaman taze fotoğrafı çekip kaydetmeyi dene
                const persistedUrl = await persistImage(photoUrl, channel.id);
                if (persistedUrl && persistedUrl !== channel.image) {
                    updatePayload.image = persistedUrl;
                    imagesMigrated++;
                    console.log(`[IMAGE_UPDATE] ${channel.name}: photo updated`);
                }
            } else if (isTelegramCdn(channel.image)) {
                // Taze fotoğraf alınamadıysa ama mevcut olan CDN linkiyse, onu kurtarmayı dene
                const persistedUrl = await persistImage(channel.image, channel.id);
                if (persistedUrl) {
                    updatePayload.image = persistedUrl;
                    imagesMigrated++;
                    console.log(`[IMAGE_PERSIST] ${channel.name}: old cdn migrated`);
                }
            }

            // Apply update if there's anything to update
            if (Object.keys(updatePayload).length > 0) {
                const { error: updateError } = await supabase
                    .from('channels')
                    .update(updatePayload)
                    .eq('id', channel.id);

                if (!updateError) {
                    updated++;
                    results.push({ name: channel.name, status: 'updated', count: memberCount });
                } else {
                    failed++;
                    results.push({ name: channel.name, status: 'failed_db_update' });
                }
            } else {
                failed++;
                results.push({ name: channel.name, status: 'failed_telegram_api' });
            }

            // Rate limiting - wait 200ms between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return NextResponse.json({
            success: true,
            updated,
            failed,
            imagesMigrated,
            total: channels?.length || 0,
            results
        });

    } catch (error: any) {
        console.error('[MEMBER_COUNT] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            details: error, // Should serialize if it's a POJO
            env: {
                hasBotToken: !!telegramBotToken,
                // hasSupabaseUrl: !!supabaseUrl,
                // hasServiceKey: !!supabaseServiceKey
            }
        }, { status: 200 }); // Return 200 to see body in simple curl
    }
}
