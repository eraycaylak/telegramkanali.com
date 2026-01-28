export interface Channel {
    id: string;
    name: string;
    slug: string;
    description: string; // Rich text or long string
    category: string; // ID of the category
    subcategories: string[];
    joinLink: string;
    stats: {
        subscribers: string; // string to handle "1.2K" formatting or number
        files?: number;
    };
    image: string; // URL to logo
    tags: string[];
    verified: boolean;
    featured: boolean;
    language: string;
    createdAt: string;
    rating?: number; // 1-5
    score?: number;
    categoryName?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    subcategories: string[];
    icon: string; // Lucide icon name or emoji
}
