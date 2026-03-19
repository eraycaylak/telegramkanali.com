/**
 * UI String translations for TR and EN locales.
 * Used in components to avoid repeating translated strings.
 */
export type Locale = 'tr' | 'en';

export const translations = {
    tr: {
        // Header / Navigation
        addChannel: '+ KANAL EKLE',
        login: 'GİRİŞ YAP',
        panel: 'PANEL',
        logout: 'ÇIKIŞ YAP',
        search: 'Aradığınız grubu yazınız...',
        allCategories: 'Tüm Kategoriler',
        webmaster: 'WEBMASTER',
        advertise: 'REKLAM VER',

        // Channel Detail
        joinChannel: 'KANALA KATIL',
        join: 'KATIL',
        members: 'Abone',
        rating: 'Puan',
        clicks: 'Tıklama',
        status: 'Durum',
        active: 'Aktif',
        about: 'Kanal Hakkında',
        security: 'Güvenlik Kontrolü',
        spamChecked: 'Spam kontrolü yapıldı',
        verified: 'İçerik doğrulandı',
        activeSharing: 'Aktif paylaşım',
        share: 'Arkadaşlarınla Paylaş',
        similarChannels: 'Benzer {category} Kanalları',
        viewAll: 'Tümünü Gör',
        advertiseHere: 'Reklam Vermek İster misiniz?',
        advertiseDesc: 'Kanalınızı binlerce kişiye tanıtın.',
        contact: 'İLETİŞİME GEÇİN',

        // Channel Card
        goToChannel: 'Kanala Git',
        voteUp: 'Beğen',
        voteDown: 'Beğenme',

        // Comments
        commentsTitle: 'Kullanıcı Yorumları',
        commentsDesc: 'Bu kanal hakkında ne düşünüyorsunuz?',
        nameLabel: 'Adınız',
        commentLabel: 'Yorum',
        submitComment: 'Yorum Gönder',
        commentPending: 'Yorumunuz incelendikten sonra yayınlanacaktır.',
        commentError: 'Bir hata oluştu.',
        noComments: 'Henüz yorum yok. İlk yorumu siz yapın!',

        // Category Page
        telegramChannels: 'Telegram Kanalları',
        categories: 'Kategoriler',
        channels: 'Kanal',
        verified2026: 'Doğrulanmış',
        updated: 'Güncel',
        popularCategories: 'Popüler Kategoriler',

        // Footer / General
        home: 'Anasayfa',
        category: 'Kategori',

        // Report / Activity
        reportStatus: 'Bu kanal aktif mi?',
        reportActive: '✅ Aktif',
        reportInactive: '❌ Pasif',
        reportSent: 'Bildiriminiz alındı, teşekkürler!',
    },
    en: {
        // Header / Navigation
        addChannel: '+ ADD CHANNEL',
        login: 'LOG IN',
        panel: 'PANEL',
        logout: 'LOG OUT',
        search: 'Search for a channel or group...',
        allCategories: 'All Categories',
        webmaster: 'WEBMASTER',
        advertise: 'ADVERTISE',

        // Channel Detail
        joinChannel: 'JOIN CHANNEL',
        join: 'JOIN',
        members: 'Members',
        rating: 'Rating',
        clicks: 'Clicks',
        status: 'Status',
        active: 'Active',
        about: 'About Channel',
        security: 'Security Check',
        spamChecked: 'Spam check passed',
        verified: 'Content verified',
        activeSharing: 'Actively posting',
        share: 'Share with Friends',
        similarChannels: 'Similar {category} Channels',
        viewAll: 'View All',
        advertiseHere: 'Want to Advertise?',
        advertiseDesc: 'Promote your channel to thousands.',
        contact: 'CONTACT US',

        // Channel Card
        goToChannel: 'Go to Channel',
        voteUp: 'Like',
        voteDown: 'Dislike',

        // Comments
        commentsTitle: 'User Reviews',
        commentsDesc: 'What do you think about this channel?',
        nameLabel: 'Your Name',
        commentLabel: 'Comment',
        submitComment: 'Submit Review',
        commentPending: 'Your comment will be published after review.',
        commentError: 'An error occurred.',
        noComments: 'No reviews yet. Be the first!',

        // Category Page
        telegramChannels: 'Telegram Channels',
        categories: 'Categories',
        channels: 'Channel',
        verified2026: 'Verified',
        updated: 'Updated',
        popularCategories: 'Popular Categories',

        // Footer / General
        home: 'Home',
        category: 'Category',

        // Report / Activity
        reportStatus: 'Is this channel active?',
        reportActive: '✅ Active',
        reportInactive: '❌ Inactive',
        reportSent: 'Thank you for your report!',
    }
} as const;

export type TranslationKey = keyof typeof translations.tr;

/**
 * Get translation for a given key and locale.
 */
export function t(key: TranslationKey, locale: Locale = 'tr'): string {
    return translations[locale][key] as string ?? translations.tr[key] as string ?? key;
}

/**
 * Get the full translation object for a locale.
 */
export function useT(locale: Locale) {
    return translations[locale];
}
