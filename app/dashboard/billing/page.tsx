'use client';

import { useState, useEffect } from 'react';
import {
    getTokenPackages,
    getTokenBalance,
    getUserTransactions,
    purchaseTokens,
    getAdPricing
} from '@/app/actions/tokens';
import {
    CreditCard,
    Coins,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    CheckCircle2,
    X,
    Zap,
    Image as ImageIcon,
    Film
} from 'lucide-react';

export default function BillingPage() {
    const [balance, setBalance] = useState(0);
    const [packages, setPackages] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [adPricing, setAdPricing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [pricingTab, setPricingTab] = useState<'featured' | 'banner' | 'story'>('featured');
    const [purchasing, setPurchasing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadAdPricing();
    }, [pricingTab]);

    async function loadData() {
        try {
            const [bal, pkgs, txns] = await Promise.all([
                getTokenBalance(),
                getTokenPackages(),
                getUserTransactions(),
            ]);
            setBalance(bal);
            setPackages(pkgs);
            setTransactions(txns);
        } catch (error) {
            console.error('Error loading billing data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadAdPricing() {
        const data = await getAdPricing(pricingTab);
        setAdPricing(data);
    }

    async function handlePurchase(packageId: string) {
        setPurchasing(true);
        setMessage('');

        const result = await purchaseTokens(packageId);

        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage('Jeton başarıyla yüklendi! 🎉');
            setShowTokenModal(false);
            loadData();
        }

        setPurchasing(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-2xl"></div>
                <div className="h-64 bg-gray-100 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                    <p className="text-purple-200 text-sm font-bold uppercase tracking-wider mb-1">Mevcut Bakiye</p>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl font-extrabold">🪙 {balance.toLocaleString()}</span>
                        <span className="text-xl text-purple-200">Jeton</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowTokenModal(true)}
                            className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-bold hover:bg-purple-50 transition text-sm flex items-center gap-2"
                        >
                            <Coins size={18} /> Jeton Yükle
                        </button>
                        <button
                            onClick={() => setShowPricingModal(true)}
                            className="bg-white/20 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/30 transition text-sm flex items-center gap-2 backdrop-blur-sm"
                        >
                            <CreditCard size={18} /> Fiyat Listesi
                        </button>
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('başarıyla') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message}
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Cüzdan Hareketleri</h3>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Clock size={32} className="mx-auto mb-3" />
                        <p className="font-medium">Henüz işlem geçmişi yok</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    {tx.amount > 0 ? (
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <ArrowDownCircle size={18} className="text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <ArrowUpCircle size={18} className="text-red-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(tx.created_at).toLocaleDateString('tr-TR', {
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} 🪙
                                    </span>
                                    <p className="text-xs text-gray-400">Bakiye: {tx.balance_after.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Token Purchase Modal */}
            {showTokenModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTokenModal(false)}>
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Jeton Yükle</h3>
                            <button onClick={() => setShowTokenModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Yükleyeceğiniz jetonlarla kendi topluluğunuzu diğer topluluklardan daha çok insana ulaştırabilirsiniz ve herhangi bir şeyin reklamını verebilirsiniz.
                        </p>
                        <p className="text-center text-sm font-bold text-purple-600 mb-4">Plan Seçin</p>
                        <div className="grid grid-cols-2 gap-4">
                            {packages.map((pkg: any) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => handlePurchase(pkg.id)}
                                    disabled={purchasing}
                                    className="border-2 border-gray-200 rounded-2xl p-4 text-center hover:border-purple-500 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-3xl">🪙</span>
                                    </div>
                                    <p className="font-bold text-gray-900 text-lg">{pkg.tokens.toLocaleString()} Jeton</p>
                                    <p className="text-sm text-gray-500 mb-3">{pkg.price_tl.toLocaleString()} TL</p>
                                    <span className="bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg inline-block">
                                        {purchasing ? 'Yükleniyor...' : 'Yükle'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Modal */}
            {showPricingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPricingModal(false)}>
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Reklam için Fiyat Listesi</h3>
                            <button onClick={() => setShowPricingModal(false)} className="text-sm font-bold text-purple-600 hover:text-purple-700">
                                Kapat
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-4">
                            {[
                                { key: 'featured' as const, label: 'Öne Çıkarma', icon: Zap },
                                { key: 'banner' as const, label: 'Banner', icon: ImageIcon },
                                { key: 'story' as const, label: 'Hikaye', icon: Film },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setPricingTab(tab.key)}
                                    className={`flex-1 py-3 text-sm font-bold transition border-b-2 ${pricingTab === tab.key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Info */}
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-4 text-xs text-purple-700 text-center">
                            Reklamlarınız için süre kısıtlaması yoktur. Reklamınız, satın aldığınız gösterim sayısına ulaşana dek yayında kalacaktır.
                        </div>

                        {/* Pricing Table */}
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 text-xs font-bold uppercase">
                                    <td className="py-2">{pricingTab === 'story' ? 'Gösterim Süresi' : 'Gösterim Sayısı'}</td>
                                    <td className="py-2 text-center">Jeton</td>
                                    <td className="py-2 text-right">Tutar</td>
                                </tr>
                            </thead>
                            <tbody>
                                {adPricing.map((p: any) => (
                                    <tr key={p.id} className="border-t border-gray-50">
                                        <td className="py-3 text-gray-700">
                                            {p.label}
                                            {p.note && <span className="text-xs text-gray-400 block">({p.note})</span>}
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="inline-flex items-center gap-1 font-bold text-gray-700">🪙 {p.tokens_required.toLocaleString()}</span>
                                        </td>
                                        <td className="py-3 text-right text-purple-600 font-bold">
                                            {p.price_tl > 0 ? `${p.price_tl.toLocaleString()} TL` : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => { setShowPricingModal(false); setShowTokenModal(true); }}
                                className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition text-sm inline-flex items-center gap-2"
                            >
                                🪙 Jeton Yükle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
