import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
    if (!text) return '';

    const trMap: { [key: string]: string } = {
        'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u',
        'ş': 's', 'Ş': 's',
        'ı': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ç': 'c', 'Ç': 'c'
    };

    return text
        .split('')
        .map(char => trMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/-+/g, '-')          // Replace multiple - with single -
        .replace(/^-+/, '')           // Trim - from start
        .replace(/-+$/, '');          // Trim - from end
}

export function convertTwitterLinksToEmbeds(content: string): string {
    if (!content) return '';
    
    // href="..." içeriğindekileri dışlayarak sadece metin içerisindeki X (Twitter) URL'lerini ararız
    const regex = /(https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+(?:\?[^\s<"']*)?)/g;
    
    return content.replace(regex, (match, url, offset, string) => {
        // Eğer bu link zaten HTML tag'i içindeyse (özellikle a href="#"), dokunma
        const prefix = string.slice(Math.max(0, offset - 6), offset);
        if (prefix === 'href="') {
            return match;
        }
        // X domainini Twitter domainine çevirerek widgets.js'nin daha stabil çalışmasını sağla
        const twitterUrl = match.replace('x.com', 'twitter.com');
        return `<blockquote class="twitter-tweet" data-theme="light"><a href="${twitterUrl}"></a></blockquote>`;
    });
}
