'use client';

import { useState, useEffect } from 'react';
import { getUserCampaigns, toggleCampaignStatus, deleteAdCampaign } from '@/app/actions/tokens';
import Link from 'next/link';
import {
    TrendingUp, Eye, CheckCircle2, Clock,
    PauseCircle, XCircle, PlusCircle, Zap, Trash2
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    pending:   { label: 'Beklemede',    icon: Clock,         color: '#92400E', bg: '#FFFBEB' },
    active:    { label: 'Aktif',        icon: TrendingUp,    color: '#065F46', bg: '#ECFDF5' },
    completed: { label: 'Tamamlandı',  icon: CheckCircle2,  color: '#1E40AF', bg: '#EFF6FF' },
    paused:    { label: 'Duraklatıldı', icon: PauseCircle,  color: '#92400E', bg: '#FFFBEB' },
    cancelled: { label: 'İptal',       icon: XCircle,       color: '#991B1B', bg: '#FEF2F2' },
};

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' };

export default function AdsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const data = await getUserCampaigns();
            setCampaigns(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(id: string) {
        setTogglingId(id);
        const r = await toggleCampaignStatus(id);
        if (r.error) setMessage(r.error);
        else { setMessage('Kampanya durumu güncellendi.'); loadData(); }
        setTogglingId(null);
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
        setTogglingId(id);
        const r = await deleteAdCampaign(id);
        if (r.error) setMessage(r.error);
        else { setMessage('Kampanya silindi.'); loadData(); }
        setTogglingId(null);
    }

    if (loading) {
        return (
            <div className="space-y-3 max-w-4xl">
                {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#F1F5F9' }} />)}
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-4xl">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>Reklamlarım</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Mevcut reklam kampanyalarınız</p>
                </div>
                <Link
                    href="/dashboard/kanal-ekle"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
                    style={{ background: '#2563EB' }}
                >
                    <PlusCircle size={15} /> Yeni Reklam
                </Link>
            </div>

            {/* Message */}
            {message && (
                <div
                    className="p-3 rounded-xl text-sm font-medium"
                    style={message.includes('silindi') || message.includes('güncellendi')
                        ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #BBF7D0' }
                        : { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
                    }
                >
                    {message}
                </div>
            )}

            {/* Empty */}
            {campaigns.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={CARD}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#EFF6FF' }}>
                        <TrendingUp size={24} style={{ color: '#2563EB' }} />
                    </div>
                    <h3 className="font-bold mb-2" style={{ color: '#0F172A' }}>Henüz reklam kampanyanız yok</h3>
                    <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: '#64748B' }}>
                        Kanalınızı tanıtmak için USDT ile reklam paketi satın alın.
                    </p>
                    <Link
                        href="/dashboard/kanal-ekle"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm"
                        style={{ background: '#2563EB' }}
                    >
                        <Zap size={15} /> Reklam Satın Al
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((c: any) => {
                        const st = STATUS_LABELS[c.status] || STATUS_LABELS.pending;
                        const StIcon = st.icon;
                        const progress = c.total_views > 0 ? Math.min(100, (c.current_views / c.total_views) * 100) : 0;

                        return (
                            <div key={c.id} style={CARD}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-sm" style={{ color: '#0F172A' }}>
                                            {c.channels?.name || 'Kanal'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                                style={{ background: st.bg, color: st.color }}
                                            >
                                                <StIcon size={11} /> {st.label}
                                            </span>
                                            <span className="text-xs" style={{ color: '#94A3B8' }}>
                                                {new Date(c.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {(c.status === 'active' || c.status === 'paused') && (
                                            <button
                                                onClick={() => handleToggle(c.id)}
                                                disabled={togglingId === c.id}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50"
                                                style={{ color: '#475569', borderColor: '#E2E8F0', background: '#F8FAFC' }}
                                            >
                                                {c.status === 'active'
                                                    ? <><PauseCircle size={13} className="inline mr-1" />Duraklat</>
                                                    : <><TrendingUp size={13} className="inline mr-1" />Devam Et</>
                                                }
                                            </button>
                                        )}
                                        {(c.status === 'pending' || c.status === 'cancelled') && (
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                disabled={togglingId === c.id}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50"
                                                style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                                            >
                                                <Trash2 size={13} className="inline mr-1" />Sil
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span style={{ color: '#64748B' }}>Gösterim İlerlemesi</span>
                                        <span className="font-semibold" style={{ color: '#0F172A' }}>
                                            {c.current_views.toLocaleString('tr-TR')} / {c.total_views.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${progress}%`,
                                                background: c.status === 'completed' ? '#10B981' : '#2563EB'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                                    <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                                        <Eye size={12} /> {c.current_views.toLocaleString('tr-TR')} gösterim
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
