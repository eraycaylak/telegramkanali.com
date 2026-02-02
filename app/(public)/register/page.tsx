'use client';

import { useState } from 'react';
import { signUp } from '@/app/actions/auth';
import Link from 'next/link';
import { Mail, Lock, UserPlus, AlertCircle, User, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await signUp(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center bg-white p-10 rounded-2xl border border-green-100 shadow-xl shadow-green-100/30">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-600 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Harika! Kayıt Başarılı</h2>
                    <p className="text-gray-600 mb-8">
                        Hesabınız oluşturuldu. E-posta kutunuzu kontrol ederek hesabınızı doğrulamanız gerekebilir (Ayarlarınıza bağlı olarak).
                    </p>
                    <Link href="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Hesap Oluştur</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Zaten hesabınız var mı?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
                            Giriş Yap
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                name="full_name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Ad Soyad"
                            />
                        </div>
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
                                placeholder="Şifreniz (En az 6 karakter)"
                                min={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 shadow-lg shadow-blue-200"
                        >
                            {loading ? 'Kayıt Yapılıyor...' : (
                                <>
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Kayıt Ol
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
