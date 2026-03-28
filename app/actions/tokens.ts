'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';

// Dynamically instantiate the client per-request to avoid Vercel build-time caching placeholders
const adminClient = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getAdminClient();
        return client[prop as keyof typeof client];
    }
});


import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper: Get authenticated user ID from server-side session
async function getAuthUserId(): Promise<string | null> {
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
    return user?.id || null;
}

// ========================
// TOKEN PACKAGES
// ========================

export async function getTokenPackages() {
    const { data, error } = await adminClient
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('[TOKENS] Error fetching packages:', error);
        return [];
    }
    return data || [];
}

// ========================
// AD PRICING
// ========================

export async function getAdPricing(adType?: string) {
    let query = adminClient
        .from('ad_pricing')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (adType) {
        query = query.eq('ad_type', adType);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[TOKENS] Error fetching ad pricing:', error);
        return [];
    }
    return data || [];
}

// ========================
// TOKEN PURCHASE (Manual approval - admin grants tokens)
// ========================

export async function purchaseTokens(packageId: string) {
    const userId = await getAuthUserId();
    if (!userId) return { error: 'Oturum açmanız gerekiyor.' };

    // Get package info
    const { data: pkg } = await adminClient
        .from('token_packages')
        .select('*')
        .eq('id', packageId)
        .single();

    if (!pkg) return { error: 'Paket bulunamadı.' };

    // Get current balance
    const { data: profile } = await adminClient
        .from('profiles')
        .select('token_balance')
        .eq('id', userId)
        .single();

    const currentBalance = profile?.token_balance || 0;
    const newBalance = currentBalance + pkg.tokens;

    // Update balance
    const { error: updateError } = await adminClient
        .from('profiles')
        .update({ token_balance: newBalance })
        .eq('id', userId);

    if (updateError) {
        console.error('[TOKENS] Balance update error:', updateError);
        return { error: 'Bakiye güncellenemedi.' };
    }

    // Log transaction
    await getAdminClient().from('token_transactions').insert({
        user_id: userId,
        type: 'purchase',
        amount: pkg.tokens,
        description: `${pkg.tokens} Jeton Satın Alma (${pkg.price_tl} TL)`,
        balance_after: newBalance,
    });

    revalidatePath('/dashboard');
    return { success: true, newBalance };
}

// ========================
// CREATE AD CAMPAIGN
// ========================

export async function createAdCampaign(data: {
    channelId: string;
    adType: 'featured' | 'banner' | 'story';
    pricingId: string;
}) {
    const userId = await getAuthUserId();
    if (!userId) return { error: 'Oturum açmanız gerekiyor.' };

    // Verify channel ownership
    const { data: channel } = await adminClient
        .from('channels')
        .select('id, name, owner_id')
        .eq('id', data.channelId)
        .single();

    if (!channel) return { error: 'Kanal bulunamadı.' };
    if (channel.owner_id !== userId) return { error: 'Bu kanal size ait değil.' };

    // Get pricing details for notifications
    const { data: pricing } = await adminClient
        .from('ad_pricing')
        .select('*')
        .eq('id', data.pricingId)
        .single();

    if (!pricing) return { error: 'Fiyatlandırma bulunamadı.' };

    // Atomik olarak jetonları düş ve kampanyayı oluştur (TOCTOU race condition önleme)
    const { data: campaignId, error: rpcError } = await getAdminClient().rpc('create_ad_campaign_atomic', {
        p_user_id: userId,
        p_channel_id: data.channelId,
        p_ad_type: data.adType,
        p_pricing_id: data.pricingId
    });

    if (rpcError) {
        console.error('[TOKENS] RPC Campaign creation error:', rpcError);
        if (rpcError.message.includes('insufficient_funds')) return { error: 'Yetersiz jeton.' };
        if (rpcError.message.includes('invalid_pricing')) return { error: 'Fiyatlandırma bilgisi geçersiz veya pasif.' };
        return { error: 'Kampanya oluşturulamadı.' };
    }

    // Try to send a Telegram notification to the Admin
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminId = process.env.TELEGRAM_ADMIN_ID;

        // Get user email for notification
        const { data: userProfile } = await adminClient
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();
        const userEmail = userProfile?.email || 'Bilinmeyen Kullanıcı';

        if (botToken && adminId) {
            const message = `🔔 *Yeni Reklam Kampanyası Bekliyor!*\n\n` +
                `👤 Kullanıcı: ${userEmail}\n` +
                `📺 Tip: ${data.adType.toUpperCase()}\n` +
                `👁️ Hedef Gösterim: ${pricing.views}\n` +
                `💰 Bütçe: ${pricing.tokens_required} Jeton\n\n` +
                `👉 Lütfen onaylamak veya reddetmek için admin paneline gidin: https://telegramkanali.com/admin/campaigns`; // Replace with actual admin URL

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            console.log("Admin notification sent to Telegram.");
        } else {
            console.log("Admin notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_ID missing.");
        }
    } catch (err) {
        console.error("Failed to send admin notification:", err);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/ads');
    return { success: true, campaignId: campaignId };
}

// ========================
// GET USER CAMPAIGNS
// ========================

export async function getUserCampaigns() {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const { data, error } = await adminClient
        .from('ad_campaigns')
        .select(`
            *,
            channels (name, image, slug)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[TOKENS] Error fetching campaigns:', error);
        return [];
    }
    return data || [];
}

// ========================
// USER TOGGLE CAMPAIGN STATUS
// ========================

export async function toggleCampaignStatus(campaignId: string) {
    const userId = await getAuthUserId();
    if (!userId) return { error: 'Oturum açmanız gerekiyor.' };

    const { data: campaign, error: fetchError } = await adminClient
        .from('ad_campaigns')
        .select('id, user_id, status')
        .eq('id', campaignId)
        .single();

    if (fetchError || !campaign) {
        return { error: 'Kampanya bulunamadı.' };
    }

    if (campaign.user_id !== userId) {
        return { error: 'Bu kampanya size ait değil.' };
    }

    if (campaign.status !== 'active' && campaign.status !== 'paused') {
        return { error: 'Sadece aktif veya duraklatılmış kampanyalar değiştirilebilir.' };
    }

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';

    const { error: updateError } = await adminClient
        .from('ad_campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

    if (updateError) {
        console.error('[TOKENS] Status update error:', updateError);
        return { error: 'Durum güncellenemedi.' };
    }

    revalidatePath('/dashboard/ads');
    return { success: true, newStatus };
}

// ========================
// USER DELETE CAMPAIGN
// ========================

export async function deleteAdCampaign(campaignId: string) {
    const userId = await getAuthUserId();
    if (!userId) return { error: 'Oturum açmanız gerekiyor.' };

    const { error: rpcError } = await getAdminClient().rpc('delete_ad_campaign_atomic', {
        p_campaign_id: campaignId,
        p_user_id: userId
    });

    if (rpcError) {
        console.error('[TOKENS] RPC Delete error:', rpcError);
        if (rpcError.message.includes('not_found')) return { error: 'Kampanya bulunamadı veya size ait değil.' };
        if (rpcError.message.includes('invalid_status')) return { error: 'Sadece beklemedeki veya iptal edilmiş kampanyalar silinebilir.' };
        return { error: 'Kampanya silinemedi. Lütfen tekrar deneyin.' };
    }

    revalidatePath('/dashboard/ads');
    return { success: true };
}

// ========================
// ADMIN CAMPAIGN MANAGEMENT
// ========================

export async function getAdminCampaigns() {
    const userId = await getAuthUserId();
    console.log('[TOKENS] getAdminCampaigns - userId:', userId);

    if (!userId) {
        console.log('[TOKENS] getAdminCampaigns - NOT AUTHENTICATED');
        return [];
    }

    // Auth Check Let's ensure user is admin/editor
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    console.log('[TOKENS] getAdminCampaigns - user profile role:', profile?.role);

    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
        console.log('[TOKENS] getAdminCampaigns - UNAUTHORIZED ROLE');
        return [];
    }

    const { data, error } = await adminClient
        .from('ad_campaigns')
        .select(`
        id,
        ad_type,
        total_views,
        current_views,
        status,
        tokens_spent,
        created_at,
        user_id,
        channels (name, slug),
        profiles (id, full_name, email)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[TOKENS] Admin fetch campaigns error:', error);
        return [];
    }

    console.log(`[TOKENS] getAdminCampaigns - Retrieved ${data?.length || 0} campaigns`);
    return data || [];
}

export async function adminUpdateCampaignStatus(campaignId: string, newStatus: string) {
    const userId = await getAuthUserId();
    if (!userId) return { error: 'Oturum açmanız gerekiyor.' };

    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
        return { error: 'Yetkiniz yok.' };
    }

    // Eğer admin, beklemedeki kampanyayı iptal/reddediyorsa, kullanıcıya jeton iadesi yapılmalı
    if (newStatus === 'cancelled') {
        const { data: campaign } = await adminClient
            .from('ad_campaigns')
            .select('user_id, status')
            .eq('id', campaignId)
            .single();

        if (campaign && campaign.status === 'pending') {
            const { error: rpcError } = await getAdminClient().rpc('refund_ad_campaign_atomic', {
                p_campaign_id: campaignId,
                p_user_id: campaign.user_id
            });
            
            if (rpcError) {
                console.error('[TOKENS] Admin refund error:', rpcError);
                return { error: 'İptal ve iade işlemi başarısız oldu.' };
            }
            revalidatePath('/admin/campaigns');
            return { success: true };
        }
    }

    const { error } = await adminClient
        .from('ad_campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

    if (error) {
        console.error('[TOKENS] Admin Status update error:', error);
        return { error: 'Durum güncellenemedi.' };
    }

    revalidatePath('/admin/campaigns');
    return { success: true };
}

// ========================
// GET USER TRANSACTIONS
// ========================

export async function getUserTransactions() {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const { data, error } = await adminClient
        .from('token_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('[TOKENS] Error fetching transactions:', error);
        return [];
    }
    return data || [];
}

// ========================
// GET TOKEN BALANCE
// ========================

export async function getTokenBalance() {
    const userId = await getAuthUserId();
    if (!userId) return 0;

    const { data } = await adminClient
        .from('profiles')
        .select('token_balance')
        .eq('id', userId)
        .single();

    return data?.token_balance || 0;
}

// ========================
// TRACK AD VIEW (called from client when ad is displayed)
// ========================

export async function trackAdView(campaignId: string) {
    if (!campaignId) return;

    try {
        // Get current campaign
        const { data: campaign } = await adminClient
            .from('ad_campaigns')
            .select('id, current_views, total_views, status, ad_type, expires_at')
            .eq('id', campaignId)
            .eq('status', 'active')
            .single();

        if (!campaign) return;

        // Check story expiration
        if (campaign.ad_type === 'story' && campaign.expires_at) {
            if (new Date(campaign.expires_at) < new Date()) {
                await adminClient
                    .from('ad_campaigns')
                    .update({ status: 'completed' })
                    .eq('id', campaignId);
                return;
            }
        }

        const newViews = campaign.current_views + 1;
        const isCompleted = newViews >= campaign.total_views && campaign.total_views > 0;

        await adminClient
            .from('ad_campaigns')
            .update({
                current_views: newViews,
                status: isCompleted ? 'completed' : 'active',
                updated_at: new Date().toISOString(),
            })
            .eq('id', campaignId);
    } catch (error) {
        console.error('[TOKENS] View tracking error:', error);
    }
}

// ========================
// GET ACTIVE ADS FOR DISPLAY (public - used by frontend to show ads)
// ========================

export async function getActiveAds(adType: 'featured' | 'banner' | 'story', categoryId?: string) {
    const { data, error } = await adminClient
        .from('ad_campaigns')
        .select(`
            id,
            ad_type,
            total_views,
            current_views,
            expires_at,
            channels (id, name, image, slug, join_link, description, member_count, category_id)
        `)
        .eq('ad_type', adType)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('[TOKENS] Error fetching active ads:', error);
        return [];
    }

    // Filter by category if specified
    let filtered = data || [];
    if (categoryId) {
        filtered = filtered.filter((ad: any) => ad.channels?.category_id === categoryId);
    }

    // Filter out expired story ads
    const now = new Date();
    filtered = filtered.filter((ad: any) => {
        if (ad.ad_type === 'story' && ad.expires_at && new Date(ad.expires_at) < now) {
            // Auto-complete expired stories
            adminClient
                .from('ad_campaigns')
                .update({ status: 'completed' })
                .eq('id', ad.id);
            return false;
        }
        return true;
    });

    return filtered;
}
