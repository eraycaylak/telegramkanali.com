'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function SettingsPage() {
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [siteTitle, setSiteTitle] = useState('Telegram Kanalları');
    const [gaId, setGaId] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setLogoUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            let finalLogoUrl = logoUrl;

            // If we have a file, upload to Supabase Storage
            if (logoFile) {
                setUploading(true);
                const formData = new FormData();
                formData.append('file', logoFile);

                const { uploadLogo } = await import('@/app/actions/admin');
                const result = await uploadLogo(formData);

                if (result.error) {
                    alert('Logo yüklenemedi: ' + result.error);
                    setSaving(false);
                    setUploading(false);
                    return;
                }

                finalLogoUrl = result.url || '';
                setLogoUrl(finalLogoUrl);
                setUploading(false);
            }

            // Save settings to localStorage (and would save to DB)
            localStorage.setItem('siteSettings', JSON.stringify({
                logoUrl: finalLogoUrl,
                siteTitle,
                gaId
            }));

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Save error:', error);
            alert('Kaydetme hatası');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ayarlar</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">

                {/* Logo Section */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Site Logosu</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Önerilen boyut: <strong>350 x 80 piksel</strong> (PNG veya WebP formatı)
                    </p>

                    <div className="space-y-4">
                        {/* Preview Area */}
                        <div
                            className="bg-[#333] rounded-lg flex items-center justify-center overflow-hidden relative"
                            style={{ width: '350px', height: '80px' }}
                        >
                            {logoPreview || logoUrl ? (
                                <>
                                    <img
                                        src={logoPreview || logoUrl}
                                        alt="Logo Önizleme"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <button
                                        onClick={removeLogo}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-gray-500 text-sm flex flex-col items-center">
                                    <ImageIcon size={24} className="mb-1 opacity-50" />
                                    <span>350 x 80 px</span>
                                </div>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="flex gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600"
                            >
                                <Upload size={18} />
                                {logoFile ? 'Farklı Dosya Seç' : 'Logo Yükle'}
                            </button>
                            {logoFile && (
                                <span className="text-sm text-green-600 flex items-center">
                                    ✓ {logoFile.name}
                                </span>
                            )}
                        </div>

                        {/* Or URL Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                veya URL ile ekle:
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2.5 text-sm"
                                placeholder="https://example.com/logo.png"
                                value={logoUrl}
                                onChange={(e) => {
                                    setLogoUrl(e.target.value);
                                    setLogoPreview(e.target.value);
                                    setLogoFile(null);
                                }}
                            />
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
                    {saved ? '✓ Kaydedildi!' : uploading ? 'Yükleniyor...' : saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
}
