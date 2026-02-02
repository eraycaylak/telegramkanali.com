'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    CreditCard,
    ArrowUpRight,
    History,
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink
} from 'lucide-react';

export default function BillingPage() {
    const [balance, setBalance] = useState(0);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Profile
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        setBalance(profile?.balance || 0);

        // Deposits
        const { data: depositData } = await supabase
            .from('deposits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        setDeposits(depositData || []);
        setLoading(false);
    }

    async function handleDeposit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const amount = formData.get('amount');
        const txHash = formData.get('tx_hash');

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from('deposits').insert({
            user_id: user?.id,
            amount: parseFloat(amount as string),
            tx_hash: txHash,
            status: 'pending'
        });

        if (!error) {
            setSuccess(true);
            e.currentTarget.reset();
            fetchData();
        } else {
            alert('Hata: ' + error.message);
        }
        setSubmitting(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={14} />;
            case 'rejected': return <AlertCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Balance & Deposit Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Current Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-blue-100 font-bold uppercase tracking-widest text-xs">Mevcut Bakiyeniz</span>
                            <CreditCard size={24} className="opacity-50" />
                        </div>
                        <div className="text-5xl font-extrabold mb-2">${balance.toLocaleString()}</div>
                        <p className="text-blue-100 text-sm opacity-80">Bakiye ile kanalınızı öne çıkarabilir ve reklam verebilirsiniz.</p>
                    </div>

                    {/* Deposit Form */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ArrowUpRight className="text-blue-600" /> Bakiye Yükle
                        </h3>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 flex gap-4">
                            <AlertCircle className="text-blue-600 mt-1 shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-bold mb-1">Ödeme Talimatı:</p>
                                <p>Lütfen USDT (TRC20) adresimize ödemeyi gönderin ve ardından aşağıdaki formu doldurun. Admin onayından sonra bakiyeniz hesabınıza yansıyacaktır.</p>
                                <code className="block bg-white p-2 mt-2 rounded border border-blue-200 font-mono text-[11px] select-all">TRC20: TYV592vJp5sS7K8m... (Örnek Adres)</code>
                            </div>
                        </div>

                        <form onSubmit={handleDeposit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Yüklemek İstediğiniz Tutar ($)</label>
                                    <input
                                        name="amount"
                                        type="number"
                                        required
                                        min="10"
                                        className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                                        placeholder="Örn: 50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">TX ID / Hash (Zorunlu)</label>
                                    <input
                                        name="tx_hash"
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Transaction Hash giriniz"
                                    />
                                </div>
                            </div>

                            {success && (
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-green-100">
                                    <CheckCircle2 /> Talebiniz başarıyla alındı! Admin onayından sonra bakiyeniz güncellenecektir.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {submitting ? 'Gönderiliyor...' : 'Yükleme Talebi Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: History */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <History className="text-gray-400" /> İşlem Geçmişi
                        </h3>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>)}
                                </div>
                            ) : deposits.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">Henüz bir işlem yok.</div>
                            ) : (
                                deposits.map((dep) => (
                                    <div key={dep.id} className="p-4 border border-gray-50 rounded-2xl bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-lg font-extrabold text-gray-900">${dep.amount}</span>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(dep.status)}`}>
                                                {getStatusIcon(dep.status)}
                                                {dep.status === 'pending' ? 'Bekliyor' : dep.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                                            <span>{new Date(dep.created_at).toLocaleDateString()}</span>
                                            {dep.tx_hash && (
                                                <a href={`https://tronscan.org/#/transaction/${dep.tx_hash}`} target="_blank" className="flex items-center gap-1 hover:text-blue-600 transition">
                                                    TX ID <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
