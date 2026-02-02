'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    User,
    Mail,
    CreditCard,
    Shield,
    Edit,
    Search,
    CheckCircle2,
    X,
    Save
} from 'lucide-react';

export default function UsersContent() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        role: 'user',
        balance: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setEditForm({
            role: user.role || 'user',
            balance: user.balance || 0
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: editForm.role, balance: editForm.balance })
                .eq('id', editingUser.id);

            if (error) throw error;

            alert('Kullanıcı başarıyla güncellendi.');
            setModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('Güncelleme başarısız!');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="text-blue-600" /> Kullanıcı Yönetimi
                </h2>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="İsim veya e-posta ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                            <th className="p-4">Kullanıcı Bilgileri</th>
                            <th className="p-4">Bakiye</th>
                            <th className="p-4">Yetki</th>
                            <th className="p-4">Kayıt Tarihi</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Kullanıcı bulunamadı.</td></tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                {u.full_name?.charAt(0) || u.email.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{u.full_name || 'İsimsiz'}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Mail size={12} /> {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-gray-900 font-extrabold bg-green-50 px-3 py-1 rounded-lg w-fit">
                                            <CreditCard size={14} className="text-green-600" />
                                            ${u.balance?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                            }`}>
                                            <Shield size={10} />
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-400">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openEditModal(u)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Düzenle">
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {modalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Kullanıcı Düzenle</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                <input type="text" value={editingUser.email} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yetki (Role)</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bakiye ($)</label>
                                <input
                                    type="number"
                                    value={editForm.balance}
                                    onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition text-sm font-medium">İptal</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition text-sm font-medium flex items-center gap-2">
                                <Save size={16} /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
