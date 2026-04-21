import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import CookieConsent from "@/components/CookieConsent";
import LivePresenceTracker from "@/components/LivePresenceTracker";

import JsonLd, { generateWebsiteSchema, generateOrganizationSchema } from "@/components/JsonLd";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://telegramkanali.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Telegram Kanalları | Türkiye'nin En Güncel Kanal Dizini",
    template: "%s | Telegram Kanalları"
  },
  description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Telegram +18 kanalları, Haber, Kripto, Eğitim ve İndirim kanal listesi. 2026 güncel rehber.",
  keywords: [
    "telegram kanalları", "telegram grupları", "telegram türkiye",
    "telegram +18 kanalları", "+18 telegram kanalları", "+18 telegram",
    "telegram 18 kanalları", "telegram haber", "telegram kripto",
    "telegram indirim", "en iyi telegram kanalları", "telegram kanal listesi",
    "telegram 2026", "telegram ifşa kanalları", "yetişkin telegram kanalları"
  ],
  authors: [{ name: "Telegram Kanalları", url: baseUrl }],
  creator: "Telegram Kanalları",
  publisher: "Telegram Kanalları",
  category: "directory",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "20wFKvwbMw7FX5yNiIFQTHkMU20H9EG57RtYbRIhgJQ",
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: baseUrl,
    siteName: "Telegram Kanalları",
    title: "Telegram Kanalları | Türkiye'nin En Güncel Kanal Dizini",
    description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Telegram Kanalları - Türkiye'nin En Büyük Kanal Dizini",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Telegram Kanalları | Türkiye'nin En Güncel Kanal Dizini",
    description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin.",
    images: ["/og-image.png"],
    creator: "@telegramkanali",
    site: "@telegramkanali",
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'tr': baseUrl,
      'en': `${baseUrl}/en`,
      'x-default': baseUrl,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Preconnect - Kritik 3. taraf kaynaklar için bağlantı ön açma */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://t.me" />
        <link rel="dns-prefetch" href="https://cdn4.telesco.pe" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        {/* PWA & Mobile App Meta */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TelegramKanali" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        {/* Global Structured Data */}
        <JsonLd data={generateWebsiteSchema(baseUrl)} />
        <JsonLd data={generateOrganizationSchema(baseUrl)} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden w-full max-w-[100vw]`}
      >
        {/* Navigation Progress Bar */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-N9BJQBE7BB" />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <CookieConsent />
        <LivePresenceTracker />

        {children}

      </body>
    </html>
  );
}
