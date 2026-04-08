import { getAdminClient } from '@/lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    Shield, ArrowLeft, Users, Calendar, DollarSign, TrendingUp,
    CheckCircle2, Lock, MessageCircle, BarChart3, BadgeCheck,
    AlertTriangle, Star, Clock, ChevronRight, Zap
} from 'lucide-react';
import type { Metadata } from 'next';
import ListingContactForm from './ListingContactForm';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

async function getListing(id: string) {
    const db = getAdminClient();
    const { data } = await db
        .from('channel_listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();
    return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);
    if (!listing) return { title: 'İlan Bulunamadı' };

    const title = listing.channel_name || listing.title;
    const price = listing.currency === 'STARS'
        ? `${listing.asking_price} ⭐ Yıldız`
        : `$${listing.asking_price} USDT`;

    return {
        title: `${title} — Satılık Telegram Kanalı ${price} | TelegramKanali.com`,
        description: `${listing.member_count?.toLocaleString('tr-TR') || '?'} üyeli ${title} kanalı satışta. ${price} fiyatıyla escrow güvenceli satın al. Telegram kanal alım satım platformu.`,
        openGraph: {
            title: `Satılık: ${title} — ${price}`,
            description: `${listing.member_count?.toLocaleString('tr-TR') || '?'} üyeli Telegram kanalı escrow güvenceli satışta.`,
        },
        alternates: {
            canonical: `https://telegramkanali.com/marketplace/${id}`,
        },
    };
}

function formatPrice(price: number, currency: string) {
    if (currency === 'STARS') return `${price.toLocaleString('tr-TR')} ⭐ Telegram Yıldız`;
    if (currency === 'BOTH') return `$${price.toLocaleString('tr-TR')} USDT / Yıldız`;
    return `$${price.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USDT`;
}

function formatMembers(count: number) {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString('tr-TR');
}

export default async function MarketplaceDetailPage({ params }: Props) {
    const { id } = await params;
    const listing = await getListing(id);

    if (!listing) notFound();

    // Mevcut kullanıcıyı al
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    // View sayısını artır (fire-and-forget)
    const db = getAdminClient();
    db.from('channel_listings').update({ views: (listing.views || 0) + 1 }).eq('id', id).then(() => { });

    const displayName = listing.channel_name || listing.title;
    const priceStr = formatPrice(listing.asking_price, listing.currency);

    // JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                name: `Satılık Telegram Kanalı: ${displayName}`,
                description: listing.description || `${listing.member_count?.toLocaleString('tr-TR')} üyeli Telegram kanalı satışta.`,
                url: `https://telegramkanali.com/marketplace/${id}`,
                offers: {
                    '@type': 'Offer',
                    price: listing.asking_price,
                    priceCurrency: listing.currency === 'STARS' ? 'XTR' : 'USD',
                    availability: 'https://schema.org/InStock',
                    seller: {
                        '@type': 'Organization',
                        name: 'TelegramKanali.com',
                        url: 'https://telegramkanali.com',
                    },
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://telegramkanali.com' },
                    { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://telegramkanali.com/marketplace' },
                    { '@type': 'ListItem', position: 3, name: displayName, item: `https://telegramkanali.com/marketplace/${id}` },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #05050f 0%, #0b0b1e 60%, #05050f 100%)' }}>
                <div className="mx-auto max-w-5xl px-4 py-10">

                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
                        <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
                        <ChevronRight size={12} />
                        <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-400 truncate max-w-[200px]">{displayName}</span>
                    </nav>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                        {/* ── Sol: İlan Detayları ── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Kanal başlık kartı */}
                            <div className="rounded-3xl p-7"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex items-start gap-5">
                                    {listing.channel_image ? (
                                        <img
                                            src={listing.channel_image}
                                            alt={displayName}
                                            className="h-20 w-20 rounded-2xl object-cover shrink-0"
                                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
                                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
                                            {(displayName || 'T')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h1 className="text-2xl font-black text-white leading-tight">{displayName}</h1>
                                            {listing.featured && (
                                                <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase"
                                                    style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                                    ⭐ Öne Çıkan
                                                </span>
                                            )}
                                        </div>
                                        {listing.channel_username && (
                                            <div className="text-sm text-slate-500 mb-2">@{listing.channel_username}</div>
                                        )}
                                        {listing.category && (
                                            <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                                                style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                                                {listing.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {listing.description && (
                                    <div className="mt-5 pt-5 border-t text-sm leading-relaxed text-slate-400"
                                        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        {listing.description}
                                    </div>
                                )}
                                {listing.niche && (
                                    <div className="mt-3 text-xs italic text-slate-500">{listing.niche}</div>
                                )}
                            </div>

                            {/* İstatistikler */}
                            <div className="rounded-3xl p-7"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h2 className="mb-5 font-black text-white flex items-center gap-2">
                                    <BarChart3 size={18} className="text-emerald-400" />
                                    Kanal İstatistikleri
                                </h2>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        {
                                            show: listing.member_count > 0,
                                            icon: Users,
                                            color: '#38bdf8',
                                            bg: 'rgba(14,165,233,0.1)',
                                            border: 'rgba(14,165,233,0.2)',
                                            val: formatMembers(listing.member_count),
                                            label: 'Üye Sayısı',
                                        },
                                        {
                                            show: listing.age_months != null,
                                            icon: Calendar,
                                            color: '#a78bfa',
                                            bg: 'rgba(139,92,246,0.1)',
                                            border: 'rgba(139,92,246,0.2)',
                                            val: `${listing.age_months} ay`,
                                            label: 'Kanal Yaşı',
                                        },
                                        {
                                            show: listing.monthly_income_est != null,
                                            icon: DollarSign,
                                            color: '#34d399',
                                            bg: 'rgba(16,185,129,0.1)',
                                            border: 'rgba(16,185,129,0.2)',
                                            val: `$${listing.monthly_income_est?.toLocaleString('tr-TR')}`,
                                            label: 'Tahmini Aylık Gelir',
                                        },
                                        {
                                            show: listing.engagement_rate != null,
                                            icon: TrendingUp,
                                            color: '#fbbf24',
                                            bg: 'rgba(245,158,11,0.1)',
                                            border: 'rgba(245,158,11,0.2)',
                                            val: `%${listing.engagement_rate}`,
                                            label: 'Etkileşim Oranı',
                                        },
                                    ].filter(s => s.show).map((s, i) => (
                                        <div key={i} className="rounded-2xl p-4 text-center"
                                            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                                            <s.icon size={20} style={{ color: s.color }} className="mx-auto mb-2" />
                                            <div className="text-lg font-black text-white">{s.val}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transfer bilgisi */}
                            <div className="rounded-3xl p-7"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <h2 className="mb-4 font-black text-white flex items-center gap-2">
                                    <Lock size={18} className="text-emerald-400" />
                                    Transfer & Escrow Süreci
                                </h2>
                                <div className="space-y-3 text-sm text-slate-400">
                                    {[
                                        { icon: CheckCircle2, text: 'Anlaşma sağlandıktan sonra ödemeyi platformumuza (escrow) gönderirsiniz' },
                                        { icon: CheckCircle2, text: 'Satıcı kanal admin haklarını size devreder ve kanaldan ayrılır' },
                                        { icon: CheckCircle2, text: 'Transfer doğrulandıktan sonra fonlar satıcıya aktarılır' },
                                        { icon: CheckCircle2, text: '%5 platform komisyonu satış fiyatından düşülür' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <item.icon size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Sağ: Fiyat & İletişim ── */}
                        <div className="space-y-5">

                            {/* Fiyat kartı */}
                            <div className="sticky top-6 rounded-3xl p-6 space-y-4"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.04))',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    boxShadow: '0 0 40px rgba(16,185,129,0.08)',
                                }}>

                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Satış Fiyatı</div>
                                    <div className="text-3xl font-black text-white">{priceStr}</div>
                                    {listing.price_negotiable && (
                                        <div className="mt-1 text-xs text-emerald-400 font-bold">✓ Pazarlık yapılabilir</div>
                                    )}
                                </div>

                                {/* Komisyon hesabı */}
                                {listing.currency !== 'STARS' && (
                                    <div className="rounded-xl p-4 space-y-2 text-xs"
                                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Satış fiyatı</span>
                                            <span className="font-bold text-white">${listing.asking_price.toLocaleString('tr-TR')} USDT</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Platform komisyonu (%5)</span>
                                            <span>-${(listing.asking_price * 0.05).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                            <span className="text-emerald-400">Satıcı alır</span>
                                            <span className="text-emerald-300">${(listing.asking_price * 0.95).toFixed(2)} USDT</span>
                                        </div>
                                    </div>
                                )}

                                {/* Escrow badge */}
                                <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold"
                                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                                    <Shield size={14} />
                                    Bu işlem Escrow güvencesindedir
                                </div>

                                {/* İletişim formu */}
                                <ListingContactForm
                                    listingId={listing.id}
                                    sellerId={listing.seller_id}
                                    isLoggedIn={!!user}
                                    userId={user?.id}
                                />

                                {/* Destek */}
                                <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all hover:text-white w-full"
                                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)' }}>
                                    <MessageCircle size={14} />
                                    Sorun mu var? Desteğe yaz
                                </a>
                            </div>

                            {/* Güven bilgisi */}
                            <div className="rounded-2xl p-5 space-y-3"
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Neden Güvenli?
                                </div>
                                {[
                                    { icon: Lock, text: 'Escrow ile ödeme korunması' },
                                    { icon: BadgeCheck, text: 'Platform garantili transfer' },
                                    { icon: Clock, text: '7/24 destek ekibi' },
                                    { icon: AlertTriangle, text: 'Anlaşmazlıkta admin müdahalesi' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                        <item.icon size={13} className="text-emerald-400 shrink-0" />
                                        {item.text}
                                    </div>
                                ))}
                            </div>

                            {/* Geri dön */}
                            <Link href="/marketplace"
                                className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                                <ArrowLeft size={13} />
                                Tüm İlanlara Dön
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
