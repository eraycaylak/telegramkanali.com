import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CountdownRedirect from '@/components/CountdownRedirect';
import { Metadata } from 'next';
import { checkAgeVerification } from '@/app/actions/age-verification';

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

// +18 kategori ID'si — tcK 226/7 kapsamında yaş doğrulama zorunluluğu
const ADULT_CATEGORY_ID = '18';

export default async function GoPage({ params }: PageProps) {
    const { id } = await params;
    const channel = await getChannelForRedirect(id);

    if (!channel || !channel.join_link) {
        notFound();
    }

    // +18 kanalı mı?
    const requiresAgeVerification = channel.category_id === ADULT_CATEGORY_ID;

    // Kullanıcının önceden onay verip vermediğini kontrol et (IP bazlı)
    const isAgeVerified = requiresAgeVerification
        ? await checkAgeVerification()
        : true;

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
            requiresAgeVerification={requiresAgeVerification}
            isAgeVerified={isAgeVerified}
        />
    );
}
