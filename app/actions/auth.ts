'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminClient } from '@/lib/supabaseAdmin';

// Supabase hata mesajlarını Türkçeleştir
function translateError(msg: string): string {
    const map: Record<string, string> = {
        'This endpoint requires a valid Bearer token': 'Sunucu yapılandırma hatası. Lütfen site yöneticisiyle iletişime geçin.',
        'User already registered': 'Bu e-posta adresi zaten kayıtlı.',
        'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır.',
        'Invalid login credentials': 'E-posta veya şifre hatalı.',
        'Email not confirmed': 'E-posta adresiniz henüz doğrulanmamış.',
        'Signup requires a valid password': 'Geçerli bir şifre giriniz.',
        'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı.',
        'Email rate limit exceeded': 'Çok fazla deneme yaptınız. Lütfen biraz bekleyin.',
        'For security purposes, you can only request this after': 'Güvenlik nedeniyle lütfen biraz bekleyip tekrar deneyin.',
    };
    for (const [en, tr] of Object.entries(map)) {
        if (msg.includes(en)) return tr;
    }
    return msg;
}

async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function signUp(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('full_name') as string;
    const legalTerms = formData.get('legal_terms') === 'on';

    if (!legalTerms) {
        return { error: 'Kullanıcı Sözleşmesini kabul etmeniz zorunludur.' };
    }

    const metadata = {
        full_name: fullName,
        legal_terms_accepted: true,
        legal_terms_accepted_at: new Date().toISOString()
    };

    const supabase = await createClient();

    // Service role key varsa admin API kullan (email onayı otomatik, rate limit yok)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = getAdminClient();
        const { error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata,
        });

        if (createError) return { error: translateError(createError.message) };

        // Kullanıcıyı hemen oturum açtır
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) return { error: translateError(signInError.message) };
    } else {
        // Service role key yoksa standart signUp kullan (anon key ile çalışır)
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: 'https://telegramkanali.com/login',
            },
        });

        if (signUpError) return { error: translateError(signUpError.message) };

        // Eğer email doğrulaması gerekiyorsa kullanıcıyı bilgilendir
        if (data?.user?.identities?.length === 0) {
            return { error: 'Bu e-posta adresi zaten kayıtlı.' };
        }
    }

    revalidatePath('/');
    return { success: true };
}

export async function signIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { error: translateError(error.message) };

    revalidatePath('/dashboard');
    return { success: true };
}

export async function adminSignIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) return { error: authError.message };

    // Eğer Vercel tarafında SUPABASE_SERVICE_ROLE_KEY ayarlanmamışsa, anonim client üzerinden kendi profiline bakılır
    let profile, dbError;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = getAdminClient();
        const res = await adminClient.from('profiles').select('role').eq('id', authData.user.id).single();
        profile = res.data;
        dbError = res.error;
    } else {
        const res = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
        profile = res.data;
        dbError = res.error;
    }

    if (profile?.role !== 'admin' && profile?.role !== 'editor') {
        const errorDetail = dbError ? dbError.message : (profile ? `Rolünüz: ${profile.role}` : 'Profil bulunamadı veya Env keys eksik');
        await supabase.auth.signOut();
        return { error: `Bu panele erişim yetkiniz yok. (Detay: ${errorDetail})` };
    }

    revalidatePath('/admin/dashboard');
    return {
        success: true,
        role: profile.role,
        userId: authData.user.id
    };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    redirect('/');
}

export async function resendVerificationEmail(email: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: 'https://telegramkanali.com',
        },
    });

    if (error) return { error: error.message };
    return { success: true };
}
