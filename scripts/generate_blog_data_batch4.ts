import * as fs from 'fs';
import * as path from 'path';

// Helper to escape SQL strings
function escapeSql(str: string): string {
    return str.replace(/'/g, "''");
}

const CATEGORIES = [
    'Haber', 'Rehber', 'İpucu', 'Teknoloji', 'Kripto', 'Eğitim', 'Pazarlama', 'Sosyal Medya', 'Botlar', 'Kanallar', 'Eğlence', 'Tarihçe'
];

const TEMPLATES = [
    {
        titlePrefix: "Telegram Sorun Giderme: ",
        topics: [
            "Bağlantı Hatası", "Bildirim Gelmiyor", "Hesap Silindi", "Kod Gelmiyor", "Medya İndirilmiyor",
            "Too Many Attempts Hatası", "Kişiler Görünmüyor", "Grup Bulunamadı", "Bot Çalışmıyor", "Sesli Arama Sorunu"
        ],
        intro: "Telegram kullanırken karşılaştığınız teknik sorunlar can sıkıcı olabilir. En sık yaşanan hataları ve bunların kesin çözüm yollarını adım adım anlatıyoruz.",
        points: [
            "Bağlantı sorunları için Proxy ayarlarını kontrol edin.",
            "Bildirim gelmiyorsa pil tasarrufu modunu devre dışı bırakın.",
            "SMS kodu gelmiyorsa sesli arama seçeneğini deneyin.",
            "Önbelleği temizleyerek uygulamanın daha hızlı çalışmasını sağlayın.",
            "Uygulamayı güncel tutarak hataların önüne geçin."
        ]
    },
    {
        titlePrefix: "Telegram Tarihçesi ve Vizyonu: ",
        topics: [
            "Pavel Durov'un Hikayesi", "VKontakte'den Telegram'a", "Dijital Direniş", "Toncoin'in Doğuşu", "Gizlilik Manifestosu",
            "Rusya Yasakları", "Dubai Merkezi", "Telegram 10. Yıl", "Gelecek Planları", "Logo Tasarımı"
        ],
        intro: "Telegram sadece bir uygulama değil, bir özgürlük hareketidir. Kurucusu Pavel Durov'un vizyonunu, Telegram'ın sansürle mücadelesini ve dijital dünyadaki yerini keşfedin.",
        points: [
            "Telegram'ın kuruluş felsefesi olan 'kar amacı gütmeyen' yapısını anlayın.",
            "Dijital Direniş (Digital Resistance) hareketinin önemini kavrayın.",
            "Sunucuların dünya geneline dağıtılmasının güvenlik avantajlarını öğrenin.",
            "TON blockchain projesinin Telegram ile olan entegrasyon sürecini inceleyin.",
            "Gizlilik odaklı politikanın kullanıcı haklarını nasıl koruduğunu görün."
        ]
    },
    {
        titlePrefix: "Eğlenceli Telegram Botları: ",
        topics: [
            "Oyun Botları", "Müzik Botları", "Meme Oluşturucu", "Astroloji Botu", "Film Öneri Botu",
            "GIF Bulucu", "Çeviri Oyunları", "Ses Değiştirici", "Arkadaş Bulma", "Sanal Pet"
        ],
        intro: "Telegram'da sıkılmak imkansız! Gruplarınızı şenlendirecek, arkadaşlarınızla yarışabileceğiniz ve keyifli vakit geçirebileceğiniz en iyi eğlence botlarını derledik.",
        points: [
            "Gamee botu ile arkadaşlarınızla anlık oyun turnuvaları düzenleyin.",
            "Müzik botları ile grubunuzda canlı radyo yayını yapın.",
            "Sticker botları ile kendi komik çıkartma paketlerinizi oluşturun.",
            "Trivia botları ile genel kültür yarışmaları yapın.",
            "Werewolf gibi rol yapma oyunlarını grupça oynayın."
        ]
    },
    {
        titlePrefix: "Telegram Pazarlama Stratejileri: ",
        topics: [
            "Huni (Funnel) Kurulumu", "Lead Toplama", "Otomatik Mesajlaşma", "Segmentasyon", "Retargeting",
            "Kanal Büyütme", "Viral İçerik", "Influencer İşbirlikleri", "Çapraz Promosyon", "Ücretli Reklamlar"
        ],
        intro: "Dijital pazarlamanın yeni yıldızı Telegram. Markanızı büyütmek, satışlarınızı artırmak ve sadık bir müşteri kitlesi oluşturmak için kullanabileceğiniz ileri düzey pazarlama taktikleri.",
        points: [
            "Hoşgeldin mesajı ile potansiyel müşterileri satış hunisine sokun.",
            "Anketler ile müşteri segmentasyonu yaparak kişiye özel teklifler sunun.",
            "Başka kanallarla karşılıklı paylaşım (SFS) yaparak kitlenizi büyütün.",
            "Çekilişler düzenleyerek viral etki yaratın.",
            "Kanal istatistiklerini analiz ederek en doğru paylaşım saatini bulun."
        ]
    },
    {
        titlePrefix: "Telegram vs Rakipler: ",
        topics: [
            "Signal Karşılaştırması", "Discord vs Telegram", "Slack Alternatifi", "Messenger Farkı", "Viber Mücadelesi",
            "WeChat Benzerlikleri", "Skype'ın Sonu", "Line vs Telegram", "iMessage Özellikleri", "Matrix Protokolü"
        ],
        intro: "Piyasada birçok mesajlaşma uygulaması var, peki neden Telegram? Güvenlik, özellik, hız ve kullanım kolaylığı açısından Telegram'ı en güçlü rakipleriyle kıyaslıyoruz.",
        points: [
            "Signal'in aksine Telegram'ın kullanıcı adı ile iletişim imkanı sunması.",
            "Discord'a göre daha az kaynak tüketen ve mobil dostu arayüz.",
            "Slack kadar yetenekli ama tamamen ücretsiz grup yönetimi.",
            "Tüm platformlarda (PC, Mobil, Web) kusursuz senkronizasyon.",
            "Rakiplerine göre çok daha geniş dosya paylaşım limitleri."
        ]
    },
    {
        titlePrefix: "Telegram Web3 ve NFT: ",
        topics: [
            "Kullanıcı Adı Pazarı", "Telegram Stars", "Mini App Ödemeleri", "TON Space", "Smart Contract",
            "Metaverse Entegrasyonu", "DAO Yönetimi", "Token Gated Gruplar", "Airdrop Avcılığı", "DeFi Cüzdanı"
        ],
        intro: "Web3 devrimi Telegram ile cebinize giriyor. Blockchain tabanlı kimlikler, kripto ödemeler ve merkeziyetsiz topluluklar (DAO) hakkında bilmeniz gereken her şey.",
        points: [
            "Fragment üzerinden NFT olarak kullanıcı adı alıp satmayı öğrenin.",
            "Telegram Stars ile uygulama içi dijital ürünleri satın alın.",
            "Token Gated botları ile sadece belirli NFT sahiplerine özel gruplar kurun.",
            "TON Space cüzdanı ile varlıklarınızı güvenle saklayın.",
            "Telegram üzerinden akıllı sözleşmelerle etkileşime geçin."
        ]
    },
    {
        titlePrefix: "Verimlilik ve Organizasyon: ",
        topics: [
            "Hatırlatıcılar", "Not Alma", "Proje Yönetimi", "Dosya Arşivi", "İş Akışı Otomasyonu",
            "Klavye Kısayolları", "Sohbet Klasörleri", "Sabitlenmiş Mesajlar", "Sesli Notlar", "Takvim Botu"
        ],
        intro: "Telegram sadece sohbet için değil, hayatınızı düzene sokmak için de harika bir araçtır. İşlerinizi takip etmek, notlar almak ve verimliliğinizi artırmak için Telegram'ı nasıl kullanabilirsiniz?",
        points: [
            "Saved Messages'ı kişisel not defteriniz ve bulut arşiviniz yapın.",
            "Hatırlatıcı (Reminder) özelliği ile önemli işlerinizi asla unutmayın.",
            "Klasörler ile iş, okul ve özel sohbetlerinizi birbirinden ayırın.",
            "Zamanlanmış mesajlar ile iş akışınızı otomatiğe bağlayın.",
            "Proje yönetimi botları ile ekibinizin görev dağılımını yapın."
        ]
    },
    {
        titlePrefix: "Telegram Gizlilik Ayarları: ",
        topics: [
            "Son Görülme", "Profil Fotoğrafı", "İletilen Mesajlar", "Grup Davetleri", "Arama Ayarları",
            "Engel Listesi", "Oturum Kapatma", "Hesap Silme Süresi", "Ödeme Bilgileri", "Veri İhracı"
        ],
        intro: "Gizliliğiniz sizin kontrolünüzde. Telegram'ın detaylı gizlilik ayarlarını yapılandırarak, kimlerin sizinle iletişim kurabileceğini ve verilerinizi görebileceğini tam olarak yönetin.",
        points: [
            "Son görülme bilginizi sadece rehberinizdeki kişilere açın.",
            "Sizi gruplara kimlerin ekleyebileceğini kısıtlayarak spam'den kurtulun.",
            "Profil fotoğrafınızı yabancılara kapatarak gizliliğinizi koruyun.",
            "İletilen mesajlarda isminizin görünmesini engelleyin.",
            "Hesabınızın belirli bir süre inaktif kalırsa otomatik silinmesini ayarlayın."
        ]
    },
    {
        titlePrefix: "Telegram Sticker ve Sanat: ",
        topics: [
            "Sticker Tasarımı", "Animasyonlu Emojiler", "Video Stickerlar", "Tema Yapımı", "Arkaplan Değiştirme",
            "Renk Paletleri", "Sanat Kanalları", "Çizim Botları", "Yarışmalar", "Tasarım Toplulukları"
        ],
        intro: "Telegram, sanatçılar ve tasarımcılar için dev bir galeri. Kendi çıkartma paketlerinizi tasarlamaktan, uygulamanın temasını değiştirmeye kadar yaratıcılığınızı konuşturabileceğiniz alanlar.",
        points: [
            "Resmi Sticker botunu kullanarak kendi paketinizi dakikalar içinde yayınlayın.",
            "TGS formatında animasyonlu çıkartmalar yaparak dikkat çekin.",
            "Sohbet arkaplanlarını özelleştirerek uygulamanızı kişiselleştirin.",
            "Tema editörü ile Telegram'ı kendi zevkinize göre renklendirin.",
            "Sanat kanallarını takip ederek ilham alın ve çalışmalarınızı paylaşın."
        ]
    },
    {
        titlePrefix: "Telegram Haber ve Medya: ",
        topics: [
            "Haber Kanalları", "RSS Botları", "Instant View", "Anlık Bildirimler", "Teyit Platformları",
            "Vatandaş Gazeteciliği", "Canlı Yayınlar", "Spor Haberleri", "Finans Bültenleri", "Magazin Akışı"
        ],
        intro: "Dünyadan haberdar olmanın en hızlı yolu Telegram. Geleneksel medyanın ötesine geçerek, son dakika gelişmelerini, spor skorlarını ve finans verilerini anlık olarak takip edin.",
        points: [
            "RSS botları ile favori web sitelerinizin içeriklerini otomatik olarak alın.",
            "Instant View teknolojisi ile haberleri uygulama içinden ışık hızında okuyun.",
            "Güvenilir haber kanallarını takip ederek dezenformasyondan kaçının.",
            "Kendi haber kanalınızı kurarak bir yayıncı olun.",
            "Finans botları ile döviz ve borsa verilerini anlık izleyin."
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

const AUTHOR_NAMES = ["Eray Çaylak", "Admin", "Telegram Uzmanı", "Teknoloji Editörü", "Kripto Analisti", "Sosyal Medya Gurusu", "Haber Masası", "Bot Geliştirici"];

function main() {
    console.log('Generating Batch 4 blog posts...');

    const TOTAL_POSTS = 300;
    const CHUNK_SIZE = 50;
    const TOTAL_CHUNKS = Math.ceil(TOTAL_POSTS / CHUNK_SIZE);

    let postCount = 0;

    for (let chunk = 1; chunk <= TOTAL_CHUNKS; chunk++) {
        let sqlContent = `-- Migration: Seed Batch 4 (Part ${chunk}/${TOTAL_CHUNKS})
-- Generated automatically
-- Date: ${new Date().toISOString()}

-- NO TRUNCATE here, we are appending!

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

            // Variation logic for 300 posts
            const variation = Math.floor(postCount / 100);

            if (variation === 1) {
                const suffixes = [" Hakkında Her Şey", " Rehberi 2026", " İncelemesi", " Kullanımı", " Ayarları"];
                displayTopic = topic + suffixes[postCount % 5];
            } else if (variation === 2) {
                const prefixes = ["Detaylı ", "Kapsamlı ", "Hızlı ", "Pratik ", "Yeni "];
                displayTopic = prefixes[postCount % 5] + topic;
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

            const readingTime = Math.floor(Math.random() * 10) + 2; // 2-12 mins

            // Random date within last 24 months (2 years) for variety
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 730));
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

        const fileName = `20260216200000_seed_blog_posts_batch4_part${chunk}.sql`;
        const outputPath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
        fs.writeFileSync(outputPath, sqlContent, 'utf8');
        console.log(`Generated migration file Part ${chunk}: ${outputPath}`);
    }
}

main();
