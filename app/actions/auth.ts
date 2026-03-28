'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminClient } from '@/lib/supabaseAdmin';

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

    // Admin client ile kullanıcı oluştur — email rate limit yok, otomatik onaylı
    const adminClient = getAdminClient();
    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Email onayını otomatik geçir
        user_metadata: { 
            full_name: fullName,
            legal_terms_accepted: true,
            legal_terms_accepted_at: new Date().toISOString()
        },
    });

    if (createError) return { error: createError.message };

    // Kullanıcıyı hemen oturum açtır
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) return { error: signInError.message };

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

    if (error) return { error: error.message };

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
