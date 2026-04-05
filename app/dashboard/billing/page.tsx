'use client';

import { useState, useEffect } from 'react';
import {
    getTokenPackages,
    getTokenBalance,
    getUserTransactions,
    getAdPricing
} from '@/app/actions/tokens';
import {
    Coins, ArrowDownCircle, ArrowUpCircle, Clock, X,
    Zap, CheckCircle2, Copy, Check, ExternalLink,
    MessageCircle, Star, Wallet, ChevronRight, Info,
    CreditCard, BarChart2, Shield
} from 'lucide-react';

const USDT_WALLET = 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // TRC20 adresi — BURAYA GERÇEĞİNİ YAZ
const USDT_WALLET_BEP = '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // BEP20 — BURAYA GERÇEĞİNİ YAZ
const TELEGRAM_PAYMENT_BOT = 'https://t.me/sibelliee'; // Ödeme bildirimi
const TELEGRAM_STARS_CHANNEL = 'https://t.me/sibelliee'; // Yıldız ödeme kanalı

type PayMethod = 'stars' | 'usdt';
type Step = 'select' | 'payment' | 'confirm';
type UsdtNetwork = 'trc20' | 'bep20';

export default function BillingPage() {
    const [balance, setBalance] = useState(0);
    const [packages, setPackages] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [adPricing, setAdPricing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [payMethod, setPayMethod] = useState<PayMethod>('stars');
    const [step, setStep] = useState<Step>('select');
    const [selectedPkg, setSelectedPkg] = useState<any>(null);
    const [usdtNetwork, setUsdtNetwork] = useState<UsdtNetwork>('trc20');
    const [copied, setCopied] = useState(false);

    // Pricing tab
    const [pricingTab, setPricingTab] = useState<'featured' | 'banner' | 'story'>('featured');
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (showPricing) loadAdPricing();
    }, [pricingTab, showPricing]);

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
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function loadAdPricing() {
        const data = await getAdPricing(pricingTab);
        setAdPricing(data);
    }

    function openModal(method: PayMethod) {
        setPayMethod(method);
        setStep('select');
        setSelectedPkg(null);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setSelectedPkg(null);
        setStep('select');
    }

    async function copyAddress(addr: string) {
        await navigator.clipboard.writeText(addr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const walletAddr = usdtNetwork === 'trc20' ? USDT_WALLET : USDT_WALLET_BEP;

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-40 bg-slate-800 rounded-3xl" />
                <div className="h-64 bg-slate-800 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 text-white">

            {/* Balance Hero */}
            <div className="relative bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl shadow-violet-950/60">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-2">Mevcut Bakiye</p>
                    <div className="flex items-end gap-3 mb-6">
                        <span className="text-5xl font-black text-white">💰 {balance.toLocaleString()}</span>
                        <span className="text-violet-300 text-xl mb-1">Jeton</span>
                    </div>
                    <p className="text-violet-200/70 text-sm mb-6">
                        Her jeton <strong className="text-violet-200">1 gösterim hakkı</strong> değil, 
                        paket bazında görüntüleme satın alırsınız. Daha fazla jeton = daha fazla gösterim.
                    </p>

                    {/* Ödeme Yöntemleri */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => openModal('stars')}
                            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black py-3 px-5 rounded-xl transition-all shadow-lg shadow-amber-900/30 text-sm"
                        >
                            <Star size={18} fill="currentColor" />
                            ⭐ Telegram Yıldız ile Öde
                        </button>
                        <button
                            onClick={() => openModal('usdt')}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 px-5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
                        >
                            <Wallet size={18} />
                            💎 USDT Kripto ile Öde
                        </button>
                        <button
                            onClick={() => setShowPricing(true)}
                            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-5 rounded-xl transition-all text-sm border border-white/10"
                        >
                            <BarChart2 size={18} />
                            Fiyat Listesi
                        </button>
                    </div>
                </div>
            </div>

            {/* Paket Bilgi Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {packages.map((pkg: any) => (
                    <div
                        key={pkg.id}
                        className={`bg-slate-900 border rounded-2xl p-4 text-center transition-all cursor-pointer
                            ${pkg.is_popular
                                ? 'border-violet-500/60 ring-1 ring-violet-500/30 bg-gradient-to-b from-violet-900/30 to-slate-900'
                                : 'border-slate-800/60 hover:border-slate-700'
                            }`}
                        onClick={() => openModal('stars')}
                    >
                        {pkg.is_popular && (
                            <div className="text-[9px] font-black text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full inline-block mb-2 uppercase tracking-wider">
                                En Popüler
                            </div>
                        )}
                        <div className="text-lg font-black text-white">{pkg.label || `${(pkg.tokens || 0).toLocaleString()} Jeton`}</div>
                        <div className="text-xs text-slate-400 my-1">{pkg.tokens?.toLocaleString()} Jeton</div>
                        <div className="text-xs text-emerald-400 font-bold">${pkg.usdt_price || (pkg.price_tl / 33).toFixed(0)} USDT</div>
                        <div className="text-[10px] text-amber-400 font-bold">{pkg.stars_price || '—'}⭐ Yıldız</div>
                    </div>
                ))}
            </div>

            {/* Nasıl Çalışır */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Info size={16} className="text-violet-400" />
                    Nasıl Çalışır?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            n: '1', icon: CreditCard, color: 'text-violet-400 bg-violet-500/10',
                            title: 'Paket Seçin & Ödeyin',
                            desc: 'Telegram Yıldız veya USDT ile dilediğiniz paketi satın alın. Ödemenizi bildirin.'
                        },
                        {
                            n: '2', icon: Coins, color: 'text-amber-400 bg-amber-500/10',
                            title: 'Jeton Yüklenir',
                            desc: 'Ödemeniz onaylandıktan sonra jetonlarınız 1 iş günü içinde hesabınıza aktarılır.'
                        },
                        {
                            n: '3', icon: Zap, color: 'text-emerald-400 bg-emerald-500/10',
                            title: 'Reklamınız Yayına Girer',
                            desc: 'Kanalınız binlerce ziyaretçinin önünde 1. sıraya yerleşir. Gösterimler sayılır.'
                        },
                    ].map(s => (
                        <div key={s.n} className="flex items-start gap-4 bg-slate-800/40 rounded-2xl p-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                                <s.icon size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{s.title}</div>
                                <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* İşlem Geçmişi */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Cüzdan Hareketleri
                </h3>
                {transactions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <Coins size={28} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">Henüz işlem geçmişi yok</p>
                        <p className="text-xs mt-1 opacity-70">İlk jeton yüklemenizden sonra burada görünecek.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                        {tx.amount > 0
                                            ? <ArrowDownCircle size={16} className="text-emerald-400" />
                                            : <ArrowUpCircle size={16} className="text-red-400" />
                                        }
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-sm">{tx.description}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(tx.created_at).toLocaleDateString('tr-TR', {
                                                day: 'numeric', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`font-black text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} 💰
                                    </span>
                                    <p className="text-xs text-slate-500">Kalan: {tx.balance_after?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== ÖDEME MODALI ===== */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={closeModal}>
                    <div
                        className="bg-slate-900 border border-slate-700/60 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800/60 sticky top-0 bg-slate-900 z-10 rounded-t-3xl">
                            <div>
                                <h3 className="font-black text-white text-lg">
                                    {payMethod === 'stars' ? '⭐ Telegram Yıldız ile Öde' : '💎 USDT Kripto ile Öde'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {step === 'select' && 'Paket seçin'}
                                    {step === 'payment' && 'Ödeme adımları'}
                                    {step === 'confirm' && 'Talep alındı!'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Method Tabs */}
                            {step === 'select' && (
                                <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
                                    {(['stars', 'usdt'] as PayMethod[]).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setPayMethod(m)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${payMethod === m ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            {m === 'stars' ? <><Star size={14} fill="currentColor" /> Yıldız</> : <><Wallet size={14} /> USDT</>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ADIM 1: Paket Seç */}
                            {step === 'select' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-400">
                                        {payMethod === 'stars'
                                            ? 'İstediğiniz paketi seçin. Telegram kanalımıza yönlendirileceksiniz.'
                                            : 'İstediğiniz paketi seçin. USDT cüzdan adresimize transfer yapacaksınız.'}
                                    </p>
                                    <div className="space-y-2">
                                        {packages.map((pkg: any) => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => { setSelectedPkg(pkg); setStep('payment'); }}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left
                                                    ${selectedPkg?.id === pkg.id
                                                        ? 'border-violet-500 bg-violet-500/10'
                                                        : 'border-slate-700/60 hover:border-slate-600 bg-slate-800/40'
                                                    } ${pkg.is_popular ? 'ring-1 ring-violet-500/30' : ''}`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-white">{pkg.label || `${pkg.tokens?.toLocaleString()} Jeton`}</span>
                                                        {pkg.is_popular && (
                                                            <span className="text-[9px] font-black text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full uppercase">Popüler</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{pkg.description || `${pkg.tokens?.toLocaleString()} Jeton`}</div>
                                                </div>
                                                <div className="text-right shrink-0 ml-3">
                                                    {payMethod === 'stars' ? (
                                                        <>
                                                            <div className="font-black text-amber-400 text-base">{pkg.stars_price || '?'}⭐</div>
                                                            <div className="text-xs text-slate-500">Yıldız</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="font-black text-emerald-400 text-base">${pkg.usdt_price || (pkg.price_tl / 33).toFixed(0)}</div>
                                                            <div className="text-xs text-slate-500">USDT</div>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ADIM 2a: Telegram Yıldız Ödeme */}
                            {step === 'payment' && payMethod === 'stars' && selectedPkg && (
                                <div className="space-y-5">
                                    {/* Seçilen paket özeti */}
                                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
                                        <div className="text-xs text-violet-300 font-bold mb-1">Seçilen Paket</div>
                                        <div className="font-black text-white text-xl">{selectedPkg.label}</div>
                                        <div className="text-amber-400 font-black text-2xl mt-1">{selectedPkg.stars_price}⭐ Yıldız</div>
                                    </div>

                                    {/* Adımlar */}
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-white text-sm">📋 Ödeme Adımları:</h4>
                                        {[
                                            { n: 1, text: 'Aşağıdaki butona tıklayarak Telegram kanalımıza gidin.' },
                                            { n: 2, text: `Kanala girdikten sonra "/" yazıp satın alma komutunu kullanın veya doğrudan mesaj atın: "${selectedPkg.stars_price} yıldız - ${selectedPkg.label} paketi almak istiyorum"` },
                                            { n: 3, text: 'Telegram\'dan gelen ödeme isteğini onaylayın.' },
                                            { n: 4, text: 'Ödeme ekran görüntüsünü bize iletin. Jetonlarınız en kısa sürede hesabınıza aktarılır.' },
                                        ].map(s => (
                                            <div key={s.n} className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-3">
                                                <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                                    {s.n}
                                                </div>
                                                <p className="text-sm text-slate-300">{s.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        <a
                                            href={TELEGRAM_STARS_CHANNEL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black py-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-900/30"
                                        >
                                            <Star size={18} fill="currentColor" />
                                            Telegram Kanalına Git & Öde
                                            <ExternalLink size={14} />
                                        </a>
                                        <button
                                            onClick={() => setStep('confirm')}
                                            className="flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl text-sm hover:bg-emerald-500/30 transition-all"
                                        >
                                            <CheckCircle2 size={16} />
                                            Ödemeyi Yaptım, Bildir
                                        </button>
                                        <button onClick={() => setStep('select')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                                            ← Geri
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ADIM 2b: USDT Ödeme */}
                            {step === 'payment' && payMethod === 'usdt' && selectedPkg && (
                                <div className="space-y-5">
                                    {/* Seçilen paket özeti */}
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                        <div className="text-xs text-emerald-300 font-bold mb-1">Seçilen Paket</div>
                                        <div className="font-black text-white text-xl">{selectedPkg.label}</div>
                                        <div className="text-emerald-400 font-black text-2xl mt-1">${selectedPkg.usdt_price || (selectedPkg.price_tl / 33).toFixed(0)} USDT</div>
                                    </div>

                                    {/* Ağ Seçimi */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Ağ Seçin</p>
                                        <div className="flex gap-2">
                                            {(['trc20', 'bep20'] as UsdtNetwork[]).map(net => (
                                                <button
                                                    key={net}
                                                    onClick={() => setUsdtNetwork(net)}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${usdtNetwork === net ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                                >
                                                    {net === 'trc20' ? 'TRC-20 (Tron)' : 'BEP-20 (BSC)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Adres */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Cüzdan Adresi</p>
                                        <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3">
                                            <code className="flex-1 text-xs text-emerald-400 font-mono break-all">{walletAddr}</code>
                                            <button
                                                onClick={() => copyAddress(walletAddr)}
                                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all shrink-0"
                                            >
                                                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-400" />}
                                            </button>
                                        </div>
                                        <div className="flex items-start gap-2 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                            <Shield size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-300/80">
                                                Lütfen yalnızca <strong className="text-amber-300">{usdtNetwork === 'trc20' ? 'TRC-20 (Tron)' : 'BEP-20 (BSC)'}</strong> ağını kullanın.
                                                Yanlış ağdan gönderilen transferler geri alınamaz.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Adımlar */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-white text-sm">📋 Ödeme Adımları:</h4>
                                        {[
                                            { n: 1, text: `Cüzdan adresini kopyalayın ve kripto borsaklı cüzdanınızdan ${selectedPkg.usdt_price} USDT gönderin.` },
                                            { n: 2, text: 'Transfer tamamlandıktan sonra TX Hash (işlem kimliği) numaranızı kopyalayın.' },
                                            { n: 3, text: '"Ödemeyi Yaptım" butonuna tıklayarak bize bildirin. İşleminiz 1 iş günü içinde onaylanır.' },
                                        ].map(s => (
                                            <div key={s.n} className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-3">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">{s.n}</div>
                                                <p className="text-sm text-slate-300">{s.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        <a
                                            href={`${TELEGRAM_PAYMENT_BOT}?text=${encodeURIComponent(`USDT Ödeme Bildirimi\nPaket: ${selectedPkg.label}\nTutar: $${selectedPkg.usdt_price} USDT\nAğ: ${usdtNetwork.toUpperCase()}\nTX Hash: `)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setStep('confirm')}
                                            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/30"
                                        >
                                            <MessageCircle size={18} />
                                            Telegram'dan Ödeme Bildir
                                            <ExternalLink size={14} />
                                        </a>
                                        <button onClick={() => setStep('select')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                                            ← Geri
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ADIM 3: Onay */}
                            {step === 'confirm' && (
                                <div className="text-center py-6">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <CheckCircle2 size={40} className="text-emerald-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-2">Talebiniz Alındı! ✅</h4>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                                        Ödemeniz onaylandıktan sonra jetonlarınız maksimum <strong className="text-white">1 iş günü</strong> içinde hesabınıza eklenecektir.
                                        Hızlı işlem için Telegram'dan bize bildirmeyi unutmayın.
                                    </p>
                                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                        <a
                                            href={TELEGRAM_PAYMENT_BOT}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold py-3 rounded-xl text-sm hover:bg-sky-500/30 transition-all"
                                        >
                                            <MessageCircle size={16} />
                                            Telegram'dan Bildir (@sibelliee)
                                        </a>
                                        <button onClick={closeModal} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                                            Kapat
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== FİYAT LİSTESİ MODALI ===== */}
            {showPricing && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPricing(false)}>
                    <div className="bg-slate-900 border border-slate-700/60 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-800/60 sticky top-0 bg-slate-900 z-10 rounded-t-3xl">
                            <h3 className="font-black text-white">Reklam Fiyat Listesi</h3>
                            <button onClick={() => setShowPricing(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-5 text-xs text-violet-300 text-center">
                                Reklamlarınız satın aldığınız gösterim sayısına ulaşana dek süresiz yayında kalır.
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-5">
                                {[
                                    { key: 'featured', label: '⚡ Öne Çıkarma' },
                                    { key: 'banner', label: '🖼 Banner' },
                                    { key: 'story', label: '🎬 Hikaye' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setPricingTab(tab.key as any)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pricingTab === tab.key ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {adPricing.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                                        <div>
                                            <div className="font-bold text-white text-sm">{p.label}</div>
                                            {p.note && <div className="text-xs text-slate-500 mt-0.5">{p.note}</div>}
                                        </div>
                                        <div className="text-right ml-4 shrink-0">
                                            <div className="font-black text-violet-400">💰 {p.tokens_required.toLocaleString()}</div>
                                            <div className="text-xs text-slate-500">jeton</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { setShowPricing(false); openModal('stars'); }}
                                className="w-full mt-5 bg-violet-600 hover:bg-violet-500 text-white font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Coins size={16} />
                                Jeton Yükle & Başla
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
