'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tv, Users, PlusCircle, CheckCircle2, Clock, XCircle, ExternalLink, Power, EyeOff, Loader2 } from 'lucide-react';
import { toggleChannelStatus } from '@/app/actions/tokens';

type Channel = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    member_count?: number;
    status: 'pending' | 'approved' | 'rejected' | 'inactive';
    join_link?: string;
    created_at: string;
};

const STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    approved: { label: 'Yayında',        color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
    pending:  { label: 'Onay Bekliyor',  color: '#D97706', bg: '#FFFBEB', icon: Clock },
    rejected: { label: 'Reddedildi',     color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
    inactive: { label: 'Pasif',          color: '#64748B', bg: '#F1F5F9', icon: EyeOff },
};

const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' };

export default function MyChannelsClient({ channels: initialChannels }: { channels: Channel[] }) {
    const [channels, setChannels] = useState(initialChannels);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    async function handleToggle(channelId: string) {
        setTogglingId(channelId);
        setMessage('');

        const result = await toggleChannelStatus(channelId);

        if (result.error) {
            setMessage(result.error);
        } else {
            // Update local state
            setChannels(prev => prev.map(ch =>
                ch.id === channelId
                    ? { ...ch, status: result.newStatus as Channel['status'] }
                    : ch
            ));
            const label = result.newStatus === 'approved' ? 'aktif' : 'pasif';
            setMessage(`Kanal ${label} yapıldı.`);
        }

        setTogglingId(null);
        setTimeout(() => setMessage(''), 3000);
    }

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
                    <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
                        {channels.length} kanal kayıtlı · {channels.filter(c => c.status === 'approved').length} aktif
                    </p>
                </div>
                <Link
                    href="/dashboard/kanal-ekle"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all"
                    style={{ background: '#2563EB' }}
                >
                    <PlusCircle size={15} /> Kanal Ekle
                </Link>
            </div>

            {/* Message */}
            {message && (
                <div
                    className="p-3 rounded-xl text-sm font-medium transition-all"
                    style={message.includes('hata') || message.includes('bulunamadı') || message.includes('ait değil')
                        ? { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
                        : { background: '#ECFDF5', color: '#065F46', border: '1px solid #BBF7D0' }
                    }
                >
                    {message}
                </div>
            )}

            {/* Channel List */}
            <div className="space-y-3">
                {channels.map(ch => {
                    const st = STATUS[ch.status] || STATUS.pending;
                    const StIcon = st.icon;
                    const isToggling = togglingId === ch.id;
                    const canToggle = ch.status === 'approved' || ch.status === 'inactive';

                    return (
                        <div
                            key={ch.id}
                            style={{
                                ...CARD,
                                opacity: ch.status === 'inactive' ? 0.7 : 1,
                            }}
                            className="flex items-center gap-4 transition-opacity"
                        >
                            {/* Avatar */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
                                style={{
                                    background: ch.status === 'inactive' ? '#F1F5F9' : '#EFF6FF',
                                    color: ch.status === 'inactive' ? '#94A3B8' : '#2563EB',
                                }}
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
                                {/* Active/Inactive Toggle */}
                                {canToggle && (
                                    <button
                                        onClick={() => handleToggle(ch.id)}
                                        disabled={isToggling}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                        style={ch.status === 'approved'
                                            ? { color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }
                                            : { color: '#059669', background: '#ECFDF5', border: '1px solid #BBF7D0' }
                                        }
                                        title={ch.status === 'approved' ? 'Kanalı pasife al' : 'Kanalı aktife al'}
                                    >
                                        {isToggling ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : ch.status === 'approved' ? (
                                            <><Power size={12} /> Pasife Al</>
                                        ) : (
                                            <><Power size={12} /> Aktife Al</>
                                        )}
                                    </button>
                                )}

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
