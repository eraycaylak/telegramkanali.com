import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { categories, channels } from '../lib/data';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🌱 Seeding Categories...');

    // Transform categories if needed, strict typing might require matching exact DB columns
    const categoryRows = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        subcategories: c.subcategories
    }));

    const { error: catError } = await supabase
        .from('categories')
        .upsert(categoryRows);

    if (catError) {
        console.error('Error seeding categories:', catError);
        return;
    }

    console.log('✅ Categories seeded.');

    console.log('🌱 Seeding Channels...');

    const channelRows = channels.map(c => ({
        // ID in data.ts is '1', '2' etc. UUIDs are better but text is fine if definition matches.
        // My SQL defined ID as UUID default gen_random_uuid().
        // If I want to keep existing IDs I need to change DB schema to text or valid UUID.
        // '1', '2' are not valid UUIDs.
        // I will let DB generate UUIDs and ignore the ID from data.ts, 
        // OR I will change schema to text. 
        // Changing schema to text is easier for migration to preserve IDs if referenced elsewhere?
        // But data.ts IDs are just '1', '2'. Let's drop them and let Supabase generate UUIDs.
        // OR better, generate deterministic UUIDs? No, just let it generate.

        name: c.name,
        slug: c.slug,
        description: c.description,
        category_id: c.category_id,
        subcategories: c.subcategories,
        join_link: c.join_link,
        stats: c.stats,
        image: c.image,
        tags: c.tags,
        verified: c.verified,
        featured: c.featured,
        language: c.language,
        rating: c.rating || 0
    }));

    const { error: chanError } = await supabase
        .from('channels')
        .upsert(channelRows, { onConflict: 'slug' }); // Use slug as unique identifier for upsert

    if (chanError) {
        console.error('Error seeding channels:', chanError);
        return;
    }

    console.log('✅ Channels seeded.');
}

seed();
