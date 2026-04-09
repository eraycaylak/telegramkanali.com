import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, ArrowRight, ShoppingBag, DollarSign } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mesajlarım | TelegramKanali.com' };

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending:            { label: 'Bekliyor',      color: '#d97706', bg: '#fffbeb' },
    accepted:           { label: 'Kabul Edildi',  color: '#16a34a', bg: '#f0fdf4' },
    escrow_funded:      { label: 'Ödeme Yapıldı', color: '#0284c7', bg: '#f0f9ff' },
    transfer_started:   { label: 'Transfer',      color: '#7c3aed', bg: '#faf5ff' },
    transfer_completed: { label: 'Transfer Tamam',color: '#16a34a', bg: '#f0fdf4' },
    completed:          { label: 'Tamamlandı ✓', color: '#16a34a', bg: '#f0fdf4' },
    disputed:           { label: 'Anlaşmazlık',   color: '#dc2626', bg: '#fef2f2' },
    cancelled:          { label: 'İptal',         color: '#64748b', bg: '#f8fafc' },
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

    const orderIds = (orders || []).map((o: any) => o.id);
    const { data: lastMsgs } = orderIds.length > 0
        ? await db
            .from('marketplace_messages')
            .select('order_id, content, created_at, sender_id, receiver_id, is_read')
            .in('order_id', orderIds)
            .order('created_at', { ascending: false })
        : { data: [] as any[] };

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

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'az önce';
    if (m < 60) return `${m}dk`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}s`;
    return `${Math.floor(h / 24)}g`;
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
        <>
            <style>{`
                .inbox-root { max-width: 680px; margin: 0 auto; padding: 16px 0 40px; }
                .inbox-conv { display: flex; flex-direction: column; gap: 6px; }
                .inbox-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fff;
                    border-radius: 12px;
                    padding: 12px;
                    text-decoration: none;
                    overflow: hidden;
                    position: relative;
                }
                .inbox-avatar {
                    width: 42px; height: 42px;
                    border-radius: 10px;
                    flex-shrink: 0;
                    overflow: hidden;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 18px; color: #7c3aed;
                }
                .inbox-info { flex: 1; min-width: 0; }
                .inbox-name {
                    font-weight: 800; font-size: 13px; color: #0f172a;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .inbox-preview {
                    font-size: 11px; color: #94a3b8; margin-top: 2px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .inbox-right {
                    display: flex; flex-direction: column; align-items: flex-end;
                    gap: 4px; flex-shrink: 0;
                }
                .inbox-price { font-weight: 900; font-size: 12px; color: #059669; }
                .inbox-unread-badge {
                    background: #7c3aed; color: #fff;
                    font-size: 10px; font-weight: 900;
                    width: 18px; height: 18px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                }
                .inbox-time { font-size: 10px; color: #cbd5e1; }
                /* Empty state */
                .inbox-empty {
                    text-align: center;
                    padding: 48px 20px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }
            `}</style>

            <div className="inbox-root">
                {/* Başlık */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessageCircle size={18} color="#7c3aed" />
                            Mesajlarım
                            {totalUnread > 0 && (
                                <span style={{ background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: 10, padding: '2px 7px', borderRadius: 100 }}>
                                    {totalUnread}
                                </span>
                            )}
                        </h1>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>Kanal alım-satım sohbetleriniz</p>
                    </div>
                    <Link href="/marketplace" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        color: '#475569', fontWeight: 700, fontSize: 11,
                        padding: '7px 12px', borderRadius: 8, textDecoration: 'none', flexShrink: 0,
                    }}>
                        <ShoppingBag size={12} /> Marketplace
                    </Link>
                </div>

                {inbox.length === 0 ? (
                    <div className="inbox-empty">
                        <MessageCircle size={36} color="#cbd5e1" style={{ margin: '0 auto 10px', display: 'block' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 5px' }}>Henüz mesajınız yok</h3>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px' }}>
                            Marketplace'te bir kanala teklif vererek sohbet başlatın.
                        </p>
                        <Link href="/marketplace" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: '#fff', fontWeight: 800, fontSize: 13,
                            padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
                        }}>
                            Kanallara Gözat <ArrowRight size={13} />
                        </Link>
                    </div>
                ) : (
                    <div className="inbox-conv">
                        {inbox.map((conv: any) => {
                            const st = STATUS_MAP[conv.status] || STATUS_MAP.pending;
                            const listing = conv.channel_listings;
                            const other = conv.isBuyer ? conv.seller : conv.buyer;
                            const otherLabel = other?.full_name || other?.email?.split('@')[0] || 'Kullanıcı';
                            const role = conv.isBuyer ? 'Alıcı' : 'Satıcı';
                            const hasUnread = conv.unreadCount > 0;
                            const lastMsg = conv.lastMessage;

                            return (
                                <Link key={conv.id} href={`/dashboard/mesajlar/${conv.id}`} className="inbox-card"
                                    style={{ border: hasUnread ? '1px solid #a5b4fc' : '1px solid #e2e8f0', boxShadow: hasUnread ? '0 2px 8px rgba(124,58,237,0.08)' : 'none' }}>
                                    {/* Avatar */}
                                    <div className="inbox-avatar">
                                        {listing?.channel_image
                                            ? <img src={listing.channel_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (listing?.channel_name || listing?.title || 'K')[0]?.toUpperCase()
                                        }
                                    </div>

                                    {/* İçerik */}
                                    <div className="inbox-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            <span className="inbox-name">
                                                {listing?.channel_name || listing?.title || 'İlan'}
                                            </span>
                                            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: st.bg, color: st.color, flexShrink: 0 }}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <div className="inbox-preview">
                                            <span style={{ color: '#7c3aed', fontWeight: 600 }}>{role}</span>
                                            {' · '}{otherLabel}
                                            {lastMsg && <> · {lastMsg.content.slice(0, 40)}{lastMsg.content.length > 40 ? '…' : ''}</>}
                                        </div>
                                    </div>

                                    {/* Sağ */}
                                    <div className="inbox-right">
                                        <span className="inbox-price">
                                            {conv.currency === 'STARS' ? `${conv.agreed_price}⭐` : `$${conv.agreed_price}`}
                                        </span>
                                        {hasUnread
                                            ? <span className="inbox-unread-badge">{conv.unreadCount}</span>
                                            : lastMsg && <span className="inbox-time">{timeAgo(lastMsg.created_at)}</span>
                                        }
                                        <ArrowRight size={12} color="#cbd5e1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
