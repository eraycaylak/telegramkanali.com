import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton pattern
let supabaseInstance: SupabaseClient | null = null;

export const supabase = (() => {
    if (supabaseInstance) return supabaseInstance;

    if (!supabaseUrl || !supabaseKey) {
        console.error('CRITICAL: Supabase environment variables are missing!');
        // Return a dummy client that warns but doesn't crash the app immediately on import
        // This allows error boundaries to render instead of a hard 500 on module load
        return createClient('https://placeholder.supabase.co', 'placeholder', {
            auth: { persistSession: false }
        });
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        }
    });

    return supabaseInstance;
})();
