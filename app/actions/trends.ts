'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

// Dynamically instantiate the client per-request to avoid Vercel build-time caching placeholders
const adminClient = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getAdminClient();
        return client[prop as keyof typeof client];
    }
});


import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

// ========================
// TREND CATEGORY ACTIONS
// ========================

export async function getTrendCategories() {
    const { data, error } = await supabase
        .from('trend_categories')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getTrendCategories error:', error);
        return [];
    }
    return data;
}

export async function addTrendCategory(formData: FormData) {
    const name = formData.get('name') as string;
    const order_index = parseInt(formData.get('order_index') as string) || 0;
    const subcatsRaw = formData.get('subcategories') as string;

    if (!name) return { error: 'Kategori adı gereklidir.' };

    const slug = slugify(name);
    let subcategories: string[] = [];
    if (subcatsRaw) {
        subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
        const { data, error } = await adminClient
            .from('trend_categories')
            .insert({ name, slug, order_index, subcategories })
            .select();

        if (error) throw error;

        revalidatePath('/admin/trends');
        revalidatePath('/trends');
        return { success: true, data };
    } catch (err: any) {
        console.error('addTrendCategory error:', err);
        return { error: err.message || 'Kategori eklenemedi.' };
    }
}

export async function updateTrendCategory(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const order_index = parseInt(formData.get('order_index') as string) || 0;
    const subcatsRaw = formData.get('subcategories') as string;

    if (!id || !name) return { error: 'ID ve Kategori adı gereklidir.' };

    const slug = slugify(name);
    let subcategories: string[] = [];
    if (subcatsRaw) {
        subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
        const { error } = await adminClient
            .from('trend_categories')
            .update({ name, slug, order_index, subcategories })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/trends');
        revalidatePath('/trends');
        return { success: true };
    } catch (err: any) {
        console.error('updateTrendCategory error:', err);
        return { error: err.message || 'Kategori güncellenemedi.' };
    }
}

export async function deleteTrendCategory(id: string) {
    if (!id) return { error: 'ID gereklidir.' };

    try {
        const { error } = await adminClient
            .from('trend_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/trends');
        revalidatePath('/trends');
        return { success: true };
    } catch (err: any) {
        console.error('deleteTrendCategory error:', err);
        return { error: err.message || 'Kategori silinemedi.' };
    }
}

// ========================
// TREND ACTIONS
// ========================

export async function getTrendsAdmin() {
    // Use public client — anon has full read access via RLS so service_role is not required
    const { data, error } = await supabase
        .from('trends')
        .select('*, trend_categories(name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getTrendsAdmin error:', error);
        return [];
    }
    return data;
}

export async function addTrend(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category_id = formData.get('category_id') as string;
    const subcategory = formData.get('subcategory') as string;
    const is_active = formData.get('is_active') === 'true';

    if (!title || !category_id) {
        return { error: 'Başlık ve Kategori gereklidir.' };
    }

    // Prepare slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
        const { data } = await getAdminClient().from('trends').select('id').eq('slug', slug).single();
        if (data) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        } else {
            slugExists = false;
        }
    }

    try {
        // Handle Image upload if any
        let image = '';
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0) {
            const ext = imageFile.name.split('.').pop() || 'jpg';
            const fileName = `trend_${slug}_${Date.now()}.${ext}`;
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            const { error: uploadError } = await getAdminClient().storage
                .from('assets')
                .upload(fileName, buffer, { contentType: imageFile.type, upsert: true });

            if (uploadError) {
                console.error('[TREND] Image upload error:', uploadError.message);
                // Sessizce devam etme — hata döndür
                return { error: `Resim yüklenemedi: ${uploadError.message}` };
            } else {
                const { data: urlData } = getAdminClient().storage.from('assets').getPublicUrl(fileName);
                image = urlData.publicUrl;
            }
        } else {
            image = formData.get('image') as string || '';
        }

        const { data, error } = await adminClient
            .from('trends')
            .insert({
                title,
                slug,
                content,
                category_id,
                subcategory,
                image,
                is_active
            })
            .select();

        if (error) throw error;

        revalidatePath('/admin/trends');
        revalidatePath('/trends');
        return { success: true, data };
    } catch (err: any) {
        console.error('addTrend error:', err);
        return { error: err.message || 'Trend eklenemedi.' };
    }
}

export async function updateTrend(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category_id = formData.get('category_id') as string;
    const subcategory = formData.get('subcategory') as string;
    const is_active = formData.get('is_active') === 'true';

    if (!title || !category_id) {
        return { error: 'Başlık ve Kategori gereklidir.' };
    }

    try {
        // Handle Image upload if any
        let image = formData.get('image') as string || '';
        const imageFile = formData.get('imageFile') as File;
        if (imageFile && imageFile.size > 0) {
            const ext = imageFile.name.split('.').pop() || 'jpg';
            const fileName = `trend_${id}_${Date.now()}.${ext}`;
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            const { error: uploadError } = await getAdminClient().storage
                .from('assets')
                .upload(fileName, buffer, { contentType: imageFile.type, upsert: true });

            if (uploadError) {
                console.error('[TREND] Image upload error:', uploadError.message);
                return { error: `Resim yüklenemedi: ${uploadError.message}` };
            } else {
                const { data: urlData } = getAdminClient().storage.from('assets').getPublicUrl(fileName);
                image = urlData.publicUrl;
            }
        }

        const { data, error } = await adminClient
            .from('trends')
            .update({
                title,
                content,
                category_id,
                subcategory,
                image,
                is_active
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        revalidatePath('/admin/trends');
        revalidatePath('/trends');
        if (data && data[0]) {
            revalidatePath(`/trends/${data[0].slug}`);
        }
        return { success: true, data };
    } catch (err: any) {
        console.error('updateTrend error:', err);
        return { error: err.message || 'Trend güncellenemedi.' };
    }
}

export async function deleteTrend(id: string) {
    if (!id) return { error: 'ID gereklidir.' };

    try {
        const { data, error } = await adminClient
            .from('trends')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        revalidatePath('/admin/trends');
        revalidatePath('/trends');
        if (data && data[0]) {
            revalidatePath(`/trends/${data[0].slug}`);
        }
        return { success: true };
    } catch (err: any) {
        console.error('deleteTrend error:', err);
        return { error: err.message || 'Trend silinemedi.' };
    }
}
