import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Singleton pattern for admin/service role client
let adminInstance: SupabaseClient | null = null;

export const getAdminClient = (): SupabaseClient => {
    if (!adminInstance) {
        adminInstance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });
    }
    return adminInstance;
};
