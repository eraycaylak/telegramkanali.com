'use client';

import { useState } from 'react';
import { regenerateBotToken } from '@/app/actions/channels';
import {
    Settings, Copy, RefreshCw, MessageSquare,
    ShieldCheck, CheckCircle2, AlertTriangle, BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function BotSettingsClient({
    channels,
    initialChannelId,
}: {
    channels: any[];
    initialChannelId: string | null;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(
        initialChannelId && channels.some(c => c.id === initialChannelId)
            ? initialChannelId
            : channels[0]?.id || null
    );
    const [localChannels, setLocalChannels] = useState(channels);
    const [generatingToken, setGeneratingToken] = useState(false);

    const selectedChannel = localChannels.find(c => c.id === selectedId);

    async function handleRegenerateToken() {
        if (!selectedId) return;
        setGeneratingToken(true);
        const res = await regenerateBotToken(selectedId);
        if (res.success && res.token) {
            // Lokal state'i güncelle — sayfayı yenilemeye gerek yok
            setLocalChannels(prev => prev.map(c =>
                c.id === selectedId ? { ...c, bot_token: res.token } : c
            ));
        } else {
            alert('Kod oluşturulurken hata: ' + res.error);
        }
        setGeneratingToken(false);
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Kopyalandı!');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sol: Kanal Seçici */}
                <div className="w-full md:w-64 shrink-0 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Kanal Seçin</h3>
                    <div className="space-y-2">
                        {localChannels.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedId === c.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                                        : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-bold truncate">{c.name}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    {c.bot_enabled ? 'Bot Aktif' : 'Bot Devre Dışı'}
                                </div>
                            </button>
                        ))}
                        {localChannels.length === 0 && (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                Henüz kanalınız yok.{' '}
                                <Link href="/dashboard/kanal-ekle" className="text-blue-600 font-bold hover:underline">
                                    Ekleyin
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sağ: Kurulum */}
                <div className="flex-1 space-y-8">
                    {selectedChannel ? (
                        <>
                            {/* Bağlantı Durumu */}
                            <div className={`p-8 rounded-3xl border-2 ${selectedChannel.bot_enabled ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    {selectedChannel.bot_enabled ? (
                                        <div className="bg-green-100 text-green-600 p-3 rounded-2xl"><CheckCircle2 size={32} /></div>
                                    ) : (
                                        <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl"><AlertTriangle size={32} /></div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-gray-900">
                                            {selectedChannel.bot_enabled ? 'Bot Başarıyla Bağlandı' : 'Bot Henüz Bağlanmadı'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {selectedChannel.bot_enabled
                                                ? 'Bot kanalınızı izliyor ve verileri kaydediyor.'
                                                : 'Analizleri görmek için botu kanalınıza eklemelisiniz.'}
                                        </p>
                                    </div>
                                    {selectedChannel.bot_enabled && (
                                        <Link href={`/dashboard/stats?channel=${selectedChannel.id}`}
                                            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition flex items-center gap-2">
                                            <BarChart3 size={16} /> İstatistikleri Gör
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Kurulum Adımları */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="text-blue-600" /> Kurulum Talimatları
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-bold flex items-center justify-center shrink-0">1</div>
                                        <div>
                                            <p className="font-bold text-gray-900 mb-1">Botu Kanalınıza Ekleyin</p>
                                            <p className="text-sm text-gray-500 mb-2">
                                                Telegram&apos;da <span className="font-bold text-blue-600">@tgkanalicom_bot</span> botunu aratın ve kanalınıza <strong>Yönetici (Admin)</strong> olarak ekleyin.
                                            </p>
                                            <p className="text-[11px] text-orange-600 font-bold">* &quot;Mesajları Oku&quot; ve &quot;Üyeleri Yönet&quot; yetkisi yeterlidir.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-bold flex items-center justify-center shrink-0">2</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 mb-1">Doğrulama Kodunu Gönderin</p>
                                            <p className="text-sm text-gray-500 mb-4">Botu ekledikten sonra kanala şu mesajı yazın:</p>
                                            <div className="relative group">
                                                <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm break-all group-hover:bg-gray-800 transition">
                                                    {selectedChannel.bot_token
                                                        ? `/verify ${selectedChannel.bot_token}`
                                                        : 'Token yükleniyor...'}
                                                </div>
                                                {selectedChannel.bot_token && (
                                                    <button
                                                        onClick={() => copyToClipboard(`/verify ${selectedChannel.bot_token}`)}
                                                        className="absolute right-3 top-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                                                        title="Kopyala"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleRegenerateToken}
                                                disabled={generatingToken}
                                                className="mt-4 bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-50"
                                            >
                                                <RefreshCw size={14} className={generatingToken ? 'animate-spin' : ''} />
                                                {generatingToken ? 'Oluşturuluyor...' : 'Yeni Kod Oluştur'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-green-600 bg-green-50 p-4 rounded-2xl">
                                        <ShieldCheck className="shrink-0" />
                                        <p className="text-xs font-bold leading-relaxed">
                                            Güvenlik Notu: Botumuz sadece üye sayısının giren çıkan trafiğini takip eder. Mesajlarınız kaydedilmez.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <a href="https://t.me/tgkanalicom_bot" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
                                    <MessageSquare size={18} /> Yardıma mı ihtiyacınız var?
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <Settings size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {localChannels.length === 0 ? 'Henüz kanalınız yok' : 'Sol menüden bir kanal seçin'}
                            </h3>
                            {localChannels.length === 0 && (
                                <Link href="/dashboard/kanal-ekle" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                                    Kanal Ekle
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
