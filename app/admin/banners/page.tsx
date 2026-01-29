'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, GripVertical, Image as ImageIcon } from 'lucide-react';

interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl: string;
    buttonText: string;
    bgColor: string;
    active: boolean;
}

const defaultBanners: Banner[] = [
    {
        id: '1',
        title: 'BLOOMBERG TRADING',
        subtitle: 'ÜCRETSİZ',
        imageUrl: '',
        linkUrl: 'https://t.me/example1',
        buttonText: 'Gruba Katıl',
        bgColor: 'from-blue-900 to-blue-800',
        active: true
    },
    {
        id: '2',
        title: 'İLK GELEN 50 KİŞİYE',
        subtitle: 'BEDAVA İŞLEM',
        imageUrl: '',
        linkUrl: 'https://t.me/example2',
        buttonText: 'Katıl',
        bgColor: 'from-green-800 to-green-700',
        active: true
    },
    {
        id: '3',
        title: 'DÜNYA SOHBET',
        subtitle: '',
        imageUrl: '',
        linkUrl: 'https://t.me/example3',
        buttonText: 'KATIL',
        bgColor: 'from-yellow-700 to-yellow-600',
        active: true
    },
    {
        id: '4',
        title: 'FIRSATLARI KAÇIRMA',
        subtitle: 'HEMEN KATIL',
        imageUrl: '',
        linkUrl: 'https://t.me/example4',
        buttonText: 'Katıl',
        bgColor: 'from-cyan-400 to-blue-400',
        active: true
    },
    {
        id: '5',
        title: 'KRİPTO SİNYALLERİ',
        subtitle: 'Günlük Analiz & Haberler',
        imageUrl: '',
        linkUrl: 'https://t.me/example5',
        buttonText: 'Katıl',
        bgColor: 'from-purple-700 to-pink-600',
        active: true
    },
    {
        id: '6',
        title: 'VIP GRUP',
        subtitle: 'Premium İçerikler',
        imageUrl: '',
        linkUrl: 'https://t.me/example6',
        buttonText: 'Katıl',
        bgColor: 'from-green-600 to-teal-500',
        active: true
    }
];

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>(defaultBanners);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [saving, setSaving] = useState(false);

    // Load banners from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('siteBanners');
        if (saved) {
            setBanners(JSON.parse(saved));
        }
    }, []);

    const saveBanners = (newBanners: Banner[]) => {
        setBanners(newBanners);
        localStorage.setItem('siteBanners', JSON.stringify(newBanners));
    };

    const handleSave = () => {
        if (!editingBanner) return;

        const updated = banners.map(b =>
            b.id === editingBanner.id ? editingBanner : b
        );
        saveBanners(updated);
        setEditingBanner(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) {
            saveBanners(banners.filter(b => b.id !== id));
        }
    };

    const handleAdd = () => {
        const newBanner: Banner = {
            id: Date.now().toString(),
            title: 'Yeni Banner',
            subtitle: 'Alt başlık',
            imageUrl: '',
            linkUrl: 'https://t.me/',
            buttonText: 'Katıl',
            bgColor: 'from-gray-700 to-gray-600',
            active: true
        };
        saveBanners([...banners, newBanner]);
        setEditingBanner(newBanner);
    };

    const toggleActive = (id: string) => {
        const updated = banners.map(b =>
            b.id === id ? { ...b, active: !b.active } : b
        );
        saveBanners(updated);
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
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Banner Yönetimi</h1>
                    <p className="text-gray-500 text-sm mt-1">Anasayfa ve kategori sayfalarındaki bannerları yönetin</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Yeni Banner
                </button>
            </div>

            {/* Banners Grid */}
            <div className="grid gap-4">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${!banner.active ? 'opacity-50' : ''}`}
                    >
                        <div className="text-gray-400 cursor-move">
                            <GripVertical size={20} />
                        </div>

                        <div className="text-gray-500 font-mono text-sm w-8">
                            #{index + 1}
                        </div>

                        {/* Preview */}
                        <div
                            className={`bg-gradient-to-r ${banner.bgColor} h-16 w-48 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}
                        >
                            {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-center px-2">{banner.title}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{banner.title}</h3>
                            <p className="text-sm text-gray-500 truncate">{banner.subtitle || 'Alt başlık yok'}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={banner.active}
                                    onChange={() => toggleActive(banner.id)}
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

            {/* Edit Modal */}
            {editingBanner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Banner Düzenle</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Önizleme</label>
                                <div
                                    className={`bg-gradient-to-r ${editingBanner.bgColor} h-28 rounded-lg flex items-center justify-between px-6 text-white overflow-hidden`}
                                >
                                    {editingBanner.imageUrl ? (
                                        <img src={editingBanner.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="font-bold text-lg">{editingBanner.title}</h3>
                                                <p className="text-sm opacity-80">{editingBanner.subtitle}</p>
                                            </div>
                                            <button className="bg-white/20 px-3 py-1 rounded text-sm font-bold">
                                                {editingBanner.buttonText}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banner Görseli (URL)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded-lg p-2.5 text-sm"
                                        placeholder="https://example.com/banner.jpg"
                                        value={editingBanner.imageUrl}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Önerilen boyut: 400x112px. Boş bırakırsanız renk + metin gösterilir.
                                </p>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5"
                                    value={editingBanner.title}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5"
                                    value={editingBanner.subtitle || ''}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                                />
                            </div>

                            {/* Link URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5"
                                    placeholder="https://t.me/grupadi"
                                    value={editingBanner.linkUrl}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                                />
                            </div>

                            {/* Button Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Buton Metni</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5"
                                    value={editingBanner.buttonText}
                                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                                />
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Arka Plan Rengi</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setEditingBanner({ ...editingBanner, bgColor: color.value })}
                                            className={`h-10 rounded-lg bg-gradient-to-r ${color.value} text-white text-xs font-bold ${editingBanner.bgColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
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
