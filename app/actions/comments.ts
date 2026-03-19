'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function getComments(channelId: string) {
    try {
        const { data: comments, error } = await supabase
            .from('channel_comments')
            .select('*')
            .eq('channel_id', channelId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
            return { error: 'Yorumlar yüklenirken bir hata oluştu.' };
        }

        return { comments };
    } catch (err: any) {
        console.error('Exception fetching comments:', err);
        return { error: 'Sunucu hatası oluştu.' };
    }
}

export async function addComment(channelId: string, authorName: string, content: string) {
    if (!authorName.trim() || !content.trim()) {
        return { error: 'Ad ve yorum alanı boş bırakılamaz.' };
    }

    try {
        const { error } = await supabase
            .from('channel_comments')
            .insert({
                channel_id: channelId,
                author_name: authorName.trim(),
                content: content.trim(),
                status: 'pending' // Admin approval required by default
            });

        if (error) {
            console.error('Error adding comment:', error);
            return { error: 'Yorumunuz gönderilirken bir hata oluştu.' };
        }

        return { success: true, message: 'Yorumunuz başarıyla alındı ve onay sürecine eklendi.' };
    } catch (err: any) {
        console.error('Exception adding comment:', err);
        return { error: 'Sunucu hatası. Yorumunuz gönderilemedi.' };
    }
}
