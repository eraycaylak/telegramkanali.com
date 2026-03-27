import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
    const { slug } = await params;

    // Slug'dan okunabilir başlık üret
    const title = slug
        .replace(/-telegram-gruplari$/, ' Telegram Grupları')
        .replace(/-telegram-kanallari$/, ' Telegram Kanalları')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    // Şehir mi, kategori mi anla
    const isCityPage = slug.endsWith('-telegram-gruplari') || slug.endsWith('-telegram-kanallari');
    const accentColor = isCityPage ? '#8b5cf6' : '#3b82f6';
    const label = isCityPage ? '📍 Şehir Sayfası' : '📂 Kategori';

    return new ImageResponse(
        (
            <div
                style={{
                    background: `linear-gradient(135deg, #0f172a 0%, #1a2744 60%, #0f172a 100%)`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '60px',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Arka plan dekor */}
                <div style={{
                    position: 'absolute', top: -80, right: -80,
                    width: 400, height: 400, borderRadius: '50%',
                    background: `${accentColor}22`, display: 'flex',
                }} />
                <div style={{
                    position: 'absolute', top: 40, right: 60,
                    width: 200, height: 200, borderRadius: '50%',
                    background: `${accentColor}11`, display: 'flex',
                }} />

                {/* Site adı sol üst */}
                <div style={{
                    position: 'absolute', top: 48, left: 60,
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: accentColor, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.86 8.76c-.14.62-.54.77-.96.48l-2.64-1.94-1.28 1.22c-.14.14-.26.26-.54.26l.2-2.72 5.04-4.56c.22-.18-.05-.28-.34-.1L7.34 14.7 4.72 13.9c-.62-.2-.64-.62.14-.92l9.84-3.8c.52-.18.98.14.94.62z"/>
                        </svg>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 18, fontWeight: 600 }}>
                        telegramkanali.com
                    </span>
                </div>

                {/* Label badge */}
                <div style={{
                    display: 'flex',
                    background: `${accentColor}33`,
                    border: `1px solid ${accentColor}66`,
                    borderRadius: '999px',
                    padding: '8px 20px',
                    marginBottom: 20,
                }}>
                    <span style={{ color: '#c4b5fd', fontSize: 18, fontWeight: 600 }}>
                        {label}
                    </span>
                </div>

                {/* Ana başlık */}
                <div style={{
                    fontSize: title.length > 30 ? 52 : 68,
                    fontWeight: 900,
                    color: 'white',
                    lineHeight: 1.1,
                    marginBottom: 20,
                    display: 'flex',
                    maxWidth: '900px',
                }}>
                    {title}
                </div>

                {/* Alt bilgi */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    <div style={{
                        width: 4, height: 32, borderRadius: 2,
                        background: accentColor, display: 'flex',
                    }} />
                    <span style={{ color: '#64748b', fontSize: 20 }}>
                        Türkiye&apos;nin #1 Telegram Kanal Dizini
                    </span>
                </div>
            </div>
        ),
        { ...size }
    );
}
