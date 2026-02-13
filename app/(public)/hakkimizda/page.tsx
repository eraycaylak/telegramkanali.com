import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Hakkımızda - Telegram Kanalları',
    description: 'Türkiye\'nin en büyük Telegram kanal dizini hakkında daha fazla bilgi edinin.',
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Hakkımızda</h1>
                <article className="prose prose-blue max-w-none space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        <strong>TelegramKanali.com</strong>, Türkiye'nin en kapsamlı ve güncel Telegram topluluk rehberidir.
                        Amacımız, kullanıcıların ilgi alanlarına en uygun Telegram kanallarını ve gruplarını kolayca keşfetmelerini sağlamaktır.
                    </p>
                    <p>
                        Platformumuzda haberden eğlenceye, kripto paradan eğitime kadar onlarca farklı kategoride binlerce onaylanmış kanal bulunmaktadır.
                        Her gün yenilenen listelerimizle Telegram dünyasının nabzını tutuyoruz.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Misyonumuz</h2>
                    <p>
                        Kullanıcılarımıza güvenli, temiz ve faydalı bir içerik havuzu sunarak Telegram deneyimlerini zenginleştirmek.
                        Aynı zamanda kanal sahiplerine kitlelerine ulaşmaları için profesyonel bir vitrin sağlamak.
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Neden Biz?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Güncellik:</strong> Kanallarımızı düzenli olarak kontrol ediyor ve aktif olmayanları temizliyoruz.</li>
                        <li><strong>Güvenlik:</strong> Spam veya zararlı içerik barındıran kanalları platformumuza kabul etmiyoruz.</li>
                        <li><strong>Kolay Arama:</strong> Gelişmiş filtreleme ve arama seçenekleriyle aradığınızı saniyeler içinde bulun.</li>
                    </ul>
                </article>
            </main>
            <Footer />
        </>
    );
}
