import { getActiveTrends, getActiveTrendCategories } from '@/app/actions/trendsPublic';
import TrendsClient from './TrendsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Günün Trendleri ve Öne Çıkanlar | TelegramKanali',
    description: 'Sosyal medya trendleri (Tiktok, Instagram, Youtube), Türkiye gündemi ve daha fazlası. Günün en çok konuşulan konuları ve hashtagleri.',
    alternates: {
        canonical: 'https://www.telegramkanali.com/trends'
    }
};

export const revalidate = 60; // Revalidate every minute

export default async function TrendsPage() {
    const [trends, categories] = await Promise.all([
        getActiveTrends(),
        getActiveTrendCategories()
    ]);

    return (
        <TrendsClient 
            initialTrends={trends || []} 
            initialCategories={categories || []} 
        />
    );
}
