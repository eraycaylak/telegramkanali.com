'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';
import { submitChannel } from '@/app/actions/submit';
import { createUsdtPayment, USDT_PACKAGES } from '@/app/actions/usdt';
import { Send, CheckCircle2, AlertCircle, MessageCircle, Zap, Crown, Triangle, Copy, Check } from 'lucide-react';
import LegalTermsModal from '@/components/LegalTermsModal';

interface Props {
    categories: Category[];
}

const CONTACT_TYPES = [
    { value: 'kanal_ekle', label: '📡 Kanal / Grup Ekle', desc: 'Telegram kanalımı veya grubumu dizine eklemek istiyorum.' },
    { value: 'reklam_talebi', label: '📢 Reklam Satın Al', desc: 'Kanalımı öne çıkarmak için reklam paketi almak istiyorum.' },
    { value: 'soru_oneri', label: '💬 Soru / Öneri', desc: 'Platforma dair sorum veya önerim var.' },
    { value: 'diger', label: '📋 Diğer', desc: 'Başka bir konuda iletişime geçmek istiyorum.' },
];

const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS || 'TRJ1q4N6eCt5q3oDmfSEfFHr7E6kBJ13pL';

function KanalEkleClientInner({ categories }: Props) {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const paketParam = searchParams.get('paket');

    const [contactType, setContactType] = useState(
        typeParam === 'reklam' ? 'reklam_talebi' : 'kanal_ekle'
    );
    const [selectedPackage, setSelectedPackage] = useState(paketParam || 'neon');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeParam === 'reklam') setContactType('reklam_talebi');
        if (paketParam && USDT_PACKAGES[paketParam as keyof typeof USDT_PACKAGES]) {
            setSelectedPackage(paketParam);
        }
    }, [typeParam, paketParam]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        formData.set('contact_type', contactType);

        let res: { success?: boolean; error?: string };

        if (contactType === 'reklam_talebi') {
            formData.set('package_id', selectedPackage);
            res = await createUsdtPayment(formData);
        } else {
            res = await submitChannel(formData);
        }

        if (res.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage(res.error || 'Bir hata oluştu.');
        }
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(USDT_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const pkg = USDT_PACKAGES[selectedPackage as keyof typeof USDT_PACKAGES];

    if (status === 'success') {
        const isReklam = contactType === 'reklam_talebi';
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-green-600 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                    {isReklam ? 'Başvurunuz Alındı!' : 'Başvurunuz Alındı!'}
                </h2>
                <p className="text-green-700 max-w-md mx-auto">
                    {isReklam
                        ? 'Ödemenizi doğruladıktan sonra reklam kampanyanız 24 saat içinde aktive edilecek. Telegram üzerinden bildirim alacaksınız.'
                        : 'Kanalınız başarıyla sisteme kaydedildi. Editörlerimiz onayladıktan sonra sitede görünecektir. Teşekkür ederiz!'}
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-bold"
                >
                    Anasayfaya Dön
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">

            {/* ── İletişim Türü Seçimi ── */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">Ne yapmak istiyorsunuz? *</label>
                <div className="grid sm:grid-cols-2 gap-3">
                    {CONTACT_TYPES.map((ct) => (
                        <button
                            key={ct.value}
                            type="button"
                            onClick={() => setContactType(ct.value)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                                contactType === ct.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="font-bold text-sm">{ct.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{ct.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── REKLAM TALEBI AKIŞI ── */}
                {contactType === 'reklam_talebi' && (
                    <>
                        {/* Paket Seçimi */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Reklam Paketi *</label>
                            <div className="grid gap-3">
                                {Object.values(USDT_PACKAGES).map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelectedPackage(p.id)}
                                        className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                                            selectedPackage === p.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-2xl mt-0.5">{p.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-gray-900">{p.name}</span>
                                                <span className="text-xs text-gray-500">{p.tagline}</span>
                                                <span className="ml-auto font-black text-emerald-700 text-lg">${p.amount_usdt}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                                            <p className="text-xs text-emerald-700 font-bold mt-1">👁 {p.total_views.toLocaleString('tr-TR')} gösterim</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* USDT Ödeme Alanı */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">💎</span>
                                <h3 className="font-black text-gray-900">USDT Ödeme (TRC-20)</h3>
                                <span className="ml-auto bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full">${pkg?.amount_usdt} USDT</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">Aşağıdaki adrese tam olarak <strong>${pkg?.amount_usdt} USDT</strong> (TRC-20 / Tron ağı) gönderin, ardından TX hash'ini forma girin.</p>
                            <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl p-3">
                                <code className="text-xs text-gray-800 font-mono break-all flex-1">{USDT_ADDRESS}</code>
                                <button
                                    type="button"
                                    onClick={copyAddress}
                                    className="shrink-0 p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition"
                                    title="Kopyala"
                                >
                                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-emerald-600" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">⚠️ Yalnızca TRC-20 (Tron) ağını kullanın. Farklı ağdan gönderilen ödemeler kaybolur.</p>
                        </div>

                        {/* TX Hash */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">TX Hash (İşlem Kimliği)</label>
                            <input
                                name="tx_hash"
                                placeholder="Örn: abc123def456... (isteğe bağlı, ödeme sonrası ekleyebilirsiniz)"
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ödeme yaptıktan sonra işlem kimliğini buraya girin veya boş bırakın.</p>
                        </div>

                        {/* Reklam verilecek kanal */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reklam Verilecek Kanal Adı *</label>
                                <input
                                    required
                                    name="channel_name"
                                    placeholder="Örn: Kripto Haber Kanalı"
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kanal Linki *</label>
                                <input
                                    required
                                    name="channel_link"
                                    placeholder="t.me/kanaliniz"
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Reklam Mesajı (opsiyonel) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Reklam Metni / Özel Not <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                            <textarea
                                name="ad_message"
                                rows={3}
                                placeholder="Reklamınızda öne çıkarılmasını istediğiniz bilgiler..."
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                        </div>
                    </>
                )}

                {/* ── KANAL EKLE / SORU / DİĞER AKIŞI ── */}
                {contactType === 'kanal_ekle' && (
                    <>
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

                        {/* Açıklama */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
                            <textarea
                                name="description"
                                rows={3}
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
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        Kullanım Şartları
                                    </button>
                                    'nı okudum, içeriğimin T.C. yasalarına (kumar, bahis, müstehcenlik vb.) aykırı olmadığını taahhüt ederim.
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
                    </>
                )}

                {/* ── SORU / DİĞER AKIŞI ── */}
                {(contactType === 'soru_oneri' || contactType === 'diger') && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mesajınız *</label>
                        <textarea
                            required
                            name="notes"
                            rows={5}
                            placeholder="Sorunuzu veya önerinizi buraya yazın..."
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                )}

                {/* ── ORTAK: İletişim Bilgileri ── */}
                <div className="grid md:grid-cols-2 gap-6">
                    {contactType !== 'kanal_ekle' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Adınız / Takma Adınız *</label>
                            <input
                                required
                                name="contact_name"
                                placeholder="Örn: Ahmet"
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Telegram Kullanıcı Adı *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                            <input
                                required
                                name={contactType === 'kanal_ekle' ? 'telegram_contact' : 'contact_telegram'}
                                placeholder="kullaniciadi"
                                className="w-full border border-gray-300 rounded-xl pl-8 pr-3 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <p className="text-xs text-orange-600 mt-1 font-medium">⚠️ Doğru girmezseniz size ulaşamayız.</p>
                    </div>
                    {contactType === 'kanal_ekle' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-posta Adresi *</label>
                            <input
                                required
                                type="email"
                                name="email_contact"
                                placeholder="ornek@mail.com"
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                            <p className="text-xs text-gray-500 mt-1">Sadece yöneticiler görebilir.</p>
                        </div>
                    )}
                    {contactType === 'reklam_talebi' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">E-posta <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                            <input
                                type="email"
                                name="contact_email"
                                placeholder="ornek@mail.com"
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    )}
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
                    className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 ${
                        contactType === 'reklam_talebi'
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                    }`}
                >
                    {status === 'loading' ? (
                        <>Gönderiliyor...</>
                    ) : (
                        <>
                            <Send size={20} />
                            {contactType === 'reklam_talebi' ? 'Reklam Başvurusu Gönder' : 'Başvuruyu Gönder'}
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                    * 5651 Sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi Hakkında Kanun uyarınca,{' '}
                    <br />işlemleriniz IP adresi ve cihaz bilgileri ile birlikte kayıt altına alınmaktadır.
                </p>
            </form>

            <LegalTermsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default function KanalEkleClient({ categories }: Props) {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Yükleniyor...</div>}>
            <KanalEkleClientInner categories={categories} />
        </Suspense>
    );
}
