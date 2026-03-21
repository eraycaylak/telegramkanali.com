const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const slug = 'aleyna-kalaycioglu-neden-trend-oldu-2026-guncel';
    console.log('Testing slug:', slug);
    
    const { data, error } = await supabase
        .from('trends')
        .select('*, trend_categories(name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
        
    console.log('Data:', data);
    console.log('Error:', error);
}

test();
