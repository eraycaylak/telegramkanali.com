import { CryptoKeywordPage } from './types';
import { tier1Pages } from './tier1';
import { tier2Pages } from './tier2';
import { tier3Pages } from './tier3';

export type { CryptoKeywordPage };

export const CRYPTO_KEYWORD_PAGES: Record<string, CryptoKeywordPage> = {
  ...tier1Pages,
  ...tier2Pages,
  ...tier3Pages,
};

export function getCryptoKeywordPage(slug: string): CryptoKeywordPage | null {
  return CRYPTO_KEYWORD_PAGES[slug] ?? null;
}

/** Sitemap'a eklenecek tüm kripto slug'ları, priority ile */
export function getCryptoSitemapEntries(): { slug: string; priority: number }[] {
  return Object.entries(CRYPTO_KEYWORD_PAGES).map(([slug, page]) => ({
    slug,
    priority: page.tier === 1 ? 0.98 : page.tier === 2 ? 0.95 : 0.90,
  }));
}

/** generateMetadata için başlık + açıklama */
export function getCryptoMetadata(slug: string) {
  const page = CRYPTO_KEYWORD_PAGES[slug];
  if (!page) return null;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
  };
}
