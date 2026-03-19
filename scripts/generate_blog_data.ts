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
        titlePrefix: "Telegram Kanalınızı Büyütmenin Yolları: ",
        topics: [
            "2026 Stratejileri", "Organik Takipçi Kasma", "Reklam Verme İpuçları", "İçerik Planlaması", "Etkileşim Artırma"
        ],
        intro: "Telegram kanalı büyütmek, doğru strateji ve sabır gerektiren bir süreçtir. Bu rehberde, kanalınızı organik olarak nasıl büyütebileceğinizi ve hedef kitlenize nasıl ulaşabileceğinizi detaylıca ele alacağız.",
        points: [
            "Düzenli ve kaliteli içerik paylaşımı yapın.",
            "Kanal açıklamanızı ve profil fotoğrafınızı optimize edin.",
            "Diğer sosyal medya platformlarında çapraz tanıtım yapın.",
            "Benzer kanallarla karşılıklı tanıtım (cross-promotion) anlaşmaları yapın.",
            "Telegram kataloglarına ve dizinlerine kaydolun."
        ]
    },
    {
        titlePrefix: "Telegram Botları ile İşinizi Kolaylaştırın: ",
        topics: [
            "En İyi Yönetim Botları", "Otomatik Paylaşım Botları", "Kripto Botları", "Eğlence Botları", "Moderasyon Araçları"
        ],
        intro: "Telegram botları, kanal ve grup yönetimini otomatize etmenin en güçlü yoludur. İşte işinizi kolaylaştıracak ve verimliliğinizi artıracak en iyi Telegram botları hakkında kapsamlı bir inceleme.",
        points: [
            "BotFather ile kendi botunuzu oluşturun ve yönetin.",
            "GroupHelp botu ile gelişmiş moderasyon özellikleri ekleyin.",
            "ControllerBot ile gönderilerinizi zamanlayın ve formatlayın.",
            "Anket botları ile topluluğunuzun nabzını tutun.",
            "Ödeme botları ile Telegram üzerinden satış yapın."
        ]
    },
    {
        titlePrefix: "Telegram Gruplarında Etkileşimi Artırma: ",
        topics: [
            "Topluluk Yönetimi", "Aktif Üye Çekme", "Spam Önleme", "Etkinlik Fikirleri", "Moderasyon Kuralları"
        ],
        intro: "Aktif bir Telegram grubu, sadık bir topluluk oluşturmanın anahtarıdır. Grubunuzdaki etkileşimi artırmak ve üyeleri konuşmaya teşvik etmek için uygulayabileceğiniz kanıtlanmış yöntemler.",
        points: [
            "Düzenli olarak soru-cevap etkinlikleri düzenleyin.",
            "Topluluk kurallarını net bir şekilde belirleyin ve sabitlenen mesaja ekleyin.",
            "Rose bot gibi anti-spam botları kullanarak kalitesiz içerikleri engelleyin.",
            "Üyelerinize özel içerikler ve fırsatlar sunun.",
            "Sesli sohbetler özelliği ile canlı yayınlar yapın."
        ]
    },
    {
        titlePrefix: "Telegram Premium Özellikleri: ",
        topics: [
            "Neden Geçmelisiniz?", "Hikaye Paylaşımı", "Özel Emojiler", "Dosya Yükleme Sınırları", "Rozetler ve Tasarım"
        ],
        intro: "Telegram Premium, kullanıcılara sunduğu ayrıcalıklı özelliklerle deneyimi bir üst seviyeye taşıyor. Peki Telegram Premium'a geçmeye değer mi? İşte tüm detaylarıyla Premium özellikleri.",
        points: [
            "4 GB'a kadar dosya yükleme kapasitesi.",
            "Daha hızlı indirme hızları.",
            "Sesli mesajları metne dönüştürme özelliği.",
            "Profilinizde özel Premium rozeti.",
            "Benzersiz çıkartmalar ve tepkiler."
        ]
    },
    {
        titlePrefix: "Kripto Para Toplulukları için Telegram: ",
        topics: [
            "Güvenlik İpuçları", "Airdrop Takibi", "Sinyal Grupları", "Yatırımcı İlişkileri", "Dolandırıcılardan Korunma"
        ],
        intro: "Kripto para dünyasının kalbi Telegram'da atıyor. Yatırımcılar ve projeler için vazgeçilmez bir platform olan Telegram'da kripto topluluklarını nasıl bulabilir ve güvenliğinizi nasıl sağlarsınız?",
        points: [
            "Resmi kanalları her zaman web sitelerinden doğrulayın.",
            "Tanımadığınız kişilerden gelen özel mesajlara dikkat edin.",
            "İki faktörlü doğrulamayı (2FA) mutlaka etkinleştirin.",
            "Gizlilik ayarlarınızı yaparak numaranızı gizleyin.",
            "Gruplardaki admin taklidi yapan dolandırıcılara karşı uyanık olun."
        ]
    },
    {
        titlePrefix: "Telegram'da Para Kazanma Yöntemleri: ",
        topics: [
            "Reklam Gelirleri", "Ücretli Abonelikler", "Affiliate Pazarlama", "Ürün Satışı", "Kanal Alım Satımı"
        ],
        intro: "Telegram sadece bir mesajlaşma uygulaması değil, aynı zamanda ciddi bir gelir kaynağıdır. Telegram kanalınız üzerinden para kazanmanın en etkili ve sürdürülebilir yollarını bu yazıda derledik.",
        points: [
            "Kanalınızda sponsorlu içerikler yayınlayın.",
            "Özel bir VIP grup oluşturarak üyelik ücreti talep edin.",
            "Affiliate linkleri paylaşarak komisyon kazanın.",
            "Kendi dijital veya fiziksel ürünlerinizi satın.",
            "Büyüttüğünüz kanalları satarak gelir elde edin."
        ]
    },
    {
        titlePrefix: "Dijital Pazarlamada Telegram'ın Gücü: ",
        topics: [
            "Marka Bilinirliği", "Müşteri Desteği", "Duyuru Kanalları", "Chatbot Entegrasyonu", "Analytics Kullanımı"
        ],
        intro: "Markalar için Telegram, müşterilere doğrudan ulaşmanın en hızlı yoludur. Dijital pazarlama stratejinize Telegram'ı nasıl entegre edebileceğinizi ve dönüşümleri nasıl artırabileceğinizi öğrenin.",
        points: [
            "Müşterilerinize anlık destek sağlamak için botlar kullanın.",
            "Yeni ürün lansmanlarını ve kampanyaları duyuru kanalından paylaşın.",
            "Kanal istatistiklerini analizerek hedef kitlenizi tanıyın.",
            "Web sitenize Telegram widget'ı ekleyerek ziyaretçileri yönlendirin.",
            "Kişiselleştirilmiş mesajlar ile müşteri sadakatini artırın."
        ]
    },
    {
        titlePrefix: "Telegram Gizlilik ve Güvenlik Rehberi: ",
        topics: [
            "Numara Gizleme", "Son Görülme Ayarları", "Grup Davetleri", "Oturum Yönetimi", "Mesaj Silme"
        ],
        intro: "Telegram'ın en büyük avantajlarından biri sunduğu gelişmiş gizlilik seçenekleridir. Hesabınızı güvende tutmak ve kişisel verilerinizi korumak için yapmanız gereken en önemli ayarlar.",
        points: [
            "Telefon numaranızı 'Hiç Kimse' olarak ayarlayın.",
            "Gruplara sizi kimlerin ekleyebileceğini sınırlayın.",
            "Eş zamanlı oturumlarınızı düzenli olarak kontrol edin.",
            "Kendi kendini yok eden mesaj özelliğini kullanın.",
            "Uygulama kilidi (Passcode Lock) özelliğini aktif edin."
        ]
    },
    {
        titlePrefix: "Telegram Sticker ve Tema Yapımı: ",
        topics: [
            "Kendi Stickerını Yap", "Hareketli Çıkartmalar", "Tema Editörü", "Paket Yayınlama", "Viral Stickerlar"
        ],
        intro: "Telegram'ı eğlenceli kılan en önemli özelliklerden biri stickerlardır. Kendi sticker paketinizi nasıl oluşturacağınızı ve Telegram temalarıyla uygulamanızı nasıl kişiselleştireceğinizi adım adım anlatıyoruz.",
        points: [
            "Stickers botunu kullanarak paketinizi oluşturun.",
            "512x512 piksel boyutlarında PNG görseller hazırlayın.",
            "Hareketli stickerlar için TGS formatını öğrenin.",
            "Kendi markanıza özel stickerlar tasarlayarak bilinirlik artırın.",
            "Mevcut temaları düzenleyerek kendi renk paletinizi oluşturun."
        ]
    },
    {
        titlePrefix: "En İyi Telegram Kaynakları: ",
        topics: [
            "Film ve Dizi Kanalları", "Yazılım Grupları", "Haber Kaynakları", "Müzik Botları", "E-Kitap Arşivleri"
        ],
        intro: "Telegram dipsiz bir okyanus gibidir ve aradığınız her şeyi bulabilirsiniz. Filmden müziğe, yazılımdan habere kadar takip etmeniz gereken en iyi Telegram kanallarını ve kaynaklarını sizin için listeledik.",
        points: [
            "Telif haklarına saygılı ve yasal içerik sunan kanalları tercih edin.",
            "Yazılım ve kodlama topluluklarına katılarak kendinizi geliştirin.",
            "Anlık bildirimler için güvenilir haber kanallarını takip edin.",
            "Müzik botları ile Telegram'ı bir müzik çalar gibi kullanın.",
            "Geniş e-kitap ve PDF arşivlerine erişim sağlayın."
        ]
    }

];

function generateHtmlContent(template: any, topic: string) {
    const title = `${template.titlePrefix}${topic}`;

    // SEO-friendly voluminous content generation
    let html = `
    <article>
        <p class="lead">${template.intro}</p>
        
        <h2>${title} Hakkında Bilmeniz Gerekenler</h2>
        <p>Telegram dünyasında <strong>${topic}</strong> konusu son zamanlarda oldukça popüler hale geldi. Kullanıcıların platformu daha verimli kullanabilmesi için bu konudaki detaylara hakim olması büyük önem taşıyor. Özellikle <em>Telegram kanalı</em> ve <em>Telegram grubu</em> yöneticileri için bu stratejiler hayati değerdedir.</p>

        <h3>Öne Çıkan İpuçları ve Stratejiler</h3>
        <ul>
            ${template.points.map((p: string) => `<li>${p}</li>`).join('\n            ')}
        </ul>

        <h2>Neden ${topic} Önemlidir?</h2>
        <p>Telegram platformu sürekli güncellenmekte ve yeni özellikler eklenmektedir. <strong>${topic}</strong> konusuna odaklanmak, rakiplerinizin önüne geçmenizi sağlar via <em>Telegram SEO</em> ve organik büyüme. Etkileşim oranlarınızı artırmak ve daha geniş kitlelere ulaşmak için bu adımları mutlaka uygulayın.</p>

        <h3>Adım Adım Uygulama Rehberi</h3>
        <p>Başarıya ulaşmak için aşağıdaki adımları sırasıyla takip edebilirsiniz:</p>
        <ol>
            <li>Hedef kitlenizi net bir şekilde belirleyin.</li>
            <li>${topic} ile ilgili güncel trendleri takip edin.</li>
            <li>Kullanıcı geri bildirimlerini dikkate alarak stratejinizi optimize edin.</li>
            <li>Düzenli analiz ve raporlama yapın.</li>
        </ol>

        <h2>Sıkça Sorulan Sorular (SSS)</h2>
        <div class="faq-section">
            <p><strong>S: ${topic} ücretli midir?</strong><br>
            C: Genellikle Telegram'ın temel özellikleri ücretsizdir, ancak bazı özel araçlar ve botlar ücretli olabilir.</p>

            <p><strong>S: Kanalımı ne kadar sürede büyütebilirim?</strong><br>
            C: Bu tamamen uyguladığınız stratejinin kalitesine ve sürekliliğine bağlıdır. Sabırlı olmak en önemli faktördür.</p>
        </div>

        <div class="conclusion">
            <h3>Sonuç</h3>
            <p>Özetle, <strong>${title}</strong> konusunda uzmanlaşmak, Telegram deneyiminizi zenginleştirecektir. Daha fazla ipucu ve güncel içerik için sitemizi takip etmeye devam edin.</p>
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

const AUTHOR_NAMES = ["Eray Çaylak", "Admin", "Telegram Uzmanı", "Teknoloji Editörü", "Sosyal Medya Danışmanı"];

function main() {
    let sqlContent = `-- Migration: Seed 100 SEO Blog Posts
-- Generated automatically
-- Date: ${new Date().toISOString()}

-- Clean existing data to avoid duplicates
TRUNCATE TABLE public.blog_posts;

`;

    let postCount = 0;
    const generatedSlugs = new Set();
    const allPosts: any[] = [];

    // Flatten templates to get roughly 50 base variations (10 templates * 5 topics)
    // We need 100, so we will generate 2 variations for each template-topic combo or cycle through.

    // Let's generate 100 posts
    while (postCount < 100) {
        const templateIndex = postCount % TEMPLATES.length;
        const template = TEMPLATES[templateIndex];

        // Cycle topics or pick random? Let's cycle.
        const topicIndex = (Math.floor(postCount / TEMPLATES.length)) % template.topics.length;
        // If we run out of unique topics, append a counter or variant
        let topic = template.topics[topicIndex];

        // Variation logic to ensure 100 unique titles if 10 * 5 = 50 isn't enough
        // We have 50 topics defined. We need 100.
        // Pass 1: Uses standard topics.
        // Pass 2: Appends "Rehberi", "Detayları", "2026", "İncelemesi" etc.

        let displayTopic = topic;
        const pass = Math.floor(postCount / 50); // 0 or 1

        if (pass === 1) {
            const suffixes = [" Detaylı Rehber", " İpuçları 2026", " Püf Noktaları", " Analizi", " Hakkında Her Şey"];
            displayTopic = topic + suffixes[postCount % 5];
        }

        const title = `${template.titlePrefix}${displayTopic}`;
        let slug = generateSlug(title);

        // Ensure unique slug
        let counter = 1;
        while (generatedSlugs.has(slug)) {
            slug = `${generateSlug(title)}-${counter}`;
            counter++;
        }
        generatedSlugs.add(slug);

        const content = generateHtmlContent(template, displayTopic);
        const category = CATEGORIES[postCount % CATEGORIES.length];

        // SEO Metadata
        const metaTitle = `${title} | Telegram Kanali`;
        const metaDesc = template.intro.substring(0, 155) + "...";

        // Tags
        const baseTags = ["telegram", "sosyal medya", "teknoloji"];
        const topicTags = displayTopic.toLowerCase().split(' ').filter(w => w.length > 3);
        const tags = [...new Set([...baseTags, ...topicTags, category.toLowerCase()])].join(', ');

        const author = AUTHOR_NAMES[postCount % AUTHOR_NAMES.length];

        // Random Reading Time
        const readingTime = Math.floor(Math.random() * 5) + 3; // 3-8 mins


        // Random date within last 3 months for sorting variety
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));
        const createdAt = date.toISOString();

        const values = `(
            '${escapeSql(title)}',
            '${escapeSql(slug)}',
            '${escapeSql(template.intro)}', 
            '${escapeSql(content)}',
            '${escapeSql(category)}',
            '{${tags.split(', ').map(t => `"${t}"`).join(',')}}',
            '${escapeSql(author)}',
            true, -- published
            ${postCount < 5 ? 'true' : 'false'}, -- featured (first 5)
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

    const outputPath = path.join(process.cwd(), 'supabase', 'migrations', '20260216190000_seed_blog_posts.sql');
    fs.writeFileSync(outputPath, sqlContent, 'utf8');
    console.log(`Generated migration file at: ${outputPath}`);
}

main();
