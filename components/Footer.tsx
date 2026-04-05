import Link from 'next/link';
import { Send } from 'lucide-react';
import { getCategories } from '@/lib/data';

export default async function Footer() {
    const categories = await getCategories();

    return (
        <footer className="w-full border-t border-gray-100 bg-white pt-8 pb-8 mb-20 md:mb-0">
            <div className="container mx-auto px-4 md:px-6">

                {/* Sponsor links have been removed due to SEO policy */}

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">

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
                            <a href="https://t.me/sibelliee" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors tooltip" aria-label="Telegram">
                                <Send size={20} />
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

                    {/* SEO - Popüler Sayfalar */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-900">Popüler Sayfalar</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/kripto-para" className="hover:text-blue-600 font-medium">Kripto Telegram Kanalları</Link></li>
                            <li><Link href="/egitim-ders" className="hover:text-blue-600">Eğitim Telegram Kanalları</Link></li>
                            <li><Link href="/haber" className="hover:text-blue-600">Haber Telegram Kanalları</Link></li>
                            <li><Link href="/teknoloji" className="hover:text-blue-600">Teknoloji Telegram Kanalları</Link></li>
                            <li><Link href="/spor" className="hover:text-blue-600">Spor Telegram Kanalları</Link></li>
                            <li><Link href="/sohbet" className="hover:text-blue-600">Sohbet Telegram Kanalları</Link></li>
                        </ul>
                    </div>

                    {/* SEO - +18 Sayfaları */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-gray-900">+18 Sayfaları</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/18" className="hover:text-red-600 font-medium transition-colors">+18 Telegram Kanalları</Link></li>
                            <li><Link href="/telegram-18-kanallari" className="hover:text-red-600 transition-colors">Telegram +18 Kanalları</Link></li>
                            <li><Link href="/18-telegram-kanallari" className="hover:text-red-600 transition-colors">+18 Telegram Kanalları Listesi</Link></li>
                            <li><Link href="/18-telegram" className="hover:text-red-600 transition-colors">+18 Telegram</Link></li>
                            <li><Link href="/telegram-ifsa-kanallari" className="hover:text-red-600 transition-colors">Telegram İfşa Kanalları</Link></li>
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
                            <li><Link href="/kunye" className="hover:text-blue-600">Künye (Zorunlu Bilgiler)</Link></li>
                            <li><Link href="/hakkimizda" className="hover:text-blue-600">Hakkımızda</Link></li>
                            <li><Link href="/reklam" className="hover:text-blue-600 font-bold text-blue-600">Reklam Paketleri</Link></li>
                            <li><Link href="/iletisim" className="hover:text-blue-600">İletişim</Link></li>
                            <li><Link href="/gizlilik" className="hover:text-blue-600">Gizlilik Politikası</Link></li>
                            <li><Link href="/kullanim-sartlari" className="hover:text-blue-600">Kullanım Şartları</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-100 pt-6 space-y-4 text-center text-sm text-gray-500">
                    <p className="text-xs text-gray-400 leading-relaxed max-w-3xl mx-auto">
                        ⚠️ Sitemizde listelenen Telegram kanalları ve grupları topluluk tarafından paylaşılmaktadır. 5651 sayılı kanun kapsamında &quot;Yer Sağlayıcı&quot; olarak hizmet vermekteyiz. İçerikler kanal yöneticilerinin sorumluluğundadır. Detaylı bilgi için <a href="/kullanim-sartlari" className="underline hover:text-blue-600">Kullanım Şartları</a> ve <a href="/gizlilik" className="underline hover:text-blue-600">Gizlilik Politikası</a> sayfalarımızı inceleyebilirsiniz.
                    </p>
                    <p>&copy; {new Date().getFullYear()} TelegramKanali.com. Tüm hakları saklıdır. Telegram, Telegram FZ-LLC&apos;nin ticari markasıdır.</p>
                </div>
            </div>
        </footer>
    );
}
