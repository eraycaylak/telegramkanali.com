'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { deleteCategory, addCategory, editCategory } from '@/app/actions/admin';
import { Category } from '@/lib/types';

export default function CategoriesClient() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

    useEffect(() => {
        checkPermission();
        fetchCategories();
    }, []);

    const checkPermission = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            window.location.href = '/admin';
            return;
        }

        const { data: user } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (user) {
            if (user.role === 'admin') return;
            if (user.role === 'editor' && user.permissions?.manage_categories) return;
        }

        alert('Bu sayfaya erişim yetkiniz yok.');
        window.location.href = '/admin/dashboard';
    };

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data as Category[]);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
            const res = await deleteCategory(id);
            if (res.success) fetchCategories();
            else alert('Hata: ' + res.error);
        }
    };
    const handleNewClick = () => {
        setEditingCategoryId(null);
        setFormData({ name: '', description: '', icon: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (cat: Category) => {
        setEditingCategoryId(cat.id);
        setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));

        let res;
        if (editingCategoryId) {
            res = await editCategory(editingCategoryId, data);
        } else {
            res = await addCategory(data);
        }

        if (res.success) {
            alert(editingCategoryId ? 'Kategori güncellendi!' : 'Kategori eklendi!');
            setIsModalOpen(false);
            setEditingCategoryId(null);
            setFormData({ name: '', description: '', icon: '' });
            fetchCategories();
        } else {
            alert('Hata: ' + res.error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Kategoriler</h1>
                <button
                    onClick={handleNewClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} /> Yeni Kategori
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4">Ad</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Açıklama</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-400">Yükleniyor...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-400">Kategori bulunamadı.</td></tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                                        <span className="text-xl">{cat.icon}</span>
                                        {cat.name}
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm font-mono">{cat.slug}</td>
                                    <td className="p-4 text-gray-500 text-sm">{cat.description}</td>
                                    <td className="p-4 text-right gap-2">
                                        <button onClick={() => handleEditClick(cat)} className="text-gray-400 hover:text-blue-600 p-2" title="Düzenle">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-600 p-2" title="Sil">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">{editingCategoryId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori Adı</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Açıklama</label>
                                <textarea className="w-full border rounded-lg p-2" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">İkon (Emoji)</label>
                                <input className="w-full border rounded-lg p-2" placeholder="Örn: 🚀" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingCategoryId ? 'Kaydet' : 'Ekle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
