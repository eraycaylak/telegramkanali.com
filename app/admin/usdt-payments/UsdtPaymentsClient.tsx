'use client';

import { useState, useEffect } from 'react';
import { getUsdtPayments, approveUsdtPayment, rejectUsdtPayment } from '@/app/actions/usdt';
import { CheckCircle2, XCircle, Clock, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

type Payment = {
    id: string;
    contact_name: string;
    contact_telegram: string;
    contact_email?: string;
    package_id: string;
    package_name: string;
    amount_usdt: number;
    tx_hash?: string;
    channel_name?: string;
    channel_link?: string;
    ad_message?: string;
    notes?: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    total_views: number;
    campaign_id?: string;
    created_at: string;
};

const PKG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    neon: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    prime: { bg: 'rgba(14,165,233,0.12)', text: '#7dd3fc', border: 'rgba(14,165,233,0.3)' },
    apex: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
};

const PKG_EMOJI: Record<string, string> = { neon: '⚡', prime: '👑', apex: '🔱' };

export default function UsdtPaymentsClient() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [approveNote, setApproveNote] = useState('');
    const [approveId, setApproveId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const load = async () => {
        setLoading(true);
        const data = await getUsdtPayments(filter === 'all' ? undefined : filter);
        setPayments(data as Payment[]);
        setLoading(false);
    };

    useEffect(() => { load(); }, [filter]);

    const copy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleApprove = async () => {
        if (!approveId) return;
        setBusy(true);
        const res = await approveUsdtPayment(approveId, approveNote);
        setBusy(false);
        setApproveId(null);
        setApproveNote('');
        if (res.success) {
            setMsg({ type: 'success', text: 'Ödeme onaylandı. Kampanya oluşturuldu.' });
        } else {
            setMsg({ type: 'error', text: res.error || 'Onay başarısız.' });
        }
        load();
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setBusy(true);
        const res = await rejectUsdtPayment(rejectId, rejectNote || 'Ödeme doğrulanamadı.');
        setBusy(false);
        setRejectId(null);
        setRejectNote('');
        if (res.success) {
            setMsg({ type: 'success', text: 'Başvuru reddedildi.' });
        } else {
            setMsg({ type: 'error', text: res.error || 'Red başarısız.' });
        }
        load();
    };

    const pending = payments.filter(p => p.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Başlık */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">USDT Reklam Ödemeleri</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kullanıcıların USDT ile yaptığı reklam başvurularını onaylayın veya reddedin.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {pending > 0 && (
                        <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-3 py-1 text-sm font-bold">
                            {pending} bekleyen
                        </span>
                    )}
                    <button onClick={load} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Mesaj */}
            {msg && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {msg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {msg.text}
                    <button onClick={() => setMsg(null)} className="ml-auto text-xs underline">Kapat</button>
                </div>
            )}

            {/* Filtre */}
            <div className="flex gap-2 flex-wrap">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {f === 'pending' ? '⏳ Bekleyen' : f === 'approved' ? '✅ Onaylanan' : f === 'rejected' ? '❌ Reddedilen' : '📋 Tümü'}
                    </button>
                ))}
            </div>

            {/* Liste */}
            {loading ? (
                <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
            ) : payments.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
                    <p className="text-lg font-bold mb-1">Başvuru bulunamadı</p>
                    <p className="text-sm">Bu filtre için henüz kayıt yok.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map(p => {
                        const pkgColor = PKG_COLORS[p.package_id] || PKG_COLORS.neon;
                        const isPending = p.status === 'pending';
                        return (
                            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* Kart başlık */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{PKG_EMOJI[p.package_id] || '📦'}</span>
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                style={{ background: pkgColor.bg, color: pkgColor.text, border: `1px solid ${pkgColor.border}` }}>
                                                {p.package_name}
                                            </span>
                                            <span className="ml-2 text-sm font-bold text-gray-900">${p.amount_usdt} USDT</span>
                                            <span className="ml-2 text-xs text-gray-500">· {p.total_views.toLocaleString('tr-TR')} görüntülenme</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            p.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            p.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {p.status === 'pending' ? '⏳ Bekliyor' : p.status === 'approved' ? '✅ Onaylandı' : '❌ Reddedildi'}
                                        </span>
                                        <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>

                                {/* Kart içerik */}
                                <div className="px-6 py-4 grid sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div><span className="text-gray-400 text-xs">Ad Soyad:</span> <strong>{p.contact_name}</strong></div>
                                        <div><span className="text-gray-400 text-xs">Telegram:</span> <strong>@{p.contact_telegram}</strong></div>
                                        {p.contact_email && <div><span className="text-gray-400 text-xs">E-posta:</span> {p.contact_email}</div>}
                                    </div>
                                    <div className="space-y-2">
                                        {p.channel_name && <div><span className="text-gray-400 text-xs">Kanal:</span> <strong>{p.channel_name}</strong></div>}
                                        {p.channel_link && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 text-xs">Link:</span>
                                                <a href={p.channel_link.startsWith('http') ? p.channel_link : `https://${p.channel_link}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                                                    {p.channel_link} <ExternalLink size={10} />
                                                </a>
                                            </div>
                                        )}
                                        {p.ad_message && <div><span className="text-gray-400 text-xs">Reklam metni:</span> {p.ad_message}</div>}
                                        {p.notes && <div><span className="text-gray-400 text-xs">Not:</span> {p.notes}</div>}
                                    </div>
                                </div>

                                {/* TX Hash */}
                                {p.tx_hash ? (
                                    <div className="mx-6 mb-4 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                                        <span className="text-xs text-gray-400">TX Hash:</span>
                                        <code className="text-xs font-mono text-gray-700 flex-1 truncate">{p.tx_hash}</code>
                                        <button onClick={() => copy(p.tx_hash!, p.id + '_tx')} className="shrink-0 p-1 hover:bg-gray-200 rounded">
                                            {copiedId === p.id + '_tx' ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
                                        </button>
                                        <a href={`https://tronscan.org/#/transaction/${p.tx_hash}`} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700">
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="mx-6 mb-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-xs text-yellow-700 font-medium">
                                        ⚠️ TX hash henüz girilmemiş — ödeme belgesi yok
                                    </div>
                                )}

                                {/* Admin notu (onaylananlar/reddedilenler) */}
                                {p.admin_notes && !isPending && (
                                    <div className="mx-6 mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs text-blue-700">
                                        <strong>Admin Notu:</strong> {p.admin_notes}
                                    </div>
                                )}

                                {/* Aksiyonlar */}
                                {isPending && (
                                    <div className="px-6 pb-4 flex gap-3 flex-wrap">
                                        <button
                                            onClick={() => setApproveId(p.id)}
                                            className="flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition"
                                        >
                                            <CheckCircle2 size={16} /> Onayla
                                        </button>
                                        <button
                                            onClick={() => setRejectId(p.id)}
                                            className="flex items-center gap-2 bg-red-100 text-red-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-red-200 transition"
                                        >
                                            <XCircle size={16} /> Reddet
                                        </button>
                                        <a href={`https://t.me/${p.contact_telegram}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-200 transition">
                                            Telegram&apos;dan Yaz
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Onaylama Modal */}
            {approveId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Ödemeyi Onayla</h3>
                        <p className="text-sm text-gray-500 mb-4">Kampanya oluşturulacak. Kullanıcıya bildirim gönderilecek.</p>
                        <textarea
                            value={approveNote}
                            onChange={e => setApproveNote(e.target.value)}
                            placeholder="Admin notu (isteğe bağlı)..."
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleApprove} disabled={busy}
                                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-60">
                                {busy ? 'İşleniyor...' : '✅ Onayla'}
                            </button>
                            <button onClick={() => setApproveId(null)}
                                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reddetme Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Başvuruyu Reddet</h3>
                        <p className="text-sm text-gray-500 mb-4">Red nedeni kullanıcıya iletilecek.</p>
                        <textarea
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                            placeholder="Red nedeni (opsiyonel)..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleReject} disabled={busy}
                                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-60">
                                {busy ? 'İşleniyor...' : '❌ Reddet'}
                            </button>
                            <button onClick={() => setRejectId(null)}
                                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
