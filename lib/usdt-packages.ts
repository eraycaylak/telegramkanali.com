// Jeton reklam paket tanımları — hem server hem client tarafında kullanılabilir
// 'use server' değil, sıradan bir utility modülü

export interface JetonPackage {
    id: string;
    tokens: number;
    price_tl: number;
    views: number;
    label: string;
}

export const JETON_PACKAGES: Record<string, JetonPackage> = {
    jeton_50:    { id: 'jeton_50',    tokens: 50,    price_tl: 127.89,   views: 5000,    label: '5.000 kişiye gösterim' },
    jeton_100:   { id: 'jeton_100',   tokens: 100,   price_tl: 243.60,   views: 10000,   label: '10.000 kişiye gösterim' },
    jeton_250:   { id: 'jeton_250',   tokens: 250,   price_tl: 567.99,   views: 25000,   label: '25.000 kişiye gösterim' },
    jeton_500:   { id: 'jeton_500',   tokens: 500,   price_tl: 1217.59,  views: 50000,   label: '50.000 kişiye gösterim' },
    jeton_800:   { id: 'jeton_800',   tokens: 800,   price_tl: 1798.99,  views: 80000,   label: '80.000 kişiye gösterim' },
    jeton_1000:  { id: 'jeton_1000',  tokens: 1000,  price_tl: 2029.59,  views: 100000,  label: '100.000 kişiye gösterim' },
    jeton_1500:  { id: 'jeton_1500',  tokens: 1500,  price_tl: 3044.59,  views: 150000,  label: '150.000 kişiye gösterim' },
    jeton_2000:  { id: 'jeton_2000',  tokens: 2000,  price_tl: 3775.39,  views: 200000,  label: '200.000 kişiye gösterim' },
    jeton_3000:  { id: 'jeton_3000',  tokens: 3000,  price_tl: 5277.59,  views: 300000,  label: '300.000 kişiye gösterim' },
    jeton_4000:  { id: 'jeton_4000',  tokens: 4000,  price_tl: 6901.59,  views: 400000,  label: '400.000 kişiye gösterim' },
    jeton_5000:  { id: 'jeton_5000',  tokens: 5000,  price_tl: 8038.39,  views: 500000,  label: '500.000 kişiye gösterim' },
    jeton_6000:  { id: 'jeton_6000',  tokens: 6000,  price_tl: 9134.59,  views: 600000,  label: '600.000 kişiye gösterim' },
    jeton_10000: { id: 'jeton_10000', tokens: 10000, price_tl: 15021.59, views: 1000000, label: '1.000.000 kişiye gösterim' },
    jeton_20000: { id: 'jeton_20000', tokens: 20000, price_tl: 28419.59, views: 2000000, label: '2.000.000 kişiye gösterim' },
    jeton_30000: { id: 'jeton_30000', tokens: 30000, price_tl: 41411.59, views: 3000000, label: '3.000.000 kişiye gösterim' },
} as const;

// Geriye uyumluluk için eski USDT_PACKAGES export'unu da ekle
export const USDT_PACKAGES = JETON_PACKAGES;

export type JetonPackageId = keyof typeof JETON_PACKAGES;
export type UsdtPackageId = JetonPackageId; // geriye uyumluluk
