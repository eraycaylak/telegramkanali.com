'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Layout, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { Banner, getBanners, saveBanner, deleteBanner, toggleBannerActive, reorderBanners } from '@/app/actions/banners';
import { getCategories } from '@/lib/data';
import { Category } from '@/lib/types';

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Tab state: 'homepage' or 'category'
    const [activeTab, setActiveTab] = useState<'homepage' | 'category'>('homepage');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);

    // Initial data load
    useEffect(() => {
        loadBanners();
        loadCategories();
    }, [activeTab, selectedCategoryId]);

    async function loadCategories() {
        const cats = await getCategories();
        setCategories(cats);
        // Default to first category if none selected and in category tab
        if (activeTab === 'category' && !selectedCategoryId && cats.length > 0) {
            setSelectedCategoryId(cats[0].id);
        }
    }

    async function loadBanners() {
        setLoading(true);
        try {
            // Fetch based on current view
            const type = activeTab;
            const catId = activeTab === 'category' ? selectedCategoryId : undefined;

            // Don't fetch if category mode but no category selected yet
            if (activeTab === 'category' && !catId) {
                setBanners([]);
                setLoading(false);
                return;
            }

            const data = await getBanners(type, catId);
            setBanners(data || []);
        } catch (error) {
            console.error('Failed to load banners', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!editingBanner) return;

        // Ensure type and category are set correctly based on current context
        const bannerToSave = {
            ...editingBanner,
            type: activeTab,
            category_id: activeTab === 'category' ? selectedCategoryId : null
        };

        const res = await saveBanner(bannerToSave);
        if (res.success) {
            setEditingBanner(null);
            loadBanners(); // Reload list
        } else {
            alert('Kaydederken hata oluştu: ' + res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
            await deleteBanner(id);
            loadBanners();
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        await toggleBannerActive(banner.id, banner.active);
        loadBanners();
    };

    const handleAdd = () => {
        // Enforce limits: 4 for Homepage, 6 for Category
        const limit = activeTab === 'homepage' ? 4 : 6;
        if (banners.length >= limit) {
            alert(`Bu alan için en fazla ${limit} banner oluşturabilirsiniz.`);
            return;
        }

        const newBanner: Partial<Banner> = {
            title: 'Yeni Banner',
            subtitle: 'Alt başlık',
            button_text: 'Katıl',
            bg_color: 'from-blue-900 to-blue-800',
            active: true,
            display_order: banners.length,
            type: activeTab,
            category_id: activeTab === 'category' ? selectedCategoryId : null
        };
        setEditingBanner(newBanner);
    };

    const colorOptions = [
        { label: 'Mavi', value: 'from-blue-900 to-blue-800' },
        { label: 'Yeşil', value: 'from-green-800 to-green-700' },
        { label: 'Sarı', value: 'from-yellow-700 to-yellow-600' },
        { label: 'Cyan', value: 'from-cyan-400 to-blue-400' },
        { label: 'Mor', value: 'from-purple-700 to-pink-600' },
        { label: 'Teal', value: 'from-green-600 to-teal-500' },
        { label: 'Kırmızı', value: 'from-red-700 to-red-600' },
        { label: 'Turuncu', value: 'from-orange-600 to-orange-500' },
        { label: 'Siyah', value: 'from-gray-900 to-gray-800' },
        { label: 'Siyah', value: 'bg-[#111]' },
    ];

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === banners.length - 1)
        ) {
            return;
        }

        const newBanners = [...banners];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap items in local state for instant feedback
        [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];

        // Update display_order property
        const reordered = newBanners.map((b, idx) => ({ ...b, display_order: idx }));

        setBanners(reordered);

        // Send minimum required data to server
        const itemsToUpdate = reordered.map(b => ({ id: b.id, display_order: b.display_order }));
        await reorderBanners(itemsToUpdate);
    };

    // ...

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Banner Yönetimi</h1>
                    <p className="text-gray-500 text-sm mt-1">Anasayfa ve kategori sayfaları için bannerları yönetin</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('homepage')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${activeTab === 'homepage'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layout size={20} />
                    Anasayfa ({activeTab === 'homepage' ? banners.length : '...'} / 4)
                </button>
                <button
                    onClick={() => setActiveTab('category')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition ${activeTab === 'category'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layers size={20} />
                    Kategori Sayfaları
                </button>
            </div>

            {/* Category Filter (Only visible in Category tab) */}
            {activeTab === 'category' && (
                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                    <label className="font-semibold text-blue-900">Kategori Seç:</label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="border border-blue-200 rounded px-3 py-2 min-w-[200px]"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <span className="text-sm text-blue-700 ml-auto font-medium">
                        {banners.length} / 6 Banner Dolu
                    </span>
                </div>
            )}

            {/* Add Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Yeni Banner Ekle
                </button>
            </div>

            {/* Banners List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
            ) : banners.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Henüz banner eklenmemiş.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${!banner.active ? 'opacity-50' : ''}`}
                        >
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <ChevronUp size={20} />
                                </button>
                                <button
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === banners.length - 1}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            <div className="text-gray-500 font-mono text-sm w-6 text-center">
                                #{index + 1}
                            </div>

                            {/* Preview */}
                            <div
                                className={`bg-gradient-to-r ${banner.bg_color || 'from-gray-500 to-gray-600'} h-16 w-48 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden relative`}
                            >
                                {banner.image_url && <img src={banner.image_url} className="absolute inset-0 w-full h-full object-cover z-0" alt="" />}
                                <span className="relative z-10 px-2 text-center drop-shadow-md">{banner.title}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 truncate">{banner.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{banner.subtitle || '-'}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={banner.active}
                                        onChange={() => handleToggleActive(banner)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-600">Aktif</span>
                                </label>

                                <button
                                    onClick={() => setEditingBanner(banner)}
                                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Düzenle
                                </button>

                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingBanner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Banner Düzenle</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Visual Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Canlı Önizleme</label>
                                <div
                                    className={`bg-gradient-to-r ${editingBanner.bg_color || 'from-gray-500 to-gray-600'} h-32 rounded-lg flex items-center justify-between px-8 text-white relative overflow-hidden group shadow-lg`}
                                >
                                    {editingBanner.image_url && (
                                        <img src={editingBanner.image_url} className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
                                    )}
                                    <div className="z-10 relative pointer-events-none">
                                        {/* Badge Preview */}
                                        {editingBanner.badge_text && (
                                            <div className={`inline-block transform -skew-x-12 px-2 py-0.5 mb-1 font-black text-xs uppercase shadow-sm ${editingBanner.badge_bg_color || 'bg-red-600'} text-white`}>
                                                <span className="block transform skew-x-12">{editingBanner.badge_text}</span>
                                            </div>
                                        )}
                                        <h3 className="font-bold text-lg text-blue-100 uppercase">{editingBanner.title || 'BAŞLIK'}</h3>
                                        {editingBanner.subtitle && <h2 className="text-2xl font-black italic">{editingBanner.subtitle}</h2>}
                                    </div>
                                    <button className="bg-white text-black px-4 py-1 rounded-full font-bold text-sm z-10 relative shadow-lg">
                                        {editingBanner.button_text || 'Katıl'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL (Opsiyonel)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5"
                                    placeholder="https://imgur.com/..."
                                    value={editingBanner.image_url || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">📐 Önerilen boyut: <strong>800x128px</strong> veya <strong>1600x256px</strong> (6:1 oranı). Fotoğraf eklendiğinde yazı ve buton gizlenir.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5"
                                        value={editingBanner.title || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5"
                                        value={editingBanner.subtitle || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5"
                                        placeholder="https://t.me/..."
                                        value={editingBanner.link_url || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buton Metni</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5"
                                        value={editingBanner.button_text || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, button_text: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Arka Plan Rengi</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setEditingBanner({ ...editingBanner, bg_color: color.value })}
                                            className={`h-10 rounded-lg bg-gradient-to-r ${color.value} text-white text-xs font-bold ${editingBanner.bg_color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                        >
                                            {color.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3 justify-end">
                            <button
                                onClick={() => setEditingBanner(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
