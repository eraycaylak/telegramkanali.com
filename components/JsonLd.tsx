// JsonLd Component for Structured Data (Server Component)

interface JsonLdProps {
    data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
    // Escape < to \u003c to prevent XSS and HTML mismatch from </script> tags in text
    const safeData = JSON.stringify(data).replace(/</g, '\\u003c');
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeData }}
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
                "description": channel.description || `${channel.name} Telegram kanalına katılın. Üye sayısı: ${channel.member_count ? channel.member_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0'}`,
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
        "isPartOf": {
            "@type": "WebSite",
            "name": "Telegram Kanallar\u0131",
            "url": baseUrl
        }
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
                    "urlTemplate": `${baseUrl}/ara?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        ]
    };
}
