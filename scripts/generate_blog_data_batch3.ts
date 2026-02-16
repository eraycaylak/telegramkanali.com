import * as fs from 'fs';
import * as path from 'path';

// Helper to escape SQL strings
function escapeSql(str: string): string {
    return str.replace(/'/g, "''");
}

const CATEGORIES = [
    'Haber', 'Rehber', 'İpucu', 'Teknoloji', 'Kripto', 'Eğitim', 'Pazarlama', 'Sosyal Medya', 'Botlar', 'Kanallar'
];

const TEMPLATES = [
    {
        titlePrefix: "Telegram'dan Para Kazanma: ",
        topics: [
            "Kanal Abonelikleri", "Reklam Gelirleri", "Affiliate Marketing", "Dijital Ürün Satışı", "Sponsorluk Anlaşmaları",
            "Premium İçerik Satışı", "Bağış Toplama", "Link Kısaltma Servisleri", "Dropshipping Entegrasyonu", "Marka Ortaklıkları"
        ],
        intro: "Telegram, sadece bir mesajlaşma uygulaması değil, aynı zamanda ciddi bir gelir kapısıdır. Kanalınızdan veya grubunuzdan nasıl para kazanabileceğinizi, gelir modellerini ve stratejileri tüm detaylarıyla anlatıyoruz.",
        points: [
            "Resmi Reklam Platformu (Telegram Ads) ile gelir elde etmeye başlayın.",
            "Özel (Private) kanallar oluşturarak ücretli abonelik sistemi kurun.",
            "Botlar aracılığıyla otomatik dijital ürün teslimatı yapın.",
            "Kitleye uygun affiliate (satış ortaklığı) ürünlerini tanıtın.",
            "Donate botları ile takipçilerinizden destek toplayın."
        ]
    },
    {
        titlePrefix: "Telegram Topluluk Yönetimi: ",
        topics: [
            "Troll Engelleme", "Moderatör Seçimi", "Grup Kuralları", "Hoşgeldin Botları", "Spam Filtreleri",
            "Üye Etkileşimi", "Anket Yönetimi", "Canlı Sohbetler", "Tartışma Grupları", "Kriz Yönetimi"
        ],
        intro: "Büyük bir Telegram topluluğunu yönetmek, bir orkestrayı yönetmek gibidir. Grubunuzun düzenini sağlamak, trollerle başa çıkmak ve üyelerinizle sağlıklı bir iletişim kurmak için ihtiyacınız olan her şey bu rehberde.",
        points: [
            "GroupHelp veya Rose gibi gelişmiş yönetim botlarını kurun.",
            "Net ve anlaşılır bir grup kuralları metni hazırlayıp sabitleyin.",
            "Spam mesajları ve bağlantıları otomatik silen filtreler oluşturun.",
            "Aktif ve güvenilir üyelerden oluşan bir moderasyon ekibi kurun.",
            "Slow Mode (Yavaş Mod) kullanarak mesaj trafiğini kontrol altında tutun."
        ]
    },
    {
        titlePrefix: "Telegram Sesli ve Görüntülü Sohbet: ",
        topics: [
            "Yayın Planlama", "Ekran Paylaşımı", "Gürültü Engelleme", "Yayın Kaydetme", "Konuk Alma",
            "Müzik Yayını", "Podcast Oluşturma", "Soru-Cevap Etkinlikleri", "Video Konferans", "Canlı Yayın Moderasyonu"
        ],
        intro: "Telegram'ın sesli ve görüntülü sohbet özellikleri, onu Zoom veya Discord'a güçlü bir rakip yapıyor. Kanalınızda nasıl profesyonel canlı yayınlar yapabileceğinizi ve kitlenizle sesli etkileşime geçebileceğinizi öğrenin.",
        points: [
            "Kanalınızda radyo tarzı sesli sohbetler (Voice Chat) başlatın.",
            "Yayınlarınızı kaydederek daha sonra podcast olarak paylaşın.",
            "Ekran paylaşımı ile sunumlar yapın veya eğitimler verin.",
            "Dinleyicileri 'el kaldırma' özelliği ile yayına konuk olarak alın.",
            "Yüksek kaliteli ses ve gürültü engelleme özelliklerini aktif edin."
        ]
    },
    {
        titlePrefix: "Telegram Depolama ve Dosya Yönetimi: ",
        topics: [
            "Sınırsız Bulut Depolama", "Dosya Sıkıştırma", "Saved Messages", "Medya İndirme Ayarları", "Cache Temizleme",
            "Büyük Dosya Gönderimi", "Albüm Oluşturma", "Dosya Arama", "Link Önizlemeleri", "Otomatik İndirme"
        ],
        intro: "Telegram'ın sunduğu sınırsız bulut depolama alanı, onu kişisel bir hard disk gibi kullanmanıza olanak tanır. Dosyalarınızı nasıl organize edeceğinizi, telefon hafızasını nasıl koruyacağınızı ve veri tasarrufu ipuçlarını keşfedin.",
        points: [
            "Saved Messages (Kayıtlı Mesajlar) bölümünü kişisel bulutunuz olarak kullanın.",
            "Önbellek (Cache) ayarlarını yapılandırarak telefon hafızasında yer açın.",
            "2GB (Premium ile 4GB) boyutunda tek dosya gönderme özelliğini kullanın.",
            "Dosyaları sıkıştırmadan orijinal kalitede gönderin.",
            "Medya otomatik indirme ayarlarını kapatarak internet kotanızı koruyun."
        ]
    },
    {
        titlePrefix: "Telegram Premium Ayrıcalıkları: ",
        topics: [
            "Özel Çıkartmalar", "Profil Rozeti", "Animasyonlu Profil Fotosu", "Sesten Yazıya Çeviri", "Hızlı İndirme",
            "Emoji Durumları", "Kanal Boost Hakkı", "Reklamsız Deneyim", "Uygulama İkonları", "Gerçek Zamanlı Çeviri"
        ],
        intro: "Telegram Premium, standart deneyimi bir üst seviyeye taşıyor. Peki aylık ücrete değer mi? Premium'un sunduğu tüm ayrıcalıkları, gizli özellikleri ve kullanıcı deneyimine etkisini detaylıca inceledik.",
        points: [
            "Sesli mesajları tek dokunuşla metne çevirerek okuyun.",
            "Dosyaları ve medyaları maksimum hızda indirin.",
            "İsminizin yanına özel bir yıldız rozeti ekleyin.",
            "Benzersiz ve tam ekran animasyonlu çıkartmaları kullanın.",
            "Sohbet listenizi daha iyi organize etmek için gelişmiş araçlara erişin."
        ]
    },
    {
        titlePrefix: "Telegram API ve Geliştirme: ",
        topics: [
            "MTProto Mimarisi", "TDLib Kullanımı", "Bot API vs User API", "Özel İstemci Yapımı", "Veri Madenciliği",
            "Otomasyon Scriptleri", "Entegrasyon Çözümleri", "Webhook Güvenliği", "Inline Query", "Telegram Payments"
        ],
        intro: "Kodlamayı sevenler için Telegram bir cennet. Kendi Telegram istemcinizi yapmaktan, karmaşık veri analizi araçlarına kadar API'nin derinliklerine iniyoruz. Teknik detaylar ve örnek senaryolar bu rehberde.",
        points: [
            "Bot API ile basit, TDLib ile gelişmiş istemci tabanlı uygulamalar yapın.",
            "Python (Telethon/Pyrogram) kütüphaneleri ile otomasyon scriptleri yazın.",
            "Webhook kullanarak sunucu yükünü azaltın ve tepki süresini hızlandırın.",
            "Telegram Login Widget ile sitenize üye girişi özelliği ekleyin.",
            "Ödeme API'sini kullanarak bot üzerinden kredi kartı ile satış yapın."
        ]
    },
    {
        titlePrefix: "Aile ve Çocuk Güvenliği: ",
        topics: [
            "Hassas İçerik Filtresi", "Grup Kısıtlamaları", "Gizlilik Ayarları", "Konum Paylaşımı", "Yabancı Mesajları",
            "Güvenli İnternet", "Ebeveyn Kontrolü", "Zararlı Botlar", "Bildirim Yönetimi", "Data Privacy"
        ],
        intro: "Çocuklarınız veya sevdikleriniz Telegram kullanıyorsa, onların güvenliğini sağlamak sizin elinizde. Telegram'ı daha güvenli bir aile ortamı haline getirmek için yapmanız gereken ayarlar ve almanız gereken önlemler.",
        points: [
            "Yakındaki Kişiler (People Nearby) özelliğini mutlaka kapatın.",
            "Telefon numarasını 'Hiç Kimse' olarak gizleyin.",
            "Gruplara ve kanallara eklenmeyi sadece 'Kişilerim' olarak sınırlayın.",
            "Hassas içerik (Sensitive Content) filtresini aktif hale getirin.",
            "Yabancılardan gelen mesajları otomatik olarak arşivleyin."
        ]
    },
    {
        titlePrefix: "Telegram ile İçerik Üretimi: ",
        topics: [
            "Telegraph Kullanımı", "Video Mesajlar", "Anket ve Quizler", "Medya Düzenleme", "Zamanlı Gönderi",
            "Sticker Yapımı", "GIF Oluşturma", "Blog Yazarlığı", "Görsel Hikayeler", "İçerik Takvimi"
        ],
        intro: "Telegram sadece paylaşım değil, aynı zamanda güçlü bir içerik üretim platformudur. Dahili editörleri, Telegraph blog aracını ve medya düzenleme özelliklerini kullanarak nasıl profesyonel içerikler üreteceğinizi öğrenin.",
        points: [
            "Telegraph ile şık ve hızlı açılan blog yazıları (Instant View) oluşturun.",
            "Dahili video editörü ile videoları kırpın, renk ayarı yapın ve sıkıştırın.",
            "Kendi sticker paketinizi oluşturarak markanızı eğlenceli hale getirin.",
            "Yuvarlak video mesajlar ile takipçilerinize samimi anlar paylaşın.",
            "Anketler (Polls) düzenleyerek kitlenizin nabzını tutun."
        ]
    },
    {
        titlePrefix: "Gezginler için Telegram: ",
        topics: [
            "Çeviri Botları", "Konum Paylaşımı", "Seyahat Grupları", "Kayıtlı Pasaport", "Offline Haritalar",
            "Vize Bilgi Kanalları", "Ucuz Uçak Bileti", "Yerel Rehberler", "Acil Durum İletişimi", "Döviz Kurları"
        ],
        intro: "Seyahat ederken en iyi yardımcınız Telegram olabilir. Yabancı dilleri anında çeviren botlardan, canlı konum paylaşımına ve yerel topluluklara kadar gezginlerin hayatını kurtaran Telegram tüyoları.",
        points: [
            "Live Location (Canlı Konum) ile sevdiklerinizin sizi takip etmesini sağlayın.",
            "Yandex.Translate veya Google Translate botları ile anlık çeviri yapın.",
            "Gittiğiniz ülkenin yerel Telegram gruplarına katılarak tavsiyeler alın.",
            "Pasaport botu ile kimlik bilgilerinizi güvenli bir şekilde saklayın.",
            "Uçak bileti ve otel fırsatlarını paylaşan kanalları takip edin."
        ]
    },
    {
        titlePrefix: "Kripto Yatırımcıları için Telegram: ",
        topics: [
            "Signal Kanalları", "Pump/Dump Uyarısı", "Whale Alert", "Portfolio Tracker", "Haber Akışı",
            "Airdrop Fırsatları", "Token Analizi", "Scam Bot Tespiti", "DeFi Grupları", "NFT Dropları"
        ],
        intro: "Kripto dünyasının kalbi Telegram'da atıyor. Yatırımlarınızı yönetirken kullanabileceğiniz en iyi botları, takip etmeniz gereken haber kaynaklarını ve dolandırıcılardan korunma yollarını derledik.",
        points: [
            "Whale Alert botu ile büyük cüzdan hareketlerini anlık takip edin.",
            "EtherDrops botu ile portföyünüzdeki değişimlerden haberdar olun.",
            "Sahte destek hesaplarına ve DM atan dolandırıcılara karşı dikkatli olun.",
            "Airdrop kanallarını takip ederek ücretsiz token fırsatlarını yakalayın.",
            "Coin fiyatlarını sorgulayan Price Botlarını gruplarınıza ekleyin."
        ]
    }
];

function generateHtmlContent(template: any, topic: string) {
    const title = `${template.titlePrefix}${topic}`;

    let html = `
    <article>
        <p class="lead">${template.intro}</p>
        
        <h2>${title} ve Detaylı İnceleme</h2>
        <p>Telegram ekosisteminde <strong>${topic}</strong> başlığı altında sunduğumuz bu rehber, hem yeni başlayanlar hem de profesyoneller için kritik bilgiler içeriyor. <em>Telegram ipuçları</em> ve stratejileri ile platformdan maksimum verimi almanızı hedefliyoruz.</p>

        <h3>Uygulamanız Gereken 5 Temel Adım</h3>
        <ul>
            ${template.points.map((p: string) => `<li>${p}</li>`).join('\n            ')}
        </ul>

        <h2>Stratejik Önemi ve Avantajları</h2>
        <p>Dijital iletişim çağında <strong>${topic}</strong> konusuna hakim olmak size büyük avantaj sağlar. Rakiplerinizden ayrışmak ve topluluğunuzu güçlendirmek için bu yöntemleri, modern <em>Telegram pazarlama</em> teknikleri ile birleştirin.</p>

        <h3>Uzman Görüşü ve Tavsiyeler</h3>
        <p>Bunu uygularken dikkat etmeniz gereken püf noktalar:</p>
        <ol>
            <li>Planlı ve programlı hareket edin.</li>
            <li>${topic} araçlarını test ederek en uygununu seçin.</li>
            <li>Güvenlik ve gizlilik ayarlarını asla ihmal etmeyin.</li>
            <li>Sürekli öğrenmeye ve yenilikleri takibe açık olun.</li>
        </ol>

        <h2>Sıkça Sorulan Sorular</h2>
        <div class="faq-section">
            <p><strong>S: Bu özellikler her cihazda çalışır mı?</strong><br>
            C: Evet, Telegram'ın bulut tabanlı yapısı sayesinde mobil, masaüstü ve web sürümlerinde senkronize çalışır.</p>

            <p><strong>S: ${topic} kullanımı güvenli mi?</strong><br>
            C: Doğru ayarlar yapıldığında ve resmi araçlar kullanıldığında oldukça güvenlidir.</p>
        </div>

        <div class="conclusion">
            <h3>Son Söz</h3>
            <p><strong>${title}</strong> hakkındaki bu kapsamlı rehberimizin sonuna geldik. Telegram yolculuğunuzda başarılar dileriz. Daha fazla içerik için blogumuzu takipte kalın.</p>
        </div>
    </article>
    `;

    return html;
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

const AUTHOR_NAMES = ["Eray Çaylak", "Admin", "Telegram Uzmanı", "Teknoloji Editörü", "Kripto Analisti", "Sosyal Medya Gurusu"];

function main() {
    let sqlContent = `-- Migration: Seed Batch 3 (Additional 200) Blog Posts
-- Generated automatically
-- Date: ${new Date().toISOString()}

-- NO TRUNCATE here, we are appending!

`;

    let postCount = 0;
    const allPosts: any[] = [];
    const TOTAL_POSTS = 200; // Requested 200 posts

    while (postCount < TOTAL_POSTS) {
        const templateIndex = postCount % TEMPLATES.length;
        const template = TEMPLATES[templateIndex];

        const topicIndex = (Math.floor(postCount / TEMPLATES.length)) % template.topics.length;
        let topic = template.topics[topicIndex];

        let displayTopic = topic;
        const pass = Math.floor(postCount / (TEMPLATES.length * 10)); // Variation logic

        // Add variation to titles to ensure 200 unique titles from 10 templates * 10 topics = 100 base topics
        // We need 200, so we will cycle through topics twice with variations
        if (postCount >= 100) {
            const suffixes = [" Detaylı Rehber", " 2026 Stratejileri", " Hakkında Bilinmeyenler", " Uzman Görüşü", " Pratik İpuçları"];
            displayTopic = topic + suffixes[postCount % 5];
        }

        const title = `${template.titlePrefix}${displayTopic}`;
        let slug = generateSlug(title);

        // Ensure uniqueness
        slug = slug + '-' + Math.random().toString(36).substring(2, 6);

        const content = generateHtmlContent(template, displayTopic);
        const category = CATEGORIES[postCount % CATEGORIES.length];

        const metaTitle = `${title} | Telegram Uzmanı`;
        const metaDesc = template.intro.substring(0, 150) + "...";

        const baseTags = ["telegram", "rehber", "2026"];
        const topicTags = displayTopic.toLowerCase().split(' ').filter(w => w.length > 3);
        const tags = [...new Set([...baseTags, ...topicTags, category.toLowerCase()])].join(', ');

        const author = AUTHOR_NAMES[postCount % AUTHOR_NAMES.length];

        const readingTime = Math.floor(Math.random() * 8) + 3; // 3-11 mins

        // Random date within last 12 months
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        const createdAt = date.toISOString();

        const values = `(
            '${escapeSql(title)}',
            '${escapeSql(slug)}',
            '${escapeSql(template.intro)}', 
            '${escapeSql(content)}',
            '${escapeSql(category)}',
            '{${tags.split(', ').map(t => `"${escapeSql(t)}"`).join(',')}}',
            '${escapeSql(author)}',
            true, -- published
            false, -- featured
            ${readingTime},
            '${escapeSql(metaTitle)}',
            '${escapeSql(metaDesc)}',
            '${createdAt}'
        )`;

        allPosts.push(values);
        postCount++;
    }

    sqlContent += `
INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    author,
    published,
    featured,
    reading_time,
    meta_title,
    meta_description,
    created_at
) VALUES 
${allPosts.join(',\n')};
`;

    const outputPath = path.join(process.cwd(), 'supabase', 'migrations', '20260216194500_seed_blog_posts_batch3.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`Generated migration file at: ${outputPath}`);
}

main();
