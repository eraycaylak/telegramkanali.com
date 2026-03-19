'use client';

import { useState, useEffect } from 'react';
import { getComments, addComment } from '@/app/actions/comments';
import { MessageSquare, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
}

export default function Comments({ channelId }: { channelId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [authorName, setAuthorName] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            const res = await getComments(channelId);
            if (res.error) {
                setError(res.error);
            } else if (res.comments) {
                setComments(res.comments as Comment[]);
            }
            setLoading(false);
        };

        fetchComments();
    }, [channelId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const res = await addComment(channelId, authorName, content);

        if (res.error) {
            setError(res.error);
        } else if (res.success) {
            setSuccessMessage(res.message || 'Yorumunuz değerlendirilmek üzere alındı.');
            setAuthorName('');
            setContent('');
        }
        setSubmitting(false);
    };

    return (
        <section className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm mt-12 mb-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                    <MessageSquare size={28} />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Kullanıcı Yorumları</h2>
                    <p className="text-gray-500 text-sm mt-1">Bu kanal hakkındaki deneyimlerinizi paylaşın.</p>
                </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-12 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Yorum Yap</h3>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3 border border-green-100">
                        <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                        <p className="text-sm font-medium">{successMessage}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="authorName" className="block text-sm font-semibold text-gray-700 mb-1.5">İsminiz</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                id="authorName"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                placeholder="Adınız Soyadınız"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1.5">Yorumunuz</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none resize-y"
                            placeholder="Kanal hakkındaki düşüncelerinizi detaylı bir şekilde yazın..."
                            required
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-2 flex justify-end">HTML etiketleri kullanılamaz.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gönderiliyor...
                            </>
                        ) : (
                            'Yorumu Gönder'
                        )}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                <h3 className="font-bold text-gray-900 text-xl mb-6 border-b pb-2 inline-block">
                    Onaylanan Yorumlar <span className="text-gray-400 font-normal text-base ml-2">({comments.length})</span>
                </h3>

                {loading ? (
                    <div className="flex justify-center flex-col items-center py-12 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Yorumlar yükleniyor...</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-white border border-gray-100 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-50 text-blue-700 font-bold uppercase shadow-sm">
                                        {comment.author_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{comment.author_name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                            <Clock size={12} />
                                            {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap ml-[52px]">
                                {comment.content}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
                        <h4 className="text-lg font-bold text-gray-900 mb-2">İlk Yorumu Siz Yapın</h4>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Bu kanal için henüz bir yorum onaylanmamış. İncelemenizi veya bu kanalla ilgili düşüncelerinizi paylaşarak diğer kullanıcılara yol gösterin.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
