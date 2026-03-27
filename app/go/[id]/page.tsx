import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CountdownRedirect from '@/components/CountdownRedirect';
import { Metadata } from 'next';

interface PageProps {
    params: { id: string };
}

async function getChannelForRedirect(id: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data, error } = await supabase
        .from('channels')
        .select('id, name, slug, image, join_link, member_count, category_id, categories(name, slug)')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const channel = await getChannelForRedirect(id);
    if (!channel) return { title: 'Yönlendiriliyor...' };

    return {
        title: `${channel.name} — Telegram Kanalına Katıl | telegramkanali.com`,
        description: `${channel.name} Telegram kanalına katılmak için yönlendiriliyorsunuz.`,
        robots: { index: false, follow: false },
    };
}

export default async function GoPage({ params }: PageProps) {
    const { id } = await params;
    const channel = await getChannelForRedirect(id);

    if (!channel || !channel.join_link) {
        notFound();
    }

    // NOT: Tıklama artık server-side sayılmıyor.
    // Kullanıcı "HEMEN KATIL" butonuna basınca veya geri sayım bitince
    // CountdownRedirect client component'i trackChannelClick() çağırır.
    // Bu sayede sayfayı ziyaret edip kapatanlar tıklama olarak sayılmaz.

    const categoryData = (channel as any).categories;

    return (
        <CountdownRedirect
            channelId={channel.id}
            channelName={channel.name}
            channelImage={channel.image}
            joinLink={channel.join_link}
            categoryName={categoryData?.name || 'Genel'}
            categorySlug={categoryData?.slug || ''}
            channelSlug={channel.slug}
            memberCount={channel.member_count}
        />
    );
}
