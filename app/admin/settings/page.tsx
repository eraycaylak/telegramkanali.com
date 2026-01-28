export default function SettingsPage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Ayarlar</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Başlığı</label>
                    <input type="text" className="w-full border rounded-lg p-2.5" defaultValue="Telegram Kanalları" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                    <input type="text" className="w-full border rounded-lg p-2.5" placeholder="G-XXXXXXXX" />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Kaydet</button>
            </div>
        </div>
    );
}
