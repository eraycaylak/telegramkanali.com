'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    LifeBuoy, Plus, ChevronLeft, Send, Loader2,
    CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle,
} from 'lucide-react';

type Ticket = {
    id: string;
    subject: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
};

type Message = {
    id: string;
    content: string;
    is_admin: boolean;
    created_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    open:        { label: 'Açık',      color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    in_progress: { label: 'İşleniyor', color: 'bg-blue-100   text-blue-700   border-blue-200'   },
    resolved:    { label: 'Çözüldü',   color: 'bg-green-100  text-green-700  border-green-200'  },
    closed:      { label: 'Kapalı',    color: 'bg-gray-100   text-gray-500   border-gray-200'   },
};

const CATEGORIES = [
    { value: 'genel',   label: '💬 Genel Soru'    },
    { value: 'teknik',  label: '🔧 Teknik Sorun'  },
    { value: 'reklam',  label: '📢 Reklam'         },
    { value: 'kanal',   label: '📺 Kanal İşlemi'   },
    { value: 'odeme',   label: '💳 Ödeme'           },
    { value: 'sikayet', label: '⚠️ Şikâyet'        },
    { value: 'oneri',   label: '💡 Öneri'           },
];

function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'az önce';
    if (m < 60) return `${m} dk önce`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} sa önce`;
    return `${Math.floor(h / 24)} gün önce`;
}

// ── Yeni Ticket Formu ────────────────────────────────────────────────────────
function NewTicketForm({ userId, defaultCategory, onSuccess, onCancel }: {
    userId: string;
    defaultCategory?: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const fd       = new FormData(e.currentTarget);
        const subject  = (fd.get('subject')  as string || '').trim();
        const category = (fd.get('category') as string || 'genel').trim();
        const message  = (fd.get('message')  as string || '').trim();

        if (!subject || !message) {
            setError('Konu ve mesaj zorunludur.');
            setLoading(false);
            return;
        }

        // 1) Ticket oluştur
        const { data: ticket, error: ticketErr } = await supabase
            .from('support_tickets')
            .insert({ user_id: userId, subject, category, status: 'open', priority: 'normal' })
            .select('id')
            .single();

        if (ticketErr || !ticket) {
            console.error('[createTicket]', ticketErr);
            setError('Ticket oluşturulamadı: ' + (ticketErr?.message || 'Bilinmeyen hata'));
            setLoading(false);
            return;
        }

        // 2) İlk mesajı ekle
        const { error: msgErr } = await supabase
            .from('support_messages')
            .insert({ ticket_id: ticket.id, sender_id: userId, content: message, is_admin: false });

        if (msgErr) {
            console.error('[createTicket] msg', msgErr);
            // Ticket oluştu, mesaj gitmedi — yine de devam et
        }

        setLoading(false);
        formRef.current?.reset();
        onSuccess();
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Plus size={20} className="text-blue-600" /> Yeni Destek Talebi
                </h2>
                <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-700 transition">
                    İptal
                </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Konu *</label>
                    <input
                        required name="subject"
                        placeholder="Kısaca konuyu yazın..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Kategori</label>
                    <select
                        name="category" defaultValue={defaultCategory || 'genel'}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Mesajınız *</label>
                    <textarea
                        required name="message" rows={5}
                        placeholder="Sorununuzu veya talebinizi detaylı açıklayın..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" /> {error}
                    </div>
                )}

                <button
                    type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {loading ? 'Gönderiliyor...' : 'Talep Oluştur'}
                </button>
            </form>
        </div>
    );
}

// ── Ticket Detay (sohbet) ────────────────────────────────────────────────────
function TicketDetail({ ticket, userId, onBack }: {
    ticket: Ticket;
    userId: string;
    onBack: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(true);
    const [sending, setSending]         = useState(false);
    const [replyError, setReplyError]   = useState('');
    const formRef  = useRef<HTMLFormElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    async function loadMessages() {
        setLoadingMsgs(true);
        const { data } = await supabase
            .from('support_messages')
            .select('id, content, is_admin, created_at')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });
        setMessages(data || []);
        setLoadingMsgs(false);
    }

    useEffect(() => { loadMessages(); }, [ticket.id]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    async function handleReply(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setReplyError('');
        const fd      = new FormData(e.currentTarget);
        const content = (fd.get('content') as string || '').trim();
        if (!content) return;

        setSending(true);
        const { error } = await supabase
            .from('support_messages')
            .insert({ ticket_id: ticket.id, sender_id: userId, content, is_admin: false });

        if (error) {
            setReplyError('Mesaj gönderilemedi: ' + error.message);
            setSending(false);
            return;
        }

        await supabase
            .from('support_tickets')
            .update({ status: 'open', updated_at: new Date().toISOString() })
            .eq('id', ticket.id);

        formRef.current?.reset();
        setSending(false);
        await loadMessages();
    }

    const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
    const catLabel   = CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category;
    const isClosed   = ticket.status === 'closed';

    return (
        <div className="space-y-4">
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
            >
                <ChevronLeft size={16} /> Tüm Talepler
            </button>

            {/* Ticket başlığı */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="font-black text-gray-900 text-lg">{ticket.subject}</h2>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusConf.color}`}>
                                {statusConf.label}
                            </span>
                            <span className="text-xs text-gray-400">{catLabel}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-400">{timeAgo(ticket.created_at)}</span>
                        </div>
                    </div>
                    <button onClick={loadMessages} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition" title="Yenile">
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* Mesajlar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 min-h-[280px] max-h-[460px] overflow-y-auto space-y-3">
                {loadingMsgs ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-blue-500" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-16">Henüz mesaj yok.</p>
                ) : messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.is_admin
                                ? 'bg-gray-100 text-gray-900 rounded-tl-md'
                                : 'bg-blue-600 text-white rounded-tr-md'
                        }`}>
                            <p className={`text-[11px] font-bold mb-1 ${msg.is_admin ? 'text-gray-500' : 'text-blue-200'}`}>
                                {msg.is_admin ? '🛡️ Destek Ekibi' : '👤 Siz'} · {timeAgo(msg.created_at)}
                            </p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Yanıt kutusu */}
            {!isClosed ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <form ref={formRef} onSubmit={handleReply} className="flex gap-3">
                        <textarea
                            required name="content" rows={3}
                            placeholder="Yanıtınızı yazın..."
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <button
                            type="submit" disabled={sending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl transition disabled:opacity-50 flex flex-col items-center justify-center gap-1.5 font-bold text-xs"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {!sending && <span>Gönder</span>}
                        </button>
                    </form>
                    {replyError && (
                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle size={13} /> {replyError}
                        </p>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center text-sm text-gray-500">
                    Bu talep kapatılmış. Yeni bir soru için yeni talep oluşturun.
                </div>
            )}
        </div>
    );
}

// ── Ticket Listesi ───────────────────────────────────────────────────────────
function TicketList({ tickets, loading, onSelect, onNew, onRefresh }: {
    tickets: Ticket[];
    loading: boolean;
    onSelect: (t: Ticket) => void;
    onNew: () => void;
    onRefresh: () => void;
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <LifeBuoy size={20} className="text-blue-600" /> Destek Taleplerim
                </h2>
                <div className="flex gap-2">
                    <button onClick={onRefresh} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition" title="Yenile">
                        <RefreshCw size={15} />
                    </button>
                    <button
                        onClick={onNew}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                        <Plus size={14} /> Yeni Talep
                    </button>
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                    <LifeBuoy size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="font-bold text-gray-700 mb-1">Henüz destek talebi yok</p>
                    <p className="text-sm text-gray-400 mb-6">Sorularınız veya sorunlarınız için bize ulaşın.</p>
                    <button
                        onClick={onNew}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition"
                    >
                        <Plus size={16} /> İlk Talebi Oluştur
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <th className="px-5 py-3 text-left">Konu</th>
                                <th className="px-5 py-3 text-left hidden sm:table-cell">Kategori</th>
                                <th className="px-5 py-3 text-left">Durum</th>
                                <th className="px-5 py-3 text-left hidden sm:table-cell">Güncelleme</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tickets.map(ticket => {
                                const conf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                                const cat  = CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category;
                                return (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => onSelect(ticket)}
                                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-5 py-4 font-semibold text-gray-900 max-w-[200px] truncate">{ticket.subject}</td>
                                        <td className="px-5 py-4 text-gray-500 text-xs hidden sm:table-cell">{cat}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${conf.color}`}>
                                                {conf.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-400 hidden sm:table-cell">{timeAgo(ticket.updated_at)}</td>
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

// ── Ana bileşen ──────────────────────────────────────────────────────────────
export default function DestekClient({ userId, defaultCategory }: {
    userId: string;
    defaultCategory?: string;
}) {
    const [view, setView]                   = useState<'list' | 'new' | 'detail'>('list');
    const [tickets, setTickets]             = useState<Ticket[]>([]);
    const [loading, setLoading]             = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    async function loadTickets() {
        setLoading(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('id, subject, category, status, created_at, updated_at')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        if (error) console.error('[loadTickets]', error);
        setTickets(data || []);
        setLoading(false);
    }

    useEffect(() => { loadTickets(); }, [userId]);

    if (view === 'new') {
        return (
            <NewTicketForm
                userId={userId}
                defaultCategory={defaultCategory}
                onSuccess={() => { loadTickets(); setView('list'); }}
                onCancel={() => setView('list')}
            />
        );
    }

    if (view === 'detail' && selectedTicket) {
        return (
            <TicketDetail
                ticket={selectedTicket}
                userId={userId}
                onBack={() => { setSelectedTicket(null); setView('list'); loadTickets(); }}
            />
        );
    }

    return (
        <TicketList
            tickets={tickets}
            loading={loading}
            onSelect={t => { setSelectedTicket(t); setView('detail'); }}
            onNew={() => setView('new')}
            onRefresh={loadTickets}
        />
    );
}
