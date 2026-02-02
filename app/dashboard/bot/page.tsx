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
                                            <p className="text-sm text-gray-500 mb-2">Telegram'da <span className="font-bold text-blue-600">@tgkanalicom_bot</span> botunu aratın ve kanalınıza **Yönetici (Admin)** olarak ekleyin.</p>
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
                                <a href="https://t.me/tgkanalicom_bot" target="_blank" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
                                    <MessageSquare size={18} /> Yardıma mı ihtiyacınız var? Destek grubuna katılın
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="text-center space-y-4">
                                <div className="bg-blue-50 text-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Settings size={40} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Bot Kurulum Merkezi</h3>
                                <p className="text-gray-500 max-w-lg mx-auto text-lg">Kanalınızın istatistiklerini takip etmek için Telegram botumuzu kurmanız gerekmektedir. İşlem sadece 1 dakika sürer.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-2xl space-y-3 hover:bg-gray-100 transition duration-300">
                                    <div className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</div>
                                        Botu Ekle
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">Telegram'da <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">@tgkanalicom_bot</span>'u bulup kanalınıza yönetici olarak ekleyin.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl space-y-3 hover:bg-gray-100 transition duration-300">
                                    <div className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</div>
                                        Kanalı Seç
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">Sol menüden kurulum yapmak istediğiniz kanalı seçin. Kanalınız yoksa önce ekleyin.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl space-y-3 hover:bg-gray-100 transition duration-300">
                                    <div className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</div>
                                        Doğrula
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">Size verilen özel kodu (ör: <span className="font-mono bg-gray-200 px-1 rounded text-gray-800">/verify KOD</span>) kanala gönderin.</p>
                                </div>
                            </div>

                            <div className="bg-green-50/80 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start border border-green-100">
                                <div className="bg-white text-green-600 p-3 rounded-2xl shadow-sm shrink-0">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-green-900 mb-2">Güvenli ve Risksizdir</h4>
                                    <p className="text-green-800/90 leading-relaxed">
                                        Botumuz kanalınızda <strong>hiçbir mesajı silmez, üye atmaz veya yetkilerini kötüye kullanmaz.</strong> Sadece "Giren/Çıkan Üye" sayısını takip etmek için okuma iznine ihtiyaç duyar. Telegram'ın resmi bot API'sini kullanır ve verileriniz şifrelenerek saklanır.
                                    </p>
                                </div>
                            </div>

                            {channels.length === 0 && (
                                <div className="flex justify-center pt-6">
                                    <div className="text-center px-8 py-6 bg-orange-50 text-orange-900 rounded-2xl border border-orange-100 shadow-sm max-w-md">
                                        <p className="font-bold text-lg mb-2">Henüz bir kanalınız yok</p>
                                        <p className="text-sm mb-6 text-orange-800">Bot kurulumuna başlamadan önce sisteme bir kanal eklemelisiniz.</p>
                                        <a href="/dashboard/kanal-ekle" className="inline-flex items-center justify-center bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                                            + Yeni Kanal Ekle
                                        </a>
                                    </div>
                                </div>
                            )}
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
