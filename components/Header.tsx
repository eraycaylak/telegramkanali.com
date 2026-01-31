import { getCategories } from '@/lib/data';
import HeaderClient from './HeaderClient';
import DynamicLogo from './DynamicLogo';
import { Category } from '@/lib/types';

export default async function Header() {
    let categories: Category[] = [];

    try {
        categories = await getCategories();
    } catch (error) {
        console.error('Header categories fetch error:', error);
        // Fallback to empty array or minimal static list if critical
    }

    return <HeaderClient categories={categories} logo={<DynamicLogo />} />;
}
