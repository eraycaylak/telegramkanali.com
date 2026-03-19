'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Check, X, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AdminComment {
    id: string;
    channel_id: string;
    author_name: string;
    content: string;
    status: string;
    created_at: string;
    channels?: { name: string, slug: string };
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<AdminComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'

    useEffect(() => {
        fetchComments();
    }, [filter]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('channel_comments')
                .select('*, channels(name, slug)')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching admin comments:', error);
            } else if (data) {
                setComments(data as AdminComment[]);
            }
        } catch (err) {
            console.error('Exception fetching admin comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('channel_comments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                console.error(`Error updating comment ${id} to ${newStatus}:`, error);
                alert('Durum güncellenemedi.');
            } else {
                fetchComments(); // Reload to reflect changes and potentially remove from current filter
            }
        } catch (err) {
            console.error('Exception updating comment status:', err);
        }
    };

    const deleteComment = async (id: string) => {
        if (!confirm('Bu yorumu tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            const { error } = await supabase
                .from('channel_comments')
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`Error deleting comment ${id}:`, error);
                alert('Yorum silinemedi.');
            } else {
                fetchComments();
            }
        } catch (err) {
            console.error('Exception deleting comment:', err);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" />
                        Yorum Yönetimi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Kullanıcı yorumlarını inceleyin, onaylayın veya silin.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-2 overflow-x-auto">
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800 border bg-yellow-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    Bekleyenler
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    Onaylananlar
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    Reddedilenler
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    Tümü
                </button>
            </div>

            {/* Comments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center flex-col items-center py-12 gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500">Yükleniyor...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Bu filtreye uygun yorum bulunmuyor.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {comments.map((comment) => (
                            <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${comment.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    comment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {comment.status === 'pending' ? 'Bekliyor' : comment.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">{comment.author_name}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.created_at).toLocaleString('tr-TR')}
                                            </span>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-lg text-gray-800 whitespace-pre-wrap">
                                            {comment.content}
                                        </div>

                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            Kanal:
                                            <Link href={`/${comment.channels?.slug}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1" target="_blank">
                                                {comment.channels?.name} <ExternalLink size={12} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex lg:flex-col gap-2 justify-start lg:justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                                        {comment.status !== 'approved' && (
                                            <button
                                                onClick={() => updateStatus(comment.id, 'approved')}
                                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors font-medium border border-green-200"
                                            >
                                                <Check size={18} /> Onayla
                                            </button>
                                        )}
                                        {comment.status !== 'rejected' && (
                                            <button
                                                onClick={() => updateStatus(comment.id, 'rejected')}
                                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors font-medium border border-orange-200"
                                            >
                                                <X size={18} /> Reddet
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteComment(comment.id)}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium border border-red-200"
                                        >
                                            <Trash2 size={18} /> Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
