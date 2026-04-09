import { getAdminClient } from '@/lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    Shield, ArrowLeft, Users, Calendar, DollarSign, TrendingUp,
    CheckCircle2, Lock, MessageCircle, BarChart3, BadgeCheck,
    AlertTriangle, Clock, ChevronRight
} from 'lucide-react';
import type { Metadata } from 'next';
import ListingContactForm from './ListingContactForm';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ id: string }>; }

async function getListing(id: string) {
    const db = getAdminClient();
    const { data } = await db.from('channel_listings').select('*').eq('id', id).eq('status', 'active').single();
    return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const listing = await getListing(id);
    if (!listing) return { title: 'İlan Bulunamadı' };
    const title = listing.channel_name || listing.title;
    const price = listing.currency === 'STARS' ? `${listing.asking_price} ⭐` : `$${listing.asking_price} USDT`;
    return {
        title: `${title} — Satılık Telegram Kanalı ${price} | TelegramKanali.com`,
        description: `${listing.member_count?.toLocaleString('tr-TR') || '?'} üyeli ${title} kanalı escrow güvencesiyle satışta. ${price} fiyatla hemen teklif ver.`,
        alternates: { canonical: `https://telegramkanali.com/marketplace/${id}` },
    };
}

function formatPrice(price: number, currency: string) {
    if (currency === 'STARS') return `${price.toLocaleString('tr-TR')} ⭐ Yıldız`;
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

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    const db = getAdminClient();
    db.from('channel_listings').update({ views: (listing.views || 0) + 1 }).eq('id', id).then(() => { });

    const displayName = listing.channel_name || listing.title;
    const priceStr = formatPrice(listing.asking_price, listing.currency);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                name: `Satılık Telegram Kanalı: ${displayName}`,
                description: listing.description || `${listing.member_count?.toLocaleString('tr-TR')} üyeli Telegram kanalı satışta.`,
                url: `https://telegramkanali.com/marketplace/${id}`,
                offers: {
                    '@type': 'Offer', price: listing.asking_price,
                    priceCurrency: listing.currency === 'STARS' ? 'XTR' : 'USD',
                    availability: 'https://schema.org/InStock',
                    seller: { '@type': 'Organization', name: 'TelegramKanali.com', url: 'https://telegramkanali.com' },
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
            <style>{`
                .detail-outer {
                    margin: 0 -12px;
                    background: #f8fafc;
                    min-height: 100vh;
                }
                .detail-inner {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 16px 16px 60px;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                    align-items: start;
                }
                /* Mobilde form üstte (önce) — right col = order 1, left col = order 2 */
                .detail-left  { order: 2; display: flex; flex-direction: column; gap: 16px; }
                .detail-right { order: 1; display: flex; flex-direction: column; gap: 12px; }

                @media (min-width: 768px) {
                    .detail-outer  { margin: 0 -24px; }
                    .detail-inner  { padding: 20px 24px 60px; }
                    .detail-grid   { grid-template-columns: 1fr 360px; gap: 24px; }
                    .detail-left   { order: 1; }
                    .detail-right  { order: 2; position: sticky; top: 20px; }
                }

                .detail-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 18px 16px;
                }
                @media (min-width: 768px) {
                    .detail-card { padding: 22px; border-radius: 16px; }
                }

                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                @media (min-width: 480px) {
                    .stat-grid { grid-template-columns: repeat(4, 1fr); }
                }

                .price-box {
                    background: #fff;
                    border: 2px solid #10b981;
                    border-radius: 14px;
                    padding: 16px;
                    box-shadow: 0 4px 20px rgba(16,185,129,0.10);
                }
                .channel-header {
                    display: flex;
                    gap: 14px;
                    align-items: flex-start;
                }
                .channel-avatar {
                    width: 60px; height: 60px;
                    flex-shrink: 0;
                }
                @media (min-width: 480px) {
                    .channel-avatar { width: 72px; height: 72px; }
                }
            `}</style>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="detail-outer">
                <div className="detail-inner">

                    {/* Breadcrumb */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8', marginBottom: 16, flexWrap: 'wrap' }}>
                        <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ana Sayfa</Link>
                        <ChevronRight size={11} />
                        <Link href="/marketplace" style={{ color: '#94a3b8', textDecoration: 'none' }}>Marketplace</Link>
                        <ChevronRight size={11} />
                        <span style={{ color: '#475569', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                    </nav>

                    <div className="detail-grid">

                        {/* ── Sol ── */}
                        <div className="detail-left">

                            {/* Başlık Kartı */}
                            <div className="detail-card">
                                <div className="channel-header">
                                    {listing.channel_image ? (
                                        <img src={listing.channel_image} alt={displayName}
                                            className="channel-avatar"
                                            style={{ borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                    ) : (
                                        <div className="channel-avatar" style={{
                                            borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 24, fontWeight: 900, color: '#059669',
                                        }}>
                                            {(displayName || 'T')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                            <h1 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{displayName}</h1>
                                            {listing.featured && (
                                                <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>⭐ Öne Çıkan</span>
                                            )}
                                        </div>
                                        {listing.channel_username && (
                                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>@{listing.channel_username}</div>
                                        )}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {listing.category && (
                                                <span style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff', borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700 }}>
                                                    {listing.category}
                                                </span>
                                            )}
                                            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Shield size={9} /> Escrow
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {listing.description && (
                                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                                        {listing.description}
                                    </div>
                                )}
                            </div>

                            {/* İstatistikler */}
                            {[listing.member_count > 0, listing.age_months != null, listing.monthly_income_est != null, listing.engagement_rate != null].some(Boolean) && (
                                <div className="detail-card">
                                    <h2 style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <BarChart3 size={14} color="#059669" /> İstatistikler
                                    </h2>
                                    <div className="stat-grid">
                                        {[
                                            { show: listing.member_count > 0, icon: Users, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', val: formatMembers(listing.member_count), label: 'Üye' },
                                            { show: listing.age_months != null, icon: Calendar, color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', val: `${listing.age_months} ay`, label: 'Yaş' },
                                            { show: listing.monthly_income_est != null, icon: DollarSign, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', val: `$${listing.monthly_income_est}`, label: 'Aylık Gelir' },
                                            { show: listing.engagement_rate != null, icon: TrendingUp, color: '#d97706', bg: '#fffbeb', border: '#fde68a', val: `%${listing.engagement_rate}`, label: 'Etkileşim' },
                                        ].filter(s => s.show).map((s, i) => (
                                            <div key={i} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 12, background: s.bg, border: `1px solid ${s.border}` }}>
                                                <s.icon size={16} style={{ color: s.color, margin: '0 auto 5px' }} />
                                                <div style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>{s.val}</div>
                                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Escrow Süreci */}
                            <div className="detail-card">
                                <h2 style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <Lock size={14} color="#059669" /> Escrow Süreci
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        'Teklif gönderin, satıcıyla sohbet başlatın',
                                        'Anlaşma sağlandıktan sonra ödemeyi escrow hesabımıza gönderin',
                                        'Satıcı kanal admin haklarını size devreder',
                                        'Transfer doğrulandıktan sonra fonlar satıcıya aktarılır (%5 komisyon)',
                                    ].map((text, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <div style={{
                                                flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, fontWeight: 900, color: '#059669',
                                            }}>{i + 1}</div>
                                            <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, paddingTop: 1 }}>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Sağ: Fiyat & Form ── */}
                        <div className="detail-right">

                            {/* Fiyat + Form */}
                            <div className="price-box">
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Satış Fiyatı</div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{priceStr}</div>
                                {listing.price_negotiable && (
                                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, marginBottom: 12 }}>✓ Pazarlık yapılabilir</div>
                                )}

                                {listing.currency !== 'STARS' && (
                                    <div style={{ borderRadius: 10, padding: '10px 12px', marginBottom: 14, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 11 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: 4 }}>
                                            <span>Satış fiyatı</span>
                                            <span style={{ fontWeight: 700 }}>${listing.asking_price} USDT</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: 6 }}>
                                            <span>Komisyon (%5)</span>
                                            <span>-${(listing.asking_price * 0.05).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                                            <span style={{ color: '#059669' }}>Satıcı alır</span>
                                            <span style={{ color: '#059669' }}>${(listing.asking_price * 0.95).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                <ListingContactForm
                                    listingId={listing.id}
                                    sellerId={listing.seller_id}
                                    isLoggedIn={!!user}
                                    userId={user?.id}
                                    askingPrice={listing.asking_price}
                                    currency={listing.currency}
                                />
                            </div>

                            {/* Güven */}
                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                    Neden Güvenli?
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { icon: Lock, text: 'Escrow ile ödeme koruması' },
                                        { icon: BadgeCheck, text: 'Platform garantili transfer' },
                                        { icon: Clock, text: '7/24 destek ekibi' },
                                        { icon: AlertTriangle, text: 'Anlaşmazlıkta admin müdahalesi' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                                            <item.icon size={12} color="#10b981" />
                                            {item.text}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, color: '#64748b', textDecoration: 'none', background: '#fff' }}>
                                <MessageCircle size={13} color="#7c3aed" /> Sorun mu var? Desteğe yaz
                            </a>

                            <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
                                <ArrowLeft size={12} /> Tüm İlanlara Dön
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
