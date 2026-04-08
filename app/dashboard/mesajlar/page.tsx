import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Clock, CheckCircle2, XCircle, DollarSign, ArrowRight, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mesajlarım | TelegramKanali.com' };

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending:            { label: 'Teklif Bekliyor', color: '#d97706', bg: '#fffbeb' },
    accepted:           { label: 'Kabul Edildi',    color: '#16a34a', bg: '#f0fdf4' },
    escrow_funded:      { label: 'Ödeme Yapıldı',   color: '#0284c7', bg: '#f0f9ff' },
    transfer_started:   { label: 'Transfer Başladı',color: '#7c3aed', bg: '#faf5ff' },
    transfer_completed: { label: 'Transfer Tamam',  color: '#16a34a', bg: '#f0fdf4' },
    completed:          { label: 'Tamamlandı ✓',   color: '#16a34a', bg: '#f0fdf4' },
    disputed:           { label: 'Anlaşmazlık',     color: '#dc2626', bg: '#fef2f2' },
    cancelled:          { label: 'İptal',           color: '#64748b', bg: '#f8fafc' },
};

async function getInbox(userId: string) {
    const db = (await import('@/lib/supabaseAdmin')).getAdminClient();

    const { data: orders } = await db
        .from('marketplace_orders')
        .select(`
            id, status, agreed_price, currency, created_at, updated_at,
            buyer_id, seller_id,
            channel_listings ( id, title, channel_name, channel_image ),
            buyer:profiles!marketplace_orders_buyer_id_fkey ( id, full_name, email ),
            seller:profiles!marketplace_orders_seller_id_fkey ( id, full_name, email )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

    // Her sipariş için son mesaj
    const orderIds = (orders || []).map((o: any) => o.id);
    const { data: lastMsgs } = orderIds.length > 0
        ? await db
            .from('marketplace_messages')
            .select('order_id, content, created_at, sender_id, receiver_id, is_read')
            .in('order_id', orderIds)
            .order('created_at', { ascending: false })
        : { data: [] as any[] };

    // Unread count per order
    const msgMap: Record<string, any> = {};
    const unreadMap: Record<string, number> = {};
    for (const m of (lastMsgs || [])) {
        if (!msgMap[m.order_id]) msgMap[m.order_id] = m;
        if (m.receiver_id === userId && !m.is_read) {
            unreadMap[m.order_id] = (unreadMap[m.order_id] || 0) + 1;
        }
    }

    return (orders || []).map((o: any) => ({
        ...o,
        lastMessage: msgMap[o.id] || null,
        unreadCount: unreadMap[o.id] || 0,
        isBuyer: o.buyer_id === userId,
    }));
}

export default async function MesajlarPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login?redirect=/dashboard/mesajlar');

    const inbox = await getInbox(user.id);
    const totalUnread = inbox.reduce((s: number, o: any) => s + o.unreadCount, 0);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
            {/* Başlık */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MessageCircle size={20} color="#7c3aed" />
                        Mesajlarım
                        {totalUnread > 0 && (
                            <span style={{
                                background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: 11,
                                padding: '2px 7px', borderRadius: 100,
                            }}>{totalUnread}</span>
                        )}
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Kanal alım-satım sohbetleriniz</p>
                </div>
                <Link href="/marketplace" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    color: '#475569', fontWeight: 700, fontSize: 12,
                    padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
                }}>
                    <ShoppingBag size={13} /> Marketplace
                </Link>
            </div>

            {inbox.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <MessageCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Henüz mesajınız yok</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
                        Marketplace'te bir kanal ilanına teklif vererek sohbet başlatın.
                    </p>
                    <Link href="/marketplace" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: '#fff', fontWeight: 800, fontSize: 13,
                        padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
                    }}>
                        Kanallara Gözat <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {inbox.map((conv: any) => {
                        const st = STATUS_MAP[conv.status] || STATUS_MAP.pending;
                        const listing = conv.channel_listings;
                        const other = conv.isBuyer ? conv.seller : conv.buyer;
                        const otherLabel = other?.full_name || other?.email || 'Kullanıcı';
                        const role = conv.isBuyer ? 'Alıcısınız' : 'Satıcısınız';
                        const hasUnread = conv.unreadCount > 0;

                        return (
                            <Link key={conv.id} href={`/dashboard/mesajlar/${conv.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    background: '#fff',
                                    border: hasUnread ? '1px solid #a5b4fc' : '1px solid #e2e8f0',
                                    borderRadius: 12, padding: '14px 16px',
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    boxShadow: hasUnread ? '0 2px 8px rgba(124,58,237,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                                        background: listing?.channel_image ? 'transparent' : '#f1f5f9',
                                        border: '1px solid #e2e8f0', overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: 18, color: '#7c3aed',
                                    }}>
                                        {listing?.channel_image
                                            ? <img src={listing.channel_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (listing?.channel_name || listing?.title || 'K')[0]?.toUpperCase()
                                        }
                                    </div>

                                    {/* İçerik */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                            <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {listing?.channel_name || listing?.title || 'İlan'}
                                            </span>
                                            <span style={{
                                                flexShrink: 0, fontSize: 10, fontWeight: 700,
                                                padding: '1px 7px', borderRadius: 100,
                                                background: st.bg, color: st.color,
                                            }}>{st.label}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <span style={{ color: '#475569', fontWeight: 600 }}>{role}</span>
                                            {' · '}{otherLabel}
                                            {conv.lastMessage && <> · {conv.lastMessage.content.slice(0, 50)}{conv.lastMessage.content.length > 50 ? '...' : ''}</>}
                                        </div>
                                    </div>

                                    {/* Sağ taraf */}
                                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#059669' }}>
                                            ${conv.agreed_price}
                                        </div>
                                        {hasUnread && (
                                            <div style={{
                                                background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 900,
                                                width: 18, height: 18, borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginLeft: 'auto', marginTop: 4,
                                            }}>{conv.unreadCount}</div>
                                        )}
                                    </div>

                                    <ArrowRight size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
