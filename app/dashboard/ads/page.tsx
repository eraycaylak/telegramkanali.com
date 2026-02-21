'use client';

import { useState, useEffect } from 'react';
import { getUserCampaigns, getAdPricing, createAdCampaign } from '@/app/actions/tokens';
import { supabase } from '@/lib/supabaseClient';
import {
    TrendingUp,
    Eye,
    CheckCircle2,
    Clock,
    PauseCircle,
    XCircle,
    PlusCircle,
    Zap,
    Image as ImageIcon,
    Film
} from 'lucide-react';

const AD_TYPE_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    featured: { label: 'Öne Çıkarma', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    banner: { label: 'Banner', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    story: { label: 'Hikaye', icon: Film, color: 'text-orange-600', bg: 'bg-orange-50' },
};

const STATUS_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    active: { label: 'Aktif', icon: TrendingUp, color: 'text-green-600' },
    completed: { label: 'Tamamlandı', icon: CheckCircle2, color: 'text-blue-600' },
    paused: { label: 'Duraklatıldı', icon: PauseCircle, color: 'text-yellow-600' },
    cancelled: { label: 'İptal Edildi', icon: XCircle, color: 'text-red-600' },
};

export default function AdsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAd, setShowNewAd] = useState(false);
    const [channels, setChannels] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [selectedAdType, setSelectedAdType] = useState<'featured' | 'banner' | 'story'>('featured');
    const [pricing, setPricing] = useState<any[]>([]);
    const [selectedPricing, setSelectedPricing] = useState('');
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadPricing();
    }, [selectedAdType]);

    async function loadData() {
        try {
            const [campaignsData] = await Promise.all([
                getUserCampaigns(),
            ]);
            setCampaigns(campaignsData);

            // Fetch user's channels
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userChannels } = await supabase
                    .from('channels')
                    .select('id, name, image')
                    .eq('owner_id', user.id);
                setChannels(userChannels || []);
            }
        } catch (error) {
            console.error('Error loading ads data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadPricing() {
        const data = await getAdPricing(selectedAdType);
        setPricing(data);
        setSelectedPricing('');
    }

    async function handleCreateCampaign() {
        if (!selectedChannel || !selectedPricing) {
            setMessage('Lütfen kanal ve paket seçin.');
            return;
        }

        setCreating(true);
        setMessage('');

        const result = await createAdCampaign({
            channelId: selectedChannel,
            adType: selectedAdType,
            pricingId: selectedPricing,
        });

        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage('Reklam kampanyası başarıyla oluşturuldu! 🎉');
            setShowNewAd(false);
            setSelectedChannel('');
            setSelectedPricing('');
            loadData();
        }

        setCreating(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>)}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reklamlarım</h2>
                    <p className="text-gray-500 text-sm mt-1">Gösterim bazlı reklam kampanyalarınızı yönetin</p>
                </div>
                <button
                    onClick={() => setShowNewAd(!showNewAd)}
                    className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2 text-sm shadow-lg shadow-purple-100"
                >
                    <PlusCircle size={18} /> Yeni Reklam
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('başarıyla') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message}
                </div>
            )}

            {/* New Ad Form */}
            {showNewAd && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Yeni Reklam Kampanyası</h3>

                    {channels.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Önce bir kanal eklemeniz gerekiyor.</p>
                        </div>
                    ) : (
                        <>
                            {/* Channel Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kanal Seçin</label>
                                <select
                                    value={selectedChannel}
                                    onChange={e => setSelectedChannel(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Seçiniz...</option>
                                    {channels.map((ch: any) => (
                                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Ad Type Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reklam Türü</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['featured', 'banner', 'story'] as const).map(type => {
                                        const info = AD_TYPE_LABELS[type];
                                        const Icon = info.icon;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedAdType(type)}
                                                className={`p-4 rounded-xl border-2 transition text-center ${selectedAdType === type ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                                            >
                                                <Icon size={24} className={`mx-auto mb-2 ${info.color}`} />
                                                <span className="text-sm font-bold text-gray-900">{info.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pricing Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Gösterim Paketi</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {pricing.map((p: any) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPricing(p.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition text-left ${selectedPricing === p.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                                        >
                                            <div>
                                                <span className="font-bold text-gray-900">{p.label}</span>
                                                {p.note && <span className="text-xs text-gray-500 block mt-0.5">({p.note})</span>}
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-purple-600">💰 {p.tokens_required.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500 block">{p.price_tl.toLocaleString()} TL</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleCreateCampaign}
                                disabled={creating || !selectedChannel || !selectedPricing}
                                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50"
                            >
                                {creating ? 'Oluşturuluyor...' : 'Kampanyayı Başlat'}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Active Campaigns */}
            {campaigns.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400">
                        <TrendingUp size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz reklam kampanyanız yok</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Jeton satın alarak kanallarınız için gösterim bazlı reklam kampanyaları oluşturun.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map((campaign: any) => {
                        const adInfo = AD_TYPE_LABELS[campaign.ad_type] || AD_TYPE_LABELS.featured;
                        const statusInfo = STATUS_LABELS[campaign.status] || STATUS_LABELS.active;
                        const AdIcon = adInfo.icon;
                        const StatusIcon = statusInfo.icon;
                        const progress = campaign.total_views > 0
                            ? Math.min(100, (campaign.current_views / campaign.total_views) * 100)
                            : 0;

                        return (
                            <div key={campaign.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${adInfo.bg}`}>
                                            <AdIcon size={20} className={adInfo.color} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">
                                                {campaign.channels?.name || 'Kanal'}
                                            </h4>
                                            <span className="text-xs text-gray-500">{adInfo.label} Reklam</span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                        <StatusIcon size={14} />
                                        {statusInfo.label}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                        <span className="text-gray-500">Gösterim İlerlemesi</span>
                                        <span className="text-gray-900">
                                            {campaign.current_views.toLocaleString()} / {campaign.total_views.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${campaign.status === 'completed' ? 'bg-green-500' : 'bg-purple-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-xs">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Eye size={14} />
                                        <span>{campaign.current_views.toLocaleString()} gösterim</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <span>💰 {campaign.tokens_spent} jeton</span>
                                    </div>
                                    <div className="text-gray-400">
                                        {new Date(campaign.created_at).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
