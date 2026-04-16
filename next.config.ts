import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Compress responses
  compress: true,
  // Power by header'ı gizle
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.telegram.org' },
      { protocol: 'https', hostname: 't.me' },
      { protocol: 'https', hostname: 'cdn4.telesco.pe' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
    // WebP/AVIF formatlarını etkinleştir
    formats: ['image/avif', 'image/webp'],
    // Cache süresi (1 yıl)
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Güvenlik başlıkları
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Statik varlıklar için uzun süre cache
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // /kategori/slug → /slug pattern redirect (eski URL yapısı)
      { source: '/kategori/:slug', destination: '/:slug', permanent: true },

      // ================================================================
      // İFŞA URL'LERİ — 301 Kalıcı Yönlendirme (TCK 134/2 uyumluluk)
      // Bu URL'ler artık silinmiştir. SEO juice /telegram-18-kanallari'ya aktarılır.
      // Tarih: 2026-04-17
      // ================================================================
      { source: '/telegram-ifsa-kanallari',       destination: '/telegram-18-kanallari', permanent: true },
      { source: '/telegram-unlu-ifsa-kanallari',  destination: '/telegram-18-kanallari', permanent: true },
      { source: '/telegram-18-ifsa-kanallari',    destination: '/telegram-18-kanallari', permanent: true },
      { source: '/telegram-turk-ifsa-kanallari',  destination: '/telegram-18-kanallari', permanent: true },
      { source: '/telegram-ifsa',                 destination: '/telegram-18-kanallari', permanent: true },
    ];
  },
};

export default nextConfig;
