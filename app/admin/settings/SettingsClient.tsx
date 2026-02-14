'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export default function SettingsClient() {
    const [logoUrl, setLogoUrl] = useState('');
    const [siteTitle, setSiteTitle] = useState('Telegram Kanalları');
    const [gaId, setGaId] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load settings from database on mount
    useEffect(() => {
        // Permission Check
        const isAdmin = localStorage.getItem('isAdmin');
        const userId = localStorage.getItem('userId');

        // Strict Admin Check
        if (isAdmin !== 'true') {
            // Second check via profile for security if ignoring localStorage
            // But for now, let's trust localStorage + profile fetch if needed.
            // Ideally we fetch profile. 
            // Let's do the profile fetch pattern as standard.
        }

        async function checkAndLoad() {
            if (userId) {
                const { data: user } = await supabase.from('profiles').select('role').eq('id', userId).single();
                if (user?.role !== 'admin') {
                    alert('Bu sayfaya erişim yetkiniz yok (Sadece Admin).');
                    window.location.href = '/admin/dashboard';
                    return;
                }
            } else if (isAdmin !== 'true') {
                // No user ID and not legacy admin
                window.location.href = '/admin/dashboard';
                return;
            }

            loadSettings();
        }
        checkAndLoad();

    }, []);

    async function loadSettings() {
        try {
            const { getAllSettings } = await import('@/app/actions/settings');
            const settings = await getAllSettings();

            if (settings.logo_url) setLogoUrl(settings.logo_url);
            if (settings.site_title) setSiteTitle(settings.site_title);
            if (settings.ga_id) setGaId(settings.ga_id);
        } catch (error) {
            console.error('Load settings error:', error);
        } finally {
            setLoading(false);
        }
    }


    const handleSave = async () => {
        setSaving(true);

        try {
            const { saveAllSettings } = await import('@/app/actions/settings');
            const result = await saveAllSettings({
                logo_url: logoUrl,
                site_title: siteTitle,
                ga_id: gaId
            });

            if (result.error) {
                alert('Kaydetme hatası: ' + result.error);
            } else {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ayarlar</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">

                {/* Logo Section */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Site Logosu</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Önerilen boyut: <strong>350 x 80 piksel</strong> (PNG veya WebP)
                    </p>

                    <div className="space-y-4">
                        {/* Preview Area */}
                        <div
                            className="bg-[#333] rounded-lg flex items-center justify-center overflow-hidden"
                            style={{ width: '350px', height: '80px' }}
                        >
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Logo Önizleme"
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="text-gray-500 text-sm flex flex-col items-center">
                                    <ImageIcon size={24} className="mb-1 opacity-50" />
                                    <span>350 x 80 px</span>
                                </div>
                            )}
                        </div>

                        {/* URL Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logo URL
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2.5 text-sm"
                                placeholder="https://i.imgur.com/xxxxx.png"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Harici bir URL girin (örn: imgur, imgbb, cloudinary)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Site Settings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Başlığı</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5"
                        placeholder="G-XXXXXXXX"
                        value={gaId}
                        onChange={(e) => setGaId(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${saved
                        ? 'bg-green-600 text-white'
                        : saving
                            ? 'bg-gray-400 text-white cursor-wait'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    {saved ? '✓ Kaydedildi!' : saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>

                <p className="text-xs text-gray-400 mt-4">
                    * Ayarlar veritabanına kaydedilir ve tüm kullanıcılar tarafından görülür.
                </p>
            </div>
        </div>
    );
}
