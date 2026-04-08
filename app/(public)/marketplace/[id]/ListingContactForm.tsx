'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { MessageCircle, Send, LogIn, DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
    listingId: string;
    sellerId: string;
    isLoggedIn: boolean;
    userId?: string;
}

export default function ListingContactForm({ listingId, sellerId, isLoggedIn, userId }: Props) {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isLoggedIn) {
        return (
            <div className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <LogIn size={24} className="mx-auto mb-2 text-violet-400" />
                <div className="text-sm font-bold text-white mb-1">Teklif vermek için giriş yap</div>
                <div className="text-xs text-slate-500 mb-3">Ücretsiz kayıt ol, satıcıya ulaş</div>
                <Link href={`/login?redirect=/marketplace/${listingId}`}
                    className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white w-full"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    <LogIn size={15} />
                    Giriş Yap / Kayıt Ol
                </Link>
            </div>
        );
    }

    if (userId === sellerId) {
        return (
            <div className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="text-sm font-bold text-amber-400">Bu sizin ilanınız</div>
                <div className="text-xs text-slate-500 mt-1">Kendi ilanınıza teklif veremezsiniz</div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="rounded-xl p-5 text-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400" />
                <div className="text-sm font-bold text-white mb-1">Teklifiniz gönderildi!</div>
                <div className="text-xs text-slate-400">
                    Satıcı bilgilendirildi. Telegram&apos;ımız üzerinden takip edebilirsiniz.
                </div>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) {
            setError('Lütfen bir mesaj yazın');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Session al
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push(`/login?redirect=/marketplace/${listingId}`);
                return;
            }

            // Order oluştur
            const agreedPrice = offerPrice ? parseFloat(offerPrice) : null;

            if (agreedPrice && agreedPrice > 0) {
                const { data: order, error: orderErr } = await supabase
                    .from('marketplace_orders')
                    .insert({
                        listing_id: listingId,
                        buyer_id: userId,
                        seller_id: sellerId,
                        agreed_price: agreedPrice,
                        currency: 'USDT',
                        status: 'pending',
                    })
                    .select()
                    .single();

                if (orderErr) throw orderErr;

                // Mesaj ekle
                if (order) {
                    await supabase
                        .from('marketplace_messages')
                        .insert({
                            order_id: order.id,
                            listing_id: listingId,
                            sender_id: userId,
                            receiver_id: sellerId,
                            content: message.trim(),
                        });
                }
            }

            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError('Bir hata oluştu, tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Teklif Fiyatı (Opsiyonel)
                </label>
                <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="number"
                        value={offerPrice}
                        onChange={e => setOfferPrice(e.target.value)}
                        placeholder="Teklif fiyatınızı yazın..."
                        min={0}
                        className="w-full rounded-xl pl-8 pr-4 py-2.5 text-sm text-white outline-none"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Mesajınız <span className="text-red-400">*</span>
                </label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Satıcıya mesajınızı yazın... (deneyiminiz, satın alma amacınız vb.)"
                    rows={3}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    }}
                />
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Gönderiliyor...
                    </>
                ) : (
                    <>
                        <Send size={16} />
                        Teklif Gönder
                    </>
                )}
            </button>

            <p className="text-center text-[10px] text-slate-600">
                Teklifiniz platforma iletilecek. Escrow korumasıyla güvendesiniz.
            </p>
        </form>
    );
}
