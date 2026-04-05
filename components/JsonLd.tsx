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
        "description": "Türkiye'nin en kapsamlı Telegram kanal dizini. Haber, kripto, +18, eğitim ve indirim kanallarını keşfedin.",
        "inLanguage": "tr-TR",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/?q={search_term_string}`
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
        "alternateName": "TelegramKanali.com",
        "url": baseUrl,
        "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/images/logo.png`,
            "width": 200,
            "height": 200
        },
        "sameAs": [
            "https://t.me/telegramkanali"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["Turkish", "English"],
            "areaServed": "TR"
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

export function generateCollectionPageSchema(
    name: string,
    description: string,
    url: string,
    itemCount: number,
    baseUrl: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "description": description,
        "url": url,
        "inLanguage": "tr-TR",
        "numberOfItems": itemCount,
        "publisher": {
            "@type": "Organization",
            "name": "TelegramKanali.com",
            "url": baseUrl,
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Anasayfa", "item": baseUrl },
                { "@type": "ListItem", "position": 2, "name": name, "item": url }
            ]
        }
    };
}

export function generateChannelSchema(channel: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    member_count?: number;
    categoryName?: string;
    created_at?: string;
    telegram_url?: string;
}, baseUrl: string) {
    const channelUrl = `${baseUrl}/${channel.slug}`;
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": channelUrl,
                "url": channelUrl,
                "name": `${channel.name} Telegram Kanalı`,
                "description": channel.description || `${channel.name} Telegram kanalına katılın. Üye sayısı: ${channel.member_count?.toLocaleString('tr-TR') || '0'}`,
                "inLanguage": "tr-TR",
                "image": channel.image || `${baseUrl}/images/logo.png`,
                "datePublished": channel.created_at || new Date().toISOString(),
                "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Anasayfa", "item": baseUrl },
                        ...(channel.categoryName ? [{ "@type": "ListItem", "position": 2, "name": channel.categoryName, "item": `${baseUrl}/${channel.categoryName?.toLowerCase().replace(/ /g, '-')}` }] : []),
                        { "@type": "ListItem", "position": channel.categoryName ? 3 : 2, "name": channel.name, "item": channelUrl },
                    ]
                },
                "isPartOf": { "@id": baseUrl }
            },
            {
                "@type": "Organization",
                "@id": `${channelUrl}#organization`,
                "name": channel.name,
                "description": channel.description || `${channel.name} resmi Telegram kanalı`,
                "url": channel.telegram_url || `https://t.me/${channel.slug}`,
                "logo": channel.image || `${baseUrl}/images/logo.png`,
                "sameAs": [channel.telegram_url || `https://t.me/${channel.slug}`],
                "interactionStatistic": {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/FollowAction",
                    "userInteractionCount": channel.member_count || 0
                }
            }
        ]
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



export function generateSiteLinksSearchBoxSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": baseUrl,
        "potentialAction": [
            {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${baseUrl}/?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        ]
    };
}

export function generateAggregateRatingSchema(channel: {
    name: string;
    slug: string;
    description?: string;
    score?: number;
    voteCount?: number;
}, baseUrl: string) {
    const rating = channel.score !== undefined
        ? Math.min(5, Math.max(1, 3 + (channel.score / 20))).toFixed(1)
        : '4.0';
    const count = Math.max(channel.voteCount || 1, 5);

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${channel.name} Telegram Kanalı`,
        "description": channel.description || `${channel.name} Telegram kanalı`,
        "url": `${baseUrl}/${channel.slug}`,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": count
        }
    };
}
