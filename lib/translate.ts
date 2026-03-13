/**
 * Translation engine using Google Translate free API.
 * Results are cached in Supabase to avoid repeated API calls.
 */

/**
 * Translates a string from Turkish to English using the unofficial Google Translate endpoint.
 * No API key required.
 */
export async function translateText(text: string, from = 'tr', to = 'en'): Promise<string> {
    if (!text || text.trim() === '') return text;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            next: { revalidate: 86400 } // Cache for 24 hours via Next.js fetch cache
        });

        if (!response.ok) {
            console.error('Translation API error:', response.status);
            return text; // Fallback to original
        }

        const data = await response.json();

        // Google returns a nested array; join all translated segments
        const translatedParts: string[] = [];
        if (data && data[0]) {
            for (const part of data[0]) {
                if (part && part[0]) {
                    translatedParts.push(part[0]);
                }
            }
        }

        return translatedParts.join('') || text;
    } catch (error) {
        console.error('Translation failed:', error);
        return text; // Fallback to original on error
    }
}

/**
 * Translates multiple strings in batch.
 */
export async function translateBatch(
    texts: Record<string, string>,
    from = 'tr',
    to = 'en'
): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
        Object.entries(texts).map(async ([key, value]) => {
            results[key] = await translateText(value, from, to);
        })
    );

    return results;
}
