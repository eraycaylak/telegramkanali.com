export interface Channel {
    id: string;
    name: string;
    slug: string;
    description: string;
    category_id: string; // Foreign Key to categories
    categoryName?: string; // Mapped field
    subcategories: string[];
    join_link: string;
    stats: {
        subscribers: string;
        files?: number;
    };
    image: string;
    tags: string[];
    verified: boolean;
    featured: boolean;
    language: string;
    created_at?: string; // DB timestamp
    rating?: number;
    score?: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    subcategories: string[];
    icon: string; // Lucide icon name or emoji
}
