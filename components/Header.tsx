import { getCategories } from '@/lib/data';
import HeaderClient from './HeaderClient';
import DynamicLogo from './DynamicLogo';

export default async function Header() {
    const categories = await getCategories();

    return <HeaderClient categories={categories} logo={<DynamicLogo />} />;
}
