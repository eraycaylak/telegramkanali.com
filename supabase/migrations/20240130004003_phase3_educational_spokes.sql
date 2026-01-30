-- Phase 3: Authority - Educational Keyword Spoke Pages (Aşama 3 - 20 Sayfa)
-- Eğitim, how-to rehberler, karşılaştırma ve bilgi sayfaları

INSERT INTO public.seo_pages (slug, title, meta_description, h1, content, related_categories, target_keywords, word_count, published, page_type, parent_hub_slug) VALUES

-- 1) Eğitim Kanalları (detay)
('telegram-egitim-kanallari-detay',
 '📚 Telegram Eğitim Kanalları 2026 ᐅ Ücretsiz Dersler',
 '✅ Ücretsiz eğitim içerikleri sunan Telegram kanalları. Dil öğrenme, yazılım, kişisel gelişim kursları.',
 'Telegram Eğitim Kanalları - Ücretsiz Dersler ve Kaynaklar',
 '{"intro": "Kendinizi geliştirmek için Telegram eğitim kanallarını kullanın. İngilizce, yazılım, kişisel gelişim ve sınav hazırlık içerikleri ücretsiz olarak paylaşılıyor.", "sections": [{"heading": "Eğitim Kategorileri", "body": "Yabancı dil, yazılım ve kodlama, kişisel gelişim, sınav hazırlık (YKS, KPSS, DGS) ve mesleki eğitimler."}, {"heading": "Ücretsiz Kaynaklar", "body": "PDF kitaplar, video dersler, pratik quizler ve study grupları ücretsiz sunuluyor."}], "faqs": [{"question": "Eğitim kanalları gerçekten ücretsiz mi?", "answer": "Çoğu kanal tamamen ücretsiz içerik sunar. Bazıları premium kurslar satabilir."}, {"question": "Sertifika alabilir miyim?", "answer": "Telegram kanalları sertifika vermez ancak edindiğiniz bilgiler değerlidir."}]}',
 ARRAY['egitim'],
 ARRAY['telegram eğitim kanalları', 'eğitim telegram', 'ücretsiz kurs telegram', 'online eğitim telegram'],
 550, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 2) İngilizce Kanalları
('telegram-ingilizce-kanallari',
 '🇬🇧 Telegram İngilizce Kanalları 2026 ᐅ Dil Öğrenme',
 '✅ İngilizce öğrenmek için Telegram kanalları. Kelime, gramer, konuşma pratikleri.',
 'Telegram İngilizce Kanalları - Dil Öğrenme Kaynakları',
 '{"intro": "İngilizce öğrenme yolculuğunuzda Telegram kanallarını kullanın. Günlük kelimeler, gramer kuralları, listening materyalleri ve speaking pratikleri.", "sections": [{"heading": "İngilizce İçerik Türleri", "body": "Vocabulary of the day, gramer kuralları açıklamaları, idioms ve phrasal verbs, podcast önerileri, film/dizi ile öğrenme."}, {"heading": "Seviye Bazlı Kanallar", "body": "Beginner, intermediate ve advanced seviyeler için farklı kanallar mevcut."}], "faqs": [{"question": "Sıfırdan İngilizce öğrenebilir miyim?", "answer": "Evet, başlangıç seviyesi kanalları temellerden başlar."}, {"question": "Speaking pratiği yapabilir miyim?", "answer": "Bazı kanallar voice chat grupları ile speaking pratiği sunar."}]}',
 ARRAY['egitim'],
 ARRAY['telegram ingilizce kanalları', 'ingilizce telegram', 'dil öğrenme telegram', 'english telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 3) Yazılım Kanalları
('telegram-yazilim-kanallari-detay',
 '💻 Telegram Yazılım Kanalları 2026 ᐅ Kodlama Eğitimi',
 '✅ Yazılım ve programlama öğrenmek için Telegram kanalları. Python, JavaScript, web geliştirme.',
 'Telegram Yazılım Kanalları - Kodlama ve Programlama',
 '{"intro": "Yazılım kariyer yolculuğunuzda Telegram kanallarını kullanın. Python, JavaScript, React, Node.js ve daha fazlası için ücretsiz kaynaklar.", "sections": [{"heading": "Programlama Dilleri", "body": "Python, JavaScript, Java, C#, Go, Rust ve daha fazlası için özel kanallar mevcut."}, {"heading": "Web Geliştirme", "body": "Frontend, backend, full-stack ve DevOps konularında detaylı içerikler paylaşılıyor."}], "faqs": [{"question": "Sıfırdan yazılım öğrenebilir miyim?", "answer": "Evet, roadmap ve başlangıç rehberleri paylaşan kanallar mevcut."}, {"question": "Hangi dille başlamalıyım?", "answer": "Python veya JavaScript yeni başlayanlar için önerilir."}]}',
 ARRAY['egitim', 'teknoloji'],
 ARRAY['telegram yazılım kanalları', 'programlama telegram', 'kodlama telegram', 'python telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 4) Kişisel Gelişim Kanalları
('telegram-kisisel-gelisim-kanallari',
 '🌱 Telegram Kişisel Gelişim Kanalları 2026 ᐅ Motivasyon',
 '✅ Kişisel gelişim için Telegram kanalları. Motivasyon, üretkenlik, alışkanlık geliştirme.',
 'Telegram Kişisel Gelişim Kanalları - Motivasyon ve Üretkenlik',
 '{"intro": "Hayatınızı dönüştürmek için kişisel gelişim Telegram kanallarını takip edin. Motivasyon, verimlilik ipuçları, alışkanlık oluşturma ve zihin sağlığı içerikleri.", "sections": [{"heading": "Kişisel Gelişim Konuları", "body": "Zaman yönetimi, verimlilik teknikleri, meditative uygulamalar, hedef belirleme ve alışkanlık takibi."}, {"heading": "Kitap Önerileri", "body": "Kişisel gelişim kitapları özet ve önerileri paylaşan kanallar popüler."}], "faqs": [{"question": "Kişisel gelişim kanalları işe yarar mı?", "answer": "Doğru uygulandığında faydalıdır. Süreklilik önemli."}, {"question": "Hangi kanalları takip etmeliyim?", "answer": "Pratik ipuçları ve uygulanabilir tavsiyeler sunan kanalları tercih edin."}]}',
 ARRAY['egitim'],
 ARRAY['telegram kişisel gelişim', 'motivasyon telegram', 'verimlilik telegram', 'self-improvement telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 5) Telegram vs WhatsApp
('telegram-vs-whatsapp',
 '⚔️ Telegram vs WhatsApp 2026 ᐅ Detaylı Karşılaştırma',
 '✅ Telegram ve WhatsApp karşılaştırması. Hangisi daha güvenli, hızlı ve işlevsel?',
 'Telegram vs WhatsApp - Detaylı Karşılaştırma Rehberi 2026',
 '{"intro": "Telegram mı WhatsApp mı? Bu kapsamlı karşılaştırmada her iki uygulamanın güvenlik, gizlilik, özellikler ve kullanım kolaylığı açısından artıları ve eksilerini inceliyoruz.", "sections": [{"heading": "Güvenlik Karşılaştırması", "body": "WhatsApp varsayılan uçtan uca şifreleme sunarken, Telegram bunu sadece Gizli Sohbetler''de sağlar. Ancak Telegram''ın açık kaynak protokolü ve bağımsız denetimler güven veriyor."}, {"heading": "Özellik Karşılaştırması", "body": "Telegram: 2GB dosya, sınırsız kanal, çoklu cihaz, bot desteği, düzenlenebilir mesajlar. WhatsApp: 100MB dosya, 256 kişilik grup, işletme özellikleri, durum paylaşımı."}, {"heading": "Sonuç", "body": "Her iki uygulama da güçlü yanlarına sahip. Kanal/topluluk için Telegram, yakın çevre iletişimi için WhatsApp önerilir."}], "faqs": [{"question": "Hangisi daha güvenli?", "answer": "Her ikisi de güvenlidir. WhatsApp varsayılan E2E, Telegram ise gizli sohbetlerde."}, {"question": "Hangisini kullanmalıyım?", "answer": "İhtiyacınıza göre. Kanallar için Telegram, günlük mesajlaşma için WhatsApp."}]}',
 ARRAY['egitim'],
 ARRAY['telegram vs whatsapp', 'telegram whatsapp karşılaştırma', 'telegram mı whatsapp mı', 'mesajlaşma uygulaması'],
 650, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 6) Telegram Gizlilik Ayarları
('telegram-gizlilik-ayarlari-detay',
 '🔐 Telegram Gizlilik Ayarları 2026 ᐅ Güvenlik Rehberi',
 '✅ Telegram gizlilik ayarlarını nasıl yapılandırırsınız? Telefon numarası gizleme, son görülme, hesap güvenliği.',
 'Telegram Gizlilik Ayarları - Adım Adım Güvenlik Rehberi',
 '{"intro": "Telegram''da gizliliğinizi korumak için tüm ayarları öğrenin. Telefon numarası gizleme, son görülme kontrolü, profil fotoğrafı erişimi ve daha fazlası.", "sections": [{"heading": "Telefon Numarası Gizleme", "body": "Settings > Privacy > Phone Number yolunu izleyerek numaranızı kimden gizleyeceğinizi seçin: Everyone, My Contacts, Nobody."}, {"heading": "Son Görülme Ayarı", "body": "Last Seen ayarını Nobody yaparak kimsenin sizi çevrimiçi görüp göremeyeceğini kontrol edin."}, {"heading": "İki Faktörlü Doğrulama", "body": "Two-Step Verification''ı aktif ederek hesabınıza ekstra güvenlik katmanı ekleyin."}], "faqs": [{"question": "Numaram gizliyken beni bulabilirler mi?", "answer": "Kullanıcı adınız varsa bulunabilirsiniz, ancak numaranız görünmez."}, {"question": "Gizli sohbet nedir?", "answer": "Uçtan uca şifrelenmiş, sunucularda saklanmayan mesajlaşma türüdür."}]}',
 ARRAY['egitim'],
 ARRAY['telegram gizlilik ayarları', 'telegram güvenlik', 'telegram numara gizleme', 'telegram privacy'],
 550, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 7) Telegram Premium Nedir
('telegram-premium-nedir-detay',
 '⭐ Telegram Premium Nedir? 2026 ᐅ Özellikleri ve Fiyatı',
 '✅ Telegram Premium aboneliği nedir? Özellikler, fiyat, değer mi? Detaylı inceleme.',
 'Telegram Premium Nedir? - Özellikler, Fiyat ve Değerlendirme',
 '{"intro": "Telegram Premium 2022''de tanıtıldı ve özel özellikler sunuyor. Bu rehberde Premium''un tüm özelliklerini, fiyatını ve gerçekten değip değmeyeceğini inceliyoruz.", "sections": [{"heading": "Premium Özellikleri", "body": "4GB dosya yükleme, hızlı indirme, premium çıkartmalar, profil rozeti, gelişmiş sohbet yönetimi, tercüme özelliği ve daha fazlası."}, {"heading": "Fiyatlandırma", "body": "Türkiye''de aylık fiyat değişkenlik göstermektedir. App Store, Google Play veya Fragment üzerinden satın alınabilir."}, {"heading": "Değer mi?", "body": "Yoğun Telegram kullanıcıları için değerli. Nadiren kullananlar için ücretsiz versiyon yeterli."}], "faqs": [{"question": "Premium olmadan da kullanabilir miyim?", "answer": "Evet, Telegram''ın temel özellikleri tamamen ücretsizdir."}, {"question": "Premium başkalarına nasıl görünür?", "answer": "İsminizin yanında yıldız rozeti görünür."}]}',
 ARRAY['egitim'],
 ARRAY['telegram premium nedir', 'telegram premium özellikleri', 'telegram premium fiyat', 'telegram premium değer mi'],
 520, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 8) Telegram Bot Kullanma
('telegram-bot-kullanma-detay',
 '🤖 Telegram Bot Kullanma Rehberi 2026 ᐅ En İyi Botlar',
 '✅ Telegram botları nasıl kullanılır? En popüler botlar ve kullanım rehberi.',
 'Telegram Bot Kullanma - Rehber ve En İyi Bot Listesi',
 '{"intro": "Telegram botları hayatınızı kolaylaştırır. Dosya indirme, çeviri, hatırlatma ve daha fazlası için botları nasıl kullanacağınızı öğrenin.", "sections": [{"heading": "Bot Nedir?", "body": "Telegram botları otomatik işlemler yapan yazılımlardır. Mesaj gönderin, komut verin, bot işlemi gerçekleştirir."}, {"heading": "Popüler Botlar", "body": "@gif - GIF arama, @stickers - çıkartma oluşturma, @vid - video indirme, @youtube - YouTube indirme."}, {"heading": "Bot Güvenliği", "body": "Bilinmeyen botlara kişisel bilgi vermeyin. Popüler ve güvenilir botları tercih edin."}], "faqs": [{"question": "Bot nasıl eklenir?", "answer": "Bot kullanıcı adını arayın veya t.me/botadi linkine tıklayın, ardından Start''a basın."}, {"question": "Kendi botumu yapabilir miyim?", "answer": "Evet, BotFather ile kendi botunuzu oluşturabilirsiniz."}]}',
 ARRAY['egitim'],
 ARRAY['telegram bot kullanma', 'telegram botları', 'en iyi telegram botları', 'telegram bot listesi'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 9) Telegram Kanal Büyütme
('telegram-kanal-buyutme-detay',
 '📈 Telegram Kanal Büyütme Rehberi 2026 ᐅ Organik Strateji',
 '✅ Telegram kanalınızı nasıl büyütürsünüz? Organik büyüme stratejileri ve ipuçları.',
 'Telegram Kanal Büyütme - Organik Strateji Rehberi',
 '{"intro": "Telegram kanalınızı organik olarak büyütmek istiyorsanız doğru yerdesiniz. Kaliteli içerik, tutarlılık ve akıllı stratejilerle abone sayınızı artırın.", "sections": [{"heading": "İçerik Stratejisi", "body": "Niş odaklı, düzenli ve değerli içerik üretin. Abonelerinize gerçek fayda sağlayın."}, {"heading": "Cross Promosyon", "body": "Benzer konudaki kanallarla karşılıklı tanıtım yapın. Win-win durumu oluşturun."}, {"heading": "Sosyal Medya", "body": "Twitter, Instagram, YouTube''da kanalınızı tanıtın. Her platformun dinamiğine uygun içerik paylaşın."}], "faqs": [{"question": "Ne kadar sürede büyürüm?", "answer": "Organik büyüme zaman alır. 6-12 ay sabır gerektirir."}, {"question": "Abone satın almalı mıyım?", "answer": "Hayır, sahte aboneler etkileşim getirmez ve kanalınıza zarar verir."}]}',
 ARRAY['egitim'],
 ARRAY['telegram kanal büyütme', 'kanal büyütme stratejisi', 'telegram abone artırma', 'kanal büyütme'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 10) İndirim Kanalları (detay)
('telegram-indirim-kanallari-detay',
 '🏷️ Telegram İndirim Kanalları 2026 ᐅ Kampanya Takibi',
 '✅ E-ticaret indirimleri için Telegram kanalları. Amazon, Trendyol, Hepsiburada fırsatları.',
 'Telegram İndirim Kanalları - Kampanya ve Fırsat Takibi',
 '{"intro": "Online alışverişte tasarruf etmek için Telegram indirim kanallarını takip edin. Anlık kampanyalar, kupon kodları ve flash sale duyuruları.", "sections": [{"heading": "Popüler E-Ticaret Siteleri", "body": "Amazon, Trendyol, Hepsiburada, N11, Çiçeksepeti, Migros, MediaMarkt fırsatları paylaşılır."}, {"heading": "Nasıl Tasarruf Edilir?", "body": "Bildirimleri açın, kupon kodlarını kullanın, fiyat karşılaştırması yapın ve stok bitmeden alın."}], "faqs": [{"question": "İndirimler gerçek mi?", "answer": "Güvenilir kanallar doğrulanmış indirimleri paylaşır. Fiyat geçmişini kontrol edin."}, {"question": "Kupon kodu nasıl kullanılır?", "answer": "Ödeme sayfasında kupon alanına kodu girin ve uygulayın."}]}',
 ARRAY['indirim'],
 ARRAY['telegram indirim kanalları', 'kampanya telegram', 'kupon kodu telegram', 'fırsat telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 11) Kupon Kanalları
('telegram-kupon-kanallari',
 '🎫 Telegram Kupon Kanalları 2026 ᐅ İndirim Kodları',
 '✅ Kupon kodu paylaşan Telegram kanalları. E-ticaret, yemek, ulaşım indirim kodları.',
 'Telegram Kupon Kanalları - Aktif İndirim Kodları',
 '{"intro": "Aktif kupon kodlarını Telegram''dan takip edin. E-ticaret, yemek siparişi, ulaşım ve daha fazlası için indirim kodları.", "sections": [{"heading": "Kupon Türleri", "body": "Yüzdelik indirimler, kargo bedava, ilk sipariş indirimi, minimum tutar indirimi gibi farklı kupon türleri."}, {"heading": "Dikkat Edilmesi Gerekenler", "body": "Kuponların son kullanma tarihi ve minimum sipariş tutarı şartlarını kontrol edin."}], "faqs": [{"question": "Kuponlar süreli mi?", "answer": "Çoğu kuponun geçerlilik süresi vardır. Hızlı kullanın."}, {"question": "Kupon çalışmıyorsa ne yapmalıyım?", "answer": "Süresi dolmuş veya kullanım limiti dolmuş olabilir."}]}',
 ARRAY['indirim'],
 ARRAY['telegram kupon kanalları', 'kupon kodu telegram', 'indirim kodu telegram', 'promosyon telegram'],
 420, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 12) Kampanya Kanalları
('telegram-kampanya-kanallari',
 '🔥 Telegram Kampanya Kanalları 2026 ᐅ Flash Sale',
 '✅ Flash sale ve kampanya duyuruları. Sınırlı süreli fırsatları kaçırmayın.',
 'Telegram Kampanya Kanalları - Flash Sale ve Fırsatlar',
 '{"intro": "Sınırlı süreli kampanyaları ve flash sale fırsatlarını Telegram üzerinden anlık takip edin. Black Friday, 11.11, yılbaşı indirimleri ve daha fazlası.", "sections": [{"heading": "Önemli Kampanya Dönemleri", "body": "Black Friday, Cyber Monday, 11.11, Yılbaşı, Anneler-Babalar Günü, Ramazan ve Kurban Bayramı."}, {"heading": "Hızlı Hareket", "body": "Flash sale''ler dakikalar içinde tükenebilir. Bildirimleri açık tutun."}], "faqs": [{"question": "Kampanyalar ne zaman başlar?", "answer": "Kanallar genellikle birkaç saat önce duyuru yapar."}, {"question": "En iyi fırsatlar ne zaman?", "answer": "Black Friday ve 11.11 yılın en büyük indirim dönemleridir."}]}',
 ARRAY['indirim'],
 ARRAY['telegram kampanya kanalları', 'flash sale telegram', 'black friday telegram', 'indirim duyuruları'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 13) Teknoloji Kanalları (detay)
('telegram-teknoloji-kanallari-detay',
 '💻 Telegram Teknoloji Kanalları 2026 ᐅ Tech Haberleri',
 '✅ Teknoloji haberleri ve ürün incelemeleri. Telefon, bilgisayar, yazılım güncellemeleri.',
 'Telegram Teknoloji Kanalları - Tech Haberleri ve İncelemeler',
 '{"intro": "Teknoloji dünyasını Telegram''dan takip edin. Yeni ürün lansmanları, detaylı incelemeler, yazılım güncellemeleri ve tech haberleri.", "sections": [{"heading": "Teknoloji Haberleri", "body": "Apple, Samsung, Google, Microsoft ürün duyuruları ve güncellemeleri."}, {"heading": "Ürün İncelemeleri", "body": "Telefon, tablet, laptop, akıllı saat ve diğer gadget incelemeleri paylaşılır."}], "faqs": [{"question": "Hangi marka kanalları var?", "answer": "Apple, Samsung, Xiaomi başta olmak üzere tüm büyük markalar takip edilebilir."}, {"question": "Güvenilir inceleme nasıl anlaşılır?", "answer": "Detaylı, objektif ve kullanım deneyimi paylaşan kanalları tercih edin."}]}',
 ARRAY['teknoloji'],
 ARRAY['telegram teknoloji kanalları', 'tech telegram', 'teknoloji haberleri telegram', 'gadget telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 14) Sağlık Kanalları
('telegram-saglik-kanallari',
 '🏥 Telegram Sağlık Kanalları 2026 ᐅ Sağlıklı Yaşam',
 '✅ Sağlık ve wellness için Telegram kanalları. Beslenme, egzersiz, mental sağlık.',
 'Telegram Sağlık Kanalları - Sağlıklı Yaşam Rehberi',
 '{"intro": "Sağlıklı yaşam yolculuğunuzda Telegram kanallarını kullanın. Beslenme tavsiyeleri, egzersiz programları, mental sağlık ipuçları ve wellness içerikleri.", "sections": [{"heading": "Sağlık Konuları", "body": "Beslenme ve diyet, fitness ve egzersiz, mental sağlık ve meditasyon, uyku kalitesi."}, {"heading": "Uyarı", "body": "Telegram kanalları tıbbi tavsiye vermez. Ciddi sağlık sorunları için doktora başvurun."}], "faqs": [{"question": "Sağlık bilgileri güvenilir mi?", "answer": "Kaynak gösteren kanalları tercih edin. Tıbbi tavsiye için uzman görüşü alın."}, {"question": "Spor programları var mı?", "answer": "Evet, fitness ve workout kanalları detaylı programlar paylaşır."}]}',
 ARRAY['saglik'],
 ARRAY['telegram sağlık kanalları', 'sağlık telegram', 'fitness telegram', 'beslenme telegram'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 15) Kitap Kanalları
('telegram-kitap-kanallari-detay',
 '📖 Telegram Kitap Kanalları 2026 ᐅ Okuma Önerileri',
 '✅ Kitap tutkunları için Telegram kanalları. Kitap önerileri, özet, okuma listeleri.',
 'Telegram Kitap Kanalları - Kitap Önerileri ve Listeler',
 '{"intro": "Okuma alışkanlığınızı geliştirmek için Telegram kitap kanallarını takip edin. Kitap önerileri, özetler, alıntılar ve okuma listeleri.", "sections": [{"heading": "Kitap Türleri", "body": "Roman, kişisel gelişim, bilim kurgu, tarih, felsefe ve biyografi kategorilerinde kanallar mevcut."}, {"heading": "Kitap Kulüpleri", "body": "Telegram gruplarında kitap tartışmaları ve okuma kulüpleri aktif."}], "faqs": [{"question": "E-kitap paylaşılıyor mu?", "answer": "Bazı kanallar yasal e-kitaplar paylaşır. Telif haklarına dikkat edin."}, {"question": "Kitap önerileri nereden alırım?", "answer": "Tür bazlı listeleme yapan ve özet paylaşan kanalları takip edin."}]}',
 ARRAY['kitap'],
 ARRAY['telegram kitap kanalları', 'kitap telegram', 'okuma önerileri telegram', 'kitap listesi telegram'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 16) Seyahat Kanalları
('telegram-seyahat-kanallari-detay',
 '✈️ Telegram Seyahat Kanalları 2026 ᐅ Ucuz Uçuşlar',
 '✅ Seyahat tutkunları için Telegram kanalları. Ucuz uçak bileti, otel fırsatları, gezi rehberleri.',
 'Telegram Seyahat Kanalları - Ucuz Uçuş ve Gezi Fırsatları',
 '{"intro": "Seyahat planlarınız için Telegram kanallarını kullanın. Ucuz uçak bileti fırsatları, otel indirimleri, vize bilgileri ve gezi rehberleri.", "sections": [{"heading": "Ucuz Uçuş Takibi", "body": "Error fare''ler, kampanyalı biletler ve mil harcama fırsatları anlık paylaşılır."}, {"heading": "Destinasyon Rehberleri", "body": "Popüler şehirler, gizli kalmış yerler ve yerel deneyimler hakkında bilgiler."}], "faqs": [{"question": "Gerçekten ucuz bilet bulunuyor mu?", "answer": "Evet, error fare ve flash sale''lerde normal fiyatın çok altına bilet çıkabiliyor."}, {"question": "Nasıl haberdar olurum?", "answer": "Bildirimleri açın, fırsatlar çok hızlı tükenir."}]}',
 ARRAY['seyahat'],
 ARRAY['telegram seyahat kanalları', 'ucuz uçuş telegram', 'seyahat fırsatları telegram', 'gezi telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 17) Yemek Kanalları
('telegram-yemek-kanallari-detay',
 '🍴 Telegram Yemek Kanalları 2026 ᐅ Tarifler',
 '✅ Yemek tutkunları için Telegram kanalları. Tarifler, restoran önerileri, food content.',
 'Telegram Yemek Kanalları - Tarifler ve Restoran Önerileri',
 '{"intro": "Mutfak tutkusunu Telegram''da yaşayın. Pratik tarifler, video yemek içerikleri, restoran önerileri ve food blogger içerikleri.", "sections": [{"heading": "Tarif Kanalları", "body": "Ev yemekleri, tatlılar, dünya mutfakları ve diet tarifleri paylaşan kanallar."}, {"heading": "Restoran Önerileri", "body": "Şehir bazlı restoran önerileri, mekan incelemeleri ve food tour içerikleri."}], "faqs": [{"question": "Video tarifler var mı?", "answer": "Evet, birçok kanal adım adım video tarifler paylaşır."}, {"question": "Diet tarifler bulunur mu?", "answer": "Evet, vegan, glutensiz, düşük kalorili tarif kanalları mevcut."}]}',
 ARRAY['yemek'],
 ARRAY['telegram yemek kanalları', 'tarif telegram', 'yemek tarifleri telegram', 'restoran telegram'],
 420, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 18) Moda Kanalları
('telegram-moda-kanallari-detay',
 '👗 Telegram Moda Kanalları 2026 ᐅ Stil Önerileri',
 '✅ Moda tutkunları için Telegram kanalları. Stil önerileri, trendler, indirimler.',
 'Telegram Moda Kanalları - Stil Önerileri ve Trendler',
 '{"intro": "Moda dünyasını Telegram''dan takip edin. Güncel trendler, stil önerileri, marka indirimleri ve fashion week haberleri.", "sections": [{"heading": "Moda İçerikleri", "body": "Sezonluk trendler, kombin önerileri, marka lansmanları ve ünlü stilleri."}, {"heading": "Moda İndirimleri", "body": "Zara, H&M, Mango ve lüks marka indirimlerini takip eden kanallar."}], "faqs": [{"question": "Erkek moda kanalları var mı?", "answer": "Evet, hem kadın hem erkek modası için ayrı kanallar mevcut."}, {"question": "İndirim haberleri güvenilir mi?", "answer": "Güvenilir kanallar doğrulanmış indirimleri paylaşır."}]}',
 ARRAY['moda'],
 ARRAY['telegram moda kanalları', 'moda telegram', 'stil önerileri telegram', 'trend telegram'],
 420, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 19) Telegram Sticker Yapma
('telegram-sticker-yapma',
 '🎨 Telegram Sticker Yapma Rehberi 2026 ᐅ Adım Adım',
 '✅ Kendi Telegram stickerlarınızı nasıl yaparsınız? Detaylı rehber ve ipuçları.',
 'Telegram Sticker Yapma - Kendi Çıkartmalarınızı Oluşturun',
 '{"intro": "Kendi özel Telegram stickerlarınızı oluşturmak ister misiniz? Bu rehberde adım adım sticker paketi nasıl yapılır öğreneceksiniz.", "sections": [{"heading": "Sticker Oluşturma Adımları", "body": "1) Stickers bot (@Stickers) ile konuşun. 2) /newpack komutuyla yeni paket başlatın. 3) PNG formatında 512x512 piksel resimler gönderin. 4) Her resme emoji atayın. 5) /publish ile paketi yayınlayın."}, {"heading": "Tasarım İpuçları", "body": "Şeffaf arka plan kullanın, yüksek çözünürlük tercih edin, emoji ifadelerle uyumlu tasarlayın."}], "faqs": [{"question": "Sticker boyutu ne olmalı?", "answer": "512x512 piksel, PNG formatında, şeffaf arka plan önerilir."}, {"question": "Kaç sticker ekleyebilirim?", "answer": "Bir pakette 120''ye kadar sticker olabilir."}]}',
 ARRAY['egitim'],
 ARRAY['telegram sticker yapma', 'çıkartma oluşturma telegram', 'sticker paketi telegram', 'telegram stickers'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 20) Telegram Dosya Paylaşma
('telegram-dosya-paylasma-detay',
 '📁 Telegram Dosya Paylaşma Rehberi 2026 ᐅ 2GB Limit',
 '✅ Telegram''da dosya paylaşımı nasıl yapılır? 2GB limit, desteklenen formatlar, cloud storage.',
 'Telegram Dosya Paylaşma - Büyük Dosya Gönderme Rehberi',
 '{"intro": "Telegram 2GB''a kadar dosya paylaşımına izin verir - rakiplerinden çok daha fazla. PDF, video, müzik ve her türlü dosyayı nasıl paylaşacağınızı öğrenin.", "sections": [{"heading": "Dosya Limitleri", "body": "Normal kullanıcılar 2GB, Premium kullanıcılar 4GB''a kadar tek dosya gönderebilir. Toplam depolama sınırsızdır."}, {"heading": "Desteklenen Formatlar", "body": "Tüm dosya formatları desteklenir: PDF, DOC, MP3, MP4, ZIP, APK ve daha fazlası."}, {"heading": "Cloud Storage", "body": "Telegram''a yüklediğiniz dosyalar bulutta saklanır ve tüm cihazlarınızdan erişilebilir."}], "faqs": [{"question": "Dosyalar ne kadar süre saklanır?", "answer": "Telegram dosyaları silmediğiniz sürece sonsuza kadar saklar."}, {"question": "Toplu dosya gönderebilir miyim?", "answer": "Evet, birden fazla dosyayı aynı anda seçip gönderebilirsiniz."}]}',
 ARRAY['egitim'],
 ARRAY['telegram dosya paylaşma', 'dosya gönderme telegram', 'büyük dosya telegram', 'telegram cloud'],
 480, true, 'spoke', 'telegram-kanallari-rehberi')

ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  word_count = EXCLUDED.word_count,
  page_type = EXCLUDED.page_type,
  updated_at = NOW();

-- Done Phase 3 Educational Pages
