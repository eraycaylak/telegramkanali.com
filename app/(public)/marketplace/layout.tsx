import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Telegram Kanal Alım Satım — Güvenli Escrow Hizmeti | TelegramKanali.com',
    description: 'Türkiye\'nin #1 güvenilir Telegram kanal alım-satım platformu. Escrow güvenciyle kanal al veya sat. 650K+ aylık ziyaretçi, %100 güvenli transfer, %5 komisyon.',
    keywords: [
        'telegram satılık kanal',
        'telegram kanal satın al',
        'telegram kanal alım satım',
        'telegram kanal escrow',
        'güvenilir telegram kanal satış',
        'telegram kanal değeri',
        'telegram kanal fiyatı',
        'telegram kanal al sat',
        'telegram kanal marketplace',
        'telegram kanal transfer',
    ],
    openGraph: {
        title: 'Telegram Kanal Alım-Satım Platformu — Escrow Güvenciyle',
        description: 'Türkiye\'nin en güvenilir Telegram kanal alım-satım platformu. Her işlemde escrow koruması. 650K+ ziyaretçi kitlesi.',
        url: 'https://telegramkanali.com/marketplace',
        type: 'website',
        siteName: 'TelegramKanali.com',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Telegram Kanal Alım-Satım — Escrow Güvenciyle',
        description: 'Güvenli Telegram kanal alım-satım. Her işlemde escrow koruması.',
    },
    alternates: {
        canonical: 'https://telegramkanali.com/marketplace',
    },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
