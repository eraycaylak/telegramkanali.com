import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { channel_id, vote_type } = await req.json()

        if (!channel_id || !vote_type) {
            throw new Error('Missing channel_id or vote_type')
        }

        // 1. Get current score
        const { data: channel, error: fetchError } = await supabase
            .from('channels')
            .select('score')
            .eq('id', channel_id)
            .single()

        if (fetchError) throw fetchError

        // 2. Update score
        const newScore = (channel.score || 0) + vote_type

        const { error: updateError } = await supabase
            .from('channels')
            .update({ score: newScore })
            .eq('id', channel_id)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({ newScore }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
