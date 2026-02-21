import Link from 'next/link';
import { Send } from 'lucide-react';
import { getCategories } from '@/lib/data';

export default async function Footer() {
    const categories = await getCategories();

    return (
        <footer className="w-full border-t border-gray-100 bg-white pt-12 pb-8 mb-20 md:mb-0">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">

                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                                <Send size={18} className="-ml-0.5 mt-0.5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                Telegram<span className="text-blue-500">Kanali</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                            Türkiye'nin en büyük ve en güncel Telegram kanal dizini. Harika toplulukları keşfedin, kanalınızı tanıtın ve büyütün.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/telegramkanaliofficial" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors tooltip" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a href="https://t.me/Errccyy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors tooltip" aria-label="Telegram">
                                <Send size={20} />
                            </a>
                            <a href="https://wa.me/905427879595" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500 transition-colors tooltip" aria-label="WhatsApp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-900">Popüler Kategoriler</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {categories.slice(0, 5).map((cat) => (
                                <li key={cat.id}>
                                    <Link href={`/${cat.slug}`} className="hover:text-blue-600 transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* SEO Rehberleri - YENİ */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-900">Telegram Rehberleri</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/rehber/telegram-kanallari-rehberi" className="hover:text-blue-600 font-medium">📚 Telegram Kanalları Rehberi</Link></li>
                            <li><Link href="/rehber/telegram-kanallari-nedir" className="hover:text-blue-600">Telegram Kanalları Nedir?</Link></li>
                            <li><Link href="/rehber/en-iyi-telegram-kanallari" className="hover:text-blue-600">En İyi Telegram Kanalları</Link></li>
                            <li><Link href="/rehber/telegram-kripto-kanallari" className="hover:text-blue-600">Kripto Telegram Kanalları</Link></li>
                            <li><Link href="/rehber/ucretsiz-telegram-kanallari" className="hover:text-blue-600">Ücretsiz Telegram Kanalları</Link></li>
                            <li><Link href="/rehber/turk-telegram-kanallari" className="hover:text-blue-600">Türk Telegram Kanalları</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-900">Hızlı Erişim</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/yeni-eklenenler" className="hover:text-blue-600">Yeni Kanallar</Link></li>
                            <li><Link href="/one-cikanlar" className="hover:text-blue-600">Öne Çıkanlar</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-600">Blog & İpuçları</Link></li>
                            <li><Link href="/kanal-ekle" className="hover:text-blue-600">Kanal Ekle</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-900">Kurumsal</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/hakkimizda" className="hover:text-blue-600">Hakkımızda</Link></li>
                            <li><Link href="/reklam" className="hover:text-blue-600 font-bold text-blue-600">Reklam Paketleri</Link></li>
                            <li><Link href="/iletisim" className="hover:text-blue-600">İletişim</Link></li>
                            <li><Link href="/gizlilik" className="hover:text-blue-600">Gizlilik Politikası</Link></li>
                            <li><Link href="/kullanim-sartlari" className="hover:text-blue-600">Kullanım Şartları</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-100 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} TelegramKanali.com. Tüm hakları saklıdır. Telegram, Telegram FZ-LLC'nin ticari markasıdır.</p>
                </div>
            </div>
        </footer>
    );
}
