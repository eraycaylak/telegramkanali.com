'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin client for writes
const adminClient = createClient(supabaseUrl, supabaseServiceKey);
// Public client for reads
const publicClient = createClient(supabaseUrl, supabaseAnonKey);

export async function getSetting(key: string): Promise<string | null> {
    try {
        const { data, error } = await publicClient
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error || !data) return null;
        return data.value;
    } catch {
        return null;
    }
}

export async function getAllSettings(): Promise<Record<string, any>> {
    try {
        const { data, error } = await publicClient
            .from('settings')
            .select('key, value');

        if (error || !data) return {};

        const settings: Record<string, any> = {};
        data.forEach(row => {
            settings[row.key] = row.value;
        });
        return settings;
    } catch {
        return {};
    }
}

export async function saveSetting(key: string, value: any) {
    try {
        const { error } = await adminClient
            .from('settings')
            .upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'key'
            });

        if (error) {
            console.error('[SETTINGS] Save error:', error);
            return { error: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('[SETTINGS] Exception:', error);
        return { error: error?.message || 'Bilinmeyen hata' };
    }
}

export async function saveAllSettings(settings: Record<string, any>) {
    try {
        const upsertData = Object.entries(settings).map(([key, value]) => ({
            key,
            value,
            updated_at: new Date().toISOString()
        }));

        const { error } = await adminClient
            .from('settings')
            .upsert(upsertData, { onConflict: 'key' });

        if (error) {
            console.error('[SETTINGS] Save all error:', error);
            return { error: error.message };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('[SETTINGS] Exception:', error);
        return { error: error?.message || 'Bilinmeyen hata' };
    }
}
