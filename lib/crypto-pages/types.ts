export interface CryptoFaq {
  question: string;
  answer: string;
}

export interface CryptoKeywordPage {
  h1: string;
  title: string;
  description: string;
  intro: string;         // 300+ kelime HTML değil düz metin
  icon: string;
  color: string;         // Tailwind gradient class başlangıcı
  keywords: string[];
  faqs: CryptoFaq[];
  relatedSlugs: string[];
  tier: 1 | 2 | 3;
}
