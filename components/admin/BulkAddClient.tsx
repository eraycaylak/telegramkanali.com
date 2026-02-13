'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { bulkAddChannels } from '@/app/actions/admin';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
    categories: Category[];
}

export default function BulkAddClient({ categories }: Props) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'completed'>('idle');
    const [urls, setUrls] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [results, setResults] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urls.trim() || !categoryId) return;

        setStatus('loading');
        const urlList = urls.split('\n').map(u => u.trim()).filter(u => u !== '');

        try {
            const res = await bulkAddChannels(urlList, categoryId);
            setResults(res);
            setStatus('completed');
        } catch (error) {
            console.error('Bulk add error:', error);
            setStatus('idle');
            alert('Bir hata oluştu.');
        }
    };

    if (status === 'completed' && results) {
        return (
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="text-green-600 w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-green-800 mb-1">İşlem Tamamlandı</h2>
                    <p className="text-green-700 text-sm">
                        {results.successCount} kanal başarıyla eklendi. {results.failCount} hata/atlama oluştu.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                            <tr>
                                <th className="px-4 py-3">Link</th>
                                <th className="px-4 py-3">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {results.results.map((r: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 truncate max-w-xs">{r.url}</td>
                                    <td className="px-4 py-3">
                                        {r.status === 'success' ? (
                                            <span className="text-green-600 font-medium">✓ {r.name}</span>
                                        ) : r.status === 'exists' ? (
                                            <span className="text-orange-600 font-medium">⚠ Mevcut</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">✗ {r.message}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={() => { setStatus('idle'); setUrls(''); setResults(null); }}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                >
                    Yeni Liste Ekle
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kanal Linkleri (Her satıra bir tane) *</label>
                <textarea
                    required
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    placeholder="t.me/kanal1&#10;t.me/kanal2&#10;t.me/kanal3"
                    className="w-full h-64 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition font-mono text-sm"
                    disabled={status === 'loading'}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori Seçin *</label>
                <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                    disabled={status === 'loading'}
                >
                    <option value="">Seçiniz...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={status === 'loading' || !urls.trim() || !categoryId}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        İşleniyor (Bu işlem zaman alabilir)...
                    </>
                ) : (
                    <>
                        <Send size={20} />
                        Toplu Ekle
                    </>
                )}
            </button>
        </form>
    );
}
