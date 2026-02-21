'use server';

import { getAdminClient } from '@/lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const adminClient = getAdminClient();

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
    await adminClient.from('token_transactions').insert({
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

    // Get pricing
    const { data: pricing } = await adminClient
        .from('ad_pricing')
        .select('*')
        .eq('id', data.pricingId)
        .single();

    if (!pricing) return { error: 'Fiyatlandırma bulunamadı.' };

    // Check balance
    const { data: profile } = await adminClient
        .from('profiles')
        .select('token_balance')
        .eq('id', userId)
        .single();

    const currentBalance = profile?.token_balance || 0;

    if (currentBalance < pricing.tokens_required) {
        return { error: `Yetersiz jeton. Gereken: ${pricing.tokens_required}, Mevcut: ${currentBalance}` };
    }

    // Deduct tokens
    const newBalance = currentBalance - pricing.tokens_required;

    const { error: balanceError } = await adminClient
        .from('profiles')
        .update({ token_balance: newBalance })
        .eq('id', userId);

    if (balanceError) {
        console.error('[TOKENS] Balance deduction error:', balanceError);
        return { error: 'Jeton düşülürken hata oluştu.' };
    }

    // Create campaign
    const campaignData: any = {
        user_id: userId,
        channel_id: data.channelId,
        ad_type: data.adType,
        total_views: pricing.views,
        current_views: 0,
        tokens_spent: pricing.tokens_required,
        status: 'active',
    };

    // Story tipi için süre bazlı
    if (data.adType === 'story') {
        campaignData.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 gün
    }

    const { data: campaign, error: campaignError } = await adminClient
        .from('ad_campaigns')
        .insert(campaignData)
        .select()
        .single();

    if (campaignError) {
        console.error('[TOKENS] Campaign creation error:', campaignError);
        // Refund tokens on failure
        await adminClient
            .from('profiles')
            .update({ token_balance: currentBalance })
            .eq('id', userId);
        return { error: 'Kampanya oluşturulamadı.' };
    }

    // Log transaction
    await adminClient.from('token_transactions').insert({
        user_id: userId,
        type: 'spend',
        amount: -pricing.tokens_required,
        description: `${data.adType === 'featured' ? 'Öne Çıkarma' : data.adType === 'banner' ? 'Banner' : 'Hikaye'} Reklam - ${pricing.tokens_required} Jeton (${pricing.label})`,
        reference_id: campaign.id,
        balance_after: newBalance,
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/ads');
    return { success: true, campaignId: campaign.id };
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
            channels:channel_id (name, image, slug)
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
            channels:channel_id (id, name, image, slug, join_link, description, member_count, category_id)
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
