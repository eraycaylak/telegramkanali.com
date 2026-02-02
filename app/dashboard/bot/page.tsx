'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Settings,
    HelpCircle,
    Copy,
    RefreshCw,
    MessageSquare,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

import { Suspense } from 'react';

function BotSettingsContent() {
    const searchParams = useSearchParams();
    const [channels, setChannels] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('channel'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChannels();
    }, []);

    async function fetchChannels() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase.from('channels').select('*').eq('owner_id', user.id);
            const userChannels = data || [];
            setChannels(userChannels);

            // If query param exists, verify it belongs to user
            const queryChannelId = searchParams.get('channel');
            if (queryChannelId && userChannels.some(c => c.id === queryChannelId)) {
                setSelectedId(queryChannelId);
            } else if (userChannels.length > 0 && !selectedId) {
                setSelectedId(userChannels[0].id);
            }
        } catch (error) {
            console.error('Error fetching channels for bot settings:', error);
        } finally {
            setLoading(false);
        }
    }

    const selectedChannel = channels.find(c => c.id === selectedId);

    async function generateToken() {
        if (!selectedId) return;
        const newToken = 'TK_' + Math.random().toString(36).substring(2, 10).toUpperCase();

        const { error } = await supabase
            .from('channels')
            .update({ bot_token: newToken })
            .eq('id', selectedId);

        if (!error) {
            fetchChannels();
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Kopyalandı!');
    };

    if (loading) return <div className="h-96 flex items-center justify-center text-gray-400">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Left: Selector */}
                <div className="w-full md:w-64 shrink-0 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Kanal Seçin</h3>
                    <div className="space-y-2">
                        {channels.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedId === c.id
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                                    : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-bold truncate">{c.name}</div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${/* selectedId === c.id ? 'text-blue-200' : */ 'text-gray-400'}`}>
                                    {c.bot_enabled ? 'Bot Aktif' : 'Bot Devre Dışı'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Instructions */}
                <div className="flex-1 space-y-8">
                    {selectedChannel ? (
                        <>
                            {/* Setup Status */}
                            <div className={`p-8 rounded-3xl border-2 ${selectedChannel.bot_enabled ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    {selectedChannel.bot_enabled ? (
                                        <div className="bg-green-100 text-green-600 p-3 rounded-2xl">
                                            <CheckCircle2 size={32} />
                                        </div>
                                    ) : (
                                        <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
                                            <AlertTriangle size={32} />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">
                                            {selectedChannel.bot_enabled ? 'Bot Başarıyla Bağlandı' : 'Bot Henüz Bağlanmadı'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {selectedChannel.bot_enabled
                                                ? 'Bot kanalınızı izliyor ve verileri kaydediyor.'
                                                : 'Analizleri görmek için botu kanalınıza eklemelisiniz.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Instruction Steps */}
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="text-blue-600" /> Kurulum Talimatları
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-bold flex items-center justify-center shrink-0">1</div>
                                        <div>
                                            <p className="font-bold text-gray-900 mb-1">Botu Kanalınıza Ekleyin</p>
                                            <p className="text-sm text-gray-500 mb-2">Telegram'da <span className="font-bold text-blue-600">@KanalAnalizBot</span> botunu aratın ve kanalınıza **Yönetici (Admin)** olarak ekleyin.</p>
                                            <p className="text-[11px] text-orange-600 font-bold">* Botun "Mesajları Oku" ve "Üyeleri Yönet" yetkisi olması yeterlidir.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-bold flex items-center justify-center shrink-0">2</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 mb-1">Doğrulama Kodunu Gönderin</p>
                                            <p className="text-sm text-gray-500 mb-4">Botu ekledikten sonra kanala şu mesajı yazın (Sonra silebilirsiniz):</p>

                                            <div className="relative group">
                                                <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm break-all group-hover:bg-gray-800 transition">
                                                    {selectedChannel.bot_token ? `/verify ${selectedChannel.bot_token}` : 'Henüz kod oluşturulmadı'}
                                                </div>
                                                {selectedChannel.bot_token && (
                                                    <button
                                                        onClick={() => copyToClipboard(`/verify ${selectedChannel.bot_token}`)}
                                                        className="absolute right-3 top-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {!selectedChannel.bot_token && (
                                                <button
                                                    onClick={generateToken}
                                                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 flex items-center gap-2"
                                                >
                                                    <RefreshCw size={16} /> Kod Oluştur
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-green-600 bg-green-50 p-4 rounded-2xl">
                                        <ShieldCheck className="shrink-0" />
                                        <p className="text-xs font-bold leading-relaxed">
                                            Güvenlik Notu: Botumuz sadece üye sayısının giren çıkan trafiğini takip eder. Mesajlarınız kaydedilmez ve üçüncü taraflarla paylaşılmaz.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <a href="https://t.me/KanalAnalizBot" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
                                    <MessageSquare size={18} /> Yardıma mı ihtiyacınız var? Destek grubuna katılın
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 border-dashed text-gray-400">
                            <HelpCircle size={48} className="mb-4 opacity-20" />
                            <p>Lütfen sol taraftan bir kanal seçin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BotSettingsPage() {
    return (
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-400">Yükleniyor...</div>}>
            <BotSettingsContent />
        </Suspense>
    );
}
