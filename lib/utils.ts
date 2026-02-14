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
