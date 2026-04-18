import { getAdminClient } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import {
    Shield, TrendingUp, DollarSign, CheckCircle2, Lock,
    MessageCircle, Zap, BadgeCheck, Clock, Search, ChevronRight
} from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 300; // 5 dakika cache — force-dynamic gereksiz, ilanlar sk değişmiyor


export const metadata: Metadata = {
    title: 'Telegram Kanal Al-Sat Marketplace — Escrow Güvenceli | TelegramKanali.com',
    description: 'Türkiye\'nin #1 güvenilir Telegram kanal alım-satım platformu. Escrow sistemiyle güvende kanal al veya sat. %5 komisyon, USDT & Telegram Yıldız ödeme.',
    alternates: { canonical: 'https://telegramkanali.com/marketplace' },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        { '@type': 'WebPage', name: 'Telegram Kanal Alım Satım Marketplace', url: 'https://telegramkanali.com/marketplace', inLanguage: 'tr' },
        {
            '@type': 'FAQPage',
            mainEntity: [
                { '@type': 'Question', name: 'Telegram kanal alım satımında escrow ne demek?', acceptedAnswer: { '@type': 'Answer', text: 'Alıcının ödeme yapıp fonların platformda tutulduğu, kanal transferi sonrası satıcıya aktarıldığı güvenlik sistemidir.' } },
                { '@type': 'Question', name: 'Telegram kanal satış komisyonu ne kadar?', acceptedAnswer: { '@type': 'Answer', text: '%5 sabit platform komisyonu.' } },
            ],
        },
    ],
};

async function getMarketplaceData() {
    try {
        const db = getAdminClient();
        const [listingsRes, statsRes] = await Promise.all([
            db.from('channel_listings').select('*').eq('status', 'active')
                .order('featured', { ascending: false }).order('created_at', { ascending: false }).limit(24),
            db.from('marketplace_orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        ]);
        return { listings: listingsRes.data || [], completedOrders: statsRes.count || 0, totalListings: listingsRes.data?.length || 0 };
    } catch { return { listings: [], completedOrders: 0, totalListings: 0 }; }
}

function formatPrice(price: number, currency: string) {
    if (currency === 'STARS') return `${price.toLocaleString('tr-TR')} ⭐`;
    return `$${price.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMembers(count: number) {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString('tr-TR');
}

const CAT_COLORS: Record<string, string> = {
    kripto: '#f59e0b', borsa: '#10b981', haber: '#3b82f6',
    teknoloji: '#8b5cf6', spor: '#ef4444', eğlence: '#ec4899', default: '#64748b',
};
function catColor(cat: string | null) {
    if (!cat) return CAT_COLORS.default;
    const k = Object.keys(CAT_COLORS).find(k => cat.toLowerCase().includes(k));
    return k ? CAT_COLORS[k] : CAT_COLORS.default;
}

export default async function MarketplacePage() {
    const { listings, completedOrders, totalListings } = await getMarketplaceData();

    return (
        <>
            <style>{`
                .mp-outer {
                    margin: 0 -12px;
                    min-height: 100vh;
                    background: #f8fafc;
                }
                @media (min-width: 768px) {
                    .mp-outer { margin: 0 -24px; }
                }

                /* ── HERO ── */
                .mp-hero {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
                    padding: 32px 16px 40px;
                }
                @media (min-width: 768px) {
                    .mp-hero { padding: 48px 24px 56px; }
                }
                .mp-hero-inner {
                    max-width: 960px;
                    margin: 0 auto;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }
                .mp-hero-left { flex: 1 1 280px; }
                .mp-hero-title {
                    font-size: 28px;
                    font-weight: 900;
                    color: #fff;
                    line-height: 1.15;
                    margin: 0 0 10px;
                }
                @media (min-width: 640px) {
                    .mp-hero-title { font-size: 36px; }
                }
                .mp-hero-steps {
                    flex: 0 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    min-width: 200px;
                }
                @media (max-width: 639px) {
                    .mp-hero-steps { display: none; }
                }
                .mp-cta-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .mp-stats-bar {
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px 20px;
                }

                /* ── İLANLAR ── */
                .mp-listings-section {
                    padding: 28px 16px 40px;
                    max-width: 1280px;
                    margin: 0 auto;
                }
                @media (min-width: 768px) {
                    .mp-listings-section { padding: 36px 24px 48px; }
                }
                .mp-card-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                @media (min-width: 480px) {
                    .mp-card-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 768px) {
                    .mp-card-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
                }
                @media (min-width: 1100px) {
                    .mp-card-grid { grid-template-columns: repeat(4, 1fr); }
                }

                /* ── KART HOVER ── */
                .listing-card-link { text-decoration: none; display: block; height: 100%; }
                .listing-card {
                    background: #fff;
                    border-radius: 14px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    height: 100%;
                    box-sizing: border-box;
                    transition: box-shadow 0.15s, transform 0.15s;
                    position: relative;
                    cursor: pointer;
                }
                .listing-card:active {
                    transform: scale(0.98);
                }
                @media (hover: hover) {
                    .listing-card-link:hover .listing-card {
                        box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important;
                        transform: translateY(-2px);
                    }
                }

                /* ── GÜVEN ŞERİDİ ── */
                .mp-trust-bar {
                    border-top: 1px solid #e2e8f0;
                    background: #fff;
                    padding: 24px 16px;
                }
                @media (min-width: 768px) {
                    .mp-trust-bar { padding: 28px 24px; }
                }
                .mp-trust-grid {
                    max-width: 960px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                @media (min-width: 768px) {
                    .mp-trust-grid { grid-template-columns: repeat(4, 1fr); }
                }

                /* ── SSS ── */
                .mp-faq {
                    padding: 32px 16px 48px;
                    background: #f8fafc;
                }
                @media (min-width: 768px) {
                    .mp-faq { padding: 40px 24px 56px; }
                }

                /* ── CTA ── */
                .mp-final-cta {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    padding: 32px 16px;
                    text-align: center;
                }
                @media (min-width: 768px) {
                    .mp-final-cta { padding: 40px 24px; }
                }
                .mp-final-cta-btns {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
            `}</style>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <HoverStyles />

            <div className="mp-outer">

                {/* ── HERO ── */}
                <section className="mp-hero">
                    <div className="mp-hero-inner">
                        <div className="mp-hero-left">
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: 100, padding: '4px 12px', marginBottom: 14,
                                fontSize: 10, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>
                                <Shield size={10} /> Escrow Güvenceli
                            </div>
                            <h1 className="mp-hero-title">
                                Telegram Kanalı<br />
                                <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Al ya da Sat
                                </span>
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px', maxWidth: 400 }}>
                                Ödeme güvende tutulur → kanal transfer edilir → para satıcıya geçer.{' '}
                                <strong style={{ color: '#cbd5e1' }}>%5 komisyon</strong>, sıfır risk.
                            </p>
                            <div className="mp-cta-row">
                                <a href="#ilanlar" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    background: 'linear-gradient(135deg, #059669, #10b981)',
                                    color: '#fff', fontWeight: 800, fontSize: 13,
                                    padding: '11px 20px', borderRadius: 12, textDecoration: 'none',
                                    boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
                                }}>
                                    <Search size={14} /> İlanlara Bak
                                </a>
                                <Link href="/dashboard/kanal-sat" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 7,
                                    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)',
                                    color: '#cbd5e1', fontWeight: 700, fontSize: 13,
                                    padding: '11px 18px', borderRadius: 12, textDecoration: 'none',
                                }}>
                                    <DollarSign size={14} /> Kanalımı Sat
                                </Link>
                            </div>
                        </div>

                        {/* Escrow adımları — sadece tablet+ */}
                        <div className="mp-hero-steps">
                            {[
                                { n: '01', c: '#a78bfa', label: 'İlan Seç & Teklif Ver' },
                                { n: '02', c: '#34d399', label: 'Escrow\'ya Öde (USDT / ⭐)' },
                                { n: '03', c: '#38bdf8', label: 'Kanal Admin Haklarını Al' },
                                { n: '04', c: '#fbbf24', label: 'Satıcı Fonları Alır ✓' },
                            ].map((s, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 10, padding: '8px 12px',
                                }}>
                                    <span style={{ fontWeight: 900, fontSize: 10, color: s.c, background: `${s.c}18`, borderRadius: 6, padding: '2px 6px', minWidth: 24, textAlign: 'center' }}>{s.n}</span>
                                    <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mp-stats-bar" style={{ maxWidth: 960, margin: '20px auto 0', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        {[
                            { icon: CheckCircle2, val: `${completedOrders}+`, label: 'Tamamlanan İşlem' },
                            { icon: Lock, val: 'Escrow', label: 'Güvenceli' },
                            { icon: BadgeCheck, val: '%5', label: 'Komisyon' },
                            { icon: Clock, val: '7/24', label: 'Destek' },
                        ].map(({ icon: Icon, val, label }, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Icon size={13} color="#10b981" />
                                <span style={{ fontWeight: 800, color: '#fff', fontSize: 12 }}>{val}</span>
                                <span style={{ color: '#64748b', fontSize: 11 }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── AKTİF İLANLAR ── */}
                <section id="ilanlar" className="mp-listings-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                Aktif İlanlar
                                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 100, padding: '2px 8px', verticalAlign: 'middle' }}>
                                    {totalListings}
                                </span>
                            </h2>
                            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>Tamamı escrow güvenceli</p>
                        </div>
                        <Link href="/dashboard/kanal-sat" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff',
                            fontWeight: 800, fontSize: 12, padding: '9px 16px', borderRadius: 10, textDecoration: 'none',
                        }}>
                            <DollarSign size={13} /> + İlan Ver
                        </Link>
                    </div>

                    {listings.length === 0 ? (
                        <EmptyListings />
                    ) : (
                        <div className="mp-card-grid">
                            {listings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── GÜVEN ŞERİDİ ── */}
                <section className="mp-trust-bar">
                    <div className="mp-trust-grid">
                        {[
                            { icon: Shield, color: '#10b981', title: 'Escrow Koruması', sub: 'Transfer öncesi ödeme güvende' },
                            { icon: BadgeCheck, color: '#3b82f6', title: 'Platform Garantisi', sub: 'Her transfer onaylanır' },
                            { icon: TrendingUp, color: '#8b5cf6', title: '650K+ Ziyaretçi', sub: 'Gerçek alıcı kitlesi' },
                            { icon: MessageCircle, color: '#f59e0b', title: 'Anlaşmazlık Çözümü', sub: 'Admin müdahalesi' },
                        ].map(({ icon: Icon, color, title, sub }, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: 12, padding: '10px 12px',
                            }}>
                                <div style={{ background: `${color}15`, borderRadius: 8, padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={14} color={color} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 12, color: '#0f172a' }}>{title}</div>
                                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── SSS ── */}
                <section className="mp-faq">
                    <div style={{ maxWidth: 680, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 16, textAlign: 'center' }}>
                            Sıkça Sorulan Sorular
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {[
                                { q: 'Escrow nedir, neden gerekli?', a: 'Alıcı ödemeyi platforma yatırır. Kanal transfer edilip doğrulandıktan sonra para satıcıya aktarılır.' },
                                { q: 'Komisyon ne kadar?', a: '%5 sabit. $1.000 satışta satıcı $950 alır.' },
                                { q: 'Hangi ödeme yöntemleri var?', a: 'USDT (TRC-20 / BEP-20) ve Telegram Yıldız (Stars).' },
                                { q: 'İlan vermek ücretli mi?', a: 'Hayır, tamamen ücretsiz. Komisyon sadece başarılı satışta alınır.' },
                                { q: 'Anlaşmazlık olursa?', a: 'Admin ekibi kanıtları inceler, adil kararı verir. Fonlar karar açıklanana kadar escrow\'da bekler.' },
                            ].map((item, i) => (
                                <details key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                                    <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', fontWeight: 700, fontSize: 13, color: '#0f172a', cursor: 'pointer', listStyle: 'none' }}>
                                        {item.q}
                                        <ChevronRight size={14} color="#94a3b8" />
                                    </summary>
                                    <div style={{ padding: '0 16px 13px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="mp-final-cta">
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                        Kanalınızı Satmaya Hazır mısınız?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 20px' }}>
                        Ücretsiz ilan verin, escrow güvencesiyle satın. Yüzlerce alıcı bekliyor.
                    </p>
                    <div className="mp-final-cta-btns">
                        <Link href="/dashboard/kanal-sat" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            background: '#fff', color: '#059669', fontWeight: 900, fontSize: 13,
                            padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        }}>
                            <DollarSign size={15} /> Kanal İlanı Ver — Ücretsiz
                        </Link>
                        <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff', fontWeight: 700, fontSize: 13,
                            padding: '12px 20px', borderRadius: 12, textDecoration: 'none',
                        }}>
                            <MessageCircle size={15} /> Telegram Destek
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
}

function ListingCard({ listing }: { listing: any }) {
    const isFeatured = listing.featured;
    const color = catColor(listing.category);
    const name = listing.channel_name || listing.title || 'Kanal';
    const price = formatPrice(listing.asking_price, listing.currency);

    return (
        <Link href={`/marketplace/${listing.id}`} className="listing-card-link">
            <div className="listing-card" style={{
                border: isFeatured ? `2px solid #10b981` : '1px solid #e2e8f0',
                boxShadow: isFeatured ? '0 4px 20px rgba(16,185,129,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
            }}>
                {isFeatured && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 800 }}>⭐ Öne Çıkan</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {listing.channel_image ? (
                        <img src={listing.channel_image} alt={name}
                            style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    ) : (
                        <div style={{
                            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                            background: `${color}18`, border: `1px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 900, color,
                        }}>
                            {name[0].toUpperCase()}
                        </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                        {listing.channel_username && (
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>@{listing.channel_username}</div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {listing.member_count > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 600, color: '#64748b' }}>
                            👥 {formatMembers(listing.member_count)}
                        </span>
                    )}
                    {listing.age_months != null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 600, color: '#64748b' }}>
                            🕐 {listing.age_months}ay
                        </span>
                    )}
                    {listing.monthly_income_est != null && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: '#059669' }}>
                            💰 ${listing.monthly_income_est}/ay
                        </span>
                    )}
                </div>

                {listing.category && (
                    <div style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, background: `${color}12`, color, border: `1px solid ${color}25`, borderRadius: 100, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {listing.category}
                    </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>{price}</div>
                        {listing.price_negotiable && <div style={{ fontSize: 9, color: '#059669', fontWeight: 700 }}>Pazarlık yapılır</div>}
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', fontWeight: 800, fontSize: 10, padding: '6px 10px', borderRadius: 7 }}>
                        İncele →
                    </div>
                </div>
            </div>
        </Link>
    );
}

function HoverStyles() {
    return null; // CSS class'lar zaten <style> tag'ında
}

function EmptyListings() {
    return (
        <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Henüz Aktif İlan Yok</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>İlk kanal ilanını sen ver!</p>
            <Link href="/dashboard/kanal-sat" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', fontWeight: 800, fontSize: 13, padding: '11px 22px', borderRadius: 12, textDecoration: 'none' }}>
                <DollarSign size={15} /> Hemen İlan Ver
            </Link>
        </div>
    );
}
