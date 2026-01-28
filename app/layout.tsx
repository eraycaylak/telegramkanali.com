import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Telegram Kanalları | Türkiye'nin En Güncel Kanal Dizini",
  description: "En iyi Telegram kanalları, grupları ve botlarını keşfedin. Haber, Kripto, Eğitim ve İndirim kanalları listesi.",
  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_KODUNUZ_BURAYA",
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        {/* Google Analytics ID - Buraya kendi ID'nizi yazın örn: G-XXXXXXXXXX */}
        <GoogleAnalytics gaId="G-ZORUNLU_DEGIL_ORNEK" />

        {/* Google Analytics ID - Buraya kendi ID'nizi yazın örn: G-XXXXXXXXXX */}
        <GoogleAnalytics gaId="G-ZORUNLU_DEGIL_ORNEK" />

        {children}
      </body>
    </html>
  );
}
