import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This API route updates member counts for all channels
// Can be called manually or via cron job service like cron-job.org

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

async function getChannelMemberCount(username: string): Promise<number | null> {
    if (!telegramBotToken) return null;

    try {
        // Remove @ or https://t.me/ if present
        const cleanUsername = username
            .replace('@', '')
            .replace('https://t.me/', '')
            .replace('http://t.me/', '');

        const response = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/getChatMemberCount?chat_id=@${cleanUsername}`
        );

        const data = await response.json();

        if (data.ok && typeof data.result === 'number') {
            return data.result;
        }

        console.log(`[MEMBER_COUNT] Failed for @${cleanUsername}:`, data.description);
        return null;
    } catch (error) {
        console.error(`[MEMBER_COUNT] Error for ${username}:`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    if (!telegramBotToken) {
        return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 200 });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Get all channels with their usernames
        const { data: channels, error: fetchError } = await supabase
            .from('channels')
            .select('id, name, join_link')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Supabase Fetch Error:', fetchError);
            throw fetchError;
        }

        console.log(`[MEMBER_COUNT] Processing ${channels?.length || 0} channels`);

        let updated = 0;
        let failed = 0;
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

            const memberCount = await getChannelMemberCount(username);

            if (memberCount !== null) {
                const { error: updateError } = await supabase
                    .from('channels')
                    .update({
                        member_count: memberCount,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', channel.id);

                if (!updateError) {
                    updated++;
                    results.push({ name: channel.name, status: 'updated', count: memberCount });
                } else {
                    failed++;
                    results.push({ name: channel.name, status: 'failed_db_update', error: updateError });
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
                hasSupabaseUrl: !!supabaseUrl,
                hasServiceKey: !!supabaseServiceKey
            }
        }, { status: 200 }); // Return 200 to see body in simple curl
    }
}
