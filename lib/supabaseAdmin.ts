import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getAdminClient = (): SupabaseClient => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('CRITICAL: Supabase Admin Keys missing! Falling back to Anon Client for development.');
        // Return client with ANON key to allow standard RLS reads. Do not cache this.
        return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
            auth: { persistSession: false }
        });
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
};

// Export a dynamic proxy so top-level imports evaluate at runtime, solving the Netlify build cache bug
export const adminClient = new Proxy({} as SupabaseClient, {
    get: (target, prop) => {
        const client = getAdminClient();
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    }
});
