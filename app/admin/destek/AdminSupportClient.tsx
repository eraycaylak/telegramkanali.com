'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LifeBuoy, Clock, CheckCircle2, AlertCircle, Loader2, Send, RefreshCw, ChevronLeft } from 'lucide-react';

type Ticket = {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    contact_telegram?: string | null;
    contact_name?: string | null;
    profiles?: { email: string; full_name: string | null };
};

type Message = {
    id: string;
    ticket_id: string;
    sender_id: string;
    content: string;
    is_admin: boolean;
    created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    open: { label: 'Açık', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    in_progress: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    resolved: { label: 'Çözüldü', color: 'bg-green-100 text-green-700 border-green-200' },
    closed: { label: 'Kapalı', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const CATEGORIES: Record<string, string> = {
    genel: '💬 Genel',
    teknik: '🔧 Teknik',
    reklam: '📢 Reklam',
    kanal: '📺 Kanal',
    odeme: '💳 Ödeme',
    sikayet: '⚠️ Şikâyet',
    oneri: '💡 Öneri',
};

export default function AdminSupportClient() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('open');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [adminId, setAdminId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setAdminId(data.user.id);
        });
        loadTickets();
    }, []);

    useEffect(() => {
        loadTickets();
    }, [filterStatus]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadTickets() {
        setLoading(true);
        let query = supabase
            .from('support_tickets')
            .select('*, profiles(email, full_name)')
            .order('updated_at', { ascending: false });

        if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
        }

        const { data } = await query;
        setTickets((data as Ticket[]) || []);
        setLoading(false);
    }

    async function loadMessages(ticketId: string) {
        setMsgLoading(true);
        const { data } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        setMessages(data || []);
        setMsgLoading(false);
    }

    async function updateStatus(status: string) {
        if (!selectedTicket) return;
        await supabase
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', selectedTicket.id);
        setSelectedTicket({ ...selectedTicket, status });
        loadTickets();
    }

    async function sendReply() {
        if (!selectedTicket || !adminId || !reply.trim()) return;
        setSending(true);
        await supabase.from('support_messages').insert({
            ticket_id: selectedTicket.id,
            sender_id: adminId,
            content: reply.trim(),
            is_admin: true,
        });
        await supabase
            .from('support_tickets')
            .update({ status: 'in_progress', updated_at: new Date().toISOString() })
            .eq('id', selectedTicket.id);
        setReply('');
        await loadMessages(selectedTicket.id);
        setSending(false);
    }

    function timeAgo(d: string) {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}dk`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}sa`;
        return `${Math.floor(hours / 24)}g`;
    }

    // Ticket listesi
    if (!selectedTicket) {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <LifeBuoy className="text-blue-600" size={26} />
                            Destek Talepleri
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Kullanıcılardan gelen destek bildirimleri</p>
                    </div>
                    <button onClick={loadTickets} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Filtreler */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'open', label: '🟡 Açık' },
                        { key: 'in_progress', label: '🔵 İşleniyor' },
                        { key: 'resolved', label: '🟢 Çözüldü' },
                        { key: 'closed', label: '⚪ Kapalı' },
                        { key: 'all', label: '📋 Tümü' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilterStatus(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterStatus === f.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Tablo */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-blue-600" size={28} />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
                        <LifeBuoy size={36} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-bold">Bu filtrede talep yok</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    <th className="px-5 py-3 text-left">Konu</th>
                                    <th className="px-5 py-3 text-left hidden sm:table-cell">Kullanıcı</th>
                                    <th className="px-5 py-3 text-left hidden md:table-cell">Kategori</th>
                                    <th className="px-5 py-3 text-left">Durum</th>
                                    <th className="px-5 py-3 text-left hidden sm:table-cell">Son Güncelleme</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map(ticket => {
                                    const status = STATUS_MAP[ticket.status] || STATUS_MAP.open;
                                    return (
                                        <tr
                                            key={ticket.id}
                                            onClick={() => { setSelectedTicket(ticket); loadMessages(ticket.id); }}
                                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-5 py-3.5 font-semibold text-gray-900 max-w-[200px] truncate">
                                                {ticket.subject}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                                                {ticket.contact_telegram
                                                    ? <div className="text-xs font-mono">@{ticket.contact_telegram}</div>
                                                    : ticket.profiles?.email
                                                        ? <div className="text-xs">{ticket.profiles.email}</div>
                                                        : <div className="text-xs text-gray-300">—</div>
                                                }
                                                {ticket.contact_name && (
                                                    <div className="text-xs text-gray-400">{ticket.contact_name}</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell text-xs">
                                                {CATEGORIES[ticket.category] || ticket.category}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-gray-400 hidden sm:table-cell">
                                                {timeAgo(ticket.updated_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // Ticket detay
    const status = STATUS_MAP[selectedTicket.status] || STATUS_MAP.open;
    return (
        <div className="max-w-3xl space-y-4">
            {/* Geri & Başlık */}
            <button
                onClick={() => { setSelectedTicket(null); loadTickets(); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ChevronLeft size={16} /> Tüm Talepler
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="font-black text-gray-900 text-lg">{selectedTicket.subject}</h2>
                        <div className="text-xs text-gray-500 mt-1 space-x-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full border font-semibold ${status.color}`}>{status.label}</span>
                            <span>{CATEGORIES[selectedTicket.category] || selectedTicket.category}</span>
                            <span>·</span>
                            <span className="font-mono">
                                {selectedTicket.contact_telegram
                                    ? `@${selectedTicket.contact_telegram}`
                                    : selectedTicket.profiles?.email || 'Bilinmiyor'
                                }
                            </span>
                            {selectedTicket.contact_name && (
                                <span className="text-gray-400">({selectedTicket.contact_name})</span>
                            )}
                        </div>
                    </div>
                    {/* Durum Değiştir */}
                    <div className="flex gap-2 flex-wrap">
                        {selectedTicket.status !== 'in_progress' && (
                            <button onClick={() => updateStatus('in_progress')} className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-200 transition">
                                İşleniyor İşaretle
                            </button>
                        )}
                        {selectedTicket.status !== 'resolved' && (
                            <button onClick={() => updateStatus('resolved')} className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition">
                                ✅ Çözüldü
                            </button>
                        )}
                        {selectedTicket.status !== 'closed' && (
                            <button onClick={() => updateStatus('closed')} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition">
                                Kapat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mesajlar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto">
                {msgLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-blue-500" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">Henüz mesaj yok.</p>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.is_admin ? 'bg-blue-600 text-white rounded-tr-md' : 'bg-gray-100 text-gray-900 rounded-tl-md'}`}>
                                <p className={`text-[11px] font-bold mb-1 ${msg.is_admin ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {msg.is_admin ? '🛡️ Admin' : '👤 Kullanıcı'} · {timeAgo(msg.created_at)}
                                </p>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Yanıt Gönder */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex gap-3">
                    <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Yanıtınızı yazın..."
                        rows={3}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                        onClick={sendReply}
                        disabled={sending || !reply.trim()}
                        className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {sending ? '' : 'Gönder'}
                    </button>
                </div>
            </div>
        </div>
    );
}
