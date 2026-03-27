import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton pattern for admin/service role client
let adminInstance: SupabaseClient | null = null;

export const getAdminClient = (): SupabaseClient => {
    if (adminInstance) return adminInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('CRITICAL: Supabase Admin Keys missing!');
        // Return dummy client to prevent crash, but admin actions will fail (which is better than server crash)
        return createClient('https://placeholder.supabase.co', 'placeholder', {
            auth: { persistSession: false }
        });
    }

    adminInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
    return adminInstance;
};
