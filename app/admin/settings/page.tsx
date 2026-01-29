'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [logoUrl, setLogoUrl] = useState('/images/logo.png');
    const [logoSize, setLogoSize] = useState(120);

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ayarlar</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">

                {/* Logo Section */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Site Logosu</h2>
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div
                                className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                                style={{ width: logoSize, height: logoSize * 0.6 }}
                            >
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt="Logo Önizleme"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm">Logo Yok</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5"
                                    placeholder="https://... veya /images/logo.png"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Harici bir URL veya /images klasöründen dosya yolu</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo Genişliği: {logoSize}px
                                </label>
                                <input
                                    type="range"
                                    min="80"
                                    max="200"
                                    value={logoSize}
                                    onChange={(e) => setLogoSize(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Site Settings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Başlığı</label>
                    <input type="text" className="w-full border rounded-lg p-2.5" defaultValue="Telegram Kanalları" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                    <input type="text" className="w-full border rounded-lg p-2.5" placeholder="G-XXXXXXXX" />
                </div>

                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
                    Kaydet
                </button>
            </div>
        </div>
    );
}
