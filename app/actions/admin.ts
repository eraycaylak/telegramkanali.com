'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize Service Role Client for Admin actions (Bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export async function deleteChannel(channelId: string) {
    if (!channelId) return { error: 'Channel ID required' };

    try {
        const { error } = await adminClient
            .from('channels')
            .delete()
            .eq('id', channelId);

        if (error) throw error;

        revalidatePath('/'); // Revalidate home
        revalidatePath('/admin/dashboard'); // Revalidate dashboard
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { error: 'Failed to delete channel' };
    }
}

export async function addChannel(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const image = formData.get('image') as string;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Basic validation
    if (!name || !join_link) return { error: 'Name and Join Link are required' };

    try {
        const { error } = await adminClient
            .from('channels')
            .insert({
                name,
                description,
                join_link,
                slug,
                category_id,
                stats: { subscribers: '0' },
                image: image || '/images/logo.png',
                verified: false,
                featured: false
            });

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Add error:', error);
        return { error: 'Failed to add channel' };
    }
}

export async function deleteCategory(id: string) {
    if (!id) return { error: 'Category ID required' };

    try {
        const { error } = await adminClient
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Delete category error:', error);
        return { error: 'Failed to delete category' };
    }
}

export async function addCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const id = slug; // Use slug as ID for text primary key

    console.log('[CATEGORY] Adding category:', { id, name, slug, description, icon });

    if (!name) {
        console.error('[CATEGORY] Name is required');
        return { error: 'Name is required' };
    }

    try {
        const { data, error } = await adminClient
            .from('categories')
            .insert({
                id,
                name,
                description,
                icon,
                slug
            })
            .select();

        if (error) {
            console.error('[CATEGORY] Insert error:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('[CATEGORY] Success:', data);
        revalidatePath('/');
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error: any) {
        console.error('[CATEGORY] Exception:', error?.message || error);
        return { error: `Kategori eklenemedi: ${error?.message || 'Bilinmeyen hata'}` };
    }
}

export async function updateChannel(id: string, formData: FormData) {
    if (!id) return { error: 'ID required' };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const join_link = formData.get('join_link') as string;
    const category_id = formData.get('category_id') as string;
    const image = formData.get('image') as string;
    // Don't change slug on edit to preserve SEO, or handle carefully. For now, keep it.

    try {
        const { error } = await adminClient
            .from('channels')
            .update({
                name,
                description,
                join_link,
                category_id,
                image: image || '/images/logo.png',
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Update error:', error);
        return { error: 'Failed to update channel' };
    }
}

export async function scrapeTelegramInfo(url: string) {
    if (!url.includes('t.me/')) return { error: 'Geçersiz Telegram linki' };

    try {
        // Use t.me/s/channelname for preview which is SSR'd
        const previewUrl = url.replace('t.me/', 't.me/s/');
        const res = await fetch(previewUrl);
        const html = await res.text();

        // Simple regex scraping (robust enough for Telegram's standard meta tags)
        const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
        const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);

        // Decode HTML entities like &#33; -> !
        const decodeHtml = (str: string) => {
            return str
                .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
        };

        return {
            title: titleMatch ? decodeHtml(titleMatch[1]) : '',
            description: descMatch ? decodeHtml(descMatch[1]) : '',
            image: imageMatch ? imageMatch[1] : ''
        };
    } catch (error) {
        console.error('Scrape error:', error);
        return { error: 'Telegram verisi çekilemedi' };
    }
}

// Upload logo to Supabase Storage
export async function uploadLogo(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { error: 'Dosya bulunamadı' };
    }

    try {
        const fileName = `logo_${Date.now()}.${file.name.split('.').pop()}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Supabase Storage
        const { data, error } = await adminClient.storage
            .from('assets')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error('Upload error:', error);

            // If bucket doesn't exist, try to create it
            if (error.message?.includes('Bucket not found')) {
                return { error: 'Storage bucket "assets" bulunamadı. Supabase Dashboard\'dan oluşturun.' };
            }
            throw error;
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from('assets')
            .getPublicUrl(fileName);

        console.log('[UPLOAD] Success:', urlData.publicUrl);
        return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
        console.error('Upload exception:', error);
        return { error: `Yükleme hatası: ${error?.message || 'Bilinmeyen hata'}` };
    }
}
