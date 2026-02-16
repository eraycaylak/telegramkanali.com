import * as fs from 'fs';
import * as path from 'path';

// Helper to escape SQL strings
function escapeSql(str: string): string {
    return str.replace(/'/g, "''");
}

const CATEGORIES = [
    'Haber', 'Rehber', 'İpucu', 'Teknoloji', 'Kripto', 'Eğitim', 'Pazarlama', 'Sosyal Medya', 'Botlar', 'Kanallar', 'Yazılım', 'Güvenlik'
];

const TEMPLATES = [
    {
        titlePrefix: "Gelişmiş Telegram Botları: ",
        topics: [
            "Yapay Zeka Entegrasyonlu Botlar", "E-Ticaret ve Ödeme Botları", "Müşteri Hizmetleri Otomasyonu", "Kripto Cüzdan Botları", "Hava Durumu ve Alarm Botları",
            "Dosya Dönüştürücü Botlar", "Dil Öğrenme Botları", "Borsa Takip Botları", "Grup Yönetim Asistanları", "Anket ve Oylama Botları"
        ],
        intro: "Basit botların ötesine geçin. İşinizi ve günlük hayatınızı otomatize edecek, yapay zeka destekli ve gelişmiş özelliklere sahip Telegram botlarını inceliyoruz.",
        points: [
            "OpenAI API kullanan botlar ile sohbet deneyimini zenginleştirin.",
            "ShopBot gibi araçlarla Telegram üzerinden doğrudan ürün satın.",
            "Destek taleplerini otomatik yanıtlayan botlar kurun.",
            "Kripto varlıklarınızı güvenli cüzdan botları ile yönetin.",
            "Dosya formatlarını (PDF, JPG, MP4) dönüştüren araçlar kullanın."
        ]
    },
    {
        titlePrefix: "Telegram ile Uzaktan Çalışma: ",
        topics: [
            "Ekip İletişimi", "Dosya Paylaşım İpuçları", "Görüntülü Toplantılar", "Kanal Tabanlı Duyurular", "Proje Yönetimi",
            "Freelancer Toplulukları", "İş Bulma Kanalları", "Dijital Göçebe Grupları", "Verimlilik Araçları", "Güvenli İletişim"
        ],
        intro: "Ofis cebinize sığsın. Uzaktan çalışan ekipler ve freelancerlar için Telegram'ı bir sanal ofise dönüştürme rehberi. Slack veya Teams'e güçlü bir alternatif.",
        points: [
            "Konulara ayrılmış grupler (Topics) ile projeleri düzenleyin.",
            "Sınırsız dosya boyutu ile büyük proje dosyalarını paylaşın.",
            "Gürültü engellemeli sesli sohbetler ile toplantı yapın.",
            "Ekran paylaşımı özelliği ile sunumlarınızı gerçekleştirin.",
            "Freelancer iş ilanları paylaşan kanalları takip edin."
        ]
    },
    {
        titlePrefix: "Telegram Proxy ve VPN: ",
        topics: [
            "MTProto Proxy Kurulumu", "SOCKS5 Ayarları", "Sansürü Aşma", "IP Gizleme", "Bağlantı Hızlandırma",
            "Ücretsiz Proxy Kanalları", "Kendi Proxy Sunucunuz", "VPN vs Proxy", "Dijital Güvenlik", "Anonimlik"
        ],
        intro: "Erişim engellerini aşmak ve bağlantınızı güvence altına almak için Telegram'ın gelişmiş proxy özelliklerini nasıl kullanırsınız? Kendi MTProto sunucunuzu kurmayı öğrenin.",
        points: [
            "Kendi MTProto proxy sunucunuzu kurarak bağlantınızı şifreleyin.",
            "Sponsorlu kanallar sayesinde proxy sunucunuzdan gelir elde edin.",
            "Düşük ping süreleri için lokasyona yakın sunucular seçin.",
            "VPN kullanmadan sadece uygulama içi trafiği yönlendirin.",
            "Telegram'ın dahili proxy listesi özelliklerini keşfedin."
        ]
    },
    {
        titlePrefix: "Telegram İleri Düzey İpuçları: ",
        topics: [
            "Geliştirici Seçenekleri", "Özel Temalar", "Bot API Tokenleri", "Veri İhracı (Export)", "Klavye Kısayolları",
            "Debug Menüsü", "Yerel Veritabanı Temizliği", "İki Adımlı Doğrulama", "Oturum Yönetimi", "URL Şemaları"
        ],
        intro: "Sadece uzmanların bildiği gizli menüler ve ayarlar. Telegram'ın geliştirici seçeneklerini açarak uygulamanın sınırlarını zorlayın ve tam kontrol sağlayın.",
        points: [
            "Versiyon numarasına basılı tutarak gizli Debug menüsüne erişin.",
            "Telegram Desktop için özel JSON temaları oluşturun.",
            "Kendi botunuzu oluşturmak için BotFather ile API token alın.",
            "Sohbet geçmişinizi HTML veya JSON formatında dışa aktarın.",
            "Klavye kısayolları ile fare kullanmadan uygulamayı yönetin."
        ]
    },
    {
        titlePrefix: "Ebeveynler İçin Telegram: ",
        topics: [
            "Çocuk Kilidi", "Güvenli Kanallar", "Eğitim Botları", "Ekran Süresi", "Zararlı İçerik Filtresi",
            "Konum Takibi", "Aile Grupları", "Ödev Yardımcıları", "Oyun Kısıtlaması", "Siber Zorbalık"
        ],
        intro: "Çocuklarınızın dijital dünyada güvende olduğundan emin olun. Ebeveynler için Telegram'ı güvenli bir eğitim ve iletişim aracına dönüştürme yöntemleri.",
        points: [
            "Çocuğunuzun konumunu anlık olarak takip edin.",
            "Eğitim kanallarına abone olarak derslerine yardımcı olun.",
            "Yabancılardan gelen mesajları engelleyerek güvenliği sağlayın.",
            "Hassas içerik filtresini mutlaka aktif hale getirin.",
            "Aile içi iletişim için özel ve kapalı bir grup kurun."
        ]
    },
    {
        titlePrefix: "Telegram ile E-Ticaret: ",
        topics: [
            "Mağaza Botları", "Ödeme Alma", "Ürün Kataloğu", "Müşteri Destek", "Sipariş Takibi",
            "Kampanya Duyuruları", "Dropshipping", "Affiliate Marketing", "Dijital Ürün Satışı", "Kupon Kodları"
        ],
        intro: "Web sitesine ihtiyacınız yok. Telegram üzerinden ürünlerinizi sergileyin, ödeme alın ve müşteri ilişkilerinizi yönetin. Yeni nesil sosyal ticaret rehberi.",
        points: [
            "Döviz ve kripto para ile ödeme kabul edin.",
            "Botlar üzerinden otomatik ürün kataloğu sunun.",
            "Sipariş durumunu müşteriye anlık bildirim olarak gönderin.",
            "İndirim kuponları oluşturarak sadık müşteriler kazanın.",
            "Kanalınızda ürün tanıtım videoları ve görselleri paylaşın."
        ]
    },
    {
        titlePrefix: "Kripto ve Blockchain Dünyası: ",
        topics: [
            "Airdrop Avcılığı", "NFT Koleksiyonları", "DeFi Haberleri", "Altcoin Sinyalleri", "Madencilik Grupları",
            "Blockchain Eğitimi", "Token Analizi", "Scam Uyarıları", "ICO Takvimi", "Kripto Sözlük"
        ],
        intro: "Kripto para yatırımcıları için en önemli bilgi kaynağı Telegram. Doğru kanalları takip ederek piyasanın nabzını tutun ve fırsatları kaçırmayın.",
        points: [
            "Güvenilir sinyal kanalları ile al-sat stratejilerinizi geliştirin.",
            "Yeni çıkan projelerin Airdrop etkinliklerine katılın.",
            "Dolandırıcılık girişimlerine karşı uyanık olun ve teyit edin.",
            "Balina hareketlerini takip eden botlar kullanın.",
            "Blockchain teknolojisi hakkında eğitici içeriklere ulaşın."
        ]
    },
    {
        titlePrefix: "Popüler Kültür ve Telegram: ",
        topics: [
            "Film ve Dizi Kanalları", "Kitap Kulüpleri", "Müzik Arşivleri", "Fan Toplulukları", "Spoiler Tartışmaları",
            "Duvar Kağıtları", "Komik Videolar", "Viral Memeler", "Ünlü Kanalları", "Podcast Yayınları"
        ],
        intro: "Eğlence dünyası parmaklarınızın ucunda. En yeni filmlerden, popüler kitaplara ve fan topluluklarına kadar Telegram'ın kültürel hazinesini keşfedin.",
        points: [
            "Netflix ve sinema filmleri hakkında tartışma gruplarına katılın.",
            "PDF ve EPUB formatında geniş e-kitap arşivlerine ulaşın.",
            "Yüksek kaliteli (FLAC) müzik paylaşım kanallarını bulun.",
            "Favori dizileriniz için spoiler içeren ve içermeyen grupları ayırın.",
            "Telefonunuz için 4K duvar kağıtları indirin."
        ]
    },
    {
        titlePrefix: "Telegram Premium Özellikleri: ",
        topics: [
            "4GB Dosya Yükleme", "Hızlı İndirme", "Sesli Mesaj Deşifre", "Premium Stickerlar", "Profil Rozeti",
            "Reklamsız Deneyim", "Daha Fazla Klasör", "Hareketli Profil Resmi", "Özel Uygulama İkonu", "Emoji Durumları"
        ],
        intro: "Telegram Premium'a geçmeye değer mi? Aylık aboneliğin getirdiği tüm ayrıcalıkları, sınırların nasıl kalktığını ve kullanıcı deneyimine etkisini detaylandırıyoruz.",
        points: [
            "4GB'a kadar devasa dosyaları buluta yükleyin.",
            "Dosyaları standart kullanıcılara göre maksimum hızda indirin.",
            "Okumaya müsait olmadığınızda sesli mesajları metne çevirin.",
            "İsminizin yanına prestijli bir yıldız rozeti ekleyin.",
            "Kanallardaki sponsorlu reklamları tamamen kaldırın."
        ]
    },
    {
        titlePrefix: "Telegram Kanal Büyütme Taktikleri: ",
        topics: [
            "İçerik Planlaması", "Etkileşim Artırma", "Çekiliş Düzenleme", "Karşılıklı Tanıtım", "Reklam Verme",
            "İstatistik Analizi", "Hedef Kitle", "Görsel Tasarım", "SEO Uyumu", "Link Kısaltma"
        ],
        intro: "Sıfırdan binlerce aboneye ulaşmanın yol haritası. Kanalınızı organik olarak büyütmek, etkileşimi artırmak ve sadık bir kitle oluşturmak için denenmiş stratejiler.",
        points: [
            "Düzenli ve kaliteli içerik paylaşım takvimi oluşturun.",
            "Takipçilerinizle anketler ve yorumlar üzerinden etkileşime girin.",
            "Benzer büyüklükteki kanallarla çapraz tanıtım (Cross-Promo) yapın.",
            "İstatistikleri analiz ederek en çok okunan içerik türlerini belirleyin.",
            "Kanal isminizi ve açıklamanızı arama motorlarına (SEO) uygun yazın."
        ]
    }
];

function generateHtmlContent(template: any, topic: string) {
    const title = `${template.titlePrefix}${topic}`;

    let html = `
    <article>
        <p class="lead">${template.intro}</p>
        
        <h2>${title} ve Kapsamlı Rehber</h2>
        <p>Telegram dünyasında <strong>${topic}</strong> konusu, kullanıcı deneyimini doğrudan etkileyen önemli bir başlıktır. Bu yazımızda, <em>${template.titlePrefix.replace(': ', '')}</em> kategorisindeki en iyi pratikleri ve bilinmesi gerekenleri derledik.</p>

        <h3>Adım Adım Uygulama Rehberi</h3>
        <ul>
            ${template.points.map((p: string) => `<li>${p}</li>`).join('\n            ')}
        </ul>

        <h2>Neden Bu Konuya Önem Vermelisiniz?</h2>
        <p>Dijital çağda <strong>${topic}</strong> hakkında bilgi sahibi olmak, hem bireysel hem de kurumsal kullanımda size hız ve güvenlik kazandırır. Telegram'ın sunduğu bu özellikleri tam kapasiteyle kullanarak rakiplerinizin önüne geçebilirsiniz.</p>

        <h3>Profesyonel Tavsiyeler</h3>
        <p>Konuyla ilgili uzman görüşleri şunlardır:</p>
        <ol>
            <li>Her zaman resmi kaynaklardan ve güvenilir botlardan işlem yapın.</li>
            <li>Ayarlarınızı kişiselleştirerek verimliliğinizi artırın.</li>
            <li>Topluluk kurallarına ve gizlilik ilkelerine dikkat edin.</li>
            <li>Yenilikleri takip etmek için Telegram'ın resmi blogunu izleyin.</li>
        </ol>

        <h2>Sıkça Sorulan Sorular (SSS)</h2>
        <div class="faq-section">
            <p><strong>S: Bu özellik ücretli mi?</strong><br>
            C: Telegram'ın temel özellikleri ücretsizdir, ancak bazı gelişmiş fonksiyonlar Premium abonelik gerektirebilir.</p>

            <p><strong>S: ${topic} güvenli mi?</strong><br>
            C: Telegram'ın şifreleme protokolleri ve güvenlik önlemleri sayesinde verileriniz güvendedir.</p>
        </div>

        <div class="conclusion">
            <h3>Özet</h3>
            <p><strong>${title}</strong> yazımızın sonuna geldik. Daha fazla ipucu, rehber ve güncel haber için sitemizi takip etmeye devam edin.</p>
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

const AUTHOR_NAMES = ["Eray Çaylak", "Admin", "Telegram Uzmanı", "Teknoloji Editörü", "Kripto Analisti", "Sosyal Medya Gurusu", "Haber Masası", "Bot Geliştirici", "Yazılım Mimarı", "Topluluk Yöneticisi"];

function main() {
    console.log('Generating Batch 5 (Independent 300) blog posts...');

    const TOTAL_POSTS = 300;
    const CHUNK_SIZE = 50;
    const TOTAL_CHUNKS = Math.ceil(TOTAL_POSTS / CHUNK_SIZE);

    let postCount = 0;

    for (let chunk = 1; chunk <= TOTAL_CHUNKS; chunk++) {
        let sqlContent = `-- Migration: Seed Batch 5 - Independent 300 (Part ${chunk}/${TOTAL_CHUNKS})
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

            // Variation logic for 300 independent posts
            const variation = Math.floor(postCount / 100);

            if (variation === 1) {
                const suffixes = [" Rehberi", " İncelemesi", " Nasıl Yapılır?", " Taktikleri", " Sırları"];
                displayTopic = topic + suffixes[postCount % 5];
            } else if (variation === 2) {
                const prefixes = ["En İyi ", "Güncel ", "Profesyonel ", "Gizli ", " popüler "];
                displayTopic = prefixes[postCount % 5] + topic;
            }

            const title = `${template.titlePrefix}${displayTopic}`;
            let slug = generateSlug(title);

            // Ensure uniqueness with higher entropy
            slug = slug + '-' + Math.random().toString(36).substring(2, 8);

            const content = generateHtmlContent(template, displayTopic);
            const category = CATEGORIES[postCount % CATEGORIES.length];

            const metaTitle = `${title} | Telegram Dünyası`;
            const metaDesc = template.intro.substring(0, 155) + "...";

            const baseTags = ["telegram", "blog", "2026", "yeni"];
            const topicTags = displayTopic.toLowerCase().split(' ').filter(w => w.length > 3);
            const tags = [...new Set([...baseTags, ...topicTags, category.toLowerCase()])].join(', ');

            const author = AUTHOR_NAMES[postCount % AUTHOR_NAMES.length];

            const readingTime = Math.floor(Math.random() * 8) + 3; // 3-11 mins

            // Random date distributed over the last year
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            // Add random time
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

        // Exact naming convention requested: "300-part1" in the name
        // We will stick to the migration timestamp prefix standard but add the requested string.
        const fileName = `20260216210000_seed_blog_posts_300_part${chunk}.sql`;
        const outputPath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
        fs.writeFileSync(outputPath, sqlContent, 'utf8');
        console.log(`Generated migration file Part ${chunk}: ${outputPath}`);
    }
}

main();
