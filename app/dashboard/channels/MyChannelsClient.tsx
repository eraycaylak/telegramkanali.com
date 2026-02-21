'use client';

import {
    Tv, ExternalLink, Settings, PlusCircle,
    RefreshCw, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function MyChannelsClient({ channels }: { channels: any[] }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase"><CheckCircle2 size={12} /> Onaylı</span>;
            case 'rejected': return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase"><AlertCircle size={12} /> Reddedildi</span>;
            default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase"><Clock size={12} /> Bekliyor</span>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Kanallarım ({channels.length})</h2>
                <Link href="/dashboard/kanal-ekle" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm shadow-lg shadow-blue-100">
                    <PlusCircle size={18} /> Yeni Kanal Ekle
                </Link>
            </div>

            {channels.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Tv size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz kanalınız yok</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">Sisteme kanalınızı ekleyerek analizlerini takip etmeye başlayın.</p>
                    <Link href="/dashboard/kanal-ekle" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        Kanalımı Ekle
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {channels.map((channel) => (
                        <div key={channel.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    {channel.image ? (
                                        <img src={channel.image} alt="" className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-bold border border-gray-100">
                                            {channel.name.charAt(0)}
                                        </div>
                                    )}
                                    {channel.bot_enabled && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg shadow-lg border-2 border-white" title="Bot Aktif">
                                            <RefreshCw size={10} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 truncate">{channel.name}</h3>
                                        {getStatusBadge(channel.status)}
                                    </div>
                                    <p className="text-gray-500 text-[13px] line-clamp-1 mb-3">@{channel.join_link?.split('/').pop()}</p>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ÜYELER</span>
                                            <span className="text-sm font-extrabold text-gray-900">{(channel.member_count || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BOT DURUMU</span>
                                            <span className={`text-sm font-extrabold ${channel.bot_enabled ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {channel.bot_enabled ? 'Aktif' : 'Devre Dışı'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <Link href={`/${channel.slug}`} target="_blank" className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition">
                                    Sitede Gör <ExternalLink size={12} />
                                </Link>
                                <div className="flex items-center gap-2">
                                    <Link href={`/dashboard/bot?channel=${channel.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                        <Settings size={18} />
                                    </Link>
                                    <Link href={`/dashboard/stats?channel=${channel.id}`} className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition">
                                        Analizler
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
