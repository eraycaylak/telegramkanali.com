'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Send, ArrowLeft, CheckCircle2, XCircle, Loader2, Info, AlertTriangle } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending:            { label: 'Bekliyor',      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    accepted:           { label: 'Kabul Edildi',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    escrow_funded:      { label: 'Ödeme Yapıldı', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    transfer_started:   { label: 'Transfer',      color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
    transfer_completed: { label: 'Transfer Tamam',color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    completed:          { label: 'Tamamlandı',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    disputed:           { label: 'Anlaşmazlık',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    cancelled:          { label: 'İptal',         color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

interface Message {
    id: string; order_id: string; sender_id: string;
    receiver_id: string; content: string; is_read: boolean; is_system: boolean; created_at: string;
}

interface Props {
    order: any; initialMessages: Message[]; userId: string;
    isBuyer: boolean; isSeller: boolean; isAdmin: boolean; otherParty: any;
    hasTelegramLinked: boolean;
    botUsername: string;
}

function formatTime(iso: string) {
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    if (isToday) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ChatClient({ order, initialMessages, userId, isBuyer, isSeller, isAdmin, otherParty, hasTelegramLinked, botUsername }: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listing = order.channel_listings;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const channel = supabase
            .channel(`order-${order.id}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public',
                table: 'marketplace_messages', filter: `order_id=eq.${order.id}`,
            }, (payload) => {
                const newMsg = payload.new as Message;
                setMessages(prev => {
                    if (prev.find(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                if (newMsg.receiver_id === userId) {
                    supabase.from('marketplace_messages').update({ is_read: true }).eq('id', newMsg.id).then(() => {});
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE', schema: 'public',
                table: 'marketplace_orders', filter: `id=eq.${order.id}`,
            }, (payload) => { setOrderStatus((payload.new as any).status); })
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
                order_id: order.id, listing_id: order.listing_id,
                sender_id: userId, receiver_id: otherId, content, is_system: false,
            });
        } catch { setText(content); }
        finally { setSending(false); }
    }

    async function updateStatus(newStatus: string, systemMsg: string) {
        setUpdatingStatus(true);
        try {
            await supabase.from('marketplace_orders').update({
                status: newStatus,
                ...(newStatus === 'accepted' ? { seller_accepted_at: new Date().toISOString() } : {}),
            }).eq('id', order.id);
            await supabase.from('marketplace_messages').insert({
                order_id: order.id, listing_id: order.listing_id,
                sender_id: userId, receiver_id: isBuyer ? order.seller_id : order.buyer_id,
                content: systemMsg, is_system: true,
            });
            setOrderStatus(newStatus);

            // Teklif kabul edilince alıcıya bot bildirimi gönder
            if (newStatus === 'accepted') {
                fetch('/api/escrow/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: order.id }),
                }).catch(console.error);
            }
        } finally { setUpdatingStatus(false); }
    }

    const st = STATUS_MAP[orderStatus] || STATUS_MAP.pending;
    const canChat = !['cancelled', 'completed'].includes(orderStatus) || isAdmin;

    return (
        <>
            <style>{`
                .chat-root {
                    display: flex;
                    flex-direction: column;
                    height: calc(100dvh - 64px);
                    max-height: calc(100dvh - 64px);
                    padding: 12px 12px 0;
                    max-width: 760px;
                    margin: 0 auto;
                    box-sizing: border-box;
                }
                @media (min-width: 768px) {
                    .chat-root { height: calc(100dvh - 80px); padding: 16px 0 0; }
                }
                .chat-header-card {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 10px 12px;
                    flex-wrap: nowrap;
                    overflow: hidden;
                }
                .chat-price-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    flex-shrink: 0;
                }
                @media (max-width: 480px) {
                    .chat-price-info .commission-line { display: none; }
                    .chat-header-card { padding: 8px 10px; }
                }
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    padding: 12px;
                    -webkit-overflow-scrolling: touch;
                }
                .chat-input-form {
                    display: flex;
                    gap: 8px;
                    padding: 10px 0 12px;
                    flex-shrink: 0;
                    background: transparent;
                }
                /* Dashboard'daki fixed menü butonunu geç — lg:hidden yani <1024px */
                @media (max-width: 1023px) {
                    .chat-input-form { padding-bottom: 84px; }
                }
                .chat-input {
                    flex: 1;
                    padding: 11px 14px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 16px; /* 16px prevents iOS zoom */
                    outline: none;
                    background: #fff;
                    color: #0f172a;
                    min-width: 0;
                }
                .chat-send-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 46px;
                    height: 46px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: background 0.15s;
                }
                .action-btns {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 10px;
                    flex-shrink: 0;
                }
                @media (max-width: 400px) {
                    .action-btns { flex-direction: column; }
                }
            `}</style>

            <div className="chat-root">

                {/* ── Geri + Başlık ── */}
                <div style={{ marginBottom: 10, flexShrink: 0 }}>
                    <Link href="/dashboard/mesajlar" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12, color: '#64748b', fontWeight: 600, textDecoration: 'none', marginBottom: 8,
                    }}>
                        <ArrowLeft size={13} /> Mesajlara Dön
                    </Link>

                    <div className="chat-header-card">
                        {/* Avatar */}
                        <div style={{
                            width: 36, height: 36, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                            background: '#f1f5f9', border: '1px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, color: '#7c3aed', fontSize: 15,
                        }}>
                            {listing?.channel_image
                                ? <img src={listing.channel_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (listing?.channel_name || 'K')[0]?.toUpperCase()}
                        </div>
                        {/* İsim */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {listing?.channel_name || listing?.title || 'İlan'}
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {isBuyer ? 'Alıcısınız' : isSeller ? 'Satıcısınız' : '👑 Admin'} · {otherParty?.full_name || otherParty?.email?.split('@')[0] || 'Kullanıcı'}
                            </div>
                        </div>
                        {/* Fiyat */}
                        <div className="chat-price-info">
                            <div style={{ fontWeight: 900, fontSize: 13, color: '#059669' }}>
                                {order.currency === 'STARS' ? `${order.agreed_price}⭐` : `$${order.agreed_price}`}
                            </div>
                            <div className="commission-line" style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
                                Net: ${order.seller_receives}
                            </div>
                        </div>
                        {/* Durum */}
                        <div style={{
                            padding: '3px 8px', borderRadius: 100, fontSize: 10, fontWeight: 800,
                            background: st.bg, color: st.color, border: `1px solid ${st.border}`, flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                            {st.label}
                        </div>
                    </div>
                </div>

                {/* ── Satıcı butonları ── */}
                {isSeller && orderStatus === 'pending' && (
                    <div className="action-btns">
                        <button onClick={() => updateStatus('accepted', '✅ Satıcı teklifi kabul etti.')} disabled={updatingStatus}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 13, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                            <CheckCircle2 size={15} /> Kabul Et
                        </button>
                        <button onClick={() => updateStatus('cancelled', '❌ Satıcı teklifi reddetti.')} disabled={updatingStatus}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 800, fontSize: 13, padding: '11px', borderRadius: 10, cursor: 'pointer' }}>
                            <XCircle size={15} /> Reddet
                        </button>
                    </div>
                )}

                {/* Telegram bağlama uyarısı — sadece TG bağlı değilse */}
                {!hasTelegramLinked && !isAdmin && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px', marginBottom: 10, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e' }}>🔔 Bot bildirimlerini aç</div>
                            <div style={{ fontSize: 11, color: '#78716c', marginTop: 1 }}>Ödeme talimatları ve transfer adımları için Telegram'ı bağlayın</div>
                        </div>
                        {botUsername && (
                            <a href={`https://t.me/${botUsername}?start=link_${userId}`} target="_blank" rel="noopener"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f59e0b', color: '#fff', fontWeight: 800, fontSize: 11, padding: '6px 10px', borderRadius: 8, textDecoration: 'none', flexShrink: 0 }}>
                                Bağla ›
                            </a>
                        )}
                    </div>
                )}

                {/* Escrow kabul edildi rehberi */}
                {orderStatus === 'accepted' && isBuyer && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px', marginBottom: 10, flexShrink: 0, fontSize: 12, color: '#166534' }}>
                        {hasTelegramLinked
                            ? <>🤖 <b>Bot size ödeme talimatını Telegram'dan gönderdi.</b> Kontrol edin!</>
                            : <>🎉 Teklif kabul edildi! <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener" style={{ color: '#7c3aed', fontWeight: 700 }}>Telegram'dan escrow ödemesi için yazın →</a></>
                        }
                    </div>
                )}

                {/* ── Mesajlar ── */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8', fontSize: 13 }}>
                            <Info size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                            Konuşmayı başlatın
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isMine = msg.sender_id === userId;
                        if (msg.is_system) {
                            return (
                                <div key={msg.id} style={{ textAlign: 'center', padding: '4px 8px' }}>
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
                                    maxWidth: '82%',
                                    background: isMine ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
                                    color: isMine ? '#fff' : '#0f172a',
                                    border: isMine ? 'none' : '1px solid #e2e8f0',
                                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    padding: '9px 12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                }}>
                                    <div style={{ fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</div>
                                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3, textAlign: isMine ? 'right' : 'left' }}>
                                        {formatTime(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* ── Input ── */}
                {canChat ? (
                    <form onSubmit={sendMessage} className="chat-input-form">
                        <input
                            ref={inputRef}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Mesajınızı yazın..."
                            className="chat-input"
                            autoComplete="off"
                        />
                        <button type="submit" disabled={sending || !text.trim()} className="chat-send-btn"
                            style={{ background: sending || !text.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                            {sending
                                ? <Loader2 size={18} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />
                                : <Send size={18} color={text.trim() ? '#fff' : '#94a3b8'} />}
                        </button>
                    </form>
                ) : (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: 13, color: '#64748b', flexShrink: 0, paddingBottom: 16 }}>
                        Bu sohbet {orderStatus === 'cancelled' ? 'iptal edildi' : 'tamamlandı'}.
                    </div>
                )}
            </div>
        </>
    );
}
