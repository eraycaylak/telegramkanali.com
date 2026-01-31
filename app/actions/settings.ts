'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { supabase as publicClient } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Admin client for writes
const adminClient = getAdminClient();

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
