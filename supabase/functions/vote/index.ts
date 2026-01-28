
// supabase/functions/vote/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { channel_id, vote_type } = await req.json();
        // Get Client IP (Supabase passes this header)
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        if (!channel_id || !vote_type) {
            throw new Error("Missing parameters");
        }

        // Initialize Supabase Client with Service Role (Admin)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Check if voted
        const { data: existingVote, error: checkError } = await supabase
            .from("channel_votes")
            .select("id")
            .eq("channel_id", channel_id)
            .eq("voter_ip", clientIp)
            .single();

        if (existingVote) {
            return new Response(
                JSON.stringify({ error: "Bu kanal için zaten oy kullandınız." }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 2. Register Vote
        const { error: insertError } = await supabase
            .from("channel_votes")
            .insert({
                channel_id: channel_id,
                voter_ip: clientIp,
                vote_type: vote_type, // 1 or -1
            });

        if (insertError) throw insertError;

        // 3. Update Channel Score (RPC or simple increment)
        // Simple increment for now. Ideally use an RPC for atomicity but this is fine for MVP.
        // Fetch current score
        const { data: channel } = await supabase
            .from("channels")
            .select("score")
            .eq("id", channel_id)
            .single();

        const newScore = (channel?.score || 0) + vote_type;

        await supabase
            .from("channels")
            .update({ score: newScore })
            .eq("id", channel_id);

        return new Response(
            JSON.stringify({ success: true, newScore }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
