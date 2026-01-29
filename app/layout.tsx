import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd, { generateWebsiteSchema, generateOrganizationSchema } from "@/components/JsonLd";
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
  description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
  keywords: ["telegram kanalları", "telegram grupları", "telegram türkiye", "telegram haber", "telegram kripto", "telegram indirim"],
  authors: [{ name: "Telegram Kanalları" }],
  creator: "Telegram Kanalları",
  publisher: "Telegram Kanalları",
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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: baseUrl,
    siteName: "Telegram Kanalları",
    title: "Telegram Kanalları | Türkiye'nin En Güncel Kanal Dizini",
    description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Telegram Kanalları",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Telegram Kanalları | Türkiye'nin En Güncel Kanal Dizini",
    description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin.",
    images: ["/og-image.png"],
    creator: "@telegramkanali",
  },
  alternates: {
    canonical: baseUrl,
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
        {/* Global Structured Data */}
        <JsonLd data={generateWebsiteSchema(baseUrl)} />
        <JsonLd data={generateOrganizationSchema(baseUrl)} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        {/* Google Analytics */}
        <GoogleAnalytics gaId="G-ZORUNLU_DEGIL_ORNEK" />

        {children}
      </body>
    </html>
  );
}
