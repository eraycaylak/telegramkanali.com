import React from 'react';
import Link from 'next/link';
import { MessageCircle, Repeat2, Heart, Share, BarChart2, BadgeCheck } from 'lucide-react';
import { BlogPost } from '@/lib/types'; // Let's guess we have this or just use any/local types

// Local type for simplicity since I can't guarantee BlogPost is fully exported in lib/types yet
interface LocalBlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image?: string;
    author: string;
    created_at: string;
    view_count?: number;
    // other fields omitted
}

interface TwitterFeedProps {
    posts: any[];
}

export default function TwitterFeed({ posts }: TwitterFeedProps) {

    const formatTwitterDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}d`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}s`;
        
        const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        return `${date.getDate()} ${monthNames[date.getMonth()]}`;
    };

    const getInitials = (name: string) => {
        return name ? name.slice(0, 2).toUpperCase() : 'AD';
    };

    if (!posts || posts.length === 0) {
        return (
            <div className="max-w-2xl mx-auto border border-gray-200 rounded-2xl p-8 text-center bg-white mt-8 shadow-sm">
                <p className="text-gray-500 font-medium">Bu akışta henüz bir gönderi bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto border-x border-t border-gray-200 bg-white min-h-screen my-6 rounded-t-2xl shadow-sm pb-12">
            {/* Feed Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200 p-4">
                <h1 className="text-xl font-bold text-gray-900">X Akışı</h1>
                <p className="text-xs text-gray-500">Özel mikro-blog yayınları</p>
            </div>

            {/* Posts Stream */}
            <div className="flex flex-col">
                {posts.map((post) => (
                    <article key={post.id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition duration-200 cursor-pointer flex gap-3">
                        {/* Left: Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex justify-center items-center font-bold text-lg">
                                {getInitials(post.author || 'Admin')}
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 min-w-0">
                            {/* Author & Meta text */}
                            <Link href={`/blog/${post.slug}`} className="block relative z-10">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1 cursor-pointer group">
                                    <span className="font-bold text-gray-900 group-hover:underline truncate">
                                        {post.author || 'Admin'}
                                    </span>
                                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-500 truncate">@{post.author ? post.author.toLowerCase().replace(/\s+/g, '') : 'admin'}</span>
                                    <span className="text-sm text-gray-500">·</span>
                                    <span className="text-sm text-gray-500 hover:underline">{formatTwitterDate(post.created_at)}</span>
                                </div>
                                
                                {/* Post Body */}
                                <div className="text-gray-900 text-[15px] leading-snug whitespace-pre-wrap mb-3">
                                    <strong className="block mb-1 text-base">{post.title}</strong>
                                    {post.excerpt && (
                                        <span className="text-gray-800 break-words">{post.excerpt}</span>
                                    )}
                                </div>
                            </Link>

                            {/* Link to Read More if necessary */}
                            <Link href={`/blog/${post.slug}`} className="text-blue-500 text-sm hover:underline block mb-3 opacity-90">
                                Daha fazla detay için tıkla...
                            </Link>

                            {/* Media Attachment */}
                            {post.cover_image && (
                                <Link href={`/blog/${post.slug}`} className="block mb-3">
                                    <div className="rounded-2xl border border-gray-300 overflow-hidden aspect-video bg-gray-100 relative">
                                        <img 
                                            src={post.cover_image} 
                                            alt={post.title} 
                                            className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                            loading="lazy"
                                        />
                                    </div>
                                </Link>
                            )}

                            {/* Action Bar */}
                            <div className="flex items-center justify-between text-gray-500 text-sm max-w-md pt-2">
                                <button className="flex items-center gap-2 hover:text-blue-500 group transition">
                                    <div className="p-2 -m-2 rounded-full group-hover:bg-blue-50 transition">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <span className="group-hover:text-blue-500 mt-0.5">0</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-green-500 group transition">
                                    <div className="p-2 -m-2 rounded-full group-hover:bg-green-50 transition">
                                        <Repeat2 className="w-4 h-4" />
                                    </div>
                                    <span className="group-hover:text-green-500 mt-0.5">0</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-pink-500 group transition">
                                    <div className="p-2 -m-2 rounded-full group-hover:bg-pink-50 transition">
                                        <Heart className="w-4 h-4" />
                                    </div>
                                    <span className="group-hover:text-pink-500 mt-0.5">0</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-blue-500 group transition">
                                    <div className="p-2 -m-2 rounded-full group-hover:bg-blue-50 transition">
                                        <BarChart2 className="w-4 h-4" />
                                    </div>
                                    <span className="group-hover:text-blue-500 mt-0.5">{post.view_count || 0}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-blue-500 group transition ml-auto">
                                    <div className="p-2 -m-2 rounded-full group-hover:bg-blue-50 transition">
                                        <Share className="w-4 h-4" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            {/* Bottom Padding */}
            <div className="p-8 text-center text-gray-300">
                 Daha fazla gönderi yok
            </div>
        </div>
    );
}
