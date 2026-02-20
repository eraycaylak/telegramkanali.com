'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Edit, Save, X, MonitorSmartphone, Zap, Award, Star, MousePointerClick, Check } from 'lucide-react';

interface AdPackage {
    id: string;
    title: string;
    description: string;
    price: number;
    duration_text: string;
    features: string[];
    icon: string;
    badge: string | null;
    is_active: boolean;
    sort_order: number;
}

const ICONS = {
    MonitorSmartphone,
    Zap,
    Award,
    Star,
    MousePointerClick
};

export default function AdsClient() {
    const [packages, setPackages] = useState<AdPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<AdPackage>>({});
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ad_packages')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching ads:', error);
            // alert('Paketler yüklenirken hata oluştu.'); // Dev modda tablo yoksa hata verebilir, sessiz geçelim
        } else {
            setPackages(data || []);
        }
        setLoading(false);
    };

    const handleEdit = (pkg: AdPackage) => {
        setEditingId(pkg.id);
        setFormData(pkg);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingId('new');
        setFormData({
            title: '',
            description: '',
            price: 0,
            duration_text: '1 Aylık',
            features: [],
            icon: 'MonitorSmartphone',
            badge: '',
            is_active: true,
            sort_order: packages.length + 1
        });
        setIsCreating(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
        setIsCreating(false);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.price || !formData.duration_text) {
            alert('Lütfen zorunlu alanları doldurun (Başlık, Fiyat, Süre)');
            return;
        }

        try {
            if (isCreating) {
                const { error } = await supabase
                    .from('ad_packages')
                    .insert([formData]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('ad_packages')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
            }

            setEditingId(null);
            setIsCreating(false);
            fetchPackages();
        } catch (error: any) {
            console.error('Save error:', error);
            alert('Kaydederken hata oluştu: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu reklam paketini silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('ad_packages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchPackages();
        } catch (error: any) {
            console.error('Delete error:', error);
            alert('Silerken hata oluştu: ' + error.message);
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...(formData.features || []), ''] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reklam Paketleri</h1>
                    <p className="text-gray-500 text-sm">Sitede görünen reklam paketlerini buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Yeni Paket Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Editing Form */}
                {(editingId || isCreating) && (
                    <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-lg mb-6 animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-blue-800">{isCreating ? 'Yeni Paket Oluştur' : 'Paketi Düzenle'}</h3>
                            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Örn: Anasayfa Banner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL)</label>
                                <input
                                    type="number"
                                    value={formData.price || 0}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Süre Metni</label>
                                <input
                                    type="text"
                                    value={formData.duration_text || ''}
                                    onChange={e => setFormData({ ...formData, duration_text: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Örn: 1 Aylık"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rozet (Badge)</label>
                                <input
                                    type="text"
                                    value={formData.badge || ''}
                                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Örn: POPÜLER (Boş bırakılabilir)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
                                <select
                                    value={formData.icon || 'MonitorSmartphone'}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    {Object.keys(ICONS).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                                <input
                                    type="number"
                                    value={formData.sort_order || 0}
                                    onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    rows={2}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Özellikler (Maddeler)</label>
                                {formData.features?.map((feature, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={e => handleFeatureChange(idx, e.target.value)}
                                            className="flex-1 p-2 border rounded-lg text-sm"
                                            placeholder="Özellik metni"
                                        />
                                        <button onClick={() => removeFeature(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <button onClick={addFeature} className="text-sm text-blue-600 font-bold hover:underline">+ Özellik Ekle</button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                            <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2">
                                <Save size={18} /> Kaydet
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => {
                        const Icon = ICONS[pkg.icon as keyof typeof ICONS] || MonitorSmartphone;
                        return (
                            <div key={pkg.id} className={`bg-white p-6 rounded-xl border ${!pkg.is_active ? 'border-red-200 opacity-70' : 'border-gray-200'} shadow-sm hover:shadow-md transition relative group`}>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleEdit(pkg)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(pkg.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                                </div>

                                {pkg.badge && (
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                        {pkg.badge}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{pkg.title}</h3>
                                        <div className="text-xs text-gray-500">{pkg.duration_text}</div>
                                    </div>
                                </div>

                                <div className="text-2xl font-black text-blue-600 mb-4">
                                    {pkg.price} TL
                                </div>

                                <ul className="space-y-2 mb-4">
                                    {pkg.features?.slice(0, 3).map((f, i) => (
                                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                                            <Check size={14} className="text-green-500 shrink-0" /> {f}
                                        </li>
                                    ))}
                                    {(pkg.features?.length || 0) > 3 && <li className="text-xs text-gray-400">Ve {pkg.features!.length - 3} özellik daha...</li>}
                                </ul>

                                {!pkg.is_active && <div className="text-xs text-red-500 font-bold mt-2">PASİF</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
