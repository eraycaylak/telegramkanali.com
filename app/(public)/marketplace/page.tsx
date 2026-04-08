import { getAdminClient } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import {
    Shield, TrendingUp, Users, DollarSign, ArrowRight,
    CheckCircle2, Star, Lock, MessageCircle, Zap,
    BarChart3, Clock, BadgeCheck, Search, Filter,
    ChevronRight, AlertCircle
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Telegram Kanal Alım Satım Marketplace — Escrow Güvenceli | TelegramKanali.com',
    description: 'Türkiye\'nin en güvenilir Telegram kanal alım-satım platformu. Escrow sistemiyle güvende kanal al veya sat. 650K+ aylık ziyaretçi kitlesinden doğrulanan alıcılar.',
    alternates: { canonical: 'https://telegramkanali.com/marketplace' },
};

// JSON-LD structured data
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebPage',
            '@id': 'https://telegramkanali.com/marketplace',
            url: 'https://telegramkanali.com/marketplace',
            name: 'Telegram Kanal Alım Satım Marketplace',
            description: 'Güvenilir escrow sistemiyle Telegram kanal al veya sat.',
            inLanguage: 'tr',
            breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://telegramkanali.com' },
                    { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://telegramkanali.com/marketplace' },
                ],
            },
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Telegram kanal alım satımında escrow ne demek?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Escrow, alıcı parasını ödedikten sonra fonların platform tarafından güvende tutulduğu ve kanal transferi tamamlandıktan sonra satıcıya aktarıldığı bir güvenlik sistemidir. Böylece ne alıcı ne de satıcı dolandırıcılık riskiyle karşılaşır.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Telegram kanal satış komisyonu ne kadar?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'TelegramKanali.com üzerinden gerçekleştirilen her kanal satışında %5 platform komisyonu uygulanır. Satıcı, anlaşılan fiyatın %95\'ini alır.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Telegram kanal transferi nasıl yapılır?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Telegram kanal transferi için kanal sahibinin admin haklarını alıcıya devretmesi ve eski admin\'in kanaldan ayrılması gerekir. Platformumuz bu süreç boyunca her iki tarafı da yönlendirir.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Hangi ödeme yöntemleri kabul ediliyor?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'USDT (TRC-20 veya BEP-20) ve Telegram Yıldız (Stars) ile ödeme yapabilirsiniz. Her iki yöntem de escrow sistemi kapsamındadır.',
                    },
                },
            ],
        },
    ],
};

async function getMarketplaceData() {
    try {
        const db = getAdminClient();
        const [listingsRes, statsRes] = await Promise.all([
            db
                .from('channel_listings')
                .select('*')
                .eq('status', 'active')
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(24),
            db
                .from('marketplace_orders')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'completed'),
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

// Kategori renk eşleşmeleri
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'kripto': { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    'borsa': { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
    'haber': { bg: 'rgba(14,165,233,0.12)', text: '#38bdf8', border: 'rgba(14,165,233,0.25)' },
    'eğlence': { bg: 'rgba(236,72,153,0.12)', text: '#f472b6', border: 'rgba(236,72,153,0.25)' },
    'teknoloji': { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
    'default': { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
};

function getCategoryColor(category: string | null) {
    if (!category) return categoryColors.default;
    const key = Object.keys(categoryColors).find(k => category.toLowerCase().includes(k));
    return key ? categoryColors[key] : categoryColors.default;
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

export default async function MarketplacePage() {
    const { listings, completedOrders, totalListings } = await getMarketplaceData();

    return (
        <>
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #05050f 0%, #0b0b1e 50%, #05050f 100%)' }}>

                {/* ── HERO ─────────────────────────────────────────────── */}
                <section className="relative overflow-hidden px-4 pt-20 pb-24">
                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-20"
                            style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 65%)' }} />
                        <div className="absolute right-0 bottom-0 h-72 w-80 rounded-full opacity-10"
                            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
                    </div>

                    <div className="relative z-10 mx-auto max-w-5xl text-center">
                        {/* Trust badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-widest"
                            style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)', color: '#34d399' }}>
                            <Shield size={12} />
                            Türkiye&apos;nin #1 Güvenilir Telegram Kanal Alım-Satım Platformu
                        </div>

                        {/* H1 */}
                        <h1 className="mb-5 text-4xl font-black leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
                            Telegram Kanalını{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #a78bfa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Güvenle Al ya da Sat
                            </span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
                            Her işlemde <strong className="text-white">Escrow güvencesi</strong> — alıcı öder, transfer tamamlanır,
                            satıcı fonları alır. %5 sabit komisyon, sıfır risk.
                        </p>

                        {/* CTA'lar */}
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <a href="#ilanlar"
                                className="group flex items-center gap-3 rounded-2xl px-7 py-4 text-base font-black text-white shadow-2xl transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 20px 50px rgba(16,185,129,0.35)' }}>
                                <Search size={18} className="relative z-10" />
                                Kanal İlanlarını Gör
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </a>
                            <Link href="/dashboard/kanal-sat"
                                className="flex items-center gap-2 rounded-2xl border px-6 py-4 text-sm font-bold text-slate-300 transition-all hover:text-white hover:border-white/20"
                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <DollarSign size={16} />
                                Kanalımı Sat
                            </Link>
                        </div>

                        {/* Micro stats */}
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={13} className="text-emerald-400" />
                                <span>{completedOrders}+ tamamlanan işlem</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Lock size={13} className="text-emerald-400" />
                                <span>Escrow koruması ile güvenli</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BadgeCheck size={13} className="text-emerald-400" />
                                <span>%5 sabit komisyon</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={13} className="text-emerald-400" />
                                <span>7/24 destek</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── ESCROW NASIL ÇALIŞIR ───────────────────────────── */}
                <section className="px-4 py-16" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-10 text-center">
                            <h2 className="mb-2 text-3xl font-black text-white">Escrow Sistemi Nasıl Çalışır?</h2>
                            <p className="text-sm text-slate-500">Her adımda platform arabulucu — ne alıcı ne satıcı risk altında</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    step: '01',
                                    icon: Search,
                                    color: '#a78bfa',
                                    bg: 'rgba(139,92,246,0.12)',
                                    border: 'rgba(139,92,246,0.25)',
                                    title: 'İlan Seç',
                                    desc: 'İstediğin kanalı istatistikleriyle incele, satıcıya teklif ver.',
                                },
                                {
                                    step: '02',
                                    icon: Lock,
                                    color: '#34d399',
                                    bg: 'rgba(16,185,129,0.12)',
                                    border: 'rgba(16,185,129,0.25)',
                                    title: 'Escrow\'ya Öde',
                                    desc: 'USDT veya Telegram Yıldız ile ödemeyi platforma gönder. Fonlar güvende bekler.',
                                },
                                {
                                    step: '03',
                                    icon: TrendingUp,
                                    color: '#38bdf8',
                                    bg: 'rgba(14,165,233,0.12)',
                                    border: 'rgba(14,165,233,0.25)',
                                    title: 'Kanal Transfer',
                                    desc: 'Satıcı admin haklarını devreder. Platform transferi doğrular.',
                                },
                                {
                                    step: '04',
                                    icon: CheckCircle2,
                                    color: '#fbbf24',
                                    bg: 'rgba(245,158,11,0.12)',
                                    border: 'rgba(245,158,11,0.25)',
                                    title: 'Fonlar Serbest',
                                    desc: 'Transfer onaylandıktan sonra satıcı fonları alır. İşlem tamamdır!',
                                },
                            ].map((s, i) => (
                                <div key={i} className="relative flex flex-col items-center rounded-2xl p-6 text-center"
                                    style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                                    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.15em]"
                                        style={{ color: s.color }}>
                                        {s.step}
                                    </div>
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                                        style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.border}` }}>
                                        <s.icon size={22} style={{ color: s.color }} />
                                    </div>
                                    <div className="mb-2 font-black text-white">{s.title}</div>
                                    <div className="text-xs leading-relaxed text-slate-400">{s.desc}</div>
                                    {i < 3 && (
                                        <ChevronRight
                                            size={18}
                                            className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-slate-700 lg:block"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── AKTİF İLANLAR ────────────────────────────────────── */}
                <section id="ilanlar" className="px-4 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-3xl font-black text-white">
                                    Aktif Kanallar ({totalListings})
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">Hepsi escrow güvenceli — güvenle teklif ver</p>
                            </div>
                            <Link href="/dashboard/kanal-sat"
                                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 8px 24px rgba(16,185,129,0.25)' }}>
                                <DollarSign size={16} />
                                + Kanal İlanı Ver
                            </Link>
                        </div>

                        {listings.length === 0 ? (
                            <EmptyListings />
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {listings.map((listing: any) => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── GÜVEN BADGES ─────────────────────────────────────── */}
                <section className="px-4 pb-20">
                    <div className="mx-auto max-w-4xl rounded-3xl p-8 md:p-10"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div className="mb-6 flex items-center gap-3">
                            <Shield size={22} style={{ color: '#10b981' }} />
                            <h3 className="text-xl font-black text-white">Neden TelegramKanali.com?</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                'Escrow sistemi — ödeme kanal transferinden sonra serbest bırakılır',
                                '650K+ aylık organik ziyaretçi — gerçek alıcı kitlesi',
                                '%5 şeffaf komisyon — gizli ücret yok',
                                'USDT & Telegram Yıldız — iki ödeme seçeneği',
                                '7/24 Telegram destek — anlaşmazlıklarda admin müdahalesi',
                                'Doğrulanmış satıcı ve kanal istatistikleri',
                            ].map(f => (
                                <div key={f} className="flex items-start gap-2 text-sm text-slate-400">
                                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ──────────────────────────────────────────────── */}
                <section className="px-4 pb-24">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-8 text-center text-3xl font-black text-white">
                            Sıkça Sorulan Sorular
                        </h2>
                        <div className="space-y-3">
                            {[
                                {
                                    q: 'Escrow sistemi nedir ve neden gerekli?',
                                    a: 'Escrow, alıcının parasını platforma yatırdığı, kanal transferi tamamlandıktan sonra satıcıya aktarıldığı güvenlik mekanizmasıdır. Böylece ne alıcı kanalı almadan parasını kaybeder, ne de satıcı kanalı devretmeden parasını alamazsın diye endişe eder.',
                                },
                                {
                                    q: 'Telegram kanal satış komisyonu ne kadar?',
                                    a: 'Tüm işlemlerde %5 sabit platform komisyonu uygulanır. Anlaşılan fiyat $1000 ise satıcı $950 alır, platform $50 komisyon alır.',
                                },
                                {
                                    q: 'Kanal transferi nasıl yapılır?',
                                    a: 'Anlaşma sağlandıktan sonra ödeme escrow\'ya yatırılır. Satıcı, kanal admin haklarını alıcıya devreder ve eski admin\'den ayrılır. Platform bu adımları doğrular ve fonları serbest bırakır.',
                                },
                                {
                                    q: 'Hangi ödeme yöntemleri kabul ediliyor?',
                                    a: 'USDT (TRC-20 veya BEP-20) ve Telegram Yıldız (Stars) ile ödeme yapabilirsiniz. Her iki yöntem de escrow sistemi kapsamındadır.',
                                },
                                {
                                    q: 'Kanal ilanı vermek ücretsiz mi?',
                                    a: 'Evet, kanal ilanı vermek tamamen ücretsizdir. Sadece başarılı satış gerçekleştiğinde %5 komisyon ödenir.',
                                },
                                {
                                    q: 'Anlaşmazlık durumunda ne olur?',
                                    a: 'Platform admin ekibi devreye girerek her iki tarafın sunduğu kanıtları inceler ve adil karar verir. Anlaşmazlık sonuçlanana kadar fonlar escrow\'da güvende bekler.',
                                },
                            ].map((item, i) => (
                                <details
                                    key={i}
                                    className="group rounded-2xl overflow-hidden"
                                    style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                                    <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 font-bold text-white">
                                        <span className="flex items-center gap-3 text-sm">
                                            <AlertCircle size={15} className="text-emerald-400 shrink-0" />
                                            {item.q}
                                        </span>
                                        <ChevronRight size={16} className="text-slate-500 transition-transform group-open:rotate-90 shrink-0" />
                                    </summary>
                                    <div className="px-6 pb-4 pt-0 text-sm leading-relaxed text-slate-400">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ─────────────────────────────────────────── */}
                <section className="relative px-4 py-24 text-center">
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-64 w-[600px] rounded-full opacity-10 blur-3xl"
                            style={{ background: 'radial-gradient(ellipse, #10b981, transparent)' }} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="mb-4 text-4xl font-black text-white md:text-5xl">
                            Kanalınızı Satmaya<br />Hazır mısınız?
                        </h2>
                        <p className="mx-auto mb-10 max-w-md text-slate-400">
                            Ücretsiz ilan verin, escrow güvencesiyle güvenle satın.
                            <br />Yüzlerce alıcı sizi bekliyor.
                        </p>
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Link href="/dashboard/kanal-sat"
                                className="group inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-black text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 20px 60px rgba(16,185,129,0.35)' }}>
                                <DollarSign size={22} />
                                Kanal İlanı Ver — Ücretsiz
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            <a href="https://t.me/comtelegramkanali" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-2xl border px-7 py-5 text-sm font-bold text-slate-300 transition-all hover:text-white"
                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <MessageCircle size={18} />
                                Destek Al
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

// ── SUB-COMPONENTS ───────────────────────────────────────────────
function ListingCard({ listing }: { listing: any }) {
    const catColor = getCategoryColor(listing.category);
    const isFeatured = listing.featured;

    return (
        <Link
            href={`/marketplace/${listing.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1"
            style={{
                background: isFeatured
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.04))'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isFeatured ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isFeatured ? '0 0 30px rgba(16,185,129,0.1)' : 'none',
            }}
        >
            {/* Featured badge */}
            {isFeatured && (
                <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                    style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                    ⭐ Öne Çıkan
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
                {/* Kanal avatar + isim */}
                <div className="mb-4 flex items-center gap-3">
                    {listing.channel_image ? (
                        <img
                            src={listing.channel_image}
                            alt={listing.channel_name || listing.title}
                            className="h-12 w-12 rounded-xl object-cover shrink-0"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
                            style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                            {(listing.channel_name || listing.title || 'T')[0].toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-black text-white text-sm leading-tight line-clamp-1">
                            {listing.channel_name || listing.title}
                        </div>
                        {listing.channel_username && (
                            <div className="text-xs text-slate-500 mt-0.5">@{listing.channel_username}</div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                    {listing.member_count > 0 && (
                        <div className="rounded-lg px-3 py-2 text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-sm font-black text-white">{formatMembers(listing.member_count)}</div>
                            <div className="text-[10px] text-slate-500">Üye</div>
                        </div>
                    )}
                    {listing.age_months != null && (
                        <div className="rounded-lg px-3 py-2 text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-sm font-black text-white">{listing.age_months} ay</div>
                            <div className="text-[10px] text-slate-500">Yaş</div>
                        </div>
                    )}
                    {listing.monthly_income_est != null && (
                        <div className="rounded-lg px-3 py-2 text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-sm font-black" style={{ color: '#34d399' }}>
                                ${listing.monthly_income_est.toLocaleString('tr-TR')}
                            </div>
                            <div className="text-[10px] text-slate-500">Aylık Gelir</div>
                        </div>
                    )}
                    {listing.engagement_rate != null && (
                        <div className="rounded-lg px-3 py-2 text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-sm font-black" style={{ color: '#a78bfa' }}>
                                %{listing.engagement_rate}
                            </div>
                            <div className="text-[10px] text-slate-500">Etkileşim</div>
                        </div>
                    )}
                </div>

                {/* Kategori tag */}
                {listing.category && (
                    <div className="mb-4">
                        <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
                            {listing.category}
                        </span>
                    </div>
                )}

                {/* Açıklama */}
                {listing.description && (
                    <p className="mb-4 text-xs leading-relaxed text-slate-500 line-clamp-2 flex-1">
                        {listing.description}
                    </p>
                )}

                {/* Fiyat + CTA */}
                <div className="mt-auto">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <div className="text-xl font-black text-white">
                                {formatPrice(listing.asking_price, listing.currency)}
                            </div>
                            {listing.price_negotiable && (
                                <div className="text-[10px] text-emerald-400">Pazarlık yapılır</div>
                            )}
                        </div>
                        <div className="rounded-full px-2 py-1 text-[10px] font-bold"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                            Escrow Güvenli
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all group-hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                        <BarChart3 size={15} />
                        İncele & Teklif Ver
                    </div>
                </div>
            </div>
        </Link>
    );
}

function EmptyListings() {
    return (
        <div className="py-20 text-center">
            <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <Zap size={32} style={{ color: '#10b981' }} />
                </div>
            </div>
            <h3 className="mb-2 text-xl font-black text-white">Henüz Aktif İlan Yok</h3>
            <p className="mb-6 text-sm text-slate-500">İlk kanal ilanını sen ver! Yüzlerce potansiyel alıcı seni bekliyor.</p>
            <Link href="/dashboard/kanal-sat"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <DollarSign size={16} />
                İlk İlanı Ben Vereyim
            </Link>
        </div>
    );
}
