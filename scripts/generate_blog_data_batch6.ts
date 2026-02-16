import * as fs from 'fs';
import * as path from 'path';

// Helper to escape SQL strings
function escapeSql(str: string): string {
    return str.replace(/'/g, "''");
}

const CATEGORIES = [
    'İstatistik', 'Yazılım', 'Pazarlama', 'Karşılaştırma', 'Gelecek', 'Güvenlik', 'Eğitim', 'Finans', 'Yaşam', 'Oyun', 'Sağlık', 'Seyahat'
];

const TEMPLATES = [
    {
        titlePrefix: "Telegram Küresel İstatistikleri: ",
        topics: [
            "Kullanıcı Sayısı", "Günlük Mesaj Hacmi", "En Popüler Ülkeler", "Kanal Büyüme Oranları", "Premium Abone Sayısı",
            "Dosya Depolama Verileri", "Bot Kullanım Oranları", "Reklam Gelirleri", "Dil Dağılımı", "Mobil vs Masaüstü"
        ],
        intro: "Verilerle Telegram dünyasını analiz ediyoruz. Platformun küresel ölçekteki büyümesi, kullanıcı alışkanlıkları ve geleceğe dair projeksiyonlar.",
        points: [
            "Aylık aktif kullanıcı sayısındaki (MAU) son artış trendlerini inceleyin.",
            "Hangi ülkelerin Telegram'ı en yoğun kullandığını öğrenin.",
            "Premium abonelik modelinin başarı oranlarını analiz edin.",
            "Günlük gönderilen ortalama mesaj ve dosya sayılarına göz atın.",
            "Kanal ve grup oluşturma istatistiklerini karşılaştırın."
        ]
    },
    {
        titlePrefix: "Telegram Bot API Entegrasyonları: ",
        topics: [
            "Webhook Kurulumu", "Python-Telegram-Bot", "Node.js Telegraf", "Google Sheets Bağlantısı", "Zapier Otomasyonu",
            "Veritabanı Entegrasyonu", "Ödeme Sistemleri", "ChatGPT Bağlantısı", "AWS Lambda Deployment", "Docker Kullanımı"
        ],
        intro: "Geliştiriciler için teknik rehber. Telegram Bot API'sini kullanarak harici servislerle nasıl entegrasyon kurabileceğinizi ve otomasyon sistemleri oluşturabileceğinizi anlatıyoruz.",
        points: [
            "Webhook yöntemi ile anlık güncellemeleri nasıl alacağınızı öğrenin.",
            "Google Sheets tablolarını bir veritabanı gibi kullanarak bot yapın.",
            "Zapier ile kod yazmadan binlerce uygulama ile bağlantı kurun.",
            "Botunuzu AWS Lambda veya Heroku üzerinde ücretsiz barındırın.",
            "MongoDB veya PostgreSQL veritabanlarını botunuza bağlayın."
        ]
    },
    {
        titlePrefix: "Telegram vs Diğer Platformlar: ",
        topics: [
            "Discord Nitro vs Premium", "WhatsApp Business vs Telegram", "Signal Gizliliği", "Zoom vs Video Chat", "Google Drive vs Cloud",
            "Patreon vs Donate Bot", "Twitter Spaces vs Voice Chat", "Instagram DM vs Secret Chat", "Skype vs Calls", "Viber vs Features"
        ],
        intro: "Telegram sadece bir mesajlaşma uygulaması değil, bir ekosistemdir. Rakipleriyle karşılaştırıldığında sunduğu benzersiz avantajları ve eksiklikleri objektif bir gözle değerlendiriyoruz.",
        points: [
            "Bulut depolama kapasitelerini ve dosya paylaşım limitlerini kıyaslayın.",
            "Topluluk yönetimi araçlarını ve moderasyon özelliklerini inceleyin.",
            "Gizlilik politikaları ve veri kullanım alışkanlıklarını karşılaştırın.",
            "Sesli ve görüntülü görüşme kalitelerini test sonuçlarıyla görün.",
            "Platformların sunduğu API ve bot geliştirme imkanlarını değerlendirin."
        ]
    },
    {
        titlePrefix: "Geleceğin Teknolojileri ve Telegram: ",
        topics: [
            "Web 4.0", "Metaverse Grupları", "Nörolink Entegrasyonu", "Holografik Aramalar", "Kuantum Şifreleme",
            "Yapay Zeka Moderatörler", "Sanal Gerçeklik (VR)", "Artırılmış Gerçeklik (AR)", "Merkeziyetsiz Sosyal Medya", "Biyometrik Güvenlik"
        ],
        intro: "Telegram'ın gelecek vizyonu nedir? Teknoloji dünyasındaki son gelişmelerin mesajlaşma alışkanlıklarımızı nasıl değiştireceğini ve Telegram'ın buna nasıl ayak uyduracağını tartışıyoruz.",
        points: [
            "TON Blockchain üzerindeki merkeziyetsiz kimlik çalışmalarını takip edin.",
            "VR gözlüklerle Telegram kanallarında gezinebileceğiniz bir gelecek hayal edin.",
            "Yapay zeka asistanların sohbetlerinizi nasıl organize edeceğini görün.",
            "Kuantum bilgisayarların şifreleme teknolojilerine etkisini öğrenin.",
            "Biyometrik verilerle güvenli giriş yöntemlerini inceleyin."
        ]
    },
    {
        titlePrefix: "Finansal Özgürlük ve Telegram: ",
        topics: [
            "Pasif Gelir Kaynakları", "Affiliate Link Paylaşımı", "Kanal Satışı", "Sponsor Bulma", "Ücretli Üyelik",
            "Bağış Toplama", "E-Kitap Satışı", "Online Kurs Tanıtımı", "Freelance İş Ağı", "Kripto Trade"
        ],
        intro: "Telegram kanalınızı bir gelir kapısına dönüştürün. Pasif gelir elde etme yöntemleri, monetization stratejileri ve finansal özgürlüğe giden yolda Telegram'ı nasıl kullanabileceğiniz.",
        points: [
            "Kanalınızın nişine uygun affiliate (satış ortaklığı) programları bulun.",
            "Büyüttüğünüz kanalları pazar yerlerinde satarak gelir elde edin.",
            "Özel içerikleriniz için ücretli (VIP) kanallar oluşturun.",
            "Donate botları ile takipçilerinizden bağış toplayın.",
            "Kendi dijital ürünlerinizi (e-kitap, kurs) doğrudan satın."
        ]
    },
    {
        titlePrefix: "Eğitim ve Kişisel Gelişim: ",
        topics: [
            "Dil Öğrenme Kanalları", "Kodlama Kampları", "Tarih Arşivleri", "Bilim Haberleri", "Kitap Özetleri",
            "Motivasyon Sözleri", "Hızlı Okuma", "Hafıza Teknikleri", "Online Sınavlar", "Sertifika Programları"
        ],
        intro: "Öğrenmek hiç bu kadar kolay olmamıştı. Telegram'ın devasa kütüphanesinden faydalanarak yabancı dil öğrenin, yeni beceriler kazanın ve kişisel gelişiminize katkıda bulunun.",
        points: [
            "İngilizce kelime ve gramer botları ile pratik yapın.",
            "Python, JS gibi yazılım dillerini öğreten kanallara katılın.",
            "Günlük kitap özetleri paylaşan kanallarla kültürünüzü artırın.",
            "Bilimsel makalelerin paylaşıldığı arşivlere erişim sağlayın.",
            "Quiz botları ile bilginizi test edin ve yarışmalara katılın."
        ]
    },
    {
        titlePrefix: "Sağlık ve Yaşam: ",
        topics: [
            "Spor ve Fitness", "Sağlıklı Beslenme", "Meditasyon", "Uyku Düzeni", "Psikoloji",
            "Yoga Dersleri", "Diyet Listeleri", "Su İçme Hatırlatıcısı", "Adım Sayar", "Kalori Takibi"
        ],
        intro: "Sağlıklı bir yaşam için Telegram yanınızda. Fitness programlarından diyet listelerine, meditasyon rehberlerinden sağlık ipuçlarına kadar her şey bu platformda.",
        points: [
            "Günlük egzersiz videoları paylaşan kanalları takip edin.",
            "Su içme hatırlatıcı botları ile sağlığınızı koruyun.",
            "Meditasyon ses kayıtları ile stresinizi azaltın.",
            "Sağlıklı yemek tarifleri alarak beslenme düzeninizi iyileştirin.",
            "Motivasyon gruplarına katılarak hedeflerinize ulaşın."
        ]
    },
    {
        titlePrefix: "Oyun ve Eğlence Dünyası: ",
        topics: [
            "Oyun Haberleri", "Steam İndirimleri", "PlayStation Plus", "Xbox Game Pass", "Espor Turnuvaları",
            "Mobil Oyunlar", "Retro Gaming", "Oyun Hileleri", "Discord Alternatifi", "Oyun Arkadaşı Bulma"
        ],
        intro: "Oyun severler için en güncel haberler ve fırsatlar. İndirimleri kaçırmayın, turnuvaları takip edin ve oyun arkadaşları bularak eğlenceyi katlayın.",
        points: [
            "Steam ve Epic Games ücretsiz oyun bildirimlerini anlık alın.",
            "Espor takımlarının maç sonuçlarını ve fikstürlerini takip edin.",
            "Oyun arkadaşı bulma gruplarında takımınızı kurun.",
            "Retro oyun emülatörleri ve ROM arşivlerine ulaşın.",
            "Oyun içi item alım-satım gruplarında ticaret yapın."
        ]
    },
    {
        titlePrefix: "Seyahat ve Gezi Rehberi: ",
        topics: [
            "Ucuz Uçak Bileti", "Vizesiz Ülkeler", "Kamp Alanları", "Interrail İpuçları", "Sırt Çantalı Gezginler",
            "Airbnb Fırsatları", "Otostop Rehberi", "Yurtdışı İş İlanları", "Erasmus Grupları", "Gezi Fotoğrafları"
        ],
        intro: "Dünyayı gezmek isteyenler için ipuçları. En ucuz uçak biletlerini bulan botlardan, kamp yapabileceğiniz gizli rotalara kadar seyahat severlerin ihtiyacı olan her şey.",
        points: [
            "Hata basım uçak biletlerini paylaşan kanalları takip edin.",
            "Vizesiz gidilebilecek ülkeler hakkında güncel bilgilere ulaşın.",
            "Kamp ve doğa yürüyüşü gruplarında deneyimlerinizi paylaşın.",
            "Yurtdışında yaşayan Türklerin yardımlaşma gruplarına katılın.",
            "Gezginlerin paylaştığı yüksek çözünürlüklü fotoğraflarla ilham alın."
        ]
    },
    {
        titlePrefix: "Telegram ve Hukuk: ",
        topics: [
            "Veri Güvenliği Kanunu", "Telif Hakları", "Siber Suçlar", "Hakaret Davaları", "IP Tespiti",
            "Kullanıcı Sözleşmesi", "Gizlilik Politikası", "KVKK Uyumu", "Yasal Sorumluluklar", "Dolandırıcılık Şikayet"
        ],
        intro: "Dijital dünyada haklarınızı bilin. Telegram kullanımı sırasında karşılaşabileceğiniz hukuksal durumlar, yasal sorumluluklarınız ve siber haklarınız hakkında bilgilendirme.",
        points: [
            "Sosyal medyada hakaret ve tehdit suçlarının yasal boyutunu öğrenin.",
            "Telif hakkı ihlalleri nedeniyle kanalların kapatılma sürecini inceleyin.",
            "Verilerinizin hangi durumlarda resmi makamlarla paylaşıldığını bilin.",
            "Dolandırıcılık vakalarında nasıl şikayetçi olacağınızı öğrenin.",
            "KVKK kapsamında kişisel verilerinizin korunması hakkında bilgi alın."
        ]
    }
];

function generateHtmlContent(template: any, topic: string) {
    const title = `${template.titlePrefix}${topic}`;

    let html = `
    <article>
        <p class="lead">${template.intro}</p>
        
        <h2>${title}: Detaylı İnceleme ve Kılavuz</h2>
        <p>Telegram platformunda <strong>${topic}</strong> konusu, son dönemde en çok merak edilen başlıklardan biri haline geldi. Bu makalede, <em>${template.titlePrefix.replace(': ', '')}</em> alanındaki gelişmeleri ve fırsatları detaylandırıyoruz.</p>

        <h3>Öne Çıkan Noktalar ve İpuçları</h3>
        <ul>
            ${template.points.map((p: string) => `<li>${p}</li>`).join('\n            ')}
        </ul>

        <h2>Stratejik Analiz ve Gelecek Öngörüsü</h2>
        <p><strong>${topic}</strong> konusundaki gelişmeler, Telegram ekosisteminin ne yöne evrildiğini bize gösteriyor. Özellikle küresel trendler ve kullanıcı alışkanlıkları göz önüne alındığında, bu alanda bilgi sahibi olmak size büyük bir vizyon katacaktır.</p>

        <h3>Uzman Önerileri</h3>
        <p>Deneyimli kullanıcıların ve uzmanların tavsiyeleri:</p>
        <ol>
            <li>Verilerinizi ve kaynaklarınızı her zaman doğrulayın.</li>
            <li>Güvenlik önlemlerini (2FA vb.) asla devre dışı bırakmayın.</li>
            <li>Telegram'ın sunduğu bot ve otomasyon araçlarını aktif kullanın.</li>
            <li>Topluluk kurallarına saygı göstererek ekosisteme katkıda bulunun.</li>
        </ol>

        <h2>Sıkça Sorulan Sorular</h2>
        <div class="faq-section">
            <p><strong>S: Bu bilgiler güncel mi?</strong><br>
            C: Evet, 2026 yılı itibarıyla en güncel veriler ve trendler baz alınarak hazırlanmıştır.</p>

            <p><strong>S: ${topic} hakkında daha fazla kaynağa nasıl ulaşırım?</strong><br>
            C: Blogumuzdaki diğer yazıları inceleyebilir veya resmi Telegram kanallarını takip edebilirsiniz.</p>
        </div>

        <div class="conclusion">
            <h3>Sonuç</h3>
            <p><strong>${title}</strong> hakkındaki bu analizimizin sonuna geldik. Umarız bu rehber, Telegram deneyiminizi bir üst seviyeye taşımanıza yardımcı olur.</p>
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

const AUTHOR_NAMES = ["Veri Analisti", "Yazılım Uzmanı", "Hukuk Danışmanı", "Gezgin", "Gamer", "Sağlık Koçu", "Finans Editörü", "Teknoloji Muhabiri", "Eğitimci", "Sosyal Medya Uzmanı"];

function main() {
    console.log('Generating Batch 6 (500 posts - "130 Part")...');

    const TOTAL_POSTS = 500;
    const CHUNK_SIZE = 50;
    const TOTAL_CHUNKS = Math.ceil(TOTAL_POSTS / CHUNK_SIZE);

    let postCount = 0;

    for (let chunk = 1; chunk <= TOTAL_CHUNKS; chunk++) {
        // Naming convention requested: "130 part1"
        // We will output to: 20260216220000_seed_blog_posts_130_partX.sql

        let sqlContent = `-- Migration: Seed Batch 6 - 500 Posts "130 Part" (Part ${chunk}/${TOTAL_CHUNKS})
-- Generated automatically
-- Date: ${new Date().toISOString()}

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
`;

        const chunkPosts: string[] = [];
        const itemsInThisChunk = Math.min(CHUNK_SIZE, TOTAL_POSTS - postCount);

        for (let i = 0; i < itemsInThisChunk; i++) {
            const templateIndex = postCount % TEMPLATES.length;
            const template = TEMPLATES[templateIndex];

            const topicIndex = (Math.floor(postCount / TEMPLATES.length)) % template.topics.length;
            let topic = template.topics[topicIndex];

            let displayTopic = topic;

            // Variation logic for 500 posts
            const variation = Math.floor(postCount / 100);

            if (variation === 1) {
                displayTopic = topic + " Analizi 2026";
            } else if (variation === 2) {
                displayTopic = "En İyi " + topic + " Uygulamaları";
            } else if (variation === 3) {
                displayTopic = topic + " Hakkında Bilinmeyenler";
            } else if (variation === 4) {
                displayTopic = topic + " İpuçları ve Hileleri";
            }

            const title = `${template.titlePrefix}${displayTopic}`;
            let slug = generateSlug(title);

            // Ensure uniqueness with high entropy
            slug = slug + '-' + Math.random().toString(36).substring(2, 9);

            const content = generateHtmlContent(template, displayTopic);
            const category = CATEGORIES[postCount % CATEGORIES.length];

            const metaTitle = `${title} | Telegram Dünyası`;
            const metaDesc = template.intro.substring(0, 155) + "...";

            const baseTags = ["telegram", "blog", "2026", "analiz", "teknoloji"];
            const topicTags = displayTopic.toLowerCase().split(' ').filter(w => w.length > 3);
            const tags = [...new Set([...baseTags, ...topicTags, category.toLowerCase()])].join(', ');

            const author = AUTHOR_NAMES[postCount % AUTHOR_NAMES.length];

            const readingTime = Math.floor(Math.random() * 8) + 3; // 3-11 mins

            // Random date distributed over the last 3 years
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 1095));
            date.setHours(Math.floor(Math.random() * 24));
            date.setMinutes(Math.floor(Math.random() * 60));
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

            chunkPosts.push(values);
            postCount++;
        }

        sqlContent += chunkPosts.join(',\n') + ';\n';

        const fileName = `20260216220000_seed_blog_posts_130_part${chunk}.sql`;
        const outputPath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
        fs.writeFileSync(outputPath, sqlContent, 'utf8');
        console.log(`Generated migration file Part ${chunk}: ${outputPath}`);
    }
}

main();
