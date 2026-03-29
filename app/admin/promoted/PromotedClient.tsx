'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Search, Star, TrendingUp } from 'lucide-react';
import {
    PromotedChannel,
    getAllPromotedChannels,
    savePromotedChannel,
    deletePromotedChannel,
    togglePromotedChannel,
    reorderPromotedChannels,
    searchChannelsForPromoted
} from '@/app/actions/promoted';
import { getCategories } from '@/lib/data';
import { Category } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

export default function PromotedClient() {
    const [items, setItems] = useState<PromotedChannel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Add form state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<any>(null);
    const [newLabel, setNewLabel] = useState('Çok Tıklananlar');
    const [newTarget, setNewTarget] = useState('all');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        checkPermission();
        loadData();
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
        }

        alert('Bu sayfaya erişim yetkiniz yok.');
        window.location.href = '/admin/dashboard';
    };

    async function loadData() {
        setLoading(true);
        try {
            const [promotedData, catsData] = await Promise.all([
                getAllPromotedChannels(),
                getCategories()
            ]);
            setItems(promotedData);
            setCategories(catsData);
        } catch (error) {
            console.error('Failed to load promoted channels', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch() {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const results = await searchChannelsForPromoted(searchQuery);
            setSearchResults(results);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }

    async function handleAdd() {
        if (!selectedChannel) {
            alert('Lütfen bir kanal seçin.');
            return;
        }

        // Check limit
        if (items.length >= 10) {
            alert('En fazla 10 öne çıkan kanal ekleyebilirsiniz.');
            return;
        }

        const res = await savePromotedChannel({
            channel_id: selectedChannel.id,
            label: newLabel,
            target: newTarget,
            display_order: items.length,
            active: true,
        });

        if (res.success) {
            setShowAddModal(false);
            setSelectedChannel(null);
            setSearchQuery('');
            setSearchResults([]);
            setNewLabel('Çok Tıklananlar');
            setNewTarget('all');
            loadData();
        } else {
            alert('Kaydederken hata: ' + res.error);
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Bu kanalı öne çıkanlardan kaldırmak istediğinize emin misiniz?')) {
            await deletePromotedChannel(id);
            loadData();
        }
    }

    async function handleToggle(item: PromotedChannel) {
        const newStatus = !item.active;
        setItems(items.map(i => i.id === item.id ? { ...i, active: newStatus } : i));
        const res = await togglePromotedChannel(item.id, item.active);
        if (!res.success) {
            setItems(items);
            alert('Durum değiştirilemedi: ' + res.error);
        }
    }

    async function handleMove(index: number, direction: 'up' | 'down') {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === items.length - 1)
        ) return;

        const newItems = [...items];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
        const reordered = newItems.map((item, idx) => ({ ...item, display_order: idx }));
        setItems(reordered);

        await reorderPromotedChannels(reordered.map(i => ({ id: i.id, display_order: i.display_order })));
    }

    function getTargetLabel(target: string): string {
        if (target === 'all') return 'Tüm Sayfalar';
        if (target === 'homepage') return 'Anasayfa';
        const cat = categories.find(c => c.id === target);
        return cat ? cat.name : target;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-orange-500" />
                        Öne Çıkan Kanallar
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        &quot;Çok Tıklananlar&quot; alanını yönetin. Bu alan banner&apos;ın üstünde gösterilir.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    disabled={items.length >= 10}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} />
                    Kanal Ekle ({items.length}/10)
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
                <strong>💡 İpucu:</strong> Bu alan &quot;Çok Tıklananlar&quot;, &quot;Editör Seçimi&quot; veya benzeri bir başlık altında anasayfa ve kategori sayfalarında banner&apos;ın üstünde gösterilir. Banner gibi görünmez, doğal bir kanal listesi formatındadır.
            </div>

            {/* Items List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Star className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-gray-500 font-medium">Henüz öne çıkan kanal eklenmemiş.</p>
                    <p className="text-gray-400 text-sm mt-1">Yukarıdaki &quot;Kanal Ekle&quot; butonuyla başlayın.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${!item.active ? 'opacity-50' : ''}`}
                        >
                            {/* Order Controls */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <ChevronUp size={18} />
                                </button>
                                <button
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            <div className="text-gray-400 font-mono text-sm w-6 text-center">
                                #{index + 1}
                            </div>

                            {/* Channel Preview */}
                            {item.channel ? (
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {item.channel.image && item.channel.image !== '/images/logo.png' ? (
                                        <img src={item.channel.image} alt="" className="w-10 h-10 rounded-full object-cover border" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border">
                                            {item.channel.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate">{item.channel.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">
                                            {item.channel.categories?.name || ''} · {item.channel.member_count?.toLocaleString() || '-'} üye
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 text-gray-400 italic">Kanal bulunamadı</div>
                            )}

                            {/* Meta */}
                            <div className="hidden md:flex items-center gap-3 text-xs">
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium">
                                    🏷️ {item.label}
                                </span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">
                                    📍 {getTargetLabel(item.target)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={item.active}
                                        onChange={() => handleToggle(item)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-600">Aktif</span>
                                </label>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">✨ Öne Çıkan Kanal Ekle</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Channel Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kanal Ara</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded-lg p-2.5"
                                        placeholder="Kanal adı yazın..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={searching}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="border rounded-lg max-h-48 overflow-y-auto">
                                    {searchResults.map((ch: any) => (
                                        <button
                                            key={ch.id}
                                            onClick={() => {
                                                setSelectedChannel(ch);
                                                setSearchResults([]);
                                            }}
                                            className={`w-full text-left flex items-center gap-3 p-3 hover:bg-blue-50 border-b last:border-b-0 transition ${selectedChannel?.id === ch.id ? 'bg-blue-50' : ''}`}
                                        >
                                            {ch.image && ch.image !== '/images/logo.png' ? (
                                                <img src={ch.image} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {ch.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 text-sm truncate">{ch.name}</div>
                                                <div className="text-xs text-gray-500">{ch.categories?.name || ''}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Selected Channel */}
                            {selectedChannel && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span className="font-medium text-green-800">{selectedChannel.name}</span>
                                </div>
                            )}

                            {/* Label */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alan Başlığı</label>
                                <select
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    className="w-full border rounded-lg p-2.5"
                                >
                                    <option value="Çok Tıklananlar">🔥 Çok Tıklananlar</option>
                                    <option value="Editör Seçimi">⭐ Editör Seçimi</option>
                                    <option value="Trend Kanallar">📈 Trend Kanallar</option>
                                    <option value="En Çok Oy Alanlar">🏆 En Çok Oy Alanlar</option>
                                    <option value="Önerilen Kanallar">💡 Önerilen Kanallar</option>
                                </select>
                            </div>

                            {/* Target */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gösterim Alanı</label>
                                <select
                                    value={newTarget}
                                    onChange={(e) => setNewTarget(e.target.value)}
                                    className="w-full border rounded-lg p-2.5"
                                >
                                    <option value="all">Tüm Sayfalar</option>
                                    <option value="homepage">Sadece Anasayfa</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name} Kategorisi</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedChannel(null);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!selectedChannel}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                Ekle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
