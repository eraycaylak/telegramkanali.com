import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton pattern for admin/service role client
let adminInstance: SupabaseClient | null = null;

export const getAdminClient = (): SupabaseClient => {
    if (adminInstance) return adminInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('CRITICAL: Supabase Admin Keys missing! Falling back to Anon Client for development.');
        // Return client with ANON key to prevent crash (ENOTFOUND) and allow standard RLS reads.
        return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
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
