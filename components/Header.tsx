import React from 'react';
import { getCategories } from '@/lib/data';
import HeaderClient from './HeaderClient';
import DynamicLogo from './DynamicLogo';
import { Category } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function Header() {
    let categories: Category[] = [];

    // Fetch Categories
    try {
        categories = await getCategories();
    } catch (error) {
        console.error('Header categories fetch error:', error);
    }

    // Fetch User
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <React.Suspense fallback={<div className="h-16 bg-[#333]"></div>}>
            <HeaderClient categories={categories} logo={<DynamicLogo />} user={user} />
        </React.Suspense>
    );
}
