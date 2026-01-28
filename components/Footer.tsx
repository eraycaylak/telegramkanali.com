import Link from 'next/link';
import { Send, Github, Twitter } from 'lucide-react';
import { categories } from '@/lib/data';

export default function Footer() {
    return (
        <footer className="w-full border-t border-gray-100 bg-white pt-12 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

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
                            <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                                <Github size={20} />
                            </Link>
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
                            <li><Link href="/iletisim" className="hover:text-blue-600">İletişim & Reklam</Link></li>
                            <li><Link href="/gizlilik" className="hover:text-blue-600">Gizlilik Politikası</Link></li>
                            <li><Link href="/kullanim-sartlari" className="hover:text-blue-600">Kullanım Şartları</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} TelegramKanali.com. Tüm hakları saklıdır. Telegram, Telegram FZ-LLC'nin ticari markasıdır.</p>
                </div>
            </div>
        </footer>
    );
}
