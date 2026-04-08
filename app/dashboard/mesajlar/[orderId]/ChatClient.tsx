'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
    Send, ArrowLeft, CheckCircle2, XCircle, Clock, Shield,
    DollarSign, Users, Loader2, Info, ExternalLink, AlertTriangle
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending:            { label: 'Teklif Bekliyor', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    accepted:           { label: 'Kabul Edildi',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    escrow_funded:      { label: 'Ödeme Escrow\'da',color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    transfer_started:   { label: 'Transfer Başladı',color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
    transfer_completed: { label: 'Transfer Tamam',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    completed:          { label: 'Tamamlandı',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    disputed:           { label: 'Anlaşmazlık',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    cancelled:          { label: 'İptal Edildi',    color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

interface Message {
    id: string;
    order_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    is_system: boolean;
    created_at: string;
}

interface Props {
    order: any;
    initialMessages: Message[];
    userId: string;
    isBuyer: boolean;
    isSeller: boolean;
    isAdmin: boolean;
    otherParty: any;
}

function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ChatClient({ order, initialMessages, userId, isBuyer, isSeller, isAdmin, otherParty }: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const listing = order.channel_listings;

    // Sayfaya gelince aşağı kaydır
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Realtime mesaj dinle
    useEffect(() => {
        const channel = supabase
            .channel(`order-${order.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'marketplace_messages',
                filter: `order_id=eq.${order.id}`,
            }, (payload) => {
                const newMsg = payload.new as Message;
                setMessages(prev => {
                    if (prev.find(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                // Okundu işaretle
                if (newMsg.receiver_id === userId) {
                    supabase.from('marketplace_messages')
                        .update({ is_read: true })
                        .eq('id', newMsg.id)
                        .then(() => {});
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'marketplace_orders',
                filter: `id=eq.${order.id}`,
            }, (payload) => {
                setOrderStatus((payload.new as any).status);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [order.id, userId]);

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || sending) return;
        const content = text.trim();
        setText('');
        setSending(true);

        try {
            const otherId = isBuyer ? order.seller_id : order.buyer_id;
            await supabase.from('marketplace_messages').insert({
                order_id: order.id,
                listing_id: order.listing_id,
                sender_id: userId,
                receiver_id: otherId,
                content,
                is_system: false,
            });
        } catch (e) {
            console.error(e);
            setText(content); // geri koy
        } finally {
            setSending(false);
        }
    }

    async function updateStatus(newStatus: string, systemMsg: string) {
        setUpdatingStatus(true);
        try {
            await supabase.from('marketplace_orders').update({
                status: newStatus,
                seller_accepted_at: newStatus === 'accepted' ? new Date().toISOString() : undefined,
            }).eq('id', order.id);

            // Sistem mesajı ekle
            await supabase.from('marketplace_messages').insert({
                order_id: order.id,
                listing_id: order.listing_id,
                sender_id: userId,
                receiver_id: isBuyer ? order.seller_id : order.buyer_id,
                content: systemMsg,
                is_system: true,
            });

            setOrderStatus(newStatus);
        } finally {
            setUpdatingStatus(false);
        }
    }

    const st = STATUS_MAP[orderStatus] || STATUS_MAP.pending;
    const canChat = !['cancelled', 'completed'].includes(orderStatus) || isAdmin;

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 500 }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: 12, flexShrink: 0 }}>
                <Link href="/dashboard/mesajlar" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: '#64748b', fontWeight: 600, textDecoration: 'none', marginBottom: 10,
                }}>
                    <ArrowLeft size={13} /> Mesajlara Dön
                </Link>

                {/* Sipariş özeti kartı */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Kanal fotoğrafı */}
                    <div style={{
                        width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#7c3aed', fontSize: 16,
                    }}>
                        {listing?.channel_image
                            ? <img src={listing.channel_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (listing?.channel_name || listing?.title || 'K')[0]?.toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                            {listing?.channel_name || listing?.title || 'İlan'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            {isBuyer ? 'Alıcısınız' : isSeller ? 'Satıcısınız' : '👑 Admin'} · {otherParty?.full_name || otherParty?.email || 'Kullanıcı'}
                        </div>
                    </div>

                    {/* Fiyat */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 15, color: '#059669' }}>
                            {order.currency === 'STARS' ? `${order.agreed_price} ⭐` : `$${order.agreed_price} USDT`}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                            Komisyon: ${order.commission_amount} · Net: ${order.seller_receives}
                        </div>
                    </div>

                    {/* Durum rozeti */}
                    <div style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color, border: `1px solid ${st.border}`, flexShrink: 0 }}>
                        {st.label}
                    </div>
                </div>
            </div>

            {/* ── Satıcı aksiyon butonları ── */}
            {isSeller && orderStatus === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexShrink: 0 }}>
                    <button
                        onClick={() => updateStatus('accepted', '✅ Satıcı teklifi kabul etti. Escrow ödemesini bekliyoruz.')}
                        disabled={updatingStatus}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 13,
                            padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        }}>
                        <CheckCircle2 size={15} /> Teklifi Kabul Et
                    </button>
                    <button
                        onClick={() => updateStatus('cancelled', '❌ Satıcı teklifi reddetti.')}
                        disabled={updatingStatus}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 800, fontSize: 13,
                            padding: '10px', borderRadius: 10, cursor: 'pointer',
                        }}>
                        <XCircle size={15} /> Reddet
                    </button>
                </div>
            )}

            {/* Escrow rehberi — accepted durumunda */}
            {orderStatus === 'accepted' && isBuyer && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 12, marginBottom: 12, flexShrink: 0, fontSize: 12, color: '#0369a1' }}>
                    <strong>🎉 Teklif kabul edildi!</strong> Ödemeyi escrow'ya göndermek için{' '}
                    <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener" style={{ color: '#7c3aed', fontWeight: 700 }}>
                        Telegram destek kanalımızla iletişime geçin
                    </a>.
                </div>
            )}

            {/* ── Mesajlar alanı ── */}
            <div style={{
                flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
                background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0',
                padding: 16, minHeight: 200,
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: 13 }}>
                        <Info size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                        Henüz mesaj yok. Konuşmaya başlayın.
                    </div>
                )}

                {messages.map((msg) => {
                    const isMine = msg.sender_id === userId;

                    if (msg.is_system) {
                        return (
                            <div key={msg.id} style={{ textAlign: 'center', padding: '6px 12px' }}>
                                <span style={{
                                    display: 'inline-block', fontSize: 11, color: '#475569',
                                    background: '#e2e8f0', borderRadius: 100, padding: '3px 12px', fontWeight: 600,
                                }}>{msg.content}</span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '70%',
                                background: isMine ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
                                color: isMine ? '#fff' : '#0f172a',
                                border: isMine ? 'none' : '1px solid #e2e8f0',
                                borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                padding: '10px 14px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            }}>
                                <div style={{ fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</div>
                                <div style={{ fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                                    {formatTime(msg.created_at)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* ── Mesaj gönder ── */}
            {canChat ? (
                <form onSubmit={sendMessage} style={{ marginTop: 10, display: 'flex', gap: 8, flexShrink: 0 }}>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        style={{
                            flex: 1, padding: '11px 14px',
                            border: '1px solid #e2e8f0', borderRadius: 10,
                            fontSize: 14, outline: 'none', background: '#fff', color: '#0f172a',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: sending || !text.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: sending || !text.trim() ? '#94a3b8' : '#fff',
                            fontWeight: 800, fontSize: 13, padding: '11px 18px',
                            borderRadius: 10, border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                            flexShrink: 0, transition: 'all 0.15s',
                        }}
                    >
                        {sending ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                        Gönder
                    </button>
                </form>
            ) : (
                <div style={{ marginTop: 10, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, textAlign: 'center', fontSize: 13, color: '#64748b', flexShrink: 0 }}>
                    Bu sohbet {orderStatus === 'cancelled' ? 'iptal edildi' : 'tamamlandı'}.
                </div>
            )}
        </div>
    );
}
