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
        titlePrefix: "Telegram Business Kullanımı: ",
        topics: [
            "İşletme Hesabı Kurulumu", "Müşteri Hizmetleri Otomasyonu", "CRM Entegrasyonu", "Hızlı Yanıt Özellikleri", "Katalog Yönetimi"
        ],
        intro: "Telegram Business, işletmelerin müşterileriyle daha etkili iletişim kurmasını sağlayan güçlü araçlar sunar. Bu rehberde, işletmenizi Telegram'a nasıl taşıyacağınızı ve satışlarınızı nasıl artıracağınızı öğreneceksiniz.",
        points: [
            "İşletme profilinizi profesyonelce düzenleyin (adres, saatler).",
            "Hızlı yanıtlar ile müşteri sorularını anında cevaplayın.",
            "Karşılama mesajları ile profesyonel bir ilk izlenim bırakın.",
            "Uzakta mesajı ile mesai saatleri dışında bilgi verin.",
            "Chatbot entegrasyonları ile 7/24 destek hizmeti sunun."
        ]
    },
    {
        titlePrefix: "Telegram vs WhatsApp: ",
        topics: [
            "Gizlilik Karşılaştırması", "Dosya Paylaşım Sınırları", "Grup Özellikleri", "Bulut Depolama Avantajı", "API Erişimi"
        ],
        intro: "Anlık mesajlaşma uygulamaları arasında seçim yapmak zor olabilir. Bu detaylı karşılaştırmada, Telegram ve WhatsApp'ın artılarını ve eksilerini masaya yatırıyor, hangisinin sizin için daha uygun olduğuna karar vermenize yardımcı oluyoruz.",
        points: [
            "Telegram'ın bulut tabanlı yapısı sayesinde mesajlarınıza her yerden erişin.",
            "WhatsApp'ın aksine Telegram'da numaranızı gizleyerek iletişim kurun.",
            "Telegram'da 2GB veya 4GB (Premium) dosya gönderme özgürlüğünü yaşayın.",
            "Gruplarda 200.000 üyeye kadar destek ile devasa topluluklar kurun.",
            "Açık kaynaklı API desteği ile kendi araçlarınızı geliştirin."
        ]
    },
    {
        titlePrefix: "Gelişmiş Telegram Güvenliği: ",
        topics: [
            "MTProto Protokolü", "Proxy ve VPN Kullanımı", "İki Adımlı Doğrulama (2FA)", "Gizli Sohbetler", "Session Yönetimi"
        ],
        intro: "Dijital dünyada güvenlik her şeydir. Telegram'ın sunduğu gelişmiş güvenlik özelliklerini derinlemesine inceliyoruz ve hesabınızı siber tehditlere karşı nasıl kale gibi koruyacağınızı anlatıyoruz.",
        points: [
            "Cloud parolasını mutlaka güçlü bir şifre ile etkinleştirin.",
            "Hassas görüşmeleriniz için uçtan uca şifreli Gizli Sohbetleri kullanın.",
            "Farklı cihazlardaki oturumlarınızı düzenli olarak kontrol edin ve kapatın.",
            "Telegram Proxy kullanarak erişim kısıtlamalarını aşın ve güvenliği artırın.",
            "Kimlik avı (phishing) saldırılarına karşı resmi hesap doğrulamasını kontrol edin."
        ]
    },
    {
        titlePrefix: "Telegram Kanal Analitiği: ",
        topics: [
            "İstatistik Okuma Rehberi", "Etkileşim Oranı Hesaplama", "Büyüme Grafikleri", "Kaynak Analizi", "En İyi Paylaşım Saatleri"
        ],
        intro: "Veriye dayalı kararlar almak, kanalınızın başarısı için kritiktir. Telegram'ın sunduğu yerleşik analiz araçlarını nasıl yorumlayacağınızı ve stratejinizi bu verilere göre nasıl şekillendireceğinizi öğrenin.",
        points: [
            "Görüntülenme başına ortalama paylaşım (VR) oranını takip edin.",
            "Bildirimleri sessize alan kullanıcı oranını analiz ederek içerik sıklığını ayarlayın.",
            "Üye kaynağı grafiği ile büyümenizin nereden geldiğini tespit edin.",
            "Mesajlarınızın en çok okunduğu saatleri belirleyerek paylaşım planı yapın.",
            "Dil istatistiklerine bakarak içeriğinizi yerelleştirin."
        ]
    },
    {
        titlePrefix: "Eğitim ve E-Öğrenme için Telegram: ",
        topics: [
            "Quiz Botu ile Sınavlar", "Dosya Arşivleme", "Ders Notu Paylaşımı", "Öğrenci Toplulukları", "Canlı Ders Yayını"
        ],
        intro: "Telegram, eğitimciler ve öğrenciler için mükemmel bir platformdur. Sınırsız dosya paylaşımı ve etkileşimli botlar sayesinde, Telegram'ı nasıl sanal bir sınıfa dönüştürebileceğinizi keşfedin.",
        points: [
            "Quiz modu ile öğrencilerinize anlık testler uygulayın.",
            "Büyük PDF kitapları ve ders videolarını kaliteden ödün vermeden paylaşın.",
            "Konulara göre ayrılmış gruplar (Topics) ile ders tartışmalarını düzenleyin.",
            "Sabitlenmiş mesajlar ile sınav takvimlerini ve önemli duyuruları öne çıkarın.",
            "Ekran paylaşımı özelliği ile canlı ders anlatımları yapın."
        ]
    },
    {
        titlePrefix: "Telegram Masaüstü İpuçları: ",
        topics: [
            "Klavye Kısayolları", "Çoklu Hesap Yönetimi", "Klasörleme Sistemi", "Gelişmiş Arama", "Export Özelliği"
        ],
        intro: "Telegram'ı bilgisayarda kullanmak verimliliğinizi ikiye katlayabilir. Telegram Desktop sürümünün az bilinen özelliklerini ve sizi klavye ninja'sına dönüştürecek kısayolları derledik.",
        points: [
            "Ctrl+K (veya Cmd+K) ile sohbetler arasında ışık hızında geçiş yapın.",
            "Sohbet klasörleri ile iş ve kişisel gruplarınızı birbirinden ayırın.",
            "Mesajları zamanlayarak (Schedule) mesai saatlerinde gönderilmesini sağlayın.",
            "Sohbet geçmişini HTML veya JSON olarak bilgisayarınıza yedekleyin.",
            "Resim içindeki metinleri kopyalamak için dahili OCR özelliğini kullanın."
        ]
    },
    {
        titlePrefix: "Telegram'da Marka Oluşturma: ",
        topics: [
            "Kanal Kimliği Tasarımı", "Tone of Voice", "Logo ve Renk Uyumu", "Hikaye Anlatıcılığı", "Topluluk Liderliği"
        ],
        intro: "Sadece bir kanal değil, bir marka inşa etmek istiyorsanız doğru yerdesiniz. Telegram'da güçlü ve akılda kalıcı bir marka kimliği oluşturmanın altın kurallarını paylaşıyoruz.",
        points: [
            "Kanal adınız ve logonuzun diğer sosyal medya hesaplarınızla tutarlı olmasını sağlayın.",
            "Kendinize has bir dil ve üslup geliştirerek takipçilerinizle bağ kurun.",
            "Görsel şablonlar kullanarak gönderilerinizde bütünlük sağlayın.",
            "Kullanıcı yorumlarına ve tepkilerine değer vererek topluluğu yönetin.",
            "Düzenli içerik serileri oluşturarak takipçilerde alışkanlık yaratın."
        ]
    },
    {
        titlePrefix: "Geliştiriciler için Telegram: ",
        topics: [
            "Bot API 7.0 Yenilikleri", "Mini App Geliştirme", "Webhook vs Polling", "Python-Telegram-Bot", "Telegram Login Widget"
        ],
        intro: "Telegram, geliştiriciler için bir oyun alanıdır. Bot API'nin son sürümüyle gelen özellikleri ve kendi Mini App'inizi (TMA) nasıl geliştirebileceğinizi teknik detaylarıyla inceliyoruz.",
        points: [
            "Web App (Mini App) özelliği ile Telegram içinde tam teşekküllü web siteleri çalıştırın.",
            "Bot API 7.0 ile gelen tepki (reaction) ve hikaye (story) özelliklerini kullanın.",
            "Webhook kullanarak sunucu kaynaklarını daha verimli yönetin.",
            "Telegram Login Widget ile web sitenize 'Telegram ile Giriş Yap' butonu ekleyin.",
            "Bot ödemeleri API'si ile uygulamanız üzerinden ürün satın."
        ]
    },
    {
        titlePrefix: "Telegram Premium Hediyeleşme: ",
        topics: [
            "Çekiliş Düzenleme", "Gift Code Oluşturma", "Boost Sistemi", "Kanal Seviyeleri", "Topluluk Ödülleri"
        ],
        intro: "Telegram'ın yeni çekiliş ve hediye özellikleri, kanalların büyümesi için harika fırsatlar sunuyor. Takipçilerinize nasıl Premium hediye edebileceğinizi ve bunun kanalınıza olan katkısını öğrenin.",
        points: [
            "Kanalınızda resmi çekilişler düzenleyerek takipçi sayınızı hızla artırın.",
            "Kazananlara otomatik olarak Premium kodları dağıtın.",
            "Kanalınıza Boost (Takviye) basan kullanıcılara özel ayrıcalıklar tanıyın.",
            "Telegram Stars (Yıldızlar) ile dijital ürün satışları yapın.",
            "Topluluk etkinliklerinde aktif üyelerinizi ödüllendirin."
        ]
    },
    {
        titlePrefix: "Telegram ve Kripto Dünyası: ",
        topics: [
            "TON Blockchain", "Wallet Entegrasyonu", "Fragment Platformu", "Username NFT'leri", "Kripto Ödemeler"
        ],
        intro: "Telegram ve TON (The Open Network) entegrasyonu, mesajlaşma uygulamasını bir Web3 cüzdanına dönüştürdü. Telegram üzerinden nasıl kripto alıp gönderebileceğinizi ve Username NFT'lerini nasıl alabileceğinizi anlatıyoruz.",
        points: [
            "Dahili Wallet botunu kullanarak USDT ve TON transferi yapın.",
            "Fragment.com üzerinden anonim numaralar ve kullanıcı adları satın alın.",
            "Kripto para bağışları kabul ederek gelirinizi çeşitlendirin.",
            "TON tabanlı Mini App oyunları (Tap-to-Earn) ile ekosistemi keşfedin.",
            "Kendi tokeninizi veya NFT koleksiyonunuzu Telegram topluluğunuza tanıtın."
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
    let sqlContent = `-- Migration: Seed Batch 2 (Additional 100) Blog Posts
-- Generated automatically
-- Date: ${new Date().toISOString()}

-- NO TRUNCATE here, we are appending!

`;

    let postCount = 0;
    const generatedSlugs = new Set();
    const allPosts: any[] = [];

    // We generate 100 posts again using new templates
    while (postCount < 100) {
        const templateIndex = postCount % TEMPLATES.length;
        const template = TEMPLATES[templateIndex];

        const topicIndex = (Math.floor(postCount / TEMPLATES.length)) % template.topics.length;
        let topic = template.topics[topicIndex];

        let displayTopic = topic;
        const pass = Math.floor(postCount / 50); // 0 or 1

        if (pass === 1) {
            const suffixes = [" 2026 Güncellemesi", " Uzman Rehberi", " Püf Noktaları", " Analiz Raporu", " Sırları"];
            displayTopic = topic + suffixes[postCount % 5];
        }

        const title = `${template.titlePrefix}${displayTopic}`;
        let slug = generateSlug(title);

        // Ensure uniqueness - append random string if needed to avoid collision with Batch 1 or self
        // Since we verify against DB offline, aggressive randomization helps
        slug = slug + '-' + Math.random().toString(36).substring(2, 6);

        const content = generateHtmlContent(template, displayTopic);
        const category = CATEGORIES[postCount % CATEGORIES.length];

        const metaTitle = `${title} | Telegram Uzmanı`;
        const metaDesc = template.intro.substring(0, 150) + "...";

        const baseTags = ["telegram", "rehber", "2026"];
        const topicTags = displayTopic.toLowerCase().split(' ').filter(w => w.length > 3);
        const tags = [...new Set([...baseTags, ...topicTags, category.toLowerCase()])].join(', ');

        const author = AUTHOR_NAMES[postCount % AUTHOR_NAMES.length];

        const readingTime = Math.floor(Math.random() * 6) + 3; // 3-9 mins

        // Random date within last 6 months (wider range)
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 180));
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
            false, -- featured (none in batch 2 forced)
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

    const outputPath = path.join(process.cwd(), 'supabase', 'migrations', '20260216193000_seed_blog_posts_batch2.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`Generated migration file at: ${outputPath}`);
}

main();
