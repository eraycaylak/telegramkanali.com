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
    member_count?: number; // Fetched from Telegram API
    seo_description?: string;
    target_audience?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'inactive';
    contact_info?: string;
    owner_id?: string;
    bot_token?: string;
    bot_enabled?: boolean;
    telegram_chat_id?: string;
    clicks?: number;
    city?: string; // Şehir bazlı programatik SEO
    // Advertisement fields
    ad_start_date?: string;
    ad_end_date?: string;
    ad_type?: string;
    ad_notes?: string;
    // English translations (auto-generated)
    name_en?: string;
    description_en?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    subcategories: string[];
    icon: string; // Lucide icon name or emoji
    seo_intro?: string;
    seo_title?: string;
    seo_description?: string;
    // English translations (auto-generated)
    name_en?: string;
    description_en?: string;
    seo_intro_en?: string;
}

export interface SeoPage {
    id: string;
    slug: string;
    title: string;
    meta_description?: string;
    h1: string;
    content: {
        intro?: string;
        sections?: Array<{
            heading: string;
            body: string;
        }>;
        faqs?: Array<{
            question: string;
            answer: string;
        }>;
    };
    related_categories?: string[];
    target_keywords?: string[];
    word_count?: number;
    published: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Banner {
    id: string;
    type: string;
    category_id?: string | null;
    title: string | null;
    subtitle?: string | null;
    image_url?: string | null;
    link_url?: string | null;
    bg_color?: string | null;
    text_color?: string | null;
    button_text?: string | null;
    badge_text?: string | null;
    badge_bg_color?: string | null;
    floating_logo_url?: string | null;
    text_align?: string | null;
    font_size?: string | null;
    display_order: number;
    active: boolean;
    created_at?: string;
    image_alignment?: 'top' | 'center' | 'bottom' | null;
    aspect_ratio?: string | null;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    cover_image?: string;
    category?: string;
    tags: string[];
    author: string;
    published: boolean;
    featured: boolean;
    view_count: number;
    reading_time?: number;
    meta_title?: string;
    meta_description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TrendCategory {
    id: string;
    name: string;
    slug: string;
    order_index: number;
    subcategories: string[];
    created_at?: string;
}

export interface Trend {
    id: string;
    title: string;
    slug: string;
    content: string;
    category_id: string;
    subcategory?: string;
    categoryName?: string;
    image?: string;
    view_count: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface UserPermissions {
    manage_blog: boolean;
    manage_channels: boolean;
    manage_categories: boolean;
    manage_banners: boolean;
    manage_users: boolean;
    view_analytics: boolean;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: 'user' | 'admin' | 'editor';
    balance: number;
    permissions?: UserPermissions;
    created_at: string;
}
