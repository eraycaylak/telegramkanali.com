import TrendsAdminClient from './TrendsAdminClient';
import { getTrendsAdmin, getTrendCategories } from '@/app/actions/trends';

export const dynamic = 'force-dynamic';

export default async function TrendsAdminPage() {
    const [trends, categories] = await Promise.all([
        getTrendsAdmin(),
        getTrendCategories()
    ]);

    return (
        <TrendsAdminClient
            initialTrends={trends || []}
            initialCategories={categories || []}
        />
    );
}
