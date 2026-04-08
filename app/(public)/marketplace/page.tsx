import { getAdminClient } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import {
    Shield, TrendingUp, Users, DollarSign, ArrowRight,
    CheckCircle2, Lock, MessageCircle, Zap, BarChart3,
    Clock, BadgeCheck, Search, ChevronRight, AlertCircle, Star
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Telegram Kanal Al-Sat Marketplace — Escrow Güvenceli | TelegramKanali.com',
    description: 'Türkiye\'nin #1 güvenilir Telegram kanal alım-satım platformu. Escrow sistemiyle güvende kanal al veya sat. %5 komisyon, USDT & Telegram Yıldız ödeme.',
    alternates: { canonical: 'https://telegramkanali.com/marketplace' },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            name: 'Telegram Kanal Alım Satım Marketplace',
            url: 'https://telegramkanali.com/marketplace',
            description: 'Güvenilir escrow sistemiyle Telegram kanal al veya sat.',
            inLanguage: 'tr',
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Telegram kanal alım satımında escrow ne demek?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Escrow, alıcının ödeme yapıp fonların platformda tutulduğu, kanal transferi sonrası satıcıya aktarıldığı güvenlik sistemidir.' },
                },
                {
                    '@type': 'Question',
                    name: 'Telegram kanal satış komisyonu ne kadar?',
                    acceptedAnswer: { '@type': 'Answer', text: '%5 sabit platform komisyonu. Satıcı fiyatın %95\'ini alır.' },
                },
            ],
        },
    ],
};

async function getMarketplaceData() {
    try {
        const db = getAdminClient();
        const [listingsRes, statsRes] = await Promise.all([
            db.from('channel_listings').select('*').eq('status', 'active')
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(24),
            db.from('marketplace_orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        ]);
        return {
            listings: listingsRes.data || [],
            completedOrders: statsRes.count || 0,
            totalListings: listingsRes.data?.length || 0,
        };
    } catch {
        return { listings: [], completedOrders: 0, totalListings: 0 };
    }
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
    'kripto': '#f59e0b', 'borsa': '#10b981', 'haber': '#3b82f6',
    'teknoloji': '#8b5cf6', 'spor': '#ef4444', 'eğlence': '#ec4899', 'default': '#64748b',
};

function catColor(cat: string | null): string {
    if (!cat) return CAT_COLORS.default;
    const k = Object.keys(CAT_COLORS).find(k => cat.toLowerCase().includes(k));
    return k ? CAT_COLORS[k] : CAT_COLORS.default;
}

export default async function MarketplacePage() {
    const { listings, completedOrders, totalListings } = await getMarketplaceData();

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <HoverStyles />

            {/* Tam ekran wrapper — parent container'ı geç */}
            <div style={{ margin: '0 -12px', minHeight: '100vh', background: '#f8fafc' }}>

                {/* ── HERO — kompakt, profesyonel ─────────────────────── */}
                <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', padding: '48px 24px 56px' }}>
                    <div style={{ maxWidth: 960, margin: '0 auto' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                            {/* Sol: başlık */}
                            <div style={{ flex: '1 1 400px' }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                                    borderRadius: 100, padding: '4px 12px', marginBottom: 16,
                                    fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em',
                                }}>
                                    <Shield size={11} />
                                    Escrow Güvenceli Marketplace
                                </div>

                                <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 12px' }}>
                                    Telegram Kanalı<br />
                                    <span style={{
                                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    }}>
                                        Al ya da Sat
                                    </span>
                                </h1>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 420 }}>
                                    Ödeme güvende tutulur → kanal transfer edilir → para satıcıya geçer.{' '}
                                    <strong style={{ color: '#cbd5e1' }}>%5 komisyon</strong>, sıfır risk.
                                </p>

                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <a href="#ilanlar" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                        color: '#fff', fontWeight: 800, fontSize: 14,
                                        padding: '11px 22px', borderRadius: 12, textDecoration: 'none',
                                        boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                                    }}>
                                        <Search size={15} /> İlanlara Bak
                                    </a>
                                    <Link href="/dashboard/kanal-sat" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        color: '#cbd5e1', fontWeight: 700, fontSize: 14,
                                        padding: '11px 22px', borderRadius: 12, textDecoration: 'none',
                                        background: 'rgba(255,255,255,0.04)',
                                    }}>
                                        <DollarSign size={15} /> Kanalımı Sat
                                    </Link>
                                </div>
                            </div>

                            {/* Sağ: mini escrow akışı */}
                            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                                {[
                                    { n: '01', c: '#a78bfa', label: 'İlan Seç & Teklif Ver' },
                                    { n: '02', c: '#34d399', label: 'Escrow\'ya Öde (USDT / ⭐)' },
                                    { n: '03', c: '#38bdf8', label: 'Kanal Admin Haklarını Al' },
                                    { n: '04', c: '#fbbf24', label: 'Satıcı Fonları Alır ✓' },
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 10, padding: '8px 14px',
                                    }}>
                                        <span style={{
                                            fontWeight: 900, fontSize: 10, color: s.c,
                                            background: `${s.c}18`, borderRadius: 6, padding: '2px 6px',
                                            minWidth: 24, textAlign: 'center',
                                        }}>{s.n}</span>
                                        <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats bar */}
                        <div style={{
                            marginTop: 32, paddingTop: 24,
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', flexWrap: 'wrap', gap: 24,
                        }}>
                            {[
                                { icon: CheckCircle2, val: `${completedOrders}+`, label: 'Tamamlanan İşlem' },
                                { icon: Lock, val: 'Escrow', label: 'Her işlemde güvence' },
                                { icon: BadgeCheck, val: '%5', label: 'Sabit Komisyon' },
                                { icon: Clock, val: '7/24', label: 'Telegram Destek' },
                            ].map(({ icon: Icon, val, label }, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon size={14} color="#10b981" />
                                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 13 }}>{val}</span>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── AKTİF İLANLAR ──────────────────────────────────── */}
                <section id="ilanlar" style={{ padding: '40px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
                    {/* Başlık */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                Aktif İlanlar
                                <span style={{
                                    marginLeft: 10, fontSize: 13, fontWeight: 700,
                                    background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                                    borderRadius: 100, padding: '2px 10px', verticalAlign: 'middle',
                                }}>{totalListings}</span>
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Tamamı escrow güvenceli</p>
                        </div>
                        <Link href="/dashboard/kanal-sat" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: '#fff', fontWeight: 800, fontSize: 13,
                            padding: '10px 20px', borderRadius: 10, textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                        }}>
                            <DollarSign size={15} /> + Kanal İlanı Ver
                        </Link>
                    </div>

                    {listings.length === 0 ? (
                        <EmptyListings />
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: 16,
                        }}>
                            {listings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── GÜVEN ŞERIDI ────────────────────────────────────── */}
                <section style={{ borderTop: '1px solid #e2e8f0', background: '#fff', padding: '32px 24px' }}>
                    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                        {[
                            { icon: Shield, color: '#10b981', title: 'Escrow Koruması', sub: 'Transfer öncesi ödeme güvende' },
                            { icon: BadgeCheck, color: '#3b82f6', title: 'Platform Garantisi', sub: 'Her transfer onaylanır' },
                            { icon: TrendingUp, color: '#8b5cf6', title: '650K+ Aylık Ziyaretçi', sub: 'Gerçek alıcı kitlesi' },
                            { icon: MessageCircle, color: '#f59e0b', title: 'Anlaşmazlık Çözümü', sub: 'Admin müdahalesi, adil karar' },
                        ].map(({ icon: Icon, color, title, sub }, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: 12, padding: '12px 16px', flex: '1 1 200px', maxWidth: 240,
                            }}>
                                <div style={{
                                    background: `${color}15`, borderRadius: 8, padding: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={16} color={color} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{title}</div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── SSS ─────────────────────────────────────────────── */}
                <section style={{ padding: '40px 24px 56px', background: '#f8fafc' }}>
                    <div style={{ maxWidth: 720, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 20, textAlign: 'center' }}>
                            Sıkça Sorulan Sorular
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { q: 'Escrow nedir, neden gerekli?', a: 'Alıcı ödemeyi platforma yatırır. Kanal transfer edilip doğrulandıktan sonra para satıcıya aktarılır. Ne alıcı parasını çarptırır ne de satıcı kanalı kaybeder.' },
                                { q: 'Komisyon ne kadar?', a: '%5 sabit. $1.000 satışta satıcı $950 alır.' },
                                { q: 'Hangi ödeme yöntemleri var?', a: 'USDT (TRC-20 / BEP-20) ve Telegram Yıldız (Stars).' },
                                { q: 'İlan vermek ücretli mi?', a: 'Hayır, tamamen ücretsiz. Komisyon sadece başarılı satışta alınır.' },
                                { q: 'Anlaşmazlık olursa?', a: 'Admin ekibi kanıtları inceler, adil kararı verir. Fonlar karar açıklanana kadar escrow\'da bekler.' },
                            ].map((item, i) => (
                                <details key={i} style={{
                                    background: '#fff', border: '1px solid #e2e8f0',
                                    borderRadius: 10, overflow: 'hidden',
                                }}>
                                    <summary style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 18px', fontWeight: 700, fontSize: 14, color: '#0f172a',
                                        cursor: 'pointer', listStyle: 'none',
                                    }}>
                                        {item.q}
                                        <ChevronRight size={15} color="#94a3b8" />
                                    </summary>
                                    <div style={{ padding: '0 18px 14px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ───────────────────────────────────────── */}
                <section style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    padding: '40px 24px', textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
                        Kanalınızı Satmaya Hazır mısınız?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 24px' }}>
                        Ücretsiz ilan verin, escrow güvencesiyle güvenle satın. Yüzlerce alıcı bekliyor.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/dashboard/kanal-sat" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: '#fff', color: '#059669', fontWeight: 900, fontSize: 14,
                            padding: '12px 28px', borderRadius: 12, textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}>
                            <DollarSign size={16} /> Kanal İlanı Ver — Ücretsiz
                        </Link>
                        <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff', fontWeight: 700, fontSize: 14,
                            padding: '12px 22px', borderRadius: 12, textDecoration: 'none',
                        }}>
                            <MessageCircle size={16} /> Telegram Destek
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
}

// ── Listing Card ──────────────────────────────────────────────────────
function ListingCard({ listing }: { listing: any }) {
    const isFeatured = listing.featured;
    const color = catColor(listing.category);
    const name = listing.channel_name || listing.title || 'Kanal';
    const price = formatPrice(listing.asking_price, listing.currency);

    return (
        <Link href={`/marketplace/${listing.id}`} className="listing-card-link" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
            <div
                className="listing-card"
                style={{
                    background: '#fff',
                    border: isFeatured ? `2px solid #10b981` : '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    height: '100%',
                    boxShadow: isFeatured ? '0 4px 20px rgba(16,185,129,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.15s, transform 0.15s',
                    position: 'relative',
                }}>

                {/* Featured badge */}
                {isFeatured && (
                    <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0',
                        borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 800,
                    }}>⭐ Öne Çıkan</div>
                )}

                {/* Avatar + isim */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {listing.channel_image ? (
                        <img src={listing.channel_image} alt={name}
                            style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    ) : (
                        <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: `${color}18`, border: `1px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 900, color,
                        }}>
                            {name[0].toUpperCase()}
                        </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontWeight: 800, fontSize: 14, color: '#0f172a',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{name}</div>
                        {listing.channel_username && (
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                @{listing.channel_username}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {listing.member_count > 0 && (
                        <StatChip icon={<Users size={10} />} val={`${formatMembers(listing.member_count)} üye`} />
                    )}
                    {listing.age_months != null && (
                        <StatChip icon={<Clock size={10} />} val={`${listing.age_months} ay`} />
                    )}
                    {listing.monthly_income_est != null && (
                        <StatChip icon={<TrendingUp size={10} />} val={`$${listing.monthly_income_est}/ay`} color="#059669" />
                    )}
                </div>

                {/* Kategori */}
                {listing.category && (
                    <div style={{
                        display: 'inline-block', fontSize: 10, fontWeight: 700,
                        background: `${color}12`, color, border: `1px solid ${color}25`,
                        borderRadius: 100, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        {listing.category}
                    </div>
                )}

                {/* Fiyat + CTA */}
                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>{price}</div>
                        {listing.price_negotiable && (
                            <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 1 }}>Pazarlık yapılır</div>
                        )}
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        color: '#fff', fontWeight: 800, fontSize: 11,
                        padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap',
                    }}>
                        İncele →
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Global hover CSS injected once
function HoverStyles() {
    return (
        <style>{`
            .listing-card { cursor: pointer; }
            .listing-card-link:hover .listing-card {
                box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important;
                transform: translateY(-2px);
            }
        `}</style>
    );
}

function StatChip({ icon, val, color = '#64748b' }: { icon: React.ReactNode; val: string; color?: string }) {
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 6, padding: '3px 7px', fontSize: 11, fontWeight: 600, color,
        }}>
            {icon}
            {val}
        </div>
    );
}

function EmptyListings() {
    return (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{
                width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Zap size={28} color="#10b981" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
                Henüz Aktif İlan Yok
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
                İlk kanal ilanını sen ver! Yüzlerce potansiyel alıcı seni bekliyor.
            </p>
            <Link href="/dashboard/kanal-sat" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: '#fff', fontWeight: 800, fontSize: 14,
                padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
            }}>
                <DollarSign size={16} /> Hemen İlan Ver
            </Link>
        </div>
    );
}
