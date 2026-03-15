import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('slug');

        if (error) {
            return NextResponse.json([], { status: 500 });
        }

        return NextResponse.json(data?.map(c => c.slug) || []);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
