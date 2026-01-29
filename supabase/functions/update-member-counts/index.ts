// Supabase Edge Function to update Telegram channel member counts
// Runs daily via cron job

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramResponse {
    ok: boolean
    result?: {
        member_count?: number
        title?: string
        description?: string
        photo?: {
            big_file_id?: string
        }
    }
    description?: string
}

async function getChannelInfo(username: string, botToken: string): Promise<{ memberCount: number | null; error?: string }> {
    try {
        // Remove @ if present
        const cleanUsername = username.replace('@', '').replace('https://t.me/', '');

        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/getChatMemberCount?chat_id=@${cleanUsername}`
        );

        const data: TelegramResponse = await response.json();

        if (data.ok && data.result) {
            return { memberCount: data.result.member_count || null };
        }

        return { memberCount: null, error: data.description || 'Unknown error' };
    } catch (error) {
        return { memberCount: null, error: String(error) };
    }
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

        if (!telegramBotToken) {
            return new Response(
                JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get all channels
        const { data: channels, error: fetchError } = await supabase
            .from('channels')
            .select('id, username, member_count')
            .order('created_at', { ascending: false });

        if (fetchError) {
            throw fetchError;
        }

        console.log(`[UPDATE] Processing ${channels?.length || 0} channels`);

        let updated = 0;
        let failed = 0;
        const results: any[] = [];

        // Process each channel
        for (const channel of channels || []) {
            if (!channel.username) continue;

            const { memberCount, error } = await getChannelInfo(channel.username, telegramBotToken);

            if (memberCount !== null) {
                // Update the channel
                const { error: updateError } = await supabase
                    .from('channels')
                    .update({
                        member_count: memberCount,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', channel.id);

                if (!updateError) {
                    updated++;
                    results.push({ id: channel.id, username: channel.username, memberCount, status: 'updated' });
                } else {
                    failed++;
                    results.push({ id: channel.id, username: channel.username, error: updateError.message, status: 'failed' });
                }
            } else {
                failed++;
                results.push({ id: channel.id, username: channel.username, error, status: 'api_error' });
            }

            // Rate limiting - wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`[UPDATE] Complete: ${updated} updated, ${failed} failed`);

        return new Response(
            JSON.stringify({
                success: true,
                updated,
                failed,
                total: channels?.length || 0,
                results
            }),
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
