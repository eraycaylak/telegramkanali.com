'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Search, LogOut, ExternalLink, RefreshCw, BarChart3, Bot, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { deleteChannel, addChannel, updateChannel, scrapeTelegramInfo, syncAllChannelsFromTelegram, approveChannel, rejectChannel, syncChannelFromTelegram } from '@/app/actions/admin';
import { Channel, Category } from '@/lib/types';

export default function DashboardClient() {
    const router = useRouter();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewStatus, setViewStatus] = useState<'approved' | 'pending' | 'rejected' | 'bot'>('approved');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        join_link: '',
        category_id: '',
        image: '',
        score: 0,
        owner_id: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [scraping, setScraping] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastEditedId, setLastEditedId] = useState<string | null>(null);

    // Protect Route
    useEffect(() => {
        if (localStorage.getItem('isAdmin') !== 'true') {
            router.push('/admin');
        } else {
            fetchData();
        }
    }, [router]);

    async function fetchData() {
        setLoading(true);
        try {
            // 1000 limit aşmak için range ile tüm kanalları çek
            let allChannels: any[] = [];
            let from = 0;
            const batchSize = 1000;
            while (true) {
                const { data: batch, error } = await supabase
                    .from('channels')
                    .select('*, categories(name)')
                    .order('created_at', { ascending: false })
                    .range(from, from + batchSize - 1);
                if (error || !batch || batch.length === 0) break;
                allChannels = [...allChannels, ...batch];
                if (batch.length < batchSize) break;
                from += batchSize;
            }
            setChannels(allChannels.map((d: any) => ({ ...d, categoryName: d.categories?.name })) as Channel[]);

            // Fetch Categories for dropdown
            const { data: catData } = await supabase.from('categories').select('*');
            if (catData) setCategories(catData as Category[]);

            // Fetch Profiles (range ile)
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
        } catch (error) {
            console.error('Admin dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
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
            owner_id: channel.owner_id || ''
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
            setFormData({ name: '', description: '', join_link: '', category_id: '', image: '', score: 0, owner_id: '' });
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

    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-sans">

            <div className="container mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 font-medium">Toplam Kanal</div>
                            <div className="text-2xl font-bold text-gray-900">{channels.length}</div>
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
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-8">
                    {/* Search & Filter Group */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Kanal ara..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Status Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setViewStatus('approved')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewStatus === 'approved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Yayındakiler
                            </button>
                            <button
                                onClick={() => setViewStatus('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewStatus === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Bekleyenler
                                {channels.filter(c => c.status === 'pending').length > 0 && (
                                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {channels.filter(c => c.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setViewStatus('rejected')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewStatus === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Reddedilenler
                            </button>
                            <button
                                onClick={() => setViewStatus('bot')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewStatus === 'bot' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Bot size={14} /> Bot Bağlı
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                        <button
                            onClick={async () => {
                                if (!confirm('Tüm kanalları Telegram\'\'dan güncellemek istediğinize emin misiniz? Bu işlem biraz zaman alabilir.')) return;
                                setSyncing(true);
                                const res = await syncAllChannelsFromTelegram();
                                setSyncing(false);
                                if (res.error) {
                                    alert('Hata: ' + res.error);
                                } else {
                                    alert(res.message);
                                    fetchData();
                                }
                            }}
                            disabled={syncing}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Senkronize Ediliyor...' : 'Telegram Sync'}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                        >
                            <Plus size={18} /> Yeni Kanal Ekle
                        </button>
                    </div>
                </div>

                {/* Channels List (Table on Desktop, Cards on Mobile) */}
                <div className="bg-white md:rounded-xl shadow-sm border-y md:border border-gray-200 overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Kanal Adı</th>
                                    <th className="p-4 font-semibold">Kategori</th>
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
                                    onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', description: '', join_link: '', category_id: '', image: '', score: 0, owner_id: '' }); }}
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
        </div>
    );
}
