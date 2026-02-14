'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Image as ImageIcon, X, ArrowLeft, Sparkles } from 'lucide-react';
import { addBlogPost, updateBlogPost, uploadBlogImage } from '@/app/actions/admin';
import Link from 'next/link';

interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image: string;
    category: string;
    tags: string[];
    author: string;
    published: boolean;
    featured: boolean;
    meta_title: string;
    meta_description: string;
}

interface BlogEditorClientProps {
    post?: BlogPost;
    isEditing?: boolean;
}

const BLOG_CATEGORIES = ['Haber', 'Rehber', 'İpucu', 'Duyuru', 'Güncel', 'Teknoloji', 'Kripto', 'Eğitim'];

export default function BlogEditorClient({ post, isEditing = false }: BlogEditorClientProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showSeoPanel, setShowSeoPanel] = useState(false);

    const [form, setForm] = useState({
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        cover_image: post?.cover_image || '',
        category: post?.category || '',
        tags: post?.tags?.join(', ') || '',
        author: post?.author || 'Admin',
        published: post?.published || false,
        featured: post?.featured || false,
        meta_title: post?.meta_title || '',
        meta_description: post?.meta_description || '',
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (title: string) => {
        setForm(f => ({
            ...f,
            title,
            slug: isEditing ? f.slug : generateSlug(title),
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const fd = new FormData();
        fd.append('file', file);

        const res = await uploadBlogImage(fd);
        if (res.success && res.url) {
            setForm(f => ({ ...f, cover_image: res.url! }));
        } else {
            alert('Fotoğraf yüklenirken hata: ' + (res.error || 'Bilinmeyen hata'));
        }
        setUploadingImage(false);
    };

    const handleSubmit = async (publish: boolean) => {
        if (!form.title || !form.content) {
            alert('Başlık ve içerik zorunludur!');
            return;
        }

        setLoading(true);
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('slug', form.slug);
        fd.append('excerpt', form.excerpt);
        fd.append('content', form.content);
        fd.append('cover_image', form.cover_image);
        fd.append('category', form.category);
        fd.append('tags', form.tags);
        fd.append('author', form.author);
        fd.append('published', String(publish));
        fd.append('featured', String(form.featured));
        fd.append('meta_title', form.meta_title || form.title);
        fd.append('meta_description', form.meta_description || form.excerpt);

        let res;
        if (isEditing && post?.id) {
            res = await updateBlogPost(post.id, fd);
        } else {
            res = await addBlogPost(fd);
        }

        if (res.success) {
            router.push('/admin/blog');
            router.refresh();
        } else {
            alert('Hata: ' + (res.error || 'Bilinmeyen hata'));
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-black text-gray-900">
                        {isEditing ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
                    >
                        <Eye size={16} /> Önizle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Yazı başlığı..."
                            className="w-full text-2xl font-black text-gray-900 placeholder-gray-300 border-0 border-b-2 border-gray-100 focus:border-blue-500 outline-none py-3 bg-transparent transition"
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">Slug:</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                                className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border-0 outline-none flex-1"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 mb-1 block">Özet</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                            placeholder="Kısa bir özet yazın (liste görünümünde gösterilir)..."
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 mb-2 block">Kapak Fotoğrafı</label>
                        {form.cover_image ? (
                            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                                <img src={form.cover_image} alt="Cover" className="w-full h-48 object-cover" />
                                <button
                                    onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                                    className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                            >
                                {uploadingImage ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                ) : (
                                    <>
                                        <ImageIcon size={32} />
                                        <span className="text-sm font-medium">Fotoğraf Yükle</span>
                                    </>
                                )}
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-gray-600">İçerik</label>
                            <span className="text-xs text-gray-400">{form.content.split(/\s+/).filter(Boolean).length} kelime</span>
                        </div>
                        {showPreview ? (
                            <div
                                className="prose prose-sm max-w-none bg-white border border-gray-200 rounded-xl p-6 min-h-[400px]"
                                dangerouslySetInnerHTML={{ __html: form.content }}
                            />
                        ) : (
                            <textarea
                                value={form.content}
                                onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                                placeholder="Blog içeriğinizi HTML formatında yazın... <h2>, <p>, <strong>, <ul>, <li>, <img> etiketleri kullanabilirsiniz."
                                rows={18}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Publish Actions */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 text-sm">Yayın Ayarları</h3>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Durum</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${form.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {form.published ? 'Yayında' : 'Taslak'}
                            </span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))}
                                className="w-4 h-4 text-yellow-500 rounded"
                            />
                            <Sparkles size={14} className="text-yellow-500" />
                            <span className="text-sm text-gray-700">Öne Çıkan</span>
                        </label>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition active:scale-95"
                            >
                                <Save size={14} /> Taslak
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={loading}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition active:scale-95"
                            >
                                {loading ? '...' : <><Eye size={14} /> Yayınla</>}
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 text-sm">Kategori</h3>
                        <div className="flex flex-wrap gap-2">
                            {BLOG_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setForm(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${form.category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 text-sm">Etiketler</h3>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                            placeholder="telegram, haber, gündem (virgülle ayırın)"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Author */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                        <h3 className="font-bold text-gray-900 text-sm">Yazar</h3>
                        <input
                            type="text"
                            value={form.author}
                            onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))}
                            placeholder="Yazar adı"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* SEO */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                        <button
                            onClick={() => setShowSeoPanel(!showSeoPanel)}
                            className="flex items-center justify-between w-full"
                        >
                            <h3 className="font-bold text-gray-900 text-sm">SEO Ayarları</h3>
                            <span className="text-xs text-blue-600">{showSeoPanel ? 'Gizle' : 'Göster'}</span>
                        </button>
                        {showSeoPanel && (
                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Meta Başlık</label>
                                    <input
                                        type="text"
                                        value={form.meta_title}
                                        onChange={(e) => setForm(f => ({ ...f, meta_title: e.target.value }))}
                                        placeholder={form.title || 'Meta başlık'}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-[10px] text-gray-400">{(form.meta_title || form.title).length}/60</span>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Meta Açıklama</label>
                                    <textarea
                                        value={form.meta_description}
                                        onChange={(e) => setForm(f => ({ ...f, meta_description: e.target.value }))}
                                        placeholder={form.excerpt || 'Meta açıklama'}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    <span className="text-[10px] text-gray-400">{(form.meta_description || form.excerpt).length}/160</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
