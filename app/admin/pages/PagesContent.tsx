'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PagesContent() {
    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const storedUserId = localStorage.getItem('userId');
        const isAdmin = localStorage.getItem('isAdmin');

        if (isAdmin === 'true' && !storedUserId) return;

        if (storedUserId) {
            const { data: user } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', storedUserId)
                .single();

            if (user) {
                if (user.role === 'admin') return;
                if (user.role === 'editor' && user.permissions?.manage_blog) return;
            }
        }

        alert('Bu sayfaya erişim yetkiniz yok.');
        window.location.href = '/admin/dashboard';
    };

    return (
        <div className="flex flex-col items-center justify-center h-96 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Sayfa Yönetimi (CMS)</h2>
            <p className="text-gray-500">Hakkımızda, İletişim gibi sayfaları buradan yönetebileceksiniz.</p>
        </div>
    );
}
