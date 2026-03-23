'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { submitChannel } from '@/app/actions/submit';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    categories: Category[];
}

export default function KanalEkleClient({ categories }: Props) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setStatus('loading');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const res = await submitChannel(formData);

        if (res.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage(res.error || 'Bir hata oluştu.');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-green-600 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Başvurunuz Alındı!</h2>
                <p className="text-green-700">
                    Kanalınız başarıyla sisteme kaydedildi. Editörlerimiz onayladıktan sonra sitede görünecektir.
                    Teşekkür ederiz!
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Anasayfaya Dön
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Kanal Adı */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kanal / Grup Adı *</label>
                    <input
                        required
                        name="name"
                        placeholder="Örn: Güncel Haberler"
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                {/* Link + Kategori */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">t.me Linki *</label>
                        <input
                            required
                            name="join_link"
                            placeholder="t.me/kanaliniz"
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kategori *</label>
                        <select
                            required
                            name="category_id"
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                        >
                            <option value="">Seçiniz...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* İletişim Alanları — Zorunlu */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Telegram Kullanıcı Adı *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                            <input
                                required
                                name="telegram_contact"
                                placeholder="kullaniciadi"
                                className="w-full border border-gray-300 rounded-xl pl-8 pr-3 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Sizinle Telegram üzerinden iletişime geçeceğiz.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            E-posta Adresi *
                        </label>
                        <input
                            required
                            type="email"
                            name="email_contact"
                            placeholder="ornek@mail.com"
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                        <p className="text-xs text-gray-500 mt-1">Sadece yöneticiler görebilir, 3. kişilerle paylaşılmaz.</p>
                    </div>
                </div>

                {/* Açıklama */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
                    <textarea
                        name="description"
                        rows={4}
                        placeholder="Kanalınız hakkında kısa bilgi..."
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                {/* Onay Kutuları */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="terms_accepted"
                            value="true"
                            required
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            <a href="/kullanim-sartlari" target="_blank" className="font-bold text-blue-600 hover:underline">Kullanım Şartları</a>'nı okudum, içeriğimin T.C. yasalarına (kumar, bahis, müstehcenlik vb.) aykırı olmadığını taahhüt ederim.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="privacy_accepted"
                            value="true"
                            required
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                            <a href="/gizlilik" target="_blank" className="font-bold text-blue-600 hover:underline">KVKK Aydınlatma Metni ve Gizlilik Politikası</a>'nı okudum, iletişim ve kayıt verilerimin işlenmesine onay veriyorum.
                        </span>
                    </label>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="flex-shrink-0" />
                        <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {status === 'loading' ? (
                        <>Gönderiliyor...</>
                    ) : (
                        <>
                            <Send size={20} />
                            Başvuruyu Gönder
                        </>
                    )}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                    * 5651 Sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Hakkında Kanun uyarınca, 
                    <br />işlemleriniz IP adresi ve cihaz bilgileri ile birlikte kayıt altına alınmaktadır.
                </p>
            </form>
        </div>
    );
}
