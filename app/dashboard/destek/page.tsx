'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    LifeBuoy,
    Plus,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronLeft,
    MessageSquare,
    Tag,
    X,
} from 'lucide-react';

type Ticket = {
    id: string;
    subject: string;
    category: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
};

type Message = {
    id: string;
    ticket_id: string;
    sender_id: string;
    content: string;
    is_admin: boolean;
    created_at: string;
};

const CATEGORIES: Record<string, { label: string; icon: string }> = {
    genel: { label: 'Genel', icon: '💬' },
    teknik: { label: 'Teknik Sorun', icon: '🔧' },
    reklam: { label: 'Reklam & Kampanya', icon: '📢' },
    kanal: { label: 'Kanal İşlemleri', icon: '📺' },
    odeme: { label: 'Ödeme & Fatura', icon: '💳' },
    sikayet: { label: 'Şikâyet', icon: '⚠️' },
    oneri: { label: 'Öneri & İstek', icon: '💡' },
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    open: { label: 'Açık', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: Clock },
    in_progress: { label: 'İşleniyor', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30', icon: Loader2 },
    resolved: { label: 'Çözüldü', color: 'text-green-400 bg-green-400/10 border-green-400/30', icon: CheckCircle2 },
    closed: { label: 'Kapalı', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30', icon: AlertCircle },
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formSubject, setFormSubject] = useState('');
    const [formCategory, setFormCategory] = useState('genel');
    const [formMessage, setFormMessage] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (userId) loadTickets();
    }, [userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    }

    async function loadTickets() {
        setLoading(true);
        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .order('updated_at', { ascending: false });
        setTickets(data || []);
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

    async function createTicket(e: React.FormEvent) {
        e.preventDefault();
        if (!userId || !formSubject.trim() || !formMessage.trim()) return;
        setFormSubmitting(true);

        // Ticket oluştur
        const { data: ticket, error } = await supabase
            .from('support_tickets')
            .insert({ user_id: userId, subject: formSubject.trim(), category: formCategory })
            .select()
            .single();

        if (ticket && !error) {
            // İlk mesajı ekle
            await supabase.from('support_messages').insert({
                ticket_id: ticket.id,
                sender_id: userId,
                content: formMessage.trim(),
                is_admin: false,
            });

            setFormSubject('');
            setFormCategory('genel');
            setFormMessage('');
            setShowNewForm(false);
            await loadTickets();
            openTicket(ticket as Ticket);
        }
        setFormSubmitting(false);
    }

    async function sendMessage() {
        if (!selectedTicket || !userId || !newMessage.trim()) return;
        setSending(true);

        await supabase.from('support_messages').insert({
            ticket_id: selectedTicket.id,
            sender_id: userId,
            content: newMessage.trim(),
            is_admin: false,
        });

        // Ticket updated_at güncelle
        await supabase
            .from('support_tickets')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', selectedTicket.id);

        setNewMessage('');
        await loadMessages(selectedTicket.id);
        setSending(false);
    }

    function openTicket(ticket: Ticket) {
        setSelectedTicket(ticket);
        loadMessages(ticket.id);
    }

    function formatDate(d: string) {
        return new Date(d).toLocaleString('tr-TR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    function timeAgo(d: string) {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}dk önce`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}sa önce`;
        const days = Math.floor(hours / 24);
        return `${days}g önce`;
    }

    // ============= TICKET LİSTESİ =============
    if (!selectedTicket && !showNewForm) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <LifeBuoy className="text-violet-400" size={24} />
                            Destek Merkezi
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Sorularınız ve sorunlarınız için destek talebi açın</p>
                    </div>
                    <button
                        onClick={() => setShowNewForm(true)}
                        className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/30"
                    >
                        <Plus size={16} />
                        Yeni Talep
                    </button>
                </div>

                {/* Ticket Listesi */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-violet-400" size={32} />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800/60">
                        <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-white mb-2">Henüz destek talebiniz yok</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Bir sorun mu yaşıyorsunuz? Hemen yeni bir destek talebi oluşturun.
                        </p>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all"
                        >
                            <Plus size={16} />
                            İlk Talebini Oluştur
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map((ticket) => {
                            const status = STATUS_MAP[ticket.status] || STATUS_MAP.open;
                            const StatusIcon = status.icon;
                            const cat = CATEGORIES[ticket.category] || CATEGORIES.genel;
                            return (
                                <button
                                    key={ticket.id}
                                    onClick={() => openTicket(ticket)}
                                    className="w-full text-left bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/60 hover:border-violet-500/30 rounded-xl p-4 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{cat.icon}</span>
                                                <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                                                    {ticket.subject}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${status.color}`}>
                                                    <StatusIcon size={11} />
                                                    {status.label}
                                                </span>
                                                <span>{cat.label}</span>
                                                <span>·</span>
                                                <span>{timeAgo(ticket.updated_at)}</span>
                                            </div>
                                        </div>
                                        <ChevronLeft size={16} className="text-slate-600 group-hover:text-violet-400 transition-colors rotate-180 shrink-0 mt-1" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ============= YENİ TALEP FORMU =============
    if (showNewForm) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <button
                    onClick={() => setShowNewForm(false)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={16} />
                    Geri Dön
                </button>

                <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-6">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                        <Plus className="text-violet-400" size={20} />
                        Yeni Destek Talebi
                    </h2>

                    <form onSubmit={createTicket} className="space-y-5">
                        {/* Konu */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Konu</label>
                            <input
                                type="text"
                                value={formSubject}
                                onChange={(e) => setFormSubject(e.target.value)}
                                placeholder="Sorununuzu kısaca özetleyin..."
                                required
                                maxLength={120}
                                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            />
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                <Tag size={14} className="inline mr-1" />
                                Kategori
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Object.entries(CATEGORIES).map(([key, val]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFormCategory(key)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                            formCategory === key
                                                ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                                                : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600/60 hover:text-slate-300'
                                        }`}
                                    >
                                        <span>{val.icon}</span>
                                        {val.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mesaj */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Mesajınız</label>
                            <textarea
                                value={formMessage}
                                onChange={(e) => setFormMessage(e.target.value)}
                                placeholder="Sorununuzu detaylı açıklayın. Ekran görüntüsü, link vb. paylaşabilirsiniz..."
                                required
                                rows={5}
                                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={formSubmitting || !formSubject.trim() || !formMessage.trim()}
                            className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {formSubmitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Gönderiliyor...</>
                            ) : (
                                <><Send size={16} /> Talebi Gönder</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ============= TICKET DETAY & MESAJLAŞMA =============
    if (!selectedTicket) return null;
    const status = STATUS_MAP[selectedTicket.status] || STATUS_MAP.open;
    const StatusIcon = status.icon;
    const cat = CATEGORIES[selectedTicket.category] || CATEGORIES.genel;

    return (
        <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
            {/* Header */}
            <div className="shrink-0 mb-4">
                <button
                    onClick={() => { setSelectedTicket(null); loadTickets(); }}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-3"
                >
                    <ChevronLeft size={16} />
                    Tüm Talepler
                </button>

                <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-bold text-white flex items-center gap-2">
                                <span>{cat.icon}</span>
                                {selectedTicket.subject}
                            </h2>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${status.color}`}>
                                    <StatusIcon size={11} />
                                    {status.label}
                                </span>
                                <span>{cat.label}</span>
                                <span>·</span>
                                <span>{formatDate(selectedTicket.created_at)}</span>
                            </div>
                        </div>
                        {selectedTicket.status !== 'closed' && (
                            <button
                                onClick={async () => {
                                    await supabase
                                        .from('support_tickets')
                                        .update({ status: 'closed', updated_at: new Date().toISOString() })
                                        .eq('id', selectedTicket.id);
                                    setSelectedTicket({ ...selectedTicket, status: 'closed' });
                                }}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-900/20"
                            >
                                <X size={13} />
                                Kapat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
                {msgLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-violet-400" size={24} />
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                msg.is_admin
                                    ? 'bg-slate-800/80 border border-slate-700/40 rounded-tl-md'
                                    : 'bg-violet-600/20 border border-violet-500/20 rounded-tr-md'
                            }`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[11px] font-bold ${msg.is_admin ? 'text-sky-400' : 'text-violet-400'}`}>
                                        {msg.is_admin ? '🛡️ Destek Ekibi' : '👤 Sen'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">{timeAgo(msg.created_at)}</span>
                                </div>
                                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Gönder */}
            {selectedTicket.status !== 'closed' && (
                <div className="shrink-0 pt-3 border-t border-slate-800/60">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Mesajınızı yazın..."
                            className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !newMessage.trim()}
                            className="bg-violet-600 text-white px-4 py-3 rounded-xl hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
