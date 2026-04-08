import { getAdminClient } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import { MessageCircle, DollarSign, Clock, CheckCircle2, XCircle, AlertTriangle, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Marketplace Admin | TelegramKanali.com' };

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    pending:            { color: '#d97706', bg: '#fffbeb' },
    accepted:           { color: '#16a34a', bg: '#f0fdf4' },
    escrow_funded:      { color: '#0284c7', bg: '#f0f9ff' },
    transfer_started:   { color: '#7c3aed', bg: '#faf5ff' },
    transfer_completed: { color: '#16a34a', bg: '#f0fdf4' },
    completed:          { color: '#16a34a', bg: '#f0fdf4' },
    disputed:           { color: '#dc2626', bg: '#fef2f2' },
    cancelled:          { color: '#64748b', bg: '#f8fafc' },
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Teklif Bekliyor', accepted: 'Kabul', escrow_funded: 'Ödeme Yapıldı',
    transfer_started: 'Transfer', transfer_completed: 'Transfer Tamam',
    completed: 'Tamamlandı', disputed: 'Anlaşmazlık', cancelled: 'İptal',
};

async function getData() {
    const db = getAdminClient();
    const [ordersRes, statsRes] = await Promise.all([
        db.from('marketplace_orders').select(`
            *,
            channel_listings ( title, channel_name ),
            buyer:profiles!marketplace_orders_buyer_id_fkey ( id, full_name, email ),
            seller:profiles!marketplace_orders_seller_id_fkey ( id, full_name, email )
        `).order('created_at', { ascending: false }).limit(100),

        db.from('marketplace_orders').select('status, agreed_price'),
    ]);

    const orders = ordersRes.data || [];
    const all = statsRes.data || [];
    const stats = {
        total: all.length,
        pending: all.filter(o => o.status === 'pending').length,
        active: all.filter(o => ['accepted', 'escrow_funded', 'transfer_started'].includes(o.status)).length,
        completed: all.filter(o => o.status === 'completed').length,
        disputed: all.filter(o => o.status === 'disputed').length,
        totalVolume: all.filter(o => o.status === 'completed').reduce((s, o) => s + (parseFloat(o.agreed_price) || 0), 0),
    };
    return { orders, stats };
}

export default async function AdminMarketplacePage() {
    const { orders, stats } = await getData();

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageCircle size={20} color="#7c3aed" /> Marketplace Admin
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>Tüm alım-satım sohbetlerini ve işlemleri yönet</p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
                {[
                    { label: 'Toplam İşlem', val: stats.total, color: '#7c3aed' },
                    { label: 'Bekleyen', val: stats.pending, color: '#d97706' },
                    { label: 'Aktif', val: stats.active, color: '#0284c7' },
                    { label: 'Tamamlanan', val: stats.completed, color: '#16a34a' },
                    { label: 'Anlaşmazlık', val: stats.disputed, color: '#dc2626' },
                    { label: 'Toplam Hacim', val: `$${stats.totalVolume.toFixed(0)}`, color: '#059669' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tablo */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                    Tüm Sohbetler & İşlemler
                </div>
                {orders.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Henüz işlem yok.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['İlan', 'Alıcı', 'Satıcı', 'Fiyat', 'Durum', 'Tarih', 'Sohbet'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order: any) => {
                                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                                    const listing = order.channel_listings;
                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', maxWidth: 180 }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {listing?.channel_name || listing?.title || '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 14px', color: '#475569' }}>
                                                {order.buyer?.full_name || order.buyer?.email?.split('@')[0] || '—'}
                                            </td>
                                            <td style={{ padding: '10px 14px', color: '#475569' }}>
                                                {order.seller?.full_name || order.seller?.email?.split('@')[0] || '—'}
                                            </td>
                                            <td style={{ padding: '10px 14px', fontWeight: 800, color: '#059669' }}>
                                                ${order.agreed_price} <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{order.currency}</span>
                                            </td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100, background: sc.bg, color: sc.color }}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 11, whiteSpace: 'nowrap' }}>
                                                {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <Link href={`/dashboard/mesajlar/${order.id}`} style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    background: '#faf5ff', border: '1px solid #e9d5ff',
                                                    color: '#7c3aed', fontWeight: 700, fontSize: 11,
                                                    padding: '5px 10px', borderRadius: 7, textDecoration: 'none',
                                                }}>
                                                    <MessageCircle size={11} /> Görüntüle
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
