'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Search, LogOut, ExternalLink, RefreshCw, BarChart3, Bot, Users as UsersIcon, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { deleteChannel, addChannel, updateChannel, scrapeTelegramInfo, syncAllChannelsFromTelegram, approveChannel, rejectChannel, syncChannelFromTelegram, getChannelFollowers } from '@/app/actions/admin';
import { Channel, Category } from '@/lib/types';

export default function DashboardClient() {
    const router = useRouter();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewStatus, setViewStatus] = useState<'approved' | 'pending' | 'rejected' | 'bot'>('approved');
    const [loading, setLoading] = useState(true);
    const [totalChannelCount, setTotalChannelCount] = useState(0);
    const [allLoaded, setAllLoaded] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [profilesLoaded, setProfilesLoaded] = useState(false);
    const [liveVisitors, setLiveVisitors] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        join_link: '',
        category_id: '',
        image: '',
        score: 0,
        owner_id: '',
        city: '',
        ad_start_date: '',
        ad_end_date: '',
        ad_type: '',
        ad_notes: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [scraping, setScraping] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastEditedId, setLastEditedId] = useState<string | null>(null);
    const [followerModalOpen, setFollowerModalOpen] = useState(false);
    const [selectedChannelForFollowers, setSelectedChannelForFollowers] = useState<Channel | null>(null);
    const [followers, setFollowers] = useState<any[]>([]);
    const [loadingFollowers, setLoadingFollowers] = useState(false);

    useEffect(() => {
        fetchData();

        // 🟢 Live Visitor Tracking Subscription
        const channel = supabase.channel('site_presence');
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                setLiveVisitors(count);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    async function fetchData() {
        setLoading(true);
        try {
            // Fetch channels (first 200) and categories in PARALLEL — not sequential
            const [channelRes, catRes] = await Promise.all([
                supabase
                    .from('channels')
                    .select('*, categories(name)', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(0, 199),
                supabase.from('categories').select('*').order('name'),
            ]);

            const fetchedChannels = (channelRes.data || []).map((d: any) => ({ ...d, categoryName: d.categories?.name })) as Channel[];
            setChannels(fetchedChannels);
            setTotalChannelCount(channelRes.count || 0);
            setAllLoaded((channelRes.count || 0) <= 200);

            if (catRes.data) {
                setCategories(catRes.data as Category[]);
                const counts: Record<string, number> = {};
                fetchedChannels.forEach((ch: any) => {
                    if (ch.category_id) counts[ch.category_id] = (counts[ch.category_id] || 0) + 1;
                });
                setCategoryCounts(counts);
            }
        } catch (error) {
            console.error('Admin dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadMoreChannels() {
        setLoadingMore(true);
        try {
            let allChannels: any[] = [...channels];
            let from = channels.length;
            const batchSize = 1000;
            while (true) {
                const { data: batch, error } = await supabase
                    .from('channels')
                    .select('*, categories(name)')
                    .order('created_at', { ascending: false })
                    .range(from, from + batchSize - 1);
                if (error || !batch || batch.length === 0) break;
                allChannels = [...allChannels, ...batch.map((d: any) => ({ ...d, categoryName: d.categories?.name }))];
                if (batch.length < batchSize) break;
                from += batchSize;
            }
            setChannels(allChannels as Channel[]);
            setAllLoaded(true);
            const counts: Record<string, number> = {};
            allChannels.forEach((ch: any) => {
                if (ch.category_id) counts[ch.category_id] = (counts[ch.category_id] || 0) + 1;
            });
            setCategoryCounts(counts);
        } catch (error) {
            console.error('loadMore error:', error);
        } finally {
            setLoadingMore(false);
        }
    }

    // Lazy load profiles only when modal is opened (saves ~2s on initial load)
    async function ensureProfilesLoaded() {
        if (profilesLoaded) return;
        let allProfiles: any[] = [];
        let pFrom = 0;
        while (true) {
            const { data: pBatch, error: pErr } = await supabase
                .from('profiles')
                .select('id, email, full_name')
                .range(pFrom, pFrom + 999);
            if (pErr || !pBatch || pBatch.length === 0) break;
            allProfiles = [...allProfiles, ...pBatch];
            if (pBatch.length < 1000) break;
            pFrom += 1000;
        }
        setProfiles(allProfiles);
        setProfilesLoaded(true);
    }


    const handleDelete = async (id: string) => {
        if (confirm('Bu kanalı silmek istediğinize emin misiniz?')) {
            const res = await deleteChannel(id);
            if (res.success) {
                fetchData();
            } else {
                alert('Hata: ' + res.error);
            }
        }
    };

    const handleEdit = (channel: Channel) => {
        setFormData({
            name: channel.name,
            description: channel.description || '',
            join_link: channel.join_link,
            category_id: channel.category_id || '',
            image: channel.image || '',
            score: channel.score || 0,
            owner_id: channel.owner_id || '',
            city: (channel as any).city || '',
            ad_start_date: channel.ad_start_date ? new Date(channel.ad_start_date).toISOString().split('T')[0] : '',
            ad_end_date: channel.ad_end_date ? new Date(channel.ad_end_date).toISOString().split('T')[0] : '',
            ad_type: channel.ad_type || '',
            ad_notes: channel.ad_notes || ''
        });
        setEditingId(channel.id);
        setLastEditedId(channel.id);
        setIsModalOpen(true);
    };

    const handleScrape = async () => {
        if (!formData.join_link) return alert('Lütfen önce linki girin.');
        setScraping(true);
        const res = await scrapeTelegramInfo(formData.join_link);
        if (res.error) {
            alert(res.error);
        } else {
            setFormData(prev => ({
                ...prev,
                name: res.title || prev.name,
                description: res.description || prev.description,
                image: res.image || prev.image
            }));
        }
        setScraping(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'score') {
                data.append(key, value.toString());
            } else {
                data.append(key, value as string);
            }
        });

        let res;
        if (editingId) {
            res = await updateChannel(editingId, data);
        } else {
            res = await addChannel(data);
        }

        if (res.success) {
            alert(editingId ? 'Kanal güncellendi!' : 'Kanal eklendi!');
            setIsModalOpen(false);
            setFormData({
                name: '', description: '', join_link: '', category_id: '', image: '', score: 0, owner_id: '', city: '',
                ad_start_date: '', ad_end_date: '', ad_type: '', ad_notes: ''
            });
            setEditingId(null);
            fetchData();
        } else {
            alert('Hata: ' + res.error);
        }
    };

    // Filter Logic
    const filteredChannels = channels.filter((c: any) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || c.category_id === selectedCategory;
        if (viewStatus === 'bot') return matchesSearch && matchesCategory && c.bot_enabled;
        const matchesStatus = c.status === viewStatus || (viewStatus === 'approved' && !c.status);
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Ads Expiring Soon Logic
    const expiringChannels = channels.filter(c => {
        if (!c.ad_end_date) return false;
        const endDate = new Date(c.ad_end_date);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays > -1 && diffDays <= 2; // Expiring in next 48 hours or recently expired
    });

    const handleApprove = async (id: string) => {
        if (confirm('Bu kanalı onaylamak istiyor musunuz?')) {
            const res = await approveChannel(id);
            if (res.success) fetchData();
            else alert(res.error);
        }
    };

    const handleReject = async (id: string) => {
        if (confirm('Bu kanalı reddetmek istiyor musunuz?')) {
            const res = await rejectChannel(id);
            if (res.success) fetchData();
            else alert(res.error);
        }
    };

    const viewFollowers = async (channel: Channel) => {
        setSelectedChannelForFollowers(channel);
        setFollowerModalOpen(true);
        setLoadingFollowers(true);
        const res = await getChannelFollowers(channel.id);
        if (res.success) {
            setFollowers(res.data);
        } else {
            alert(res.error);
        }
        setLoadingFollowers(false);
    };

    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-sans">

            <div className="container mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Toplam Kanal</div>
                            <div className="text-2xl font-bold text-gray-900">{allLoaded ? channels.length : `${channels.length} / ${totalChannelCount}`}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setViewStatus('bot')}
                        className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 w-full text-left hover:border-green-300 hover:shadow-md transition ${viewStatus === 'bot' ? 'border-green-500 ring-2 ring-green-100' : ''}`}
                    >
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                            <Bot size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Bot Bağlı Kanal</div>
                            <div className="text-2xl font-bold text-gray-900">{channels.filter((c: any) => c.bot_enabled).length}</div>
                        </div>
                    </button>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <UsersIcon size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Toplam Abone</div>
                            <div className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('tr-TR').format(channels.reduce((sum, c) => sum + (c.member_count || 0), 0))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl border border-indigo-400 shadow-lg shadow-indigo-200 flex items-center gap-4 text-white relative overflow-hidden group">
                        {/* Pulse effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse opacity-50"></div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center relative z-10 shadow-inner">
                            <Zap size={24} className="text-yellow-300 drop-shadow-md" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-sm text-indigo-100 font-medium">Sitede Canlı İzleyici</div>
                            <div className="text-3xl font-black">{liveVisitors}</div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                            <Zap size={100} />
                        </div>
                    </div>
                </div>

                {/* Ads Expiring Soon Alert */}
                {expiringChannels.length > 0 && (
                    <div className="mb-8 space-y-3">
                        <div className="flex items-center gap-2 px-1 text-orange-600">
                            <AlertCircle size={18} />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Reklamı Bitmek Üzere Olanlar</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {expiringChannels.map(ch => {
                                const endDate = new Date(ch.ad_end_date!);
                                const now = new Date();
                                const diffTime = endDate.getTime() - now.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                let statusText = "";
                                let statusColor = "";
                                
                                if (diffDays < 0) {
                                    statusText = "Süresi Bitti";
                                    statusColor = "bg-red-50 text-red-700 border-red-100";
                                } else if (diffDays === 0) {
                                    statusText = "Bugün Bitiyor";
                                    statusColor = "bg-orange-100 text-orange-800 border-orange-200 animate-pulse";
                                } else if (diffDays === 1) {
                                    statusText = "1 Gün Kaldı";
                                    statusColor = "bg-orange-50 text-orange-700 border-orange-100";
                                } else {
                                    statusText = `${diffDays} Gün Kaldı`;
                                    statusColor = "bg-blue-50 text-blue-700 border-blue-100";
                                }

                                return (
                                    <div key={ch.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-sm ${statusColor}`}>
                                        <div className="flex items-center gap-3">
                                            {ch.image && (
                                                <img src={ch.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-black/5" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm truncate max-w-[120px]">{ch.name}</span>
                                                <span className="text-[10px] opacity-70 font-medium uppercase tracking-tighter">{ch.ad_type || 'Reklam'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[11px] font-black uppercase whitespace-nowrap">{statusText}</span>
                                            <button 
                                                onClick={() => handleEdit(ch)}
                                                className="text-[10px] font-bold underline mt-1 opacity-80 hover:opacity-100"
                                            >
                                                Düzenle
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 space-y-6">
                    {/* Top Row: Search and Status Tabs */}
                    <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                        <div className="relative w-full xl:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Kanal ara..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1 rounded-xl w-full xl:w-auto">
                            <button
                                onClick={() => setViewStatus('approved')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${viewStatus === 'approved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <BarChart3 size={14} /> Yayındakiler
                            </button>
                            <button
                                onClick={() => setViewStatus('pending')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${viewStatus === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <CheckCircle2 size={14} /> Bekleyenler {channels.filter(c => c.status === 'pending').length > 0 && <span className="bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{channels.filter(c => c.status === 'pending').length}</span>}
                            </button>
                            <button
                                onClick={() => setViewStatus('rejected')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${viewStatus === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Trash2 size={14} /> Reddedilenler
                            </button>
                            <button
                                onClick={() => setViewStatus('bot')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${viewStatus === 'bot' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Bot size={14} /> Bot Bağlı
                            </button>
                        </div>

                        <div className="flex items-center gap-2 w-full xl:w-auto">
                            <button
                                onClick={async () => {
                                    setSyncing(true);
                                    const res = await syncAllChannelsFromTelegram();
                                    setSyncing(false);
                                    if (res.error) alert(res.error);
                                    else {
                                        alert('Tüm kanallar senkronize edildi!');
                                        fetchData();
                                    }
                                }}
                                disabled={syncing}
                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                                {syncing ? 'Yükleniyor...' : 'Sync'}
                            </button>
                            <button
                                onClick={async () => { await ensureProfilesLoaded(); setIsModalOpen(true); }}
                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                            >
                                <Plus size={16} />
                                Ekle
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Compact Categories */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori Filtresi</span>
                            {selectedCategory !== 'all' && (
                                <button onClick={() => setSelectedCategory('all')} className="text-[10px] font-bold text-blue-600 hover:underline transition">Filtreyi Temizle</button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition border ${selectedCategory === 'all'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                Tümü ({channels.length})
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition border ${selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    {cat.name} ({categoryCounts[cat.id] || 0})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Load all channels banner */}
                {!allLoaded && (
                    <div className="mb-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3">
                        <span className="text-sm text-yellow-800 font-medium">İlk <strong>200</strong> kanal gösteriliyor. Toplam: <strong>{totalChannelCount}</strong></span>
                        <button
                            onClick={loadMoreChannels}
                            disabled={loadingMore}
                            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition disabled:opacity-50"
                        >
                            {loadingMore ? 'Yükleniyor...' : 'Tüm Kanalları Yükle'}
                        </button>
                    </div>
                )}

                {/* Channels List (Table on Desktop, Cards on Mobile) */}
                <div className="bg-white md:rounded-xl shadow-sm border-y md:border border-gray-200 overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Kanal Adı</th>
                                    <th className="p-4 font-semibold">Kategori</th>
                                    <th className="p-4 font-semibold text-center">Abone</th>
                                    <th className="p-4 font-semibold text-center">Tıklama</th>
                                    <th className="p-4 font-semibold text-center">Skor</th>
                                    <th className="p-4 font-semibold text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
                                ) : filteredChannels.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Kanal bulunamadı.</td></tr>
                                ) : (
                                    filteredChannels.map(channel => (
                                        <tr
                                            key={channel.id}
                                            className={`transition border-b border-gray-100 ${editingId === channel.id ? 'bg-blue-50' :
                                                lastEditedId === channel.id ? 'bg-green-50' :
                                                    'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="p-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    {channel.image && channel.image !== '/images/logo.png' ? (
                                                        <img
                                                            src={channel.image}
                                                            alt=""
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                                                            {channel.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span>{channel.name}</span>
                                                        {channel.status === 'pending' && channel.contact_info && (
                                                            <span className="text-[10px] text-gray-400 font-normal">İletişim: {channel.contact_info}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{channel.categoryName || 'Genel'}</span>
                                            </td>
                                            <td className="p-4 p-4 text-center font-medium text-gray-700">
                                                {new Intl.NumberFormat('tr-TR').format(channel.member_count || 0)}
                                            </td>
                                            <td className="p-4 text-center font-medium text-gray-700">
                                                {new Intl.NumberFormat('tr-TR').format(channel.clicks || 0)}
                                            </td>
                                            <td className="p-4 text-center font-bold text-gray-700">{channel.score || 0}</td>
                                            <td className="p-4 text-right flex items-center justify-end gap-2">
                                                {channel.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(channel.id)}
                                                            className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition"
                                                        >
                                                            Onayla
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(channel.id)}
                                                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                                                        >
                                                            Reddet
                                                        </button>
                                                    </>
                                                )}
                                                {channel.status === 'rejected' && (
                                                    <button
                                                        onClick={() => handleApprove(channel.id)}
                                                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                                                    >
                                                        Geri Al
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => viewFollowers(channel)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                    title="Takipçileri Gör"
                                                >
                                                    <UsersIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setSyncing(true);
                                                        const res = await syncChannelFromTelegram(channel.id);
                                                        setSyncing(false);
                                                        if (res.error) alert(res.error);
                                                        else {
                                                            alert('Kanal güncellendi!');
                                                            fetchData();
                                                        }
                                                    }}
                                                    disabled={syncing}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                                    title="Telegram'dan Güncelle"
                                                >
                                                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(channel)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Düzenle">
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(channel.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
                        ) : filteredChannels.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">Kanal bulunamadı.</div>
                        ) : (
                            filteredChannels.map(channel => (
                                <div
                                    key={channel.id}
                                    className={`p-4 flex flex-col gap-3 transition ${editingId === channel.id ? 'bg-blue-50' : 'bg-white'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {channel.image && channel.image !== '/images/logo.png' ? (
                                                <img
                                                    src={channel.image}
                                                    alt=""
                                                    className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black border border-gray-200">
                                                    {channel.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 leading-tight">{channel.name}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {channel.categoryName || 'Genel'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        Skor: {channel.score || 0}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        • {new Intl.NumberFormat('tr-TR').format(channel.member_count || 0)} Abone
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        • {new Intl.NumberFormat('tr-TR').format(channel.clicks || 0)} Tık
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {channel.status === 'pending' && (
                                                <button onClick={() => handleApprove(channel.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Onayla</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(channel)}
                                                className="p-2.5 text-blue-600 bg-blue-50 rounded-xl transition"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => viewFollowers(channel)}
                                                className="p-2.5 text-purple-600 bg-purple-50 rounded-xl transition"
                                            >
                                                <UsersIcon size={18} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setSyncing(true);
                                                    const res = await syncChannelFromTelegram(channel.id);
                                                    setSyncing(false);
                                                    if (res.error) alert(res.error);
                                                    else fetchData();
                                                }}
                                                className="p-2.5 text-green-600 bg-green-50 rounded-xl transition"
                                            >
                                                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {channel.status === 'pending' && (
                                                <button onClick={() => handleReject(channel.id)} className="p-2.5 text-red-600 bg-red-50 rounded-xl">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            {channel.status !== 'pending' && (
                                                <button onClick={() => handleDelete(channel.id)} className="p-2.5 text-gray-400 bg-gray-50 rounded-xl">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-white rounded-t-[32px] md:rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in slide-in-from-bottom md:zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-black text-gray-900">{editingId ? 'Kanalı Düzenle' : 'Yeni Kanal Ekle'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="md:hidden w-8 h-1.5 bg-gray-200 rounded-full mx-auto absolute top-3 left-1/2 -translate-x-1/2"></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Katılma Linki (t.me/...)</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        required
                                        className="flex-1 border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition"
                                        value={formData.join_link}
                                        onChange={e => setFormData({ ...formData, join_link: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleScrape}
                                        disabled={scraping}
                                        className="bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl font-bold hover:bg-blue-100 disabled:opacity-50 whitespace-nowrap transition"
                                    >
                                        {scraping ? 'Çekiliyor...' : 'Otomatik Çek'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Kanal Adı</label>
                                    <input required className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Kategori</label>
                                    <select className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition bg-white" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                        <option value="">Seçiniz...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Açıklama</label>
                                <textarea className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Skor / Öncelik</label>
                                    <input
                                        type="number"
                                        className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition"
                                        value={formData.score}
                                        onChange={e => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">🏙️ Şehir (SEO)</label>
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition bg-white"
                                        value={(formData as any).city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value } as any)}
                                    >
                                        <option value="">— Şehir Seçin —</option>
                                        <option value="İstanbul">İstanbul</option>
                                        <option value="Ankara">Ankara</option>
                                        <option value="İzmir">İzmir</option>
                                        <option value="Bursa">Bursa</option>
                                        <option value="Antalya">Antalya</option>
                                        <option value="Adana">Adana</option>
                                        <option value="Konya">Konya</option>
                                        <option value="Gaziantep">Gaziantep</option>
                                        <option value="Mersin">Mersin</option>
                                        <option value="Kayseri">Kayseri</option>
                                        <option value="Genele Ait">Genele Ait (Tüm Türkiye)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Kanal Sahibi</label>
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition bg-white"
                                        value={formData.owner_id}
                                        onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
                                    >
                                        <option value="">Sahipsiz</option>
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Reklam Yönetimi Section */}
                            <div className="p-5 bg-blue-50/50 rounded-[24px] border border-blue-100/50 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="text-blue-600" size={16} />
                                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider">REKLAM YÖNETİMİ</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5">Reklam Türü</label>
                                        <select 
                                            className="w-full border-2 border-white rounded-xl p-3 focus:border-blue-500 outline-none transition bg-white text-sm" 
                                            value={formData.ad_type} 
                                            onChange={e => setFormData({ ...formData, ad_type: e.target.value })}
                                        >
                                            <option value="">Yok</option>
                                            <option value="featured">Featured (Sponsorlu)</option>
                                            <option value="banner">Banner</option>
                                            <option value="story">Story</option>
                                            <option value="verified">Onaylı Kanal</option>
                                            <option value="vip_sponsor">VIP Sponsor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5">Bitiş Tarihi</label>
                                        <input 
                                            type="date" 
                                            className="w-full border-2 border-white rounded-xl p-3 focus:border-blue-500 outline-none transition bg-white text-sm" 
                                            value={formData.ad_end_date} 
                                            onChange={e => setFormData({ ...formData, ad_end_date: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1.5">Reklam Notları</label>
                                    <input 
                                        className="w-full border-2 border-white rounded-xl p-3 focus:border-blue-500 outline-none transition bg-white text-sm" 
                                        placeholder="Örn: Ödeme alındı, görsel eklendi..."
                                        value={formData.ad_notes} 
                                        onChange={e => setFormData({ ...formData, ad_notes: e.target.value })} 
                                    />
                                    <input type="hidden" value={formData.ad_start_date} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Görsel URL</label>
                                <div className="flex gap-3">
                                    <input className="w-full border-2 border-gray-100 rounded-2xl p-3 md:p-4 focus:border-blue-500 outline-none transition" placeholder="https://..." value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                                    {formData.image && <img src={formData.image} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 pb-4 md:pb-0">
                                <button
                                    type="button"
                                    onClick={() => { 
                                        setIsModalOpen(false); 
                                        setEditingId(null); 
                                        setFormData({ 
                                            name: '', description: '', join_link: '', category_id: '', image: '', 
                                            score: 0, owner_id: '', city: '', 
                                            ad_start_date: '', ad_end_date: '', ad_type: '', ad_notes: '' 
                                        }); 
                                    }}
                                    className="order-2 sm:order-1 px-8 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="order-1 sm:order-2 px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition"
                                >
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Follower Modal */}
            {followerModalOpen && selectedChannelForFollowers && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 animate-in zoom-in duration-300 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{selectedChannelForFollowers.name}</h2>
                                <p className="text-sm text-gray-500">Son Takipçi Hareketleri</p>
                            </div>
                            <button
                                onClick={() => setFollowerModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <Plus size={24} className="rotate-45 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[300px]">
                            {loadingFollowers ? (
                                <div className="flex items-center justify-center h-full py-12">
                                    <RefreshCw className="animate-spin text-purple-600" size={32} />
                                </div>
                            ) : followers.length === 0 ? (
                                <div className="text-center py-12">
                                    <UsersIcon size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400">Henüz takipçi hareketi kaydedilmemiş.</p>
                                    <p className="text-xs text-gray-400 mt-1">(Sadece bot bağlı kanallarda takip edilir)</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-3">Kullanıcı</th>
                                            <th className="pb-3 text-center">İşlem</th>
                                            <th className="pb-3 text-right">Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {followers.map((ev: any) => (
                                            <tr key={ev.id} className="text-sm hover:bg-gray-50 transition">
                                                <td className="py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">
                                                            {ev.first_name} {ev.last_name}
                                                        </span>
                                                        {ev.username && (
                                                            <span className="text-xs text-purple-600">@{ev.username}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${ev.event_type === 'join' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {ev.event_type === 'join' ? 'KATILDI' : 'AYRILDI'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right text-gray-500 tabular-nums">
                                                    {new Date(ev.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
