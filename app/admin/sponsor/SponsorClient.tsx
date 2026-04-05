'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Zap, Plus, Trash2, Search, CheckCircle2, XCircle,
    Globe, FolderTree, RefreshCw, AlertTriangle, Info
} from 'lucide-react';
import Image from 'next/image';

interface SponsoredSlot {
    id: string;
    channel_id: string;
    category_id: string | null;
    position: number;
    is_active: boolean;
    note: string | null;
    created_at: string;
    channels: {
        id: string;
        name: string;
        image: string | null;
        slug: string | null;
        member_count: number | null;
        categories: { name: string; slug: string } | null;
    };
}

interface Channel {
    id: string;
    name: string;
    image: string | null;
    slug: string | null;
    member_count: number | null;
    category_id: string | null;
    categories: { name: string; slug: string } | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function SponsorClient() {
    const [slots, setSlots] = useState<SponsoredSlot[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    // Form state
    const [searchQ, setSearchQ] = useState('');
    const [selectedChannelId, setSelectedChannelId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [note, setNote] = useState('');
    const [searchResults, setSearchResults] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    useEffect(() => {
        if (searchQ.length < 2) { setSearchResults([]); return; }
        const q = searchQ.toLowerCase();
        setSearchResults(channels.filter(c =>
            c.name.toLowerCase().includes(q)
        ).slice(0, 8));
    }, [searchQ, channels]);

    async function loadAll() {
        setLoading(true);
        try {
            const [slotsRes, channelsRes, catsRes] = await Promise.all([
                supabase
                    .from('sponsored_slots')
                    .select('*, channels(id, name, image, slug, member_count, categories(name, slug))')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('channels')
                    .select('id, name, image, slug, member_count, category_id, categories(name, slug)')
                    .eq('status', 'approved')
                    .order('name'),
                supabase
                    .from('categories')
                    .select('id, name, slug')
                    .order('name'),
            ]);

            if (slotsRes.data) setSlots(slotsRes.data as any);
            if (channelsRes.data) setChannels(channelsRes.data as any);
            if (catsRes.data) setCategories(catsRes.data as any);
        } finally {
            setLoading(false);
        }
    }

    async function addSlot() {
        if (!selectedChannelId) {
            setMsg({ type: 'err', text: 'Lütfen bir kanal seçin.' });
            return;
        }
        setSaving(true);
        const { error } = await supabase.from('sponsored_slots').insert({
            channel_id: selectedChannelId,
            category_id: selectedCategoryId || null,
            note: note || null,
            is_active: true,
            position: 1,
        });
        if (error) {
            setMsg({ type: 'err', text: `Hata: ${error.message}` });
        } else {
            setMsg({ type: 'ok', text: 'Sponsor slot eklendi!' });
            setSelectedChannelId('');
            setSelectedChannel(null);
            setSelectedCategoryId('');
            setNote('');
            setSearchQ('');
            loadAll();
        }
        setSaving(false);
        setTimeout(() => setMsg(null), 4000);
    }

    async function toggleSlot(id: string, current: boolean) {
        await supabase.from('sponsored_slots').update({ is_active: !current }).eq('id', id);
        setSlots(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
    }

    async function deleteSlot(id: string) {
        if (!confirm('Bu sponsor slotunu silmek istediğinizden emin misiniz?')) return;
        await supabase.from('sponsored_slots').delete().eq('id', id);
        setSlots(prev => prev.filter(s => s.id !== id));
        setMsg({ type: 'ok', text: 'Slot silindi.' });
        setTimeout(() => setMsg(null), 3000);
    }

    function pickChannel(ch: Channel) {
        setSelectedChannel(ch);
        setSelectedChannelId(ch.id);
        setSearchQ(ch.name);
        setSearchResults([]);
    }

    const activeCount = slots.filter(s => s.is_active).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <RefreshCw size={28} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Zap size={24} className="text-violet-600" />
                        Sponsor Yönetimi
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Kanal listesinin 1. pozisyonuna oturan kanalları buradan yönetin.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2">
                    <Zap size={14} className="text-violet-600" />
                    <span className="text-sm font-bold text-violet-700">{activeCount} Aktif Slot</span>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                    <strong>Nasıl çalışır?</strong> Buradan eklediğiniz kanal, anasayfa ve kategori sayfalarındaki kanal listesinin
                    tam <strong>1. pozisyonuna</strong> yerleşir. Kategori seçmezseniz tüm sayfalarda görünür.
                    Aynı anda birden fazla aktif slot varsa <strong>en son eklenen</strong> önceliklidir.
                </div>
            </div>

            {/* Feedback */}
            {msg && (
                <div className={`rounded-2xl px-5 py-4 flex items-center gap-3 font-bold text-sm ${msg.type === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── YENİ SLOT EKLE ── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Plus size={18} className="text-violet-600" />
                            Yeni Sponsor Ekle
                        </h2>

                        {/* Kanal Arama */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                    Kanal Seç *
                                </label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Kanal adı ile ara..."
                                        value={searchQ}
                                        onChange={e => setSearchQ(e.target.value)}
                                        className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                                    />
                                </div>

                                {/* Arama Sonuçları */}
                                {searchResults.length > 0 && (
                                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
                                        {searchResults.map(ch => (
                                            <button
                                                key={ch.id}
                                                onClick={() => pickChannel(ch)}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 text-left transition-colors border-b border-gray-100 last:border-0"
                                            >
                                                {ch.image ? (
                                                    <Image src={ch.image} alt={ch.name} width={36} height={36}
                                                        className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                                                        {ch.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">{ch.name}</div>
                                                    <div className="text-xs text-gray-400">{ch.categories?.name} · {ch.member_count?.toLocaleString() || 0} üye</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Seçilen Kanal */}
                                {selectedChannel && (
                                    <div className="mt-2 flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                                        {selectedChannel.image ? (
                                            <Image src={selectedChannel.image} alt={selectedChannel.name} width={36} height={36}
                                                className="w-9 h-9 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-sm">
                                                {selectedChannel.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-violet-900 text-sm truncate">{selectedChannel.name}</div>
                                            <div className="text-xs text-violet-600">{selectedChannel.categories?.name}</div>
                                        </div>
                                        <CheckCircle2 size={18} className="text-violet-600 shrink-0" />
                                    </div>
                                )}
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <FolderTree size={12} />
                                    Kategori Filtresi
                                </label>
                                <select
                                    value={selectedCategoryId}
                                    onChange={e => setSelectedCategoryId(e.target.value)}
                                    className="w-full py-3 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-white"
                                >
                                    <option value="">🌐 Tüm Sayfalar (Global)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Boş bırakırsanız tüm sayfalarda görünür.
                                </p>
                            </div>

                            {/* Not */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                    Admin Notu (opsiyonel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Örn: Aylık anlaşma, fiyat: $90"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                                />
                            </div>

                            <button
                                onClick={addSlot}
                                disabled={saving || !selectedChannelId}
                                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
                            >
                                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                                Sponsor Olarak Ekle
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── MEVCUT SLOTLAR ── */}
                <div className="lg:col-span-3">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Mevcut Sponsor Slotları
                        <span className="ml-2 text-sm font-normal text-gray-400">({slots.length} toplam)</span>
                    </h2>

                    {slots.length === 0 ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                            <Zap size={32} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Henüz sponsor slot yok</p>
                            <p className="text-gray-400 text-sm mt-1">Sol taraftan yeni slot ekleyin.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {slots.map(slot => (
                                <div
                                    key={slot.id}
                                    className={`bg-white border rounded-2xl p-5 transition-all ${slot.is_active ? 'border-violet-200 shadow-sm shadow-violet-50' : 'border-gray-200 opacity-60'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        {slot.channels?.image ? (
                                            <Image src={slot.channels.image} alt={slot.channels.name} width={52} height={52}
                                                className="w-13 h-13 rounded-xl object-cover border border-gray-100 shrink-0" />
                                        ) : (
                                            <div className="w-13 h-13 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg shrink-0 w-[52px] h-[52px]">
                                                {slot.channels?.name?.charAt(0) || '?'}
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-gray-900">{slot.channels?.name}</span>
                                                {slot.is_active ? (
                                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Aktif</span>
                                                ) : (
                                                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Pasif</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {slot.channels?.categories?.name || 'Kategori yok'} ·{' '}
                                                {slot.channels?.member_count?.toLocaleString() || 0} üye
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    {slot.category_id ? <FolderTree size={11} /> : <Globe size={11} />}
                                                    {slot.category_id
                                                        ? categories.find(c => c.id === slot.category_id)?.name || 'Bilinmeyen Kategori'
                                                        : 'Tüm Sayfalar'}
                                                </span>
                                                {slot.note && (
                                                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                                                        {slot.note}
                                                    </span>
                                                )}
                                                <span className="text-gray-300">
                                                    {new Date(slot.created_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => toggleSlot(slot.id, slot.is_active)}
                                                className={`p-2.5 rounded-xl transition-all ${slot.is_active
                                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                                                    }`}
                                                title={slot.is_active ? 'Pasife Al' : 'Aktive Et'}
                                            >
                                                {slot.is_active ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            </button>
                                            <button
                                                onClick={() => deleteSlot(slot.id)}
                                                className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
