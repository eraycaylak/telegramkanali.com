import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'İletişim | TelegramKanali.com',
    description: 'Bizimle iletişime geçmek için Kanal Ekle formunu kullanabilirsiniz.',
    alternates: {
        canonical: 'https://telegramkanali.com/kanal-ekle',
    },
};

export default function IletisimPage() {
    redirect('/kanal-ekle');
}
