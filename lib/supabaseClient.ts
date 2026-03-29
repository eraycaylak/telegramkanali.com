import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Universal Supabase client - works in both server and browser environments
// Using createClient from @supabase/supabase-js (NOT createBrowserClient from @supabase/ssr)
// because this module is imported by Server Components (lib/data.ts) that run on Node.js
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
