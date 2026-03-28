'use client';

import { X } from 'lucide-react';

interface LegalTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LegalTermsModal({ isOpen, onClose }: LegalTermsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Kullanıcı ve İçerik Sözleşmesi</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4 text-gray-700 text-sm leading-relaxed">
                    <p>
                        Sitemize kayıt olarak ve/veya sistemimize Telegram kanalı, grubu ekleyerek aşağıdaki 
                        yasal şartları ve kullanım kurallarını <strong>tamamen kabul etmiş sayılırsınız.</strong>
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                        <h3 className="font-semibold text-gray-900">1. Yer Sağlayıcı Sorumluluğu (5651 Sayılı Kanun)</h3>
                        <p>
                            Platformumuz, 5651 sayılı "İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun" kapsamında <strong>"Yer Sağlayıcı"</strong> olarak faaliyet göstermektedir. Yer sağlayıcı olarak sitemiz, kullanıcılar tarafından oluşturulan veya paylaşılan içerikleri kontrol etmek veya hukuka aykırı bir faaliyetin söz konusu olup olmadığını araştırmakla yükümlü değildir. Paylaşılan kanallardan doğacak tüm hukuki ve cezai sorumluluk <strong>kanalı ekleyen kullanıcıya aittir.</strong>
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                        <h3 className="font-semibold text-gray-900">2. Müstehcenlik yasağı (TCK Madde 226)</h3>
                        <p>
                            Türk Ceza Kanunu'nun 226. maddesi gereğince; platformumuza genel ahlaka aykırı, çocukların cinsel istismarını içeren, şiddet barındıran veya her türlü müstehcen içerik üreten, paylaşan veya bu içeriklere yönlendiren Telegram kanal/gruplarının eklenmesi <strong>kesinlikle yasaktır.</strong> Bu kuralların ihlali durumunda ilgili kanal derhal sistemden silinecek ve gerekli görüldüğünde hukuki mercilere bilgi (IP, Zaman bilgisi) verilecektir.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                        <h3 className="font-semibold text-gray-900">3. Kumar, Bahis Oynatma ve Teşvik (TCK Madde 228 & 7258 Sayılı Kanun)</h3>
                        <p>
                            Türk Ceza Kanunu Madde 228 uyarınca kumar oynanması için yer ve imkan sağlama suçu ile 7258 sayılı "Futbol ve Diğer Spor Müsabakalarında Bahis ve Şans Oyunları Düzenlenmesi Hakkında Kanun" kapsamında <strong>yasadışı bahis</strong>, şans oyunları ve yasa dışı çekilişlerin oynatılmasına, teşvik edilmesine olanak sağlayan içeriklerin veya bu amaca hizmet eden Telegram kanallarının sitemize eklenmesi <strong>kesinlikle yasaktır.</strong>
                        </p>
                    </div>

                    <p className="font-medium text-gray-900 pt-2">
                        Tarafımca oluşturulan üyelik hesabı ve eklediğim içeriklerin/kanalların yukarıdaki yasal hükümlere uygun olduğunu, ihlal durumunda adli makamlara şahsım (IP adresim ve bağlantı zamanı ile birlikte) hakkında bilgi paylaşımının yapılmasını onayladığımı beyan ve taahhüt ederim.
                    </p>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                    >
                        Okudum, Anladım
                    </button>
                </div>
            </div>
        </div>
    );
}
