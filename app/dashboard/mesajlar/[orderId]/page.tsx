import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/supabaseAdmin';
import ChatClient from './ChatClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sohbet | TelegramKanali.com' };

export default async function ChatPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/login?redirect=/dashboard/mesajlar/${orderId}`);

    const db = getAdminClient();

    // Siparişi getir
    const { data: order } = await db
        .from('marketplace_orders')
        .select(`
            *,
            channel_listings ( id, title, channel_name, channel_image, asking_price, currency ),
            buyer:profiles!marketplace_orders_buyer_id_fkey ( id, full_name, email, telegram_username ),
            seller:profiles!marketplace_orders_seller_id_fkey ( id, full_name, email, telegram_username )
        `)
        .eq('id', orderId)
        .single();

    if (!order) notFound();

    // Sadece buyer, seller veya admin erişebilir
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';
    const isParty = order.buyer_id === user.id || order.seller_id === user.id;
    if (!isAdmin && !isParty) redirect('/dashboard/mesajlar');

    // Mesajları getir
    const { data: messages } = await db
        .from('marketplace_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    // Okunmamış mesajları oku
    await db
        .from('marketplace_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;
    const otherParty = isBuyer ? order.seller : order.buyer;

    // Kullanıcının Telegram bağlı olup olmadığını kontrol et
    const { data: myProfile } = await db.from('profiles').select('telegram_id').eq('id', user.id).single();
    const hasTelegramLinked = Boolean(myProfile?.telegram_id);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || '';

    return (
        <ChatClient
            order={order}
            initialMessages={messages || []}
            userId={user.id}
            isBuyer={isBuyer}
            isSeller={isSeller}
            isAdmin={isAdmin}
            otherParty={otherParty}
            hasTelegramLinked={hasTelegramLinked}
            botUsername={botUsername}
        />
    );
}
