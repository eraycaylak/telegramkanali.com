'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import {
    DollarSign, Plus, Trash2, Eye, ExternalLink, CheckCircle2,
    Clock, XCircle, ChevronDown, ChevronUp, Info, Users,
    TrendingUp, Shield, Loader2, AlertCircle, BarChart3,
    MessageSquare, Star
} from 'lucide-react';

const CURRENCY_OPTIONS = [
    { value: 'USDT', label: '💎 USDT', desc: 'TRC-20 / BEP-20' },
    { value: 'STARS', label: '⭐ Telegram Yıldız', desc: 'Telegram\'dan direkt' },
    { value: 'BOTH', label: '💎⭐ Her İkisi', desc: 'Alıcı seçer' },
];

const CATEGORY_OPTIONS = [
    'Kripto & Borsa', 'Haber & Gündem', 'Eğlence & Komedi',
    'Teknoloji', 'Finans & Yatırım', 'Spor', 'Oyun',
    'Sağlık & Fitness', 'Eğitim', 'Seyahat', 'Müzik', 'Diğer',
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    active:   { label: 'Aktif',     color: '#34d399', bg: 'rgba(16,185,129,0.15)',  icon: CheckCircle2 },
    sold:     { label: 'Satıldı',   color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', icon: CheckCircle2 },
    suspended:{ label: 'Askıda',    color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: AlertCircle },
    withdrawn:{ label: 'Kaldırıldı',color: '#f87171', bg: 'rgba(239,68,68,0.15)',  icon: XCircle },
};

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending:             { label: 'Teklif Bekleniyor', color: '#fbbf24' },
    accepted:            { label: 'Kabul Edildi',      color: '#34d399' },
    escrow_funded:       { label: 'Escrow Ödendi',     color: '#38bdf8' },
    transfer_started:    { label: 'Transfer Başladı',  color: '#a78bfa' },
    transfer_completed:  { label: 'Transfer Tamam',    color: '#34d399' },
    disputed:            { label: 'Anlaşmazlık',       color: '#f87171' },
    cancelled:           { label: 'İptal',             color: '#64748b' },
    completed:           { label: 'Tamamlandı ✓',     color: '#34d399' },
};

interface Props {
    userId: string;
    userProfile: any;
    myChannels: any[];
    myListings: any[];
    incomingOrders: any[];
}

const defaultForm = {
    // İlan tipi
    useExistingChannel: false,
    channelId: '',

    // Kanal bilgileri (manuel)
    channelName: '',
    channelUsername: '',
    channelImage: '',
    channelMemberCount: '',

    // İlan bilgileri
    title: '',
    description: '',
    askingPrice: '',
    currency: 'USDT',
    priceNegotiable: false,
    category: '',
    niche: '',
    ageMonths: '',
    monthlyIncomeEst: '',
    engagementRate: '',
    transferMethod: 'admin_transfer',
};

export default function KanalSatClient({ userId, userProfile, myChannels, myListings, incomingOrders }: Props) {
    const [tab, setTab] = useState<'new' | 'listings' | 'orders'>('new');
    const [form, setForm] = useState({ ...defaultForm });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [listings, setListings] = useState(myListings);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    function updateForm(key: string, value: any) {
        setForm(f => ({ ...f, [key]: value }));
    }

    // Mevcut kanaldan otomatik doldur
    function fillFromChannel(channelId: string) {
        const ch = myChannels.find(c => c.id === channelId);
        if (!ch) return;
        setForm(f => ({
            ...f,
            channelId,
            channelName: ch.name || '',
            channelUsername: ch.username || '',
            channelImage: ch.image || '',
            channelMemberCount: ch.member_count?.toString() || '',
            title: ch.name ? `${ch.name} Kanalı Satışta` : '',
            category: ch.category_id || '',
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.title.trim()) { setError('İlan başlığı zorunlu'); return; }
        if (!form.askingPrice || parseFloat(form.askingPrice) <= 0) { setError('Geçerli bir satış fiyatı girin'); return; }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Oturum bulunamadı');

            const payload: any = {
                seller_id: userId,
                title: form.title.trim(),
                description: form.description.trim() || null,
                asking_price: parseFloat(form.askingPrice),
                currency: form.currency,
                price_negotiable: form.priceNegotiable,
                category: form.category || null,
                niche: form.niche.trim() || null,
                age_months: form.ageMonths ? parseInt(form.ageMonths) : null,
                monthly_income_est: form.monthlyIncomeEst ? parseFloat(form.monthlyIncomeEst) : null,
                engagement_rate: form.engagementRate ? parseFloat(form.engagementRate) : null,
                transfer_method: form.transferMethod,
                channel_name: form.channelName.trim() || null,
                channel_username: form.channelUsername.trim() || null,
                channel_image: form.channelImage.trim() || null,
                member_count: form.channelMemberCount ? parseInt(form.channelMemberCount) : null,
                status: 'active',
            };

            if (form.channelId) payload.channel_id = form.channelId;

            const { data, error: insertErr } = await supabase
                .from('channel_listings')
                .insert(payload)
                .select()
                .single();

            if (insertErr) throw insertErr;

            setListings(prev => [data, ...prev]);
            setForm({ ...defaultForm });
            setSuccess('İlanınız başarıyla yayınlandı! Marketplace\'te görünmeye başladı.');
            setTab('listings');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }

    async function deleteListing(id: string) {
        setDeletingId(id);
        try {
            await supabase.from('channel_listings').update({ status: 'withdrawn' }).eq('id', id);
            setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'withdrawn' } : l));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Başlık */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <DollarSign size={22} className="text-emerald-400" />
                        Kanalımı Sat
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Telegram kanalınızı escrow güvencesiyle listeleyin. İlan ücretsiz, sadece satıştan %5 komisyon.
                    </p>
                </div>
                <Link href="/marketplace" target="_blank"
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-emerald-400 transition-all hover:text-emerald-300"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <ExternalLink size={13} />
                    Marketplace&apos;i Görüntüle
                </Link>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {([
                    { key: 'new', label: '+ Yeni İlan', icon: Plus },
                    { key: 'listings', label: `İlanlarım (${listings.length})`, icon: BarChart3 },
                    { key: 'orders', label: `Teklifler (${incomingOrders.length})`, icon: MessageSquare },
                ] as const).map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all"
                        style={{
                            background: tab === t.key ? 'rgba(16,185,129,0.15)' : 'transparent',
                            color: tab === t.key ? '#34d399' : 'rgba(148,163,184,0.7)',
                            border: tab === t.key ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
                        }}>
                        <t.icon size={13} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: Yeni İlan ─────────────────────────────────── */}
            {tab === 'new' && (
                <div className="rounded-2xl p-6"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

                    {success && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl p-4"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-300 font-bold">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mevcut kanal seç */}
                        {myChannels.length > 0 && (
                            <FormSection title="Kayıtlı Kanallardan Seç" subtitle="Platformda kayıtlı kanalınızı seçerek otomatik doldurun (opsiyonel)">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {myChannels.map(ch => (
                                        <button
                                            type="button"
                                            key={ch.id}
                                            onClick={() => {
                                                if (form.channelId === ch.id) {
                                                    setForm({ ...defaultForm });
                                                } else {
                                                    fillFromChannel(ch.id);
                                                }
                                            }}
                                            className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                                            style={{
                                                background: form.channelId === ch.id ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${form.channelId === ch.id ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                            }}>
                                            {ch.image ? (
                                                <img src={ch.image} alt={ch.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0"
                                                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                                                    {(ch.name || 'T')[0]}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{ch.name}</div>
                                                <div className="text-[10px] text-slate-500">{ch.member_count?.toLocaleString('tr-TR')} üye</div>
                                            </div>
                                            {form.channelId === ch.id && <CheckCircle2 size={14} className="text-emerald-400 ml-auto shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </FormSection>
                        )}

                        {/* Kanal Bilgileri */}
                        <FormSection title="Kanal Bilgileri" subtitle="Satılık kanalın temel bilgilerini girin">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    label="Kanal Adı *"
                                    value={form.channelName}
                                    onChange={v => updateForm('channelName', v)}
                                    placeholder="Örn: Kripto Analiz TR"
                                />
                                <FormInput
                                    label="Telegram Kullanıcı Adı"
                                    value={form.channelUsername}
                                    onChange={v => updateForm('channelUsername', v)}
                                    placeholder="@olmadan (örn: kriptoanaliz)"
                                    prefix="@"
                                />
                                <FormInput
                                    label="Üye Sayısı"
                                    type="number"
                                    value={form.channelMemberCount}
                                    onChange={v => updateForm('channelMemberCount', v)}
                                    placeholder="Örn: 15000"
                                    icon={Users}
                                />
                                <FormInput
                                    label="Kanal Yaşı (Ay)"
                                    type="number"
                                    value={form.ageMonths}
                                    onChange={v => updateForm('ageMonths', v)}
                                    placeholder="Örn: 18"
                                />
                                <FormInput
                                    label="Kanal Resmi URL (opsiyonel)"
                                    value={form.channelImage}
                                    onChange={v => updateForm('channelImage', v)}
                                    placeholder="https://..."
                                    className="sm:col-span-2"
                                />
                            </div>
                        </FormSection>

                        {/* İlan Detayları */}
                        <FormSection title="İlan Detayları" subtitle="Alıcıların göreceği açıklama ve istatistikler">
                            <div className="space-y-4">
                                <FormInput
                                    label="İlan Başlığı *"
                                    value={form.title}
                                    onChange={v => updateForm('title', v)}
                                    placeholder="Örn: 15K Üyeli Kripto Analiz Kanalı Satışta"
                                />
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Kanal Açıklaması
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => updateForm('description', e.target.value)}
                                        placeholder="Kanalınız hakkında detaylı bilgi verin: içerik türü, hedef kitle, gelir modeli, büyüme trendi..."
                                        rows={4}
                                        className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                                            Kategori
                                        </label>
                                        <select
                                            value={form.category}
                                            onChange={e => updateForm('category', e.target.value)}
                                            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <option value="">Kategori seçin...</option>
                                            {CATEGORY_OPTIONS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <FormInput
                                        label="Niş Alan"
                                        value={form.niche}
                                        onChange={v => updateForm('niche', v)}
                                        placeholder="Örn: Türk BTC analistleri"
                                    />
                                    <FormInput
                                        label="Tahmini Aylık Gelir (USDT)"
                                        type="number"
                                        value={form.monthlyIncomeEst}
                                        onChange={v => updateForm('monthlyIncomeEst', v)}
                                        placeholder="Örn: 500"
                                        icon={DollarSign}
                                    />
                                    <FormInput
                                        label="Etkileşim Oranı (%)"
                                        type="number"
                                        value={form.engagementRate}
                                        onChange={v => updateForm('engagementRate', v)}
                                        placeholder="Örn: 12.5"
                                        icon={TrendingUp}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        {/* Fiyat & Ödeme */}
                        <FormSection title="Fiyat & Ödeme" subtitle="Satış fiyatı ve kabul ettiğiniz ödeme yöntemi">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    label="Satış Fiyatı *"
                                    type="number"
                                    value={form.askingPrice}
                                    onChange={v => updateForm('askingPrice', v)}
                                    placeholder="Örn: 2500"
                                    icon={DollarSign}
                                />
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Para Birimi *
                                    </label>
                                    <div className="flex gap-2">
                                        {CURRENCY_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => updateForm('currency', opt.value)}
                                                className="flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition-all"
                                                style={{
                                                    background: form.currency === opt.value ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${form.currency === opt.value ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                                    color: form.currency === opt.value ? '#34d399' : '#94a3b8',
                                                }}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer sm:col-span-2">
                                    <div
                                        onClick={() => updateForm('priceNegotiable', !form.priceNegotiable)}
                                        className="relative h-5 w-9 rounded-full transition-all cursor-pointer flex-shrink-0"
                                        style={{ background: form.priceNegotiable ? '#10b981' : 'rgba(255,255,255,0.15)' }}>
                                        <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                                            style={{ left: form.priceNegotiable ? '20px' : '2px' }} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Pazarlık yapılabilir</div>
                                        <div className="text-xs text-slate-500">Alıcılar farklı teklifler sunabilir</div>
                                    </div>
                                </label>
                            </div>

                            {/* Komisyon bilgisi */}
                            {form.askingPrice && parseFloat(form.askingPrice) > 0 && form.currency !== 'STARS' && (
                                <div className="mt-4 rounded-xl p-4"
                                    style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                    <div className="text-xs font-bold text-emerald-400 mb-2">Komisyon Hesabı</div>
                                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                        <div>
                                            <div className="font-black text-white">${parseFloat(form.askingPrice).toLocaleString('tr-TR')} USDT</div>
                                            <div className="text-slate-500 mt-0.5">Satış Fiyatı</div>
                                        </div>
                                        <div>
                                            <div className="font-black" style={{ color: '#f87171' }}>-${(parseFloat(form.askingPrice) * 0.05).toFixed(2)}</div>
                                            <div className="text-slate-500 mt-0.5">Platform Komisyonu (%5)</div>
                                        </div>
                                        <div>
                                            <div className="font-black" style={{ color: '#34d399' }}>${(parseFloat(form.askingPrice) * 0.95).toFixed(2)} USDT</div>
                                            <div className="text-slate-500 mt-0.5">Sizin Alacağınız</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FormSection>

                        {/* Uyarı */}
                        <div className="flex items-start gap-3 rounded-xl p-4"
                            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <Shield size={16} className="text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-slate-400 leading-relaxed">
                                <strong className="text-amber-400">Escrow Nasıl İşler:</strong> Alıcı anlaşmayı kabul edip ödemeyi escrow'ya yatırdıktan sonra siz admini devredersiniz.
                                Ödeme ancak transfer tamamlandıktan sonra size (-%5 komisyon) aktarılır. Anlaşmazlıklarda platform adil karar verir.
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl p-4 text-sm text-red-300"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 10px 30px rgba(16,185,129,0.3)' }}>
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Yayınlanıyor...</>
                            ) : (
                                <><DollarSign size={18} /> İlanı Yayınla — Ücretsiz</>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* ── TAB: İlanlarım ─────────────────────────────────── */}
            {tab === 'listings' && (
                <div className="space-y-4">
                    {listings.length === 0 ? (
                        <EmptyState
                            icon={BarChart3}
                            title="Henüz İlan Yok"
                            desc="İlk kanal ilanınızı verin, yüzlerce potansiyel alıcıya ulaşın."
                            action={{ label: 'İlan Ver', onClick: () => setTab('new') }}
                        />
                    ) : (
                        listings.map(listing => {
                            const st = STATUS_MAP[listing.status] || STATUS_MAP.active;
                            return (
                                <div key={listing.id} className="rounded-2xl p-5"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div className="flex items-start gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-black text-white text-sm">{listing.title}</h3>
                                                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                                                    style={{ background: st.bg, color: st.color }}>
                                                    {st.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={11} />
                                                    {listing.currency === 'STARS' ? `${listing.asking_price} ⭐` : `$${listing.asking_price} USDT`}
                                                    {listing.price_negotiable && ' (pazar.)'}
                                                </span>
                                                {listing.member_count > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Users size={11} />
                                                        {listing.member_count?.toLocaleString('tr-TR')} üye
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Eye size={11} />
                                                    {listing.views || 0} görüntülenme
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link href={`/marketplace/${listing.id}`} target="_blank"
                                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all"
                                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <ExternalLink size={12} />
                                                Görüntüle
                                            </Link>
                                            {listing.status === 'active' && (
                                                <button
                                                    onClick={() => deleteListing(listing.id)}
                                                    disabled={deletingId === listing.id}
                                                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all"
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    {deletingId === listing.id
                                                        ? <Loader2 size={12} className="animate-spin" />
                                                        : <Trash2 size={12} />}
                                                    Kaldır
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ── TAB: Teklifler ─────────────────────────────────── */}
            {tab === 'orders' && (
                <div className="space-y-4">
                    {incomingOrders.length === 0 ? (
                        <EmptyState
                            icon={MessageSquare}
                            title="Henüz Teklif Yok"
                            desc="İlanlarınıza alıcılar teklif verdiğinde burada görünecek."
                        />
                    ) : (
                        incomingOrders.map((order: any) => {
                            const st = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#94a3b8' };
                            const listing = order.channel_listings;
                            return (
                                <div key={order.id} className="rounded-2xl p-5"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div className="min-w-0">
                                            <div className="text-sm font-black text-white mb-0.5">
                                                {listing?.channel_name || listing?.title || 'İlan'}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                                <span style={{ color: '#34d399' }} className="font-bold">
                                                    ${order.agreed_price} {order.currency}
                                                </span>
                                                <span>Komisyon: ${order.commission_amount}</span>
                                                <span style={{ color: '#a78bfa' }} className="font-bold">
                                                    Alacaksınız: ${order.seller_receives}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                                            style={{ background: `${st.color}20`, color: st.color, border: `1px solid ${st.color}30` }}>
                                            {st.label}
                                        </span>
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                            <p className="text-xs text-slate-500 mb-3">
                                                Alıcı teklif gönderdi. Kabul ederseniz ödeme escrow&apos;ya yatırılır.
                                            </p>
                                            <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold"
                                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <MessageSquare size={12} />
                                                Telegram&apos;dan Yanıtla
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

// ── Yardımcı bileşenler ───────────────────────────────────────────

function FormSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-4">
                <h3 className="font-black text-white text-sm">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {children}
            </div>
        </div>
    );
}

function FormInput({
    label, value, onChange, placeholder, type = 'text',
    icon: Icon, prefix, className = '',
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; icon?: any; prefix?: string; className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">{prefix}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    step={type === 'number' ? 'any' : undefined}
                    min={type === 'number' ? 0 : undefined}
                    className="w-full rounded-xl py-2.5 text-sm text-white outline-none"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        paddingLeft: Icon || prefix ? '2rem' : '1rem',
                        paddingRight: '1rem',
                    }}
                />
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, desc, action }: {
    icon: any; title: string; desc: string; action?: { label: string; onClick: () => void };
}) {
    return (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <Icon size={28} style={{ color: '#10b981' }} />
                </div>
            </div>
            <h3 className="mb-1 font-black text-white">{title}</h3>
            <p className="text-sm text-slate-500 mb-5">{desc}</p>
            {action && (
                <button onClick={action.onClick}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                    <Plus size={14} />
                    {action.label}
                </button>
            )}
        </div>
    );
}
