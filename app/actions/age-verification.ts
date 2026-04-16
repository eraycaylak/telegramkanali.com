'use server';

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Kullanıcının gerçek IP'sini al (proxy/CDN destekli)
async function getUserIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    '0.0.0.0'
  );
}

/**
 * Kullanıcının +18 onayı verip vermediğini kontrol et
 * IP bazlı, 30 günlük geçerlilik
 */
export async function checkAgeVerification(): Promise<boolean> {
  try {
    const ip = await getUserIP();
    const { data } = await supabase
      .from('age_verifications')
      .select('id, expires_at')
      .eq('ip_address', ip)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Kullanıcı +18 olduğunu onayladı — kayıt oluştur
 * TCK 226/7 uyumluluk kaydı
 */
export async function recordAgeVerification(channelId?: string): Promise<{ success: boolean }> {
  try {
    const headersList = await headers();
    const ip = await getUserIP();
    const userAgent = headersList.get('user-agent') || '';

    // Önce mevcut geçerli kayıt var mı kontrol et
    const { data: existing } = await supabase
      .from('age_verifications')
      .select('id')
      .eq('ip_address', ip)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (existing) {
      // Zaten onay var, geçerlilik süresini yenile
      await supabase
        .from('age_verifications')
        .update({ expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', existing.id);
      return { success: true };
    }

    // Yeni onay kaydı oluştur
    const { error } = await supabase.from('age_verifications').insert({
      ip_address: ip,
      user_agent: userAgent,
      channel_id: channelId || null,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      console.error('[AgeVerification] DB error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error('[AgeVerification] Error:', err);
    return { success: false };
  }
}
