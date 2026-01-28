'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Search, LogOut, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { deleteChannel, addChannel } from '@/app/actions/admin';
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
        image: ''
    });

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
                fetchData(); // Refresh list
            } else {
                alert('Hata: ' + res.error);
            }
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));

        const res = await addChannel(data);
        if (res.success) {
            alert('Kanal eklendi!');
            setIsModalOpen(false);
            setFormData({ name: '', description: '', join_link: '', category_id: '', image: '' });
            fetchData();
        } else {
            alert('Hata: ' + res.error);
        }
    };

    const filteredChannels = channels.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-transparent text-gray-900 font-sans">

            <div className="container mx-auto">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Kanal ara..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        <Plus size={18} /> Yeni Kanal Ekle
                    </button>
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
                                    <tr key={channel.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{channel.name}</td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{channel.categoryName || 'Genel'}</span>
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-700">{channel.score || 0}</td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Düzenle">
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

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">Yeni Kanal Ekle</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Katılma Linki (t.me/...)</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.join_link} onChange={e => setFormData({ ...formData, join_link: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL (Logo Linki)</label>
                                <input className="w-full border rounded-lg p-2" placeholder="https://..." value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
