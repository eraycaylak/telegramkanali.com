import Link from 'next/link';
import { Bell, Send, ChevronRight } from 'lucide-react';

interface BotNotificationCardProps {
    categoryName: string;
    categorySlug: string;
}

const BOT_URL = 'https://t.me/TgChannelsList_bot';

export default function BotNotificationCard({ categoryName, categorySlug }: BotNotificationCardProps) {
    const botLink = `${BOT_URL}?start=notify_${categorySlug}`;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-5 my-4">
            {/* Dekoratif arka plan dairesi */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-blue-100/60" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-indigo-100/50" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* İkon */}
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                    <Bell className="h-6 w-6 text-white" />
                </div>

                {/* Metin */}
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base leading-snug">
                        <span className="text-blue-600">{categoryName}</span> kategorisine yeni kanal eklenince haberdar ol
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Telegram botumuz üzerinden anlık bildirim alın — ücretsiz, tek tık.
                    </p>
                </div>

                {/* CTA Butonu */}
                <Link
                    href={botLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Send className="h-4 w-4" />
                    Bildirim Al
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
