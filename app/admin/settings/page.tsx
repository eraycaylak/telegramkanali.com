'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function SettingsPage() {
    const [logoUrl, setLogoUrl] = useState('');
    const [siteTitle, setSiteTitle] = useState('Telegram Kanalları');
    const [gaId, setGaId] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('siteSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setLogoUrl(settings.logoUrl || '');
            setSiteTitle(settings.siteTitle || 'Telegram Kanalları');
            setGaId(settings.gaId || '');
        }
    }, []);

    const handleSave = () => {
        setSaving(true);

        // Save to localStorage
        localStorage.setItem('siteSettings', JSON.stringify({
            logoUrl,
            siteTitle,
            gaId
        }));

        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 300);
    };

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
                                placeholder="https://example.com/logo.png"
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
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${saved
                            ? 'bg-green-600 text-white'
                            : saving
                                ? 'bg-gray-400 text-white cursor-wait'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {saved ? '✓ Kaydedildi!' : saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
}
