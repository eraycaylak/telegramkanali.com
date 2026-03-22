import React from 'react';
import { getCategories, getNewChannels } from '@/lib/data';
import HeaderClient from './HeaderClient';
import DynamicLogo from './DynamicLogo';
import { Category, Channel } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function Header() {
    let categories: Category[] = [];
    let recentChannels: Channel[] = [];

    // Fetch Categories and Recent Channels
    try {
        [categories, recentChannels] = await Promise.all([
            getCategories(),
            getNewChannels()
        ]);
        // Limit recent channels to max 5 for the notification bell
        recentChannels = recentChannels.slice(0, 5);
    } catch (error) {
        console.error('Header categories/channels fetch error:', error);
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
            <HeaderClient categories={categories} logo={<DynamicLogo />} user={user} recentChannels={recentChannels} />
        </React.Suspense>
    );
}
