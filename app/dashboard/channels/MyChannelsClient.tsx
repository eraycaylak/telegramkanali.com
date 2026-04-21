'use client';

import Link from 'next/link';
import { Tv, Users, PlusCircle, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';

type Channel = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    member_count?: number;
    status: 'pending' | 'approved' | 'rejected';
    join_link?: string;
    created_at: string;
};

const STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    approved: { label: 'Yayında', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
    pending:  { label: 'Onay Bekliyor', color: '#D97706', bg: '#FFFBEB', icon: Clock },
    rejected: { label: 'Reddedildi', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
};

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' };

export default function MyChannelsClient({ channels }: { channels: Channel[] }) {
    if (channels.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center" style={{ ...CARD, padding: '64px 32px' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#EFF6FF' }}>
                    <Tv size={28} style={{ color: '#2563EB' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0F172A' }}>Henüz kanalınız yok</h3>
                <p className="text-sm mb-6" style={{ color: '#64748B' }}>
                    Telegram kanalınızı ekleyin ve 290K+ aylık ziyaretçiye ulaşın.
                </p>
                <Link
                    href="/dashboard/kanal-ekle"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm"
                    style={{ background: '#2563EB' }}
                >
                    <PlusCircle size={16} /> İlk Kanalımı Ekle
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold" style={{ color: '#0F172A' }}>Kanallarım</h2>
                    <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{channels.length} kanal kayıtlı</p>
                </div>
                <Link
                    href="/dashboard/kanal-ekle"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all"
                    style={{ background: '#2563EB' }}
                >
                    <PlusCircle size={15} /> Kanal Ekle
                </Link>
            </div>

            {/* Channel List */}
            <div className="space-y-3">
                {channels.map(ch => {
                    const st = STATUS[ch.status] || STATUS.pending;
                    const StIcon = st.icon;
                    return (
                        <div key={ch.id} style={CARD} className="flex items-center gap-4">
                            {/* Avatar */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
                                style={{ background: '#EFF6FF', color: '#2563EB' }}
                            >
                                {ch.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-sm truncate" style={{ color: '#0F172A' }}>{ch.name}</h3>
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                        style={{ background: st.bg, color: st.color }}
                                    >
                                        <StIcon size={11} />
                                        {st.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    {ch.member_count != null && (
                                        <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                                            <Users size={12} /> {ch.member_count.toLocaleString('tr-TR')} üye
                                        </span>
                                    )}
                                    <span className="text-xs" style={{ color: '#94A3B8' }}>
                                        {new Date(ch.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {ch.status === 'approved' && ch.slug && (
                                    <Link
                                        href={`/${ch.slug}`}
                                        target="_blank"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{ color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE' }}
                                    >
                                        <ExternalLink size={12} /> Görüntüle
                                    </Link>
                                )}
                                {ch.join_link && (
                                    <a
                                        href={ch.join_link.startsWith('http') ? ch.join_link : `https://t.me/${ch.join_link.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{ color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                    >
                                        Telegram
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
