'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Star, Clock, BarChart } from 'lucide-react';
import { deleteBlogPost, toggleBlogPublish } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    category?: string;
    published: boolean;
    featured: boolean;
    view_count: number;
    reading_time?: number;
    created_at?: string;
    updated_at?: string;
}

interface BlogAdminClientProps {
    posts: BlogPost[];
}

export default function BlogAdminClient({ posts: initialPosts }: BlogAdminClientProps) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [loading, setLoading] = useState<string | null>(null);

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'published' ? post.published : !post.published);
        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) return;
        setLoading(id);
        const res = await deleteBlogPost(id);
        if (res.success) {
            setPosts(posts.filter(p => p.id !== id));
        } else {
            alert('Silme hatası: ' + res.error);
        }
        setLoading(null);
    };

    const handleTogglePublish = async (id: string, currentState: boolean) => {
        setLoading(id);
        const res = await toggleBlogPublish(id, !currentState);
        if (res.success) {
            setPosts(posts.map(p => p.id === id ? { ...p, published: !currentState } : p));
        }
        setLoading(null);
    };

    const formatDate = (d?: string) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.published).length,
        draft: posts.filter(p => !p.published).length,
        totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Blog Yönetimi</h1>
                    <p className="text-sm text-gray-500 mt-1">Blog yazılarınızı yönetin</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={18} /> Yeni Yazı
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Toplam', value: stats.total, icon: BarChart, color: 'blue' },
                    { label: 'Yayında', value: stats.published, icon: Eye, color: 'green' },
                    { label: 'Taslak', value: stats.draft, icon: EyeOff, color: 'yellow' },
                    { label: 'Görüntülenme', value: stats.totalViews, icon: BarChart, color: 'purple' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-2xl p-4`}>
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon size={16} className={`text-${stat.color}-600`} />
                            <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                        </div>
                        <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Yazı ara..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'published', 'draft'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f === 'all' ? 'Tümü' : f === 'published' ? 'Yayında' : 'Taslak'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <p className="text-gray-400 text-lg font-medium">Henüz blog yazısı yok</p>
                    <p className="text-gray-400 text-sm mt-1">Yeni bir yazı ekleyin</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition hover:shadow-md ${loading === post.id ? 'opacity-50' : ''}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">{post.title}</h3>
                                    {post.featured && <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {post.published ? 'Yayında' : 'Taslak'}
                                    </span>
                                    {post.category && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{post.category}</span>}
                                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(post.created_at)}</span>
                                    <span className="flex items-center gap-1"><Eye size={12} /> {post.view_count}</span>
                                    {post.reading_time && <span>{post.reading_time} dk okuma</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleTogglePublish(post.id, post.published)}
                                    className={`p-2 rounded-lg transition ${post.published ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                    title={post.published ? 'Taslağa al' : 'Yayınla'}
                                >
                                    {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <Link
                                    href={`/admin/blog/${post.id}`}
                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                    title="Düzenle"
                                >
                                    <Edit2 size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id, post.title)}
                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
