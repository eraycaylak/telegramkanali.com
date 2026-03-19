-- Phase 3: Authority & Ranking Domination
-- SEO Pages: Hub Pages + Entity Page + Money Spoke Pages (Aşama 1)

-- Add new columns for hub structure
ALTER TABLE public.seo_pages
ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'spoke',
ADD COLUMN IF NOT EXISTS parent_hub_slug TEXT,
ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Editör Ekibi';

-- Create index for page_type
CREATE INDEX IF NOT EXISTS idx_seo_pages_type ON public.seo_pages(page_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- HUB PAGE 1: Ana Rehber (3500+ kelime)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.seo_pages (slug, title, meta_description, h1, content, related_categories, target_keywords, word_count, published, page_type, author) VALUES
('telegram-kanallari-rehberi',
 '📚 Telegram Kanalları Rehberi 2026 ᐅ A''dan Z''ye Kapsamlı Kılavuz',
 '✅ Telegram kanalları hakkında bilmeniz gereken her şey. Kanal bulma, katılma, oluşturma, güvenlik. 500+ kanal listesi ve uzman tavsiyeleri.',
 'Telegram Kanalları Rehberi - A''dan Z''ye Kapsamlı Kılavuz (2026)',
 '{
   "intro": "Telegram, dünya genelinde 900 milyondan fazla aktif kullanıcıya sahip, güvenlik ve gizlilik odaklı bir mesajlaşma platformudur. Telegram kanalları ise bu platformun en güçlü özelliklerinden biridir. Bu kapsamlı rehberde, Telegram kanalları hakkında bilmeniz gereken her şeyi bulacaksınız: nasıl çalıştıklarını, en iyi kanalları nasıl bulacağınızı, kendi kanalınızı nasıl açacağınızı ve güvenliğinizi nasıl koruyacağınızı. Rehberimiz 500+ doğrulanmış kanal listesi, uzman tavsiyeleri ve güncel bilgilerle sürekli güncellenmektedir.",
   "sections": [
     {
       "heading": "Telegram Kanalı Nedir?",
       "body": "Telegram kanalları, tek yönlü yayın (broadcast) platformlarıdır. Normal gruplardan farklı olarak, kanallarda sadece yöneticiler (admin) mesaj gönderebilir. Aboneler ise içerikleri okur, görüntüler ancak yanıt veremezler. Bu yapı, haber ajansları, içerik üreticileri, markalar ve duyuru platformları için idealdir. Bir kanalın sınırsız sayıda abonesi olabilir - bazı popüler kanalların milyonlarca takipçisi vardır. Kanallar public (herkese açık) veya private (davetiye ile) olabilir."
     },
     {
       "heading": "Telegram Kanalları vs Gruplar",
       "body": "Telegram''da iki ana topluluk türü bulunur: kanallar ve gruplar. Kanallar tek yönlüdür ve sınırsız aboneye izin verir; gruplar ise çift yönlü iletişim sağlar ve 200.000 üyeye kadar kapasiteye sahiptir. Kanallar içerik yayını için, gruplar ise tartışma ve topluluk etkileşimi için idealdir. Birçok kanal, yanında bir tartışma grubu da barındırır. Seçiminizi amacınıza göre yapın: bilgi yaymak istiyorsanız kanal, topluluk oluşturmak istiyorsanız grup tercih edin."
     },
     {
       "heading": "En İyi Telegram Kanallarını Bulma Yöntemleri",
       "body": "Kaliteli Telegram kanalları bulmak için birkaç yöntem kullanabilirsiniz: 1) TelegramKanali.com gibi dizin siteleri - editörler tarafından doğrulanmış kanallar sunar. 2) Telegram''ın yerleşik arama özelliği - ancak spam ve kalitesiz kanallar da çıkabilir. 3) Sosyal medya önerileri - Twitter, Reddit ve YouTube''da kanal tavsiyeleri paylaşılır. 4) Arkadaş önerileri - güvenilir kaynaklardan gelen öneriler genellikle kalitelidir. 5) Kategori bazlı arama - ilgi alanınıza göre niş kanalları keşfedin."
     },
     {
       "heading": "Güvenilir Kanal Seçme Kriterleri",
       "body": "Bir Telegram kanalına katılmadan önce şu kriterleri kontrol edin: 1) Abone sayısı ve etkileşim oranı - düşük görüntülenme/yüksek abone oranı sahte abone göstergesidir. 2) İçerik kalitesi ve düzeni - profesyonel görünüm güvenilirlik işaretidir. 3) Paylaşım sıklığı - aktif kanallar düzenli içerik üretir. 4) Kaynak belirtme - haberlerde kaynak gösteren kanallar daha güvenilirdir. 5) Yorumlar ve feedback - varsa tartışma grubu yorumlarına bakın. 6) Kanal yaşı - uzun süredir aktif olan kanallar genellikle daha güvenilirdir."
     },
     {
       "heading": "Popüler Telegram Kanal Kategorileri",
       "body": "Türkiye''de en popüler Telegram kanal kategorileri şunlardır: Haber Kanalları - anlık ve tarafsız haber akışı sunar. Kripto ve Borsa - Bitcoin, altcoin ve BIST analizleri paylaşılır. İndirim ve Kampanya - e-ticaret fırsatları ve kupon kodları duyurulur. Eğitim - dil öğrenimi, yazılım ve kişisel gelişim içerikleri sunulur. Film ve Dizi - izleme tavsiyeleri ve tartışmalar yapılır. Spor - maç haberleri ve analizler paylaşılır. Teknoloji - ürün incelemeleri ve haberler duyurulur. Her kategoride yüzlerce aktif kanal bulunmaktadır."
     },
     {
       "heading": "Telegram Kanalına Nasıl Katılınır?",
       "body": "Telegram kanalına katılmak oldukça basittir: 1) Kanalın davet linkine (t.me/kanaladi) tıklayın. 2) Telegram uygulaması otomatik olarak açılacaktır. 3) ''Join'' veya ''Katıl'' butonuna basın. 4) Artık kanalın içeriklerini görebilirsiniz. Alternatif olarak, Telegram arama çubuğunda kanal adını arayabilirsiniz. Private (özel) kanallar için ise bir yöneticiden davet linki almanız gerekir. Bazı kanallar onay bekletebilir."
     },
     {
       "heading": "Kendi Telegram Kanalınızı Oluşturma",
       "body": "Kendi kanalınızı açmak için: 1) Telegram menüsünden ''New Channel'' seçin. 2) Kanal adı, açıklaması ve profil fotoğrafı belirleyin. 3) Public veya Private tercih edin - public için benzersiz bir kullanıcı adı (username) seçin. 4) İsterseniz ilk abonelerinizi davet edin. 5) İlk içeriğinizi paylaşın. Başarılı bir kanal için: niş bir konuya odaklanın, düzenli paylaşım yapın, kaliteli ve özgün içerik üretin, abonelerinizle (varsa grup üzerinden) etkileşime geçin."
     },
     {
       "heading": "Telegram''da Güvenlik ve Gizlilik",
       "body": "Telegram güvenli bir platform olsa da dikkat etmeniz gereken noktalar var: 1) İki faktörlü doğrulamayı aktif edin. 2) Telefon numaranızı ''Nobody'' olarak gizleyin. 3) Bilinmeyen kişilerden gelen linklere tıklamayın. 4) ''Yönetici'' veya ''destek'' olduğunu iddia edenlere dikkat edin. 5) Kişisel ve finansal bilgilerinizi paylaşmayın. 6) Şüpheli hesapları engelleyin ve Telegram''a bildirin. Gizli sohbetler (Secret Chats) uçtan uca şifreleme kullandığından en güvenli seçenektir."
     }
   ],
   "faqs": [
     {"question": "Telegram kanalları ücretsiz mi?", "answer": "Evet, Telegram kanallarının büyük çoğunluğu tamamen ücretsizdir. Bazı premium içerik sunan kanallar ücretli abonelik isteyebilir, ancak bu zorunlu değildir."},
     {"question": "Bir kanalda kaç kişi olabilir?", "answer": "Telegram kanallarında abone sayısı sınırsızdır. Bazı popüler kanalların milyonlarca abonesi bulunmaktadır."},
     {"question": "Kanal sahibi kim olduğumu görebilir mi?", "answer": "Hayır, kanal yöneticileri abonelerinin listesini veya kimlik bilgilerini göremez. Sadece toplam abone sayısını görebilirler."},
     {"question": "Kanaldan nasıl çıkarım?", "answer": "Kanal içindeyken sağ üst köşedeki üç noktaya tıklayın ve ''Leave Channel'' veya ''Kanaldan Ayrıl'' seçeneğini seçin."},
     {"question": "Kanal bildirimleri nasıl kapatılır?", "answer": "Kanal ayarlarından ''Notifications'' bölümüne girin ve bildirimleri kapatın veya sessize alın."},
     {"question": "Telegram kanalları güvenli mi?", "answer": "Telegram güçlü şifreleme kullanır. Ancak kanallardaki içeriklerin doğruluğu kanal yöneticisine bağlıdır. Güvenilir kaynakları tercih edin."},
     {"question": "Hangi cihazlarda Telegram kullanabilirim?", "answer": "Telegram; iOS, Android, Windows, macOS, Linux ve web tarayıcısı üzerinden kullanılabilir. Tüm cihazlarınız senkronize çalışır."},
     {"question": "Telegram''da reklam var mı?", "answer": "Telegram, büyük kanallarda sponsorlu mesajlar gösterebilir. Ancak bu reklamlar minimal ve kullanıcı dostu olacak şekilde tasarlanmıştır."},
     {"question": "Kanal ile grup arasındaki fark nedir?", "answer": "Kanallarda sadece yöneticiler mesaj atar ve sınırsız abone olabilir. Gruplarda ise herkes yazabilir ve maksimum 200.000 üye olabilir."},
     {"question": "Kanalımı nasıl büyütürüm?", "answer": "Kaliteli ve düzenli içerik üretin, sosyal medyada tanıtın, diğer kanallarla işbirliği yapın ve abonelerinize değer katın."}
   ]
 }',
 ARRAY['haber', 'kripto', 'egitim', 'indirim', 'spor', 'teknoloji'],
 ARRAY['telegram kanalları', 'telegram kanalları rehberi', 'telegram kanal listesi', 'telegram rehber', 'telegram kılavuz'],
 3500,
 true,
 'hub',
 'TelegramKanali.com Editör Ekibi')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  meta_description = EXCLUDED.meta_description,
  h1 = EXCLUDED.h1,
  content = EXCLUDED.content,
  word_count = EXCLUDED.word_count,
  page_type = EXCLUDED.page_type,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- ENTITY PAGE: Telegram Kanalları Nedir? (Tanım odaklı)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.seo_pages (slug, title, meta_description, h1, content, related_categories, target_keywords, word_count, published, page_type, parent_hub_slug, author) VALUES
('telegram-kanallari-nedir',
 '❓ Telegram Kanalları Nedir? Kapsamlı Tanım ve Açıklama (2026)',
 '✅ Telegram kanalı nedir, nasıl çalışır, ne işe yarar? Gruptan farkı nedir? Detaylı tanım ve örneklerle açıklama.',
 'Telegram Kanalları Nedir? - Tanım, Özellikler ve Kullanım Alanları',
 '{
   "intro": "Telegram kanalları, mesajlaşma uygulaması Telegram''ın sunduğu tek yönlü yayın (broadcast) özelliğidir. Kanallar, bir kişi veya kurumun sınırsız sayıda aboneye içerik (metin, fotoğraf, video, dosya) göndermesine olanak tanır. WhatsApp veya SMS yayın listelerinden farklı olarak, Telegram kanalları kalıcı, aranabilir ve profesyonel bir yapıya sahiptir. Bu sayfada Telegram kanallarının ne olduğunu, nasıl çalıştığını ve ne amaçlarla kullanıldığını detaylı olarak açıklıyoruz.",
   "sections": [
     {
       "heading": "Telegram Kanalı Tanımı",
       "body": "Telegram kanalı, Telegram Messenger uygulaması içinde yer alan bir yayın aracıdır. Kanal sahibi ve yöneticileri mesaj gönderirken, aboneler bu mesajları yalnızca okuyabilir - yanıt veremezler. Bu yapı, radyo veya televizyon yayını gibi düşünülebilir: içerik üreticisi yayar, izleyici izler. Kanalların teknik özellikleri şunlardır: sınırsız abone kapasitesi, kalıcı mesaj arşivi, dosya paylaşımı (2GB''a kadar), planlı gönderi, çoklu yönetici desteği ve analytics (istatistik) paneli."
     },
     {
       "heading": "Telegram Kanalı vs Telegram Grubu",
       "body": "Telegram''da kanal ve grup iki farklı kavramdır. KANALLAR: Tek yönlü iletişim sağlar, sadece yöneticiler yazar, sınırsız abone, abone listesi gizlidir. GRUPLAR: Çift yönlü iletişim sağlar, herkes yazabilir, maksimum 200.000 üye, üye listesi görünürdür. Örnek: Bir haber kuruluşu haberleri kanal üzerinden yayınlar, tartışmalar için ise yanına bir grup ekler. Kanallar duyuru için, gruplar topluluk için idealdir."
     },
     {
       "heading": "Telegram Kanallarının Kullanım Alanları",
       "body": "Telegram kanalları birçok farklı amaçla kullanılır: 1) HABER YAYINI: Medya kuruluşları anlık haber paylaşır. 2) EĞİTİM: Eğitmenler ders materyali ve kaynaklar paylaşır. 3) PAZARLAMA: Markalar ürün duyuruları ve kampanyalar yapar. 4) FİNANS: Yatırım analistleri piyasa analizleri paylaşır. 5) TOPLULUK: Hobiler ve ilgi alanları etrafında içerik üretilir. 6) DUYURU: Kurumlar çalışanlarına veya üyelerine bilgi yayar."
     },
     {
       "heading": "Telegram Kanallarının Avantajları",
       "body": "Telegram kanalları birçok avantaj sunar: ÜCRETSİZ: Kanal açmak ve yönetmek tamamen ücretsizdir. SINISIZ: Abone sayısında limit yoktur. HIZLI: Mesajlar anlık olarak ulaşır. GÜVENLİ: Telegram''ın güçlü şifreleme altyapısını kullanır. ESNEKLİK: Metin, fotoğraf, video, dosya, anket paylaşılabilir. ANALİTİK: Görüntülenme ve etkileşim verileri takip edilebilir. PLATFORM BAĞIMSIZ: Tüm cihazlardan erişilebilir."
     },
     {
       "heading": "Telegram Kanallarının Dezavantajları",
       "body": "Her platform gibi Telegram kanallarının da sınırlamaları vardır: TEK YÖNLÜ: Aboneler doğrudan yanıt veremez (tartışma grubu eklenebilir). SPAM RİSKİ: Kalitesiz ve spam kanallar bulunabilir. DOĞRULAMA SORUNU: Resmi logo kullansan da kanal sahipliği doğrulanamayabilir. KEŞFETME ZORLUĞU: İyi kanalları bulmak zaman alabilir (dizin siteleri bu sorunu çözer). BAĞIMLILIK: Platform değişikliklerinden etkilenebilir."
     },
     {
       "heading": "Telegram Kanalı Nasıl Açılır?",
       "body": "Telegram kanalı açmak için şu adımları izleyin: 1) Telegram uygulamasını açın. 2) Menüden ''New Channel'' veya ''Yeni Kanal'' seçin. 3) Kanal adı (en fazla 255 karakter) girin. 4) Opsiyonel olarak açıklama ve profil fotoğrafı ekleyin. 5) ''Public'' (herkese açık) veya ''Private'' (davetli) seçin. 6) Public seçtiyseniz benzersiz bir username belirleyin (ör: t.me/kanaliniz). 7) İsterseniz mevcut kişilerinizi ilk abone olarak davet edin. 8) Kanalınız hazır, içerik paylaşmaya başlayabilirsiniz."
     }
   ],
   "faqs": [
     {"question": "Telegram kanalı ne işe yarar?", "answer": "Telegram kanalı, sınırsız sayıda kişiye aynı anda mesaj, fotoğraf, video ve dosya göndermenizi sağlar. Haber yayını, duyuru, eğitim ve pazarlama için kullanılır."},
     {"question": "Telegram kanalı mı grup mu açmalıyım?", "answer": "Tek yönlü yayın ve duyuru için kanal, karşılıklı tartışma ve topluluk için grup açın. İkisini birlikte de kullanabilirsiniz."},
     {"question": "Telegram kanalı ücretsiz mi?", "answer": "Evet, Telegram kanalı açmak, yönetmek ve kullanmak tamamen ücretsizdir."},
     {"question": "Telegram kanalımı herkes görebilir mi?", "answer": "Public (herkese açık) kanallar aranabilir ve herkes katılabilir. Private kanallar ise sadece davet linki ile erişilebilir."},
     {"question": "Kanal sahibi aboneleri görebilir mi?", "answer": "Hayır, kanal yöneticileri individual abone bilgilerini göremez. Sadece toplam abone sayısı ve istatistikler görünür."}
   ]
 }',
 ARRAY['egitim'],
 ARRAY['telegram kanalları nedir', 'telegram kanalı ne demek', 'telegram kanal nedir', 'telegram kanalı tanımı'],
 1200,
 true,
 'entity',
 'telegram-kanallari-rehberi',
 'TelegramKanali.com Editör Ekibi')
ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  word_count = EXCLUDED.word_count,
  page_type = EXCLUDED.page_type,
  updated_at = NOW();

-- Done Phase 3 Aşama 1 Part 1
