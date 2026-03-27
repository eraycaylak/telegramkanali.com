import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Telegram Kanalları - Türkiye'nin En Büyük Kanal Dizini";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Background pattern circles */}
                <div style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: -150,
                    left: -100,
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                }} />

                {/* Telegram Icon */}
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 32,
                    boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4)',
                }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.86 8.76c-.14.62-.54.77-.96.48l-2.64-1.94-1.28 1.22c-.14.14-.26.26-.54.26l.2-2.72 5.04-4.56c.22-.18-.05-.28-.34-.1L7.34 14.7 4.72 13.9c-.62-.2-.64-.62.14-.92l9.84-3.8c.52-.18.98.14.94.62z"/>
                    </svg>
                </div>

                {/* Main Title */}
                <div style={{
                    fontSize: 72,
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-2px',
                    textAlign: 'center',
                    lineHeight: 1,
                    marginBottom: 16,
                    display: 'flex',
                }}>
                    Telegram{' '}
                    <span style={{ color: '#60a5fa', marginLeft: 12 }}>Kanalları</span>
                </div>

                {/* Subtitle */}
                <div style={{
                    fontSize: 28,
                    color: '#94a3b8',
                    textAlign: 'center',
                    marginBottom: 40,
                    display: 'flex',
                }}>
                    Türkiye&apos;nin #1 Telegram Kanal Dizini
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'flex',
                    gap: 32,
                    marginBottom: 40,
                }}>
                    {[
                        { label: 'Kanal', value: '10.000+' },
                        { label: 'Kategori', value: '50+' },
                        { label: 'Günlük Ziyaretçi', value: '100K+' },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '16px',
                            padding: '16px 28px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <span style={{ color: '#60a5fa', fontSize: 28, fontWeight: 900, display: 'flex', justifyContent: 'center' }}>{stat.value}</span>
                            <span style={{ color: '#94a3b8', fontSize: 16, marginTop: 4, display: 'flex', justifyContent: 'center' }}>{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* URL Badge */}
                <div style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '999px',
                    padding: '10px 28px',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <span style={{ color: '#60a5fa', fontSize: 22, fontWeight: 700 }}>
                        telegramkanali.com
                    </span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
