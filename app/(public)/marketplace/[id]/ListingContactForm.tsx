'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { MessageCircle, Send, LogIn, DollarSign, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
    listingId: string;
    sellerId: string;
    isLoggedIn: boolean;
    userId?: string;
    askingPrice?: number;
    currency?: string;
}

export default function ListingContactForm({ listingId, sellerId, isLoggedIn, userId, askingPrice, currency }: Props) {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [offerCurrency, setOfferCurrency] = useState(currency === 'STARS' ? 'STARS' : 'USDT');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState('');

    if (!isLoggedIn) {
        return (
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <LogIn size={22} color="#7c3aed" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>Teklif vermek için giriş yap</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Ücretsiz hesap aç, satıcıyla konuş</div>
                <Link href={`/login?redirect=/marketplace/${listingId}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: '#fff', fontWeight: 800, fontSize: 13,
                    padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
                }}>
                    <LogIn size={14} /> Giriş Yap / Kayıt Ol
                </Link>
            </div>
        );
    }

    if (userId === sellerId) {
        return (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>Bu sizin ilanınız</div>
                <div style={{ fontSize: 12, color: '#78716c', marginTop: 4 }}>Kendi ilanınıza teklif veremezsiniz.</div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <CheckCircle2 size={26} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 800, fontSize: 14, color: '#15803d', marginBottom: 4 }}>Teklifiniz gönderildi!</div>
                <div style={{ fontSize: 12, color: '#16a34a', marginBottom: 16 }}>{success}</div>
                <Link href="/dashboard/mesajlar" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13,
                    padding: '8px 18px', borderRadius: 8, textDecoration: 'none',
                }}>
                    <MessageCircle size={14} /> Sohbete Git <ArrowRight size={13} />
                </Link>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) { setError('Lütfen bir mesaj yazın'); return; }

        setLoading(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push(`/login?redirect=/marketplace/${listingId}`); return; }

            const price = offerPrice ? parseFloat(offerPrice) : (askingPrice || 0);
            const curr = offerCurrency || 'USDT';

            // 1. Sipariş oluştur (her mesaj bir sipariş/konuşma açar)
            const { data: order, error: orderErr } = await supabase
                .from('marketplace_orders')
                .insert({
                    listing_id: listingId,
                    buyer_id: userId,
                    seller_id: sellerId,
                    agreed_price: price,
                    currency: curr,
                    status: 'pending',
                })
                .select()
                .single();

            if (orderErr) throw orderErr;

            // 2. İlk mesajı kaydet
            const { error: msgErr } = await supabase
                .from('marketplace_messages')
                .insert({
                    order_id: order.id,
                    listing_id: listingId,
                    sender_id: userId,
                    receiver_id: sellerId,
                    content: message.trim(),
                    is_system: false,
                });

            if (msgErr) throw msgErr;

            setSuccess(`Teklif sohbeti açıldı. Satıcı yanıt verdiğinde bildirim alırsınız.`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu, tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Teklif fiyatı */}
            <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Teklif Fiyatı (Opsiyonel)
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <DollarSign size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="number"
                            value={offerPrice}
                            onChange={e => setOfferPrice(e.target.value)}
                            placeholder={askingPrice ? `İstenen: ${askingPrice}` : 'Fiyat girin...'}
                            min={0}
                            style={{
                                width: '100%', paddingLeft: 32, paddingRight: 12,
                                paddingTop: 9, paddingBottom: 9,
                                border: '1px solid #e2e8f0', borderRadius: 8,
                                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                                background: '#f8fafc', color: '#0f172a',
                            }}
                        />
                    </div>
                    <select
                        value={offerCurrency}
                        onChange={e => setOfferCurrency(e.target.value)}
                        style={{
                            border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 10px',
                            fontSize: 12, fontWeight: 700, background: '#f8fafc', color: '#0f172a', outline: 'none',
                        }}
                    >
                        <option value="USDT">USDT</option>
                        <option value="STARS">⭐ Yıldız</option>
                    </select>
                </div>
            </div>

            {/* Mesaj */}
            <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Mesajınız <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Kendinizi tanıtın, satın alma amacınızı ve bütçenizi kısaca belirtin..."
                    rows={3}
                    style={{
                        width: '100%', padding: 12, boxSizing: 'border-box',
                        border: error ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                        borderRadius: 8, fontSize: 13, resize: 'none', outline: 'none',
                        background: '#f8fafc', color: '#0f172a', lineHeight: 1.5,
                    }}
                />
                {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #059669, #10b981)',
                    color: '#fff', fontWeight: 800, fontSize: 14,
                    padding: '12px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(16,185,129,0.3)',
                }}
            >
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Gönderiliyor...</> : <><Send size={15} /> Teklif Gönder & Sohbet Başlat</>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
                Escrow korumasıyla güvendesiniz. %5 komisyon yalnızca satışta alınır.
            </p>
        </form>
    );
}
