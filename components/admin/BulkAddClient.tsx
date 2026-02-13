'use client';

import { useState } from 'react';
import { Category } from '@/lib/types';
import { addChannelByUrl } from '@/app/actions/admin';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
    categories: Category[];
}

interface ProcessResult {
    url: string;
    status: 'success' | 'exists' | 'error';
    name?: string;
    message?: string;
}

export default function BulkAddClient({ categories }: Props) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'completed'>('idle');
    const [urls, setUrls] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [results, setResults] = useState<ProcessResult[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalToProcess, setTotalToProcess] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const urlList = urls.split('\n').map(u => u.trim()).filter(u => u !== '');
        if (urlList.length === 0 || !categoryId) return;

        setStatus('loading');
        setTotalToProcess(urlList.length);
        setCurrentIndex(0);
        setResults([]);

        const newResults: ProcessResult[] = [];

        for (let i = 0; i < urlList.length; i++) {
            const url = urlList[i];
            setCurrentIndex(i + 1);

            try {
                const res = await addChannelByUrl(url, categoryId);

                if (res.success) {
                    newResults.push({ url, status: 'success', name: res.name });
                } else if (res.status === 'exists') {
                    newResults.push({ url, status: 'exists', message: 'Zaten mevcut' });
                } else {
                    newResults.push({ url, status: 'error', message: res.error || 'Bilinmeyen hata' });
                }
            } catch (error) {
                console.error('Error adding channel:', url, error);
                newResults.push({ url, status: 'error', message: 'İletişim hatası' });
            }

            // Update results state to show progress
            setResults([...newResults]);

            // Wait a bit to be safe
            if (i < urlList.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        setStatus('completed');
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText) {
            // If the pasted text doesn't end with a newline, add one
            const textToAppend = pastedText.endsWith('\n') ? pastedText : pastedText + '\n';

            // Prevent default to manually handle the insertion
            e.preventDefault();

            const textarea = e.target as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const newValue = urls.substring(0, start) + textToAppend + urls.substring(end);
            setUrls(newValue);

            // Set cursor position after the pasted text (needs a slight delay for React to update)
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + textToAppend.length;
            }, 0);
        }
    };

    if (status === 'completed' || (status === 'loading' && results.length > 0)) {
        const successCount = results.filter(r => r.status === 'success').length;
        const failCount = results.filter(r => r.status !== 'success').length;

        return (
            <div className="space-y-6">
                <div className={`border rounded-2xl p-6 text-center ${status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    {status === 'loading' ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                            <h2 className="text-xl font-bold text-blue-800">İşleniyor ({currentIndex} / {totalToProcess})</h2>
                            <div className="w-full bg-blue-100 rounded-full h-2.5 mt-2">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentIndex / totalToProcess) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="text-green-600 w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-green-800 mb-1">İşlem Tamamlandı</h2>
                            <p className="text-green-700 text-sm">
                                {successCount} kanal başarıyla eklendi. {failCount} hata/atlama oluştu.
                            </p>
                        </>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold sticky top-0">
                            <tr>
                                <th className="px-3 md:px-4 py-3">Kanal</th>
                                <th className="px-3 md:px-4 py-3 text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...results].reverse().map((r, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-3 md:px-4 py-3 truncate max-w-[120px] md:max-w-xs">{r.url}</td>
                                    <td className="px-3 md:px-4 py-3 text-xs text-right">
                                        {r.status === 'success' ? (
                                            <span className="text-green-600 font-bold whitespace-nowrap">✓ {r.name}</span>
                                        ) : r.status === 'exists' ? (
                                            <span className="text-orange-600 font-bold">Mevcut</span>
                                        ) : (
                                            <span className="text-red-600 font-bold truncate block">✗ Hata</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {status === 'completed' && (
                    <button
                        onClick={() => { setStatus('idle'); setUrls(''); setResults([]); setTotalToProcess(0); }}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                    >
                        Yeni Liste Ekle
                    </button>
                )}
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
                    onPaste={handlePaste}
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
