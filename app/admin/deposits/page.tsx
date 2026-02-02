'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Search,
    Filter,
    DollarSign
} from 'lucide-react';

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchDeposits();
    }, [filter]);

    async function fetchDeposits() {
        let query = supabase
            .from('deposits')
            .select(`
        *,
        profiles:user_id (email, full_name, balance)
      `)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data } = await query;
        setDeposits(data || []);
        setLoading(false);
    }

    async function handleApprove(deposit: any) {
        if (!confirm(`${deposit.profiles.full_name} isimli kullanıcının $${deposit.amount} tutarındaki ödemesini onaylıyor musunuz?`)) return;

        // 1. Update deposit status
        const { error: depError } = await supabase
            .from('deposits')
            .update({ status: 'approved' })
            .eq('id', deposit.id);

        if (depError) return alert(depError.message);

        // 2. Update user balance
        const newBalance = (deposit.profiles.balance || 0) + deposit.amount;
        const { error: profError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', deposit.user_id);

        if (profError) return alert(profError.message);

        alert('Başarıyla onaylandı ve bakiye eklendi!');
        fetchDeposits();
    }

    async function handleReject(deposit: any) {
        if (!confirm('Bu ödemeyi reddetmek istediğinize emin misiniz?')) return;

        const { error } = await supabase
            .from('deposits')
            .update({ status: 'rejected' })
            .eq('id', deposit.id);

        if (error) alert(error.message);
        else fetchDeposits();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="text-green-600" /> Ödeme Talepleri
                </h2>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['pending', 'approved', 'rejected', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f === 'pending' ? 'Bekleyenler' : f === 'approved' ? 'Onaylananlar' : f === 'rejected' ? 'Reddedilenler' : 'Tümü'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                            <th className="p-4">Kullanıcı</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">TX ID</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
                        ) : deposits.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Talep bulunamadı.</td></tr>
                        ) : (
                            deposits.map(dep => (
                                <tr key={dep.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{dep.profiles?.full_name || 'İsimsiz'}</div>
                                        <div className="text-xs text-gray-400">{dep.profiles?.email}</div>
                                    </td>
                                    <td className="p-4 font-extrabold text-blue-600">${dep.amount}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 max-w-[120px]">
                                            <span className="truncate font-mono text-xs text-gray-400">{dep.tx_hash}</span>
                                            <a href={`https://tronscan.org/#/transaction/${dep.tx_hash}`} target="_blank" className="text-blue-500">
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">
                                        {new Date(dep.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-xs">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase ${dep.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                dep.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                            }`}>
                                            {dep.status === 'approved' ? <CheckCircle2 size={12} /> : dep.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                                            {dep.status}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {dep.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(dep)}
                                                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition"
                                                >
                                                    Onayla
                                                </button>
                                                <button
                                                    onClick={() => handleReject(dep)}
                                                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                                                >
                                                    Reddet
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
