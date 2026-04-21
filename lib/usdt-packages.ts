// USDT paket tanımları — hem server hem client tarafında kullanılabilir
// 'use server' değil, sıradan bir utility modülü

export const USDT_PACKAGES = {
    neon: {
        id: 'neon',
        name: 'NEON',
        tagline: 'Kategori Banner',
        amount_usdt: 15,
        total_views: 10000,
        description: 'Kanalınız hedef kategoride üst banner alanında gösterilir.',
        emoji: '⚡',
    },
    prime: {
        id: 'prime',
        name: 'PRIME',
        tagline: 'Kategori 1. Sıra',
        amount_usdt: 9,
        total_views: 5000,
        description: "Kanalınız seçilen kategorinin kanal listesinin 1. pozisyonuna pin'lenir.",
        emoji: '👑',
    },
    apex: {
        id: 'apex',
        name: 'APEX',
        tagline: 'Anasayfa Banner',
        amount_usdt: 39,
        total_views: 50000,
        description: 'Siteye giren her ziyaretçinin ilk gördüğü anasayfa banner alanı.',
        emoji: '🔱',
    },
} as const;

export type UsdtPackageId = keyof typeof USDT_PACKAGES;
