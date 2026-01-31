'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Search, LogOut, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { deleteChannel, addChannel, updateChannel, scrapeTelegramInfo, syncAllChannelsFromTelegram } from '@/app/actions/admin';
import { Channel, Category } from '@/lib/types';

export default function AdminDashboard() {
    const router = useRouter();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        join_link: '',
        category_id: '',
        image: '',
        score: 0
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
        // Fetch Channels
        const { data: chanData } = await supabase.from('channels').select('*, categories(name)').order('created_at', { ascending: false });
        if (chanData) setChannels(chanData.map((d: any) => ({ ...d, categoryName: d.categories?.name })) as Channel[]);

        // Fetch Categories for dropdown
        const { data: catData } = await supabase.from('categories').select('*');
        if (catData) setCategories(catData as Category[]);

        setLoading(false);
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
            score: channel.score || 0
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
            setFormData({ name: '', description: '', join_link: '', category_id: '', image: '', score: 0 });
            setEditingId(null);
            fetchData();
        } else {
            alert('Hata: ' + res.error);
        }
    };

    // Filter Logic
    const filteredChannels = channels.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || c.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-sans">

            <div className="container mx-auto">
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
                        {/* Kategori Filtresi */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="all">Tüm Kategoriler</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
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

                {/* Channels Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercas tracking-wider">
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
                                        <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
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
                                            <span>{channel.name}</span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{channel.categoryName || 'Genel'}</span>
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-700">{channel.score || 0}</td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
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
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Kanalı Düzenle' : 'Yeni Kanal Ekle'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Katılma Linki (t.me/...)</label>
                                <div className="flex gap-2">
                                    <input required className="w-full border rounded-lg p-2" value={formData.join_link} onChange={e => setFormData({ ...formData, join_link: e.target.value })} />
                                    <button
                                        type="button"
                                        onClick={handleScrape}
                                        disabled={scraping}
                                        className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {scraping ? 'Çekiliyor...' : 'Otomatik Çek'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Önce linki yapıştırıp "Otomatik Çek" diyebilirsiniz.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kanal Adı</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea className="w-full border rounded-lg p-2" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select className="w-full border rounded-lg p-2" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                                    <option value="">Seçiniz...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Skor Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skor / Öncelik Puanı</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.score}
                                    onChange={e => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Sıralamada öne çıkarmak için yüksek puan verin.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL (Logo Linki)</label>
                                <div className="flex gap-2">
                                    <input className="w-full border rounded-lg p-2" placeholder="https://..." value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                                    {formData.image && <img src={formData.image} alt="Önizleme" className="w-10 h-10 rounded-lg object-cover border" />}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ name: '', description: '', join_link: '', category_id: '', image: '', score: 0 }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingId ? 'Güncelle' : 'Kaydet'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
