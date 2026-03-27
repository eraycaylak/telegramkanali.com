import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client that bypasses RLS using the service role key.
 * 
 * NOTE: We intentionally do NOT cache/singleton this client, because module-level
 * singletons get initialised at BUILD TIME on Netlify, when env vars may not yet
 * be available, producing a "placeholder" client that persists for the lifetime
 * of the lambda and causes RLS errors on every request.
 * 
 * Server Actions are re-evaluated per-request in the Node.js runtime where env
 * vars ARE present, so the tiny overhead of createClient() per call is acceptable.
 */
export const getAdminClient = (): SupabaseClient => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error(
            'CRITICAL: Supabase Admin Keys missing!',
            'URL:', supabaseUrl ? 'OK' : 'MISSING',
            'Key:', supabaseServiceKey ? 'OK' : 'MISSING'
        );
        // Return a dummy client — callers will receive DB errors rather than crashing
        return createClient('https://placeholder.supabase.co', 'placeholder', {
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
