'use client';

import { useState, useEffect } from 'react';
import { getAdminCampaigns, adminUpdateCampaignStatus } from '@/app/actions/tokens';
import {
    Clock,
    TrendingUp,
    PauseCircle,
    CheckCircle2,
    XCircle,
    MonitorSmartphone,
    Zap,
    Image as ImageIcon,
    Film,
    Filter
} from 'lucide-react';

const AD_TYPE_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    featured: { label: 'Öne Çıkarma', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    banner: { label: 'Banner', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    story: { label: 'Hikaye', icon: Film, color: 'text-orange-600', bg: 'bg-orange-50' },
};

const STATUS_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    pending: { label: 'Beklemede', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    active: { label: 'Aktif', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    paused: { label: 'Duraklatıldı', icon: PauseCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    completed: { label: 'Tamamlandı', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    cancelled: { label: 'İptal / Reddedildi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function CampaignsClient() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        loadCampaigns();
    }, []);

    async function loadCampaigns() {
        setLoading(true);
        const data = await getAdminCampaigns();
        setCampaigns(data);
        setLoading(false);
    }

    async function handleStatusChange(id: string, newStatus: string) {
        if (!confirm(`Kampanya durumunu "${STATUS_LABELS[newStatus]?.label || newStatus}" olarak değiştirmek istediğinize emin misiniz?`)) return;

        setUpdatingId(id);
        const res = await adminUpdateCampaignStatus(id, newStatus);
        if (res.error) {
            alert(res.error);
        } else {
            // Update successful
            loadCampaigns();
        }
        setUpdatingId(null);
    }

    const filteredCampaigns = statusFilter === 'all'
        ? campaigns
        : campaigns.filter(c => c.status === statusFilter);

    if (loading) return <div className="p-8 text-center text-gray-500">Kampanyalar yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kampanya Onayları</h1>
                    <p className="text-gray-500 text-sm">Kullanıcıların satın aldığı gösterim bazlı reklam kampanyalarını onaylayın veya reddedin.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">Durum Filtresi:</span>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'active', 'paused', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Tümü' : STATUS_LABELS[status]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="p-4 border-b">Tarih</th>
                                <th className="p-4 border-b">Kullanıcı</th>
                                <th className="p-4 border-b">Kanal & Tür</th>
                                <th className="p-4 border-b">Bütçe (Jeton)</th>
                                <th className="p-4 border-b">Durum</th>
                                <th className="p-4 border-b">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCampaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Hiç kampanya bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredCampaigns.map(campaign => {
                                    const adInfo = AD_TYPE_LABELS[campaign.ad_type] || AD_TYPE_LABELS.featured;
                                    const statusInfo = STATUS_LABELS[campaign.status] || STATUS_LABELS.pending;
                                    const AdIcon = adInfo.icon;
                                    const StatusIcon = statusInfo.icon;
                                    const date = new Date(campaign.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

                                    return (
                                        <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-gray-600">{date}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{campaign.profiles?.full_name || 'İsimsiz'}</div>
                                                <div className="text-xs text-gray-500">{campaign.profiles?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <AdIcon size={16} className={adInfo.color} />
                                                    <span className="font-bold text-gray-900">{campaign.channels?.name || 'Kanal Yok'}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{adInfo.label}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-purple-600">{campaign.tokens_spent} Jeton</div>
                                                <div className="text-xs text-gray-500">{campaign.current_views} / {campaign.total_views} Gör.</div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                                                    <StatusIcon size={14} />
                                                    {statusInfo.label}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {campaign.status === 'pending' && (
                                                        <>
                                                            <button
                                                                disabled={updatingId === campaign.id}
                                                                onClick={() => handleStatusChange(campaign.id, 'active')}
                                                                className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-bold disabled:opacity-50 transition"
                                                            >
                                                                Onayla
                                                            </button>
                                                            <button
                                                                disabled={updatingId === campaign.id}
                                                                onClick={() => handleStatusChange(campaign.id, 'cancelled')}
                                                                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-bold disabled:opacity-50 transition"
                                                            >
                                                                Reddet
                                                            </button>
                                                        </>
                                                    )}
                                                    {campaign.status === 'active' && (
                                                        <button
                                                            disabled={updatingId === campaign.id}
                                                            onClick={() => handleStatusChange(campaign.id, 'paused')}
                                                            className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded text-xs font-bold disabled:opacity-50 transition"
                                                        >
                                                            Duraklat
                                                        </button>
                                                    )}
                                                    {campaign.status === 'paused' && (
                                                        <button
                                                            disabled={updatingId === campaign.id}
                                                            onClick={() => handleStatusChange(campaign.id, 'active')}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-bold disabled:opacity-50 transition"
                                                        >
                                                            Başlat
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
