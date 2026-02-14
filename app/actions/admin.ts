'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// Initialize Service Role Client for Admin actions (Bypasses RLS)
const adminClient = getAdminClient();

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
    const score = parseInt(formData.get('score') as string) || 0;
    const owner_id = formData.get('owner_id') as string;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    console.log('[CHANNEL] Adding channel:', { name, slug, join_link, category_id, image, description, score });

    // Basic validation
    if (!name || !join_link) return { error: 'Ad ve Katılma Linki gereklidir' };

    try {
        // Telegram'dan kanal bilgilerini otomatik çek
        const { fetchTelegramChannelInfo } = await import('@/lib/telegram');
        const telegramInfo = await fetchTelegramChannelInfo(join_link);

        console.log('[CHANNEL] Telegram info:', telegramInfo);

        // Persist image to our storage
        const finalImage = await persistTelegramImage(
            image || telegramInfo?.photo_url || '/images/logo.png',
            slug
        );

        const finalDescription = description || telegramInfo?.description || '';
        const memberCount = telegramInfo?.member_count || 0;
        const subscriberStr = memberCount > 0 ? memberCount.toString() : '0';

        const insertData: any = {
            name,
            description: finalDescription,
            join_link,
            slug,
            stats: { subscribers: subscriberStr },
            image: finalImage,
            member_count: memberCount,
            score,
            owner_id: owner_id || null,
            verified: false,
            featured: false
        };

        // Eğer category_id boş ise, veritabanına gönderme (NULL olarak bırak)
        if (category_id && category_id.trim() !== '') {
            insertData.category_id = category_id;
        }

        console.log('[CHANNEL] Insert data:', insertData);

        const { data, error } = await adminClient
            .from('channels')
            .insert(insertData)
            .select();

        if (error) {
            console.error('[CHANNEL] Insert error:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('[CHANNEL] Success:', data);
        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true, telegramInfo };
    } catch (error: any) {
        console.error('[CHANNEL] Exception:', error?.message || error);
        return { error: `Kanal eklenemedi: ${error?.message || 'Bilinmeyen hata'}` };
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
    const score = parseInt(formData.get('score') as string) || 0;
    const owner_id = formData.get('owner_id') as string;

    // Don't change slug on edit to preserve SEO, or handle carefully. For now, keep it.

    try {
        const { error } = await adminClient
            .from('channels')
            .update({
                name,
                description,
                join_link,
                category_id,
                score,
                owner_id: owner_id || null,
                image: await persistTelegramImage(image || '/images/logo.png', id),
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

/**
 * Downloads a Telegram image and uploads it to our own storage to prevent expiration
 */
async function persistTelegramImage(url: string, slug: string): Promise<string> {
    if (!url || !url.startsWith('http') || url.includes('supabase.co')) return url;

    // Only persist if it's from Telegram or similar CDNs
    if (!url.includes('telesco.pe') && !url.includes('telegram') && !url.includes('t.me')) return url;

    try {
        console.log(`[STORAGE] Persisting image: ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Image fetch failed');

        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.split('/').pop() || 'jpg';
        const fileName = `channel_${slug}_${Date.now()}.${ext}`;

        const { error } = await adminClient.storage
            .from('assets')
            .upload(fileName, buffer, { contentType, upsert: true });

        if (error) throw error;

        const { data: urlData } = adminClient.storage
            .from('assets')
            .getPublicUrl(fileName);

        console.log(`[STORAGE] Persisted to: ${urlData.publicUrl}`);
        return urlData.publicUrl;
    } catch (err) {
        console.error('[STORAGE] Persistence error:', err);
        return url; // Fallback to original if upload fails
    }
}

/**
 * Tüm kanalları Telegram'dan güncelleyerek fotoğraf ve üye sayısını çeker
 * Admin panelinden çağrılacak
 */
export async function syncAllChannelsFromTelegram() {
    console.log('[SYNC] Starting bulk channel sync from Telegram...');

    try {
        // Tüm kanalları çek
        const { data: channels, error: fetchError } = await adminClient
            .from('channels')
            .select('id, name, join_link, image, member_count');

        if (fetchError) throw fetchError;
        if (!channels || channels.length === 0) {
            return { success: true, message: 'Güncellenecek kanal bulunamadı', updated: 0, failed: 0 };
        }

        console.log(`[SYNC] Found ${channels.length} channels to sync`);

        const { fetchTelegramChannelInfo } = await import('@/lib/telegram');

        let updated = 0;
        let failed = 0;
        const results: { id: string; name: string; status: string; photo?: string; members?: number }[] = [];

        // Her kanal için Telegram'dan bilgi çek
        for (const channel of channels) {
            try {
                console.log(`[SYNC] Processing: ${channel.name}`);

                const telegramInfo = await fetchTelegramChannelInfo(channel.join_link);

                if (telegramInfo) {
                    // Güncelleme verisi hazırla
                    const updateData: any = {};

                    // Fotoğraf güncelle (eğer Telegram'dan geldi ve mevcut boşsa veya temp ise)
                    const isTempImage = channel.image?.includes('telesco.pe') || !channel.image?.includes('supabase.co');

                    if (telegramInfo.photo_url && (!channel.image || channel.image === '/images/logo.png' || isTempImage)) {
                        updateData.image = await persistTelegramImage(telegramInfo.photo_url, channel.id);
                    }

                    // Üye sayısını güncelle (eğer Telegram'dan geldi)
                    if (telegramInfo.member_count > 0) {
                        updateData.member_count = telegramInfo.member_count;
                        updateData.stats = { subscribers: telegramInfo.member_count.toString() };
                    }

                    // Eğer güncellenecek bir şey varsa
                    if (Object.keys(updateData).length > 0) {
                        const { error: updateError } = await adminClient
                            .from('channels')
                            .update(updateData)
                            .eq('id', channel.id);

                        if (updateError) {
                            console.error(`[SYNC] Update error for ${channel.name}:`, updateError);
                            failed++;
                            results.push({ id: channel.id, name: channel.name, status: 'error' });
                        } else {
                            updated++;
                            results.push({
                                id: channel.id,
                                name: channel.name,
                                status: 'updated',
                                photo: updateData.image,
                                members: updateData.member_count
                            });
                        }
                    } else {
                        results.push({ id: channel.id, name: channel.name, status: 'skipped' });
                    }
                } else {
                    // Telegram'dan bilgi alınamadı (private kanal veya hata)
                    results.push({ id: channel.id, name: channel.name, status: 'no_info' });
                }

                // Rate limiting - Telegram'ı spam etmemek için 500ms bekle
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (channelError) {
                console.error(`[SYNC] Error processing ${channel.name}:`, channelError);
                failed++;
                results.push({ id: channel.id, name: channel.name, status: 'error' });
            }
        }

        console.log(`[SYNC] Complete. Updated: ${updated}, Failed: ${failed}`);

        revalidatePath('/');
        revalidatePath('/admin/dashboard');

        return {
            success: true,
            message: `Senkronizasyon tamamlandı. ${updated} kanal güncellendi, ${failed} hata oluştu.`,
            updated,
            failed,
            total: channels.length,
            results
        };

    } catch (error: any) {
        console.error('[SYNC] Bulk sync error:', error);
        return { error: `Senkronizasyon hatası: ${error?.message || 'Bilinmeyen hata'}` };
    }
}

/**
 * Tek bir kanalı Telegram'dan günceller
 */
export async function syncChannelFromTelegram(channelId: string) {
    try {
        // Kanal bilgisini çek
        const { data: channel, error: fetchError } = await adminClient
            .from('channels')
            .select('id, name, join_link, bot_enabled, telegram_chat_id')
            .eq('id', channelId)
            .single();

        if (fetchError || !channel) {
            return { error: 'Kanal bulunamadı' };
        }

        const { fetchTelegramChannelInfo, fetchChannelInfoViaBot } = await import('@/lib/telegram');

        let telegramInfo;
        if (channel.bot_enabled && channel.telegram_chat_id) {
            console.log(`[SYNC] Using Bot API for channel: ${channel.name}`);
            telegramInfo = await fetchChannelInfoViaBot(channel.telegram_chat_id);
        }

        // Fallback or scraping
        if (!telegramInfo) {
            console.log(`[SYNC] Using Scraping for channel: ${channel.name}`);
            telegramInfo = await fetchTelegramChannelInfo(channel.join_link);
        }

        if (!telegramInfo) {
            return { error: 'Telegram\'dan bilgi alınamadı' };
        }

        // Güncelle
        const updateData: any = {};

        if (telegramInfo.photo_url) {
            updateData.image = telegramInfo.photo_url;
        }

        if (telegramInfo.member_count > 0) {
            updateData.member_count = telegramInfo.member_count;
            updateData.stats = { subscribers: telegramInfo.member_count.toString() };
        }

        if (Object.keys(updateData).length === 0) {
            return { success: true, message: 'Güncellenecek bilgi bulunamadı' };
        }

        const { error: updateError } = await adminClient
            .from('channels')
            .update(updateData)
            .eq('id', channelId);

        if (updateError) throw updateError;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');

        return {
            success: true,
            message: 'Kanal güncellendi',
            data: { ...telegramInfo, ...updateData }
        };

    } catch (error: any) {
        return { error: `Güncelleme hatası: ${error?.message || 'Bilinmeyen hata'}` };
    }
}


export async function approveChannel(id: string) {
    if (!id) return { error: 'ID required' };

    try {
        const { error } = await adminClient
            .from('channels')
            .update({ status: 'approved' })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Approve error:', error);
        return { error: 'Failed to approve channel' };
    }
}

export async function rejectChannel(id: string) {
    if (!id) return { error: 'ID required' };

    try {
        const { error } = await adminClient
            .from('channels')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Reject error:', error);
        return { error: 'Failed to reject channel' };
    }
}

export async function addChannelByUrl(url: string, categoryId: string) {
    const cleanUrl = url.trim();
    if (!cleanUrl) return { error: 'Link gereklidir' };

    console.log(`[ADMIN] Adding single channel by URL: ${cleanUrl}`);

    try {
        const { fetchTelegramChannelInfo } = await import('@/lib/telegram');

        // Check if exists
        const { data: existing } = await adminClient
            .from('channels')
            .select('id')
            .eq('join_link', cleanUrl)
            .single();

        if (existing) {
            return { status: 'exists', message: 'Zaten mevcut' };
        }

        const telegramInfo = await fetchTelegramChannelInfo(cleanUrl);

        if (!telegramInfo) {
            return { error: 'Telegram bilgisi çekilemedi' };
        }

        const name = telegramInfo.title;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

        const finalImage = await persistTelegramImage(
            telegramInfo.photo_url || '/images/logo.png',
            slug
        );

        const insertData: any = {
            name,
            description: telegramInfo.description || '',
            join_link: cleanUrl,
            slug,
            stats: { subscribers: telegramInfo.member_count.toString() },
            image: finalImage,
            member_count: telegramInfo.member_count,
            category_id: categoryId,
            status: 'approved',
            score: 0,
            verified: false,
            featured: false
        };

        const { error } = await adminClient.from('channels').insert(insertData);

        if (error) throw error;

        revalidatePath('/');
        revalidatePath('/admin/dashboard');

        return { success: true, name };
    } catch (err: any) {
        console.error(`[ADMIN] Error adding ${url}:`, err);
        return { error: err.message || 'Bilinmeyen hata' };
    }
}

// ========================
// BLOG ACTIONS
// ========================

export async function getAllBlogPostsAdmin() {
    const { data, error } = await adminClient
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[ADMIN] Error fetching blog posts:', error);
        return [];
    }
    return data || [];
}

export async function getBlogPostById(id: string) {
    const { data, error } = await adminClient
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data;
}

export async function addBlogPost(formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const cover_image = formData.get('cover_image') as string;
    const category = formData.get('category') as string;
    const tagsStr = formData.get('tags') as string;
    const author = (formData.get('author') as string) || 'Admin';
    const published = formData.get('published') === 'true';
    const featured = formData.get('featured') === 'true';
    const meta_title = formData.get('meta_title') as string;
    const meta_description = formData.get('meta_description') as string;

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Calculate reading time (~200 words/min)
    const wordCount = content.split(/\s+/).length;
    const reading_time = Math.max(1, Math.ceil(wordCount / 200));

    const { data, error } = await adminClient
        .from('blog_posts')
        .insert({
            title,
            slug,
            excerpt,
            content,
            cover_image: cover_image || null,
            category: category || null,
            tags,
            author,
            published,
            featured,
            reading_time,
            meta_title: meta_title || title,
            meta_description: meta_description || excerpt,
        })
        .select()
        .single();

    if (error) {
        console.error('[ADMIN] Error adding blog post:', error);
        return { error: error.message };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return { success: true, data };
}

export async function updateBlogPost(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const cover_image = formData.get('cover_image') as string;
    const category = formData.get('category') as string;
    const tagsStr = formData.get('tags') as string;
    const author = (formData.get('author') as string) || 'Admin';
    const published = formData.get('published') === 'true';
    const featured = formData.get('featured') === 'true';
    const meta_title = formData.get('meta_title') as string;
    const meta_description = formData.get('meta_description') as string;

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    const wordCount = content.split(/\s+/).length;
    const reading_time = Math.max(1, Math.ceil(wordCount / 200));

    const { error } = await adminClient
        .from('blog_posts')
        .update({
            title,
            slug,
            excerpt,
            content,
            cover_image: cover_image || null,
            category: category || null,
            tags,
            author,
            published,
            featured,
            reading_time,
            meta_title: meta_title || title,
            meta_description: meta_description || excerpt,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('[ADMIN] Error updating blog post:', error);
        return { error: error.message };
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath('/admin/blog');
    return { success: true };
}

export async function deleteBlogPost(id: string) {
    const { error } = await adminClient
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[ADMIN] Error deleting blog post:', error);
        return { error: error.message };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return { success: true };
}

export async function toggleBlogPublish(id: string, published: boolean) {
    const { error } = await adminClient
        .from('blog_posts')
        .update({ published, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('[ADMIN] Error toggling blog publish:', error);
        return { error: error.message };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return { success: true };
}

export async function uploadBlogImage(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'Dosya bulunamadı' };

    const ext = file.name.split('.').pop();
    const fileName = `blog/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await adminClient.storage
        .from('images')
        .upload(fileName, file, {
            cacheControl: '31536000',
            upsert: false,
        });

    if (error) {
        console.error('[ADMIN] Error uploading blog image:', error);
        return { error: error.message };
    }

    const { data: urlData } = adminClient.storage
        .from('images')
        .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
}
