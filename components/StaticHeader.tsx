import HeaderClient from './HeaderClient';
import DynamicLogo from './DynamicLogo';
import { Category } from '@/lib/types';

// Static categories for 404 page (avoids DB connection during build)
const staticCategories: Category[] = [
    { id: '1', name: 'Haber & Gündem', slug: 'haber-gundem', description: '', icon: '📰', subcategories: [] },
    { id: '2', name: 'Kripto Para', slug: 'kripto-para', description: '', icon: '💰', subcategories: [] },
    { id: '3', name: 'Teknoloji', slug: 'teknoloji', description: '', icon: '💻', subcategories: [] },
    { id: '4', name: 'Eğitim', slug: 'egitim', description: '', icon: '🎓', subcategories: [] },
];

export default function StaticHeader() {
    return <HeaderClient categories={staticCategories} logo={<DynamicLogo />} />;
}
