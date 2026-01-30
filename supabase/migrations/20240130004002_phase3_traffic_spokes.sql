-- Phase 3: Authority - Traffic Keyword Spoke Pages (Aşama 2 - 15 Sayfa)
-- Haber, Film, Dizi, Spor, Müzik, Oyun temalı sayfalar

INSERT INTO public.seo_pages (slug, title, meta_description, h1, content, related_categories, target_keywords, word_count, published, page_type, parent_hub_slug) VALUES

-- 1) Haber Kanalları
('telegram-haber-kanallari-detay',
 '📰 Telegram Haber Kanalları 2026 ᐅ Anlık Haberler',
 '✅ En güncel haber Telegram kanalları. Son dakika, ekonomi, siyaset, dünya haberleri. Tarafsız habercilik.',
 'Telegram Haber Kanalları - Anlık ve Güncel Haberler 2026',
 '{"intro": "Geleneksel medyadan bağımsız, hızlı ve anlık haber akışı için Telegram haber kanalları ideal bir kaynaktır. Son dakika gelişmeleri, ekonomi, siyaset ve dünya haberlerini takip edebileceğiniz en iyi kanalları derledik.", "sections": [{"heading": "Neden Telegram''da Haber Takibi?", "body": "Telegram haber kanalları algoritma engellerine takılmadan doğrudan size ulaşır. Bildirim açtığınızda önemli gelişmelerden anında haberdar olursunuz. Birçok kanal ana akım medyada yer almayan haberleri de paylaşır."}, {"heading": "Güvenilir Haber Kanalı Seçimi", "body": "Kaynak belirtme alışkanlığına, haberlerin doğruluğuna ve kanalın geçmiş performansına bakın. Birden fazla kanalı karşılaştırarak takip edin."}], "faqs": [{"question": "En güvenilir haber kanalları hangileri?", "answer": "Kaynak gösteren, doğrulama yapan ve şeffaf geçmişe sahip kanallar güvenilirdir."}, {"question": "Bildirimler çok mu gelir?", "answer": "Kanaldan kanala değişir. Bildirim ayarlarından özelleştirebilirsiniz."}]}',
 ARRAY['haber'],
 ARRAY['telegram haber kanalları', 'haber telegram', 'son dakika telegram', 'güncel haber telegram'],
 550, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 2) Film Kanalları
('telegram-film-kanallari-detay',
 '🎬 Telegram Film Kanalları 2026 ᐅ Film Önerileri',
 '✅ Film tutkunları için Telegram kanalları. Yeni filmler, öneriler, incelemeler, IMDb listesi.',
 'Telegram Film Kanalları - Film Önerileri ve İncelemeler',
 '{"intro": "Film tutkunları için Telegram mükemmel bir platform. Yeni çıkan filmlerin tanıtımları, izleme önerileri, IMDb puanları ve film eleştirileri paylaşan kanalları keşfedin.", "sections": [{"heading": "Film Kanallarında Neler Var?", "body": "Vizyondaki filmler, Netflix/Disney+ içerikleri, klasik film önerileri, tür bazlı listeler ve film festivali haberleri paylaşılır."}, {"heading": "Yasal Uyarı", "body": "Telif hakkı içeren içeriklere dikkat edin. Yasal platformları tercih edin."}], "faqs": [{"question": "Film önerileri nereden alırım?", "answer": "Tür bazlı ve editör seçmeli kanallar kaliteli öneriler sunar."}, {"question": "Yasal film izleme kanalları var mı?", "answer": "Kanallar genellikle öneri yapar, izleme için resmi platformları kullanın."}]}',
 ARRAY['film-dizi'],
 ARRAY['telegram film kanalları', 'film telegram', 'film önerileri telegram', 'netflix telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 3) Dizi Kanalları
('telegram-dizi-kanallari-detay',
 '📺 Telegram Dizi Kanalları 2026 ᐅ Dizi Takibi',
 '✅ Dizi tutkunları için Telegram kanalları. Yeni sezon duyuruları, dizi önerileri, tartışmalar.',
 'Telegram Dizi Kanalları - Dizi Önerileri ve Takip',
 '{"intro": "Favori dizilerinizi Telegram üzerinden takip edin. Yeni bölüm duyuruları, sezon finali tahminleri, karakter analizleri ve dizi tavsiyeleri sunan kanallar.", "sections": [{"heading": "Dizi Kanalları İçerikleri", "body": "Netflix, Disney+, HBO, yerli diziler hakkında tartışmalar, spoiler''sız incelemeler ve izleme listesi önerileri."}, {"heading": "Spoiler Uyarısı", "body": "Bazı kanallar spoiler içerebilir. Açıklamalara dikkat edin."}], "faqs": [{"question": "Yeni bölüm ne zaman çıkar?", "answer": "Dizi takip kanalları yayın takvimlerini düzenli paylaşır."}, {"question": "Yerli dizi kanalları var mı?", "answer": "Evet, Türk dizilerine özel birçok kanal mevcuttur."}]}',
 ARRAY['film-dizi'],
 ARRAY['telegram dizi kanalları', 'dizi telegram', 'dizi önerileri telegram', 'türk dizileri telegram'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 4) Müzik Kanalları (detay)
('telegram-muzik-kanallari-detay',
 '🎵 Telegram Müzik Kanalları 2026 ᐅ Şarkı Önerileri',
 '✅ Müzik severler için Telegram kanalları. Yeni çıkan şarkılar, playlist önerileri, müzik haberleri.',
 'Telegram Müzik Kanalları - Şarkı ve Playlist Önerileri',
 '{"intro": "Müzik dünyasını Telegram''dan takip edin. Yeni albüm duyuruları, popüler playlistler, tür bazlı öneriler ve konser haberleri paylaşan kanallar.", "sections": [{"heading": "Müzik Türleri", "body": "Pop, rock, hip-hop, elektronik, Türk müziği, K-pop ve klasik müzik için özel kanallar mevcuttur."}, {"heading": "Playlist Paylaşımları", "body": "Spotify, Apple Music ve YouTube Music playlistleri paylaşan kanallar oldukça popüler."}], "faqs": [{"question": "Türkçe müzik kanalları var mı?", "answer": "Evet, pop, arabesk, hip-hop dahil tüm türlerde Türkçe kanallar mevcut."}, {"question": "Müzik indirmek yasal mı?", "answer": "Telif haklı içerik indirmek yasadışıdır. Yasal platformları tercih edin."}]}',
 ARRAY['muzik'],
 ARRAY['telegram müzik kanalları', 'müzik telegram', 'şarkı önerileri telegram', 'playlist telegram'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 5) Spor Kanalları (detay)
('telegram-spor-kanallari-detay',
 '⚽ Telegram Spor Kanalları 2026 ᐅ Spor Haberleri',
 '✅ Spor tutkunları için Telegram kanalları. Futbol, basketbol, tenis haberleri ve analizler.',
 'Telegram Spor Kanalları - Spor Haberleri ve Analizler',
 '{"intro": "Spor dünyasını Telegram üzerinden yakından takip edin. Futbol, basketbol, tenis ve daha fazlası hakkında haberler, analizler ve maç yorumları.", "sections": [{"heading": "Futbol Kanalları", "body": "Süper Lig, Premier Lig, La Liga, Şampiyonlar Ligi maç haberleri, transfer dedikoduları ve teknik analizler."}, {"heading": "Diğer Sporlar", "body": "NBA, EuroLeague, Formula 1, tenis ve MMA için özel kanallar da bulunmaktadır."}], "faqs": [{"question": "Canlı maç skoru takip edebilir miyim?", "answer": "Evet, bazı kanallar maç sırasında canlı skor güncelleme yapar."}, {"question": "Transfer haberleri doğru mu?", "answer": "Söylentiler her zaman doğrulanmayabilir. Resmi duyuruları bekleyin."}]}',
 ARRAY['spor'],
 ARRAY['telegram spor kanalları', 'spor telegram', 'futbol telegram', 'maç haberleri telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 6) Futbol Kanalları
('telegram-futbol-kanallari',
 '⚽ Telegram Futbol Kanalları 2026 ᐅ Lig Haberleri',
 '✅ Futbol tutkunları için Telegram. Süper Lig, Avrupa ligleri, transfer haberleri.',
 'Telegram Futbol Kanalları - Lig Haberleri ve Transferler',
 '{"intro": "Futbol tutkusunu Telegram''da yaşayın. Süper Lig, Premier Lig, La Liga ve Şampiyonlar Ligi hakkında detaylı haberler, maç analizleri ve transfer dedikoduları.", "sections": [{"heading": "Türk Takımları Kanalları", "body": "Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor taraftar kanalları ve resmi haber kaynakları."}, {"heading": "Avrupa Futbolu", "body": "Premier Lig, La Liga, Serie A, Bundesliga ve Ligue 1 haberleri özel kanallarda takip edilebilir."}], "faqs": [{"question": "Takımıma özel kanal var mı?", "answer": "Evet, büyük Türk kulüplerinin birden fazla taraftar kanalı bulunuyor."}, {"question": "Maç özetleri paylaşılıyor mu?", "answer": "Bazı kanallar özet ve gol videoları paylaşır."}]}',
 ARRAY['spor'],
 ARRAY['telegram futbol kanalları', 'futbol telegram', 'süper lig telegram', 'transfer haberleri telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 7) Canlı Maç Kanalları
('telegram-canli-mac-kanallari-detay',
 '📺 Telegram Canlı Maç Kanalları 2026 ᐅ Skor Takibi',
 '✅ Canlı maç skorları ve anlık güncellemeler. Futbol, basketbol, tenis takibi.',
 'Telegram Canlı Maç Kanalları - Anlık Skor Güncellemeleri',
 '{"intro": "Maçları canlı olarak Telegram üzerinden takip edin. Anlık skor güncellemeleri, gol bildirimleri ve maç istatistikleri paylaşan kanallar.", "sections": [{"heading": "Canlı Skor Takibi", "body": "Bildirim açarak golleri anında öğrenin. Maç istatistikleri, kadro bilgileri ve canlı yorumlar."}, {"heading": "Yasal Uyarı", "body": "Canlı yayın için beIN Sports gibi resmi platformları kullanın. Telegram kanalları skor paylaşır."}], "faqs": [{"question": "Canlı maç izleyebilir miyim?", "answer": "Telegram kanalları genellikle skor paylaşır. Canlı yayın için resmi platformları tercih edin."}, {"question": "Hangi maçlar takip edilir?", "answer": "Süper Lig, Champions League, Premier Lig ve büyük turnuvalar popülerdir."}]}',
 ARRAY['spor'],
 ARRAY['telegram canlı maç', 'canlı skor telegram', 'maç sonuçları telegram', 'futbol canlı telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 8) Anime Kanalları
('telegram-anime-kanallari-detay',
 '🎌 Telegram Anime Kanalları 2026 ᐅ Anime Önerileri',
 '✅ Anime tutkunları için Telegram kanalları. Yeni sezon, öneriler, manga haberleri.',
 'Telegram Anime Kanalları - Anime Önerileri ve Haberler',
 '{"intro": "Anime dünyasını Telegram''dan takip edin. Yeni sezon duyuruları, anime önerileri, manga güncellemeleri ve topluluk tartışmaları.", "sections": [{"heading": "Anime İçerikleri", "body": "Seasonal anime listeleri, MAL skorları, izleme sıralamaları, dublaj/altyazı haberleri."}, {"heading": "Manga Kanalları", "body": "Manga güncellemeleri, yeni bölüm duyuruları ve çeviri bilgileri paylaşan kanallar."}], "faqs": [{"question": "Türkçe anime kanalları var mı?", "answer": "Evet, Türkçe altyazı ve topluluk kanalları mevcuttur."}, {"question": "Yeni sezon anime ne zaman?", "answer": "Kanallar seasonal anime listelerini düzenli paylaşır."}]}',
 ARRAY['anime'],
 ARRAY['telegram anime kanalları', 'anime telegram', 'manga telegram', 'anime önerileri telegram'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 9) Oyun Kanalları
('telegram-oyun-kanallari-detay',
 '🎮 Telegram Oyun Kanalları 2026 ᐅ Gaming Haberleri',
 '✅ Oyuncular için Telegram kanalları. Oyun haberleri, indirimler, rehberler.',
 'Telegram Oyun Kanalları - Gaming Haberleri ve İndirimler',
 '{"intro": "Oyun dünyasını Telegram üzerinden takip edin. Yeni çıkan oyunlar, ücretsiz oyun duyuruları, Steam indirimleri ve oyun rehberleri.", "sections": [{"heading": "Oyun Haberleri", "body": "PS5, Xbox, Nintendo ve PC oyun haberleri, çıkış tarihleri ve incelemeler."}, {"heading": "İndirim Takibi", "body": "Steam, Epic Games, GOG ücretsiz oyun ve indirim duyuruları paylaşan kanallar."}], "faqs": [{"question": "Ücretsiz oyun duyuruları var mı?", "answer": "Evet, Epic Games ve Prime Gaming ücretsizlerini takip eden kanallar mevcut."}, {"question": "Hangi platformlar takip edilir?", "answer": "PC, PlayStation, Xbox ve Nintendo tüm platformlar için kanallar var."}]}',
 ARRAY['oyun'],
 ARRAY['telegram oyun kanalları', 'gaming telegram', 'oyun haberleri telegram', 'steam telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 10) Eğlence Kanalları
('telegram-eglence-kanallari',
 '😂 Telegram Eğlence Kanalları 2026 ᐅ Komik İçerikler',
 '✅ Eğlence ve mizah Telegram kanalları. Komik videolar, memler, viral içerikler.',
 'Telegram Eğlence Kanalları - Komik İçerikler ve Memler',
 '{"intro": "Telegram''da gülmek ve eğlenmek için en iyi kanallar. Viral videolar, komik capsler, meme kültürü ve eğlenceli içerikler.", "sections": [{"heading": "Eğlence İçerikleri", "body": "Güncel memler, viral Twitter/TikTok içerikleri, komik hayvan videoları ve rastgele eğlenceli paylaşımlar."}, {"heading": "Türkçe Mizah", "body": "Türk internet kültürüne özgü mizah içerikleri paylaşan kanallar oldukça popüler."}], "faqs": [{"question": "En komik kanallar hangileri?", "answer": "Düzenli güncellenen ve orijinal içerik üreten kanalları tercih edin."}, {"question": "İçerikler uygun mu?", "answer": "Kanal açıklamalarına bakarak içerik türünü anlayabilirsiniz."}]}',
 ARRAY['eglence'],
 ARRAY['telegram eğlence kanalları', 'komik telegram', 'meme telegram', 'mizah telegram'],
 420, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 11) E-Spor Kanalları
('telegram-espor-kanallari',
 '🏆 Telegram E-Spor Kanalları 2026 ᐅ Turnuva Haberleri',
 '✅ E-spor tutkunları için Telegram. Turnuva sonuçları, takım haberleri, CS2, Valorant, LoL.',
 'Telegram E-Spor Kanalları - Turnuva ve Takım Haberleri',
 '{"intro": "E-spor dünyasını Telegram üzerinden takip edin. CS2, Valorant, League of Legends turnuva sonuçları, takım transferleri ve maç analizleri.", "sections": [{"heading": "Popüler E-Spor Oyunları", "body": "Counter-Strike 2, Valorant, League of Legends, Dota 2, Rainbow Six Siege ve Rocket League turnuvaları takip edilir."}, {"heading": "Türk E-Spor", "body": "Türk e-spor takımları ve VALORANT Türkiye ligi haberleri için özel kanallar mevcut."}], "faqs": [{"question": "Turnuva sonuçları paylaşılıyor mu?", "answer": "Evet, büyük turnuvaların canlı sonuçları ve analizleri paylaşılır."}, {"question": "Türk takım kanalları var mı?", "answer": "BBL, FUT, Papara SuperMassive gibi takımların takip kanalları mevcut."}]}',
 ARRAY['oyun', 'spor'],
 ARRAY['telegram esport kanalları', 'esport telegram', 'valorant telegram', 'cs2 telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 12) Podcast Kanalları
('telegram-podcast-kanallari-detay',
 '🎙️ Telegram Podcast Kanalları 2026 ᐅ Sesli İçerikler',
 '✅ Podcast tutkunları için Telegram kanalları. Podcast önerileri, yeni bölüm duyuruları.',
 'Telegram Podcast Kanalları - Sesli İçerik Önerileri',
 '{"intro": "Podcast dünyasını Telegram üzerinden keşfedin. Popüler podcast önerileri, yeni bölüm duyuruları ve tür bazlı listeler.", "sections": [{"heading": "Podcast Türleri", "body": "Haber, suç, tarih, kişisel gelişim, komedi ve teknoloji podcastleri için farklı kanallar mevcut."}, {"heading": "Türkçe Podcastler", "body": "Türkçe podcast ekosistemi hızla büyüyor, birçok kaliteli içerik üreticisi Telegram''da aktif."}], "faqs": [{"question": "Podcast önerileri nereden alırım?", "answer": "Tür bazlı listeleme yapan kanallar kaliteli öneriler sunar."}, {"question": "Podcastler Telegram''da dinleniyor mu?", "answer": "Kanallar genellikle link paylaşır, dinleme Spotify/Apple Podcasts üzerinden yapılır."}]}',
 ARRAY['egitim'],
 ARRAY['telegram podcast kanalları', 'podcast telegram', 'sesli içerik telegram', 'podcast önerileri'],
 450, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 13) Video Kanalları
('telegram-video-kanallari',
 '📹 Telegram Video Kanalları 2026 ᐅ Video İçerikler',
 '✅ Video içerik sunan Telegram kanalları. Short videolar, eğitici içerikler, viral videolar.',
 'Telegram Video Kanalları - Video İçerikler',
 '{"intro": "Video içeriklerini Telegram''dan takip edin. TikTok/Reels tarzı kısa videolar, eğitici içerikler ve viral videolar paylaşan kanallar.", "sections": [{"heading": "Video Türleri", "body": "Eğitici videolar, komik içerikler, how-to rehberleri, doğa belgeselleri ve viral sosyal medya içerikleri."}, {"heading": "Video Kalitesi", "body": "Telegram 2GB''a kadar video paylaşımına izin verir, HD kalitede içerikler mevcuttur."}], "faqs": [{"question": "Videolar indirilebilir mi?", "answer": "Evet, Telegram''da paylaşılan videolar doğrudan indirilebilir."}, {"question": "TikTok videoları paylaşılıyor mu?", "answer": "Birçok kanal TikTok ve Reels derlemeleri paylaşır."}]}',
 ARRAY['eglence'],
 ARRAY['telegram video kanalları', 'video telegram', 'viral video telegram', 'tiktok telegram'],
 420, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 14) Meme Kanalları
('telegram-meme-kanallari',
 '🤣 Telegram Meme Kanalları 2026 ᐅ Güncel Memler',
 '✅ Meme kültürü Telegram''da. Güncel caps, Twitter capsları, viral memler.',
 'Telegram Meme Kanalları - Güncel Memler ve Capsler',
 '{"intro": "İnternet meme kültürünü Telegram''dan takip edin. Güncel memler, popüler kültür capsleri ve viral içerikler.", "sections": [{"heading": "Meme Türleri", "body": "Twitter/X capsleri, Reddit memeleri, Türk internet kültürü memeleri ve gündem odaklı capsler."}, {"heading": "Türk Meme Kültürü", "body": "Türkçe meme üreten ve paylaşan aktif topluluklar Telegram''da oldukça güçlü."}], "faqs": [{"question": "En güncel memler nerede?", "answer": "Aktif güncellenen kanallar trendleri hızlıca paylaşır."}, {"question": "Meme yapabilir miyim?", "answer": "Evet, topluluk kanallarına kendi içeriklerinizi gönderebilirsiniz."}]}',
 ARRAY['eglence'],
 ARRAY['telegram meme kanalları', 'meme telegram', 'caps telegram', 'komik caps telegram'],
 400, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 15) Mizah Kanalları
('telegram-mizah-kanallari',
 '😄 Telegram Mizah Kanalları 2026 ᐅ Türkçe Komedi',
 '✅ Türkçe mizah Telegram kanalları. Stand-up, caps, komik içerikler.',
 'Telegram Mizah Kanalları - Türkçe Komedi İçerikleri',
 '{"intro": "Türkçe mizah içeriklerini Telegram''dan takip edin. Stand-up kesitleri, komik skeçler, viral videolar ve günlük espriler.", "sections": [{"heading": "Mizah Türleri", "body": "Güncel olaylara yönelik capsler, stand-up komedyen içerikleri, parodi hesapları ve absürt mizah."}, {"heading": "Popüler Mizah Kanalları", "body": "Düzenli içerik üreten, orijinal ve kaliteli mizah sunan kanallar en çok takip ediliyor."}], "faqs": [{"question": "Aile dostu mizah kanalları var mı?", "answer": "Evet, içerik türünü kanal açıklamasından kontrol edebilirsiniz."}, {"question": "Kendi içeriklerimi paylaşabilir miyim?", "answer": "Bazı kanallar topluluk içerik kabulü yapar."}]}',
 ARRAY['eglence'],
 ARRAY['telegram mizah kanalları', 'komedi telegram', 'türkçe mizah telegram', 'eğlence telegram'],
 420, true, 'spoke', 'telegram-kanallari-rehberi')

ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  word_count = EXCLUDED.word_count,
  page_type = EXCLUDED.page_type,
  updated_at = NOW();

-- Done Phase 3 Traffic Pages
