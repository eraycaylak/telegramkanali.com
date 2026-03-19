'use client';

import { useState } from 'react';
import { signIn } from '@/app/actions/auth';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await signIn(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            window.location.href = '/dashboard';
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Giriş Yap</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Hesabınız yok mu?{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
                            Hemen Kayıt Ol
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="E-posta Adresiniz"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Şifreniz"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex flex-col gap-2 text-sm animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                            {error.includes('Email not confirmed') && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const form = document.querySelector('form');
                                        const email = new FormData(form!).get('email') as string;
                                        if (!email) return alert('Lütfen email adresinizi girin.');

                                        const { resendVerificationEmail } = await import('@/app/actions/auth');
                                        const res = await resendVerificationEmail(email);
                                        if (res.error) alert(res.error);
                                        else alert('Doğrulama maili tekrar gönderildi!');
                                    }}
                                    className="ml-7 text-left text-xs font-bold underline hover:text-red-800"
                                >
                                    Doğrulama mailini tekrar gönder
                                </button>
                            )}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 shadow-lg shadow-blue-200"
                        >
                            {loading ? 'Giriş Yapılıyor...' : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Giriş Yap
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
