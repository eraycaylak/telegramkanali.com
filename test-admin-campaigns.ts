import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function test() {
    const { data, error } = await supabase
        .from('ad_campaigns')
        .select(`
        id,
        ad_type,
        total_views,
        current_views,
        status,
        tokens_spent,
        created_at,
        user_id,
        channels:channel_id (name, slug),
        profiles:user_id (id, full_name, email)
    `)
        .order('created_at', { ascending: false });

    console.log(error);
    console.log(data);
}

test();
