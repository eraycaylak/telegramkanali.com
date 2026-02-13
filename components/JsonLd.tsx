// JsonLd Component for Structured Data (Server Component)

interface JsonLdProps {
    data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Pre-built schema generators
export function generateWebsiteSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Telegram Kanalları",
        "alternateName": "TelegramKanali.com",
        "url": baseUrl,
        "description": "Türkiye'nin en kapsamlı Telegram kanal dizini. Haber, kripto, eğitim ve indirim kanallarını keşfedin.",
        "inLanguage": "tr-TR",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/ara?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}

export function generateOrganizationSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Telegram Kanalları",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "sameAs": [
            "https://t.me/telegramkanali"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Turkish"
        }
    };
}

export function generateBreadcrumbSchema(items: Array<{ name: string, url: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

export function generateChannelSchema(channel: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    member_count?: number;
    categoryName?: string;
}, baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "SocialMediaPosting",
        "name": channel.name,
        "description": channel.description || `${channel.name} Telegram kanalı`,
        "url": `${baseUrl}/${channel.slug}`,
        "image": channel.image || `${baseUrl}/logo.png`,
        "author": {
            "@type": "Organization",
            "name": channel.name
        },
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/FollowAction",
            "userInteractionCount": channel.member_count || 0
        },
        "keywords": [channel.categoryName, "telegram", "kanal", channel.name].filter(Boolean).join(", ")
    };
}

export function generateItemListSchema(items: Array<{ name: string, url: string, position: number }>, listName: string) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": listName,
        "numberOfItems": items.length,
        "itemListElement": items.map((item) => ({
            "@type": "ListItem",
            "position": item.position,
            "item": {
                "@type": "WebPage",
                "@id": item.url,
                "name": item.name,
                "url": item.url
            }
        }))
    };
}

export function generateFAQSchema(faqs: Array<{ question: string, answer: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}
