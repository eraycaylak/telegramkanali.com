'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Plus, Edit, Trash2, FolderTree, FileText } from 'lucide-react';
import { addTrend, updateTrend, deleteTrend, addTrendCategory, deleteTrendCategory } from '@/app/actions/trends';
import { useRouter } from 'next/navigation';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function TrendsAdminClient({ initialTrends, initialCategories }: { initialTrends: any[], initialCategories: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'trends' | 'categories'>('trends');
    const [trends, setTrends] = useState(initialTrends);
    const [categories, setCategories] = useState(initialCategories);

    // Trend Form
    const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
    const [editingTrendId, setEditingTrendId] = useState<string | null>(null);
    const [trendForm, setTrendForm] = useState({
        title: '',
        content: '',
        category_id: '',
        subcategory: '',
        image: '',
        is_active: false
    });
    const [trendImageFile, setTrendImageFile] = useState<File | null>(null);

    // Category Form
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [catForm, setCatForm] = useState({ name: '', order_index: 0 });

    const handleTrendSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(trendForm).forEach(([key, value]) => {
            data.append(key, value.toString());
        });
        if (trendImageFile) data.append('imageFile', trendImageFile);

        const res = editingTrendId
            ? await updateTrend(editingTrendId, data)
            : await addTrend(data);

        if (res.error) return alert(res.error);
        alert(editingTrendId ? 'Güncellendi' : 'Eklendi');
        setIsTrendModalOpen(false);
        resetTrendForm();
        window.location.reload();
    };

    const resetTrendForm = () => {
        setTrendForm({ title: '', content: '', category_id: '', subcategory: '', image: '', is_active: false });
        setEditingTrendId(null);
        setTrendImageFile(null);
    };

    const handleTrendEdit = (t: any) => {
        setTrendForm({
            title: t.title,
            content: t.content || '',
            category_id: t.category_id || '',
            subcategory: t.subcategory || '',
            image: t.image || '',
            is_active: t.is_active || false
        });
        setEditingTrendId(t.id);
        setIsTrendModalOpen(true);
    };

    const handleTrendDelete = async (id: string) => {
        if (!confirm('Emin misiniz?')) return;
        const res = await deleteTrend(id);
        if (res.error) alert(res.error);
        else window.location.reload();
    };

    const handleCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', catForm.name);
        data.append('order_index', catForm.order_index.toString());
        const res = await addTrendCategory(data);
        if (res.error) alert(res.error);
        else {
            setIsCatModalOpen(false);
            setCatForm({ name: '', order_index: 0 });
            window.location.reload();
        }
    };

    const handleCatDelete = async (id: string) => {
        if (!confirm('Emin misiniz? Kategoriye bağlı trendler kategorisiz kalır.')) return;
        const res = await deleteTrendCategory(id);
        if (res.error) alert(res.error);
        else window.location.reload();
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    return (
        <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black text-gray-900">Trend Yönetimi</h1>
                <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 border border-gray-100">
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'trends' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FileText size={16} /> Trendler
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${activeTab === 'categories' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FolderTree size={16} /> Kategoriler
                    </button>
                </div>
            </div>

            {activeTab === 'trends' && (
                <div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                        <p className="text-gray-500 text-sm">Trendleri ve Gündem başlıklarını buradan yönetebilirsiniz.</p>
                        <button
                            onClick={() => { resetTrendForm(); setIsTrendModalOpen(true); }}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                        >
                            <Plus size={18} /> Yeni Trend Ekle
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm border-b uppercase tracking-wider">
                                    <th className="p-4 font-bold">Trend Başlığı</th>
                                    <th className="p-4 font-bold">Kategori</th>
                                    <th className="p-4 font-bold">Durum</th>
                                    <th className="p-4 font-bold text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trends.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Henüz trend eklenmemiş</td></tr>
                                ) : trends.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                {t.image && <img src={t.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                                                <span>{t.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {t.trend_categories?.name || 'Kategorisiz'}
                                            {t.subcategory && <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-xs">{t.subcategory}</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {t.is_active ? 'Yayında' : 'Taslak'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleTrendEdit(t)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                                            <button onClick={() => handleTrendDelete(t.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                        <p className="text-gray-500 text-sm">Trendler için "Türkiye Gündemi", "Sosyal Medya" gibi ana sekmeler oluşturun.</p>
                        <button
                            onClick={() => setIsCatModalOpen(true)}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            <Plus size={18} /> Yeni Kategori
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {categories.map((c: any) => (
                            <div key={c.id} className="bg-white border text-center border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center gap-2 relative">
                                <h3 className="font-bold text-lg">{c.name}</h3>
                                <p className="text-xs text-gray-400">Sıra: {c.order_index}</p>
                                <button onClick={() => handleCatDelete(c.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        {categories.length === 0 && <div className="col-span-3 text-center p-8 text-gray-400">Kategori bulunamadı.</div>}
                    </div>
                </div>
            )}

            {/* Modal for Categories */}
            {isCatModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-4">Kategori Ekle</h2>
                        <form onSubmit={handleCatSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Kategori Adı</label>
                                <input required className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sıralama (Küçük önce)</label>
                                <input type="number" className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" value={catForm.order_index} onChange={e => setCatForm({...catForm, order_index: parseInt(e.target.value)||0})} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl">İptal</button>
                                <button type="submit" className="flex-1 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Trends */}
            {isTrendModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 py-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <h2 className="text-2xl font-black mb-6">{editingTrendId ? 'Trendi Düzenle' : 'Yeni Trend'}</h2>
                        <form onSubmit={handleTrendSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Başlık</label>
                                    <input required className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" value={trendForm.title} onChange={e => setTrendForm({...trendForm, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Ana Kategori (Sekme)</label>
                                    <select required className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500 bg-white" value={trendForm.category_id} onChange={e => setTrendForm({...trendForm, category_id: e.target.value})}>
                                        <option value="">Seçiniz...</option>
                                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Alt Kategori (Örn: Tiktok)</label>
                                    <input placeholder="Opsiyonel" className="w-full border-2 border-gray-100 rounded-xl p-3 outline-none focus:border-blue-500" value={trendForm.subcategory} onChange={e => setTrendForm({...trendForm, subcategory: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Önizleme Resim Dosyası</label>
                                    <input type="file" accept="image/*" onChange={e => setTrendImageFile(e.target.files?.[0] || null)} className="w-full border-2 border-gray-100 rounded-xl p-2" />
                                </div>
                            </div>

                            <div className="h-64 sm:h-80 md:h-96 pb-12">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">İçerik (Zengin Metin, Embed vb.)</label>
                                <ReactQuill 
                                    theme="snow" 
                                    modules={quillModules}
                                    value={trendForm.content} 
                                    onChange={(v) => setTrendForm({...trendForm, content: v})} 
                                    className="h-full rounded-xl"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 pt-6 lg:pt-0">
                                <input type="checkbox" id="trendActive" checked={trendForm.is_active} onChange={e => setTrendForm({...trendForm, is_active: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                                <label htmlFor="trendActive" className="font-bold text-gray-700">Yayında</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsTrendModalOpen(false)} className="px-8 py-3 text-gray-500 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition">İptal</button>
                                <button type="submit" className="px-10 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
