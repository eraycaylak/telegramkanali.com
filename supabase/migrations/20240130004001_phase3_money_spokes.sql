-- Phase 3: Authority - Money Keyword Spoke Pages (Aşama 1 - 15 Sayfa)
-- Kripto, Borsa, Yatırım temalı sayfalar

INSERT INTO public.seo_pages (slug, title, meta_description, h1, content, related_categories, target_keywords, word_count, published, page_type, parent_hub_slug) VALUES

-- 1) Kripto Kanalları
('telegram-kripto-kanallari',
 '💰 Telegram Kripto Kanalları 2026 ᐅ Bitcoin & Altcoin',
 '✅ En iyi kripto Telegram kanalları. Bitcoin, Ethereum, altcoin analizleri ve sinyaller. Ücretsiz ve güvenilir.',
 'Telegram Kripto Kanalları - Bitcoin & Altcoin Analizleri 2026',
 '{"intro": "Kripto para dünyasını Telegram üzerinden takip edin. En güncel Bitcoin, Ethereum ve altcoin analizleri, trading sinyalleri ve piyasa haberleri sunan kanalları derledik. Yatırımcılar için vazgeçilmez kaynak.", "sections": [{"heading": "Kripto Kanallarında Neler Paylaşılır?", "body": "Günlük ve haftalık piyasa analizleri, teknik analiz grafikleri, al-sat sinyalleri, yeni coin duyuruları, airdrop fırsatları ve önemli piyasa haberleri bu kanallarda paylaşılır."}, {"heading": "Güvenilir Kripto Kanalı Seçimi", "body": "Geçmiş performansı kontrol edin, gerçekçi vaatler sunan kanalları tercih edin, pump-dump gruplarından uzak durun. Kendi araştırmanızı yapmayı unutmayın."}], "faqs": [{"question": "Kripto sinyalleri güvenilir mi?", "answer": "Her sinyal farklı performans gösterir. Geçmiş sonuçlar gelecek kazançları garanti etmez. Risk yönetimi şarttır."}, {"question": "Ücretsiz kripto kanalları var mı?", "answer": "Evet, birçok kanal ücretsiz analiz paylaşır. Premium kanallar ek detaylı içerik sunabilir."}]}',
 ARRAY['kripto'],
 ARRAY['telegram kripto kanalları', 'kripto telegram', 'bitcoin telegram kanalları', 'altcoin telegram'],
 600, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 2) Bitcoin Kanalları
('telegram-bitcoin-kanallari',
 '₿ Telegram Bitcoin Kanalları 2026 ᐅ BTC Analiz',
 '✅ Bitcoin odaklı Telegram kanalları. BTC fiyat tahminleri, teknik analizler, haberler.',
 'Telegram Bitcoin Kanalları - BTC Analizleri ve Haberler',
 '{"intro": "Bitcoin yatırımcıları için özel Telegram kanalları. BTC fiyat analizleri, on-chain verileri, whale hareketleri ve güncel haberler paylaşan kaliteli kanalları listeledik.", "sections": [{"heading": "Bitcoin Kanallarının Özellikleri", "body": "BTC/USD ve BTC/TL grafik analizleri, halving takvimi, mining haberleri, kurumsal yatırımlar ve Lightning Network gelişmeleri bu kanallarda işlenir."}, {"heading": "BTC Yatırımcıları İçin İpuçları", "body": "DYOR (Do Your Own Research) prensibiyle hareket edin. Tek bir kanala bağımlı kalmayın, farklı perspektifler edinin."}], "faqs": [{"question": "En iyi Bitcoin kanalları hangileri?", "answer": "Teknik analiz odaklı, kaynak gösteren ve şeffaf geçmişe sahip kanalları tercih edin."}, {"question": "Bitcoin fiyat tahminleri doğru mu?", "answer": "Hiçbir tahmin kesin değildir. Piyasalar volatildir, her zaman risk vardır."}]}',
 ARRAY['kripto'],
 ARRAY['telegram bitcoin kanalları', 'btc telegram', 'bitcoin analiz telegram', 'bitcoin turkish telegram'],
 550, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 3) Altcoin Kanalları
('telegram-altcoin-kanallari',
 '🚀 Telegram Altcoin Kanalları 2026 ᐅ Yeni Coinler',
 '✅ Altcoin Telegram kanalları. Ethereum, Solana, yeni coin duyuruları ve gem hunting.',
 'Telegram Altcoin Kanalları - Yeni Coinler ve Gem Hunting',
 '{"intro": "Bitcoin dışındaki coinlere odaklanan Telegram kanalları. Ethereum, Solana, Polygon ve yükselen altcoin projeleri hakkında analizler, IDO/IEO duyuruları ve early gem fırsatları.", "sections": [{"heading": "Altcoin Kategorileri", "body": "Layer 1 ve Layer 2 projeleri, DeFi coinleri, NFT tokenleri, meme coinler ve GameFi projeleri farklı kanallarda ele alınır."}, {"heading": "Dikkat Edilmesi Gerekenler", "body": "Proof of work veya proof of stake mekanizmalarını, tokenomics yapısını ve ekip geçmişini araştırın. Rug pull riskine karşı temkinli olun."}], "faqs": [{"question": "Hangi altcoinler popüler?", "answer": "Ethereum, Solana, Cardano gibi büyük projeler daima ilgi görür. Yeni projeler için araştırma şart."}, {"question": "Gem coin nasıl bulunur?", "answer": "Erken aşama projeleri takip eden kanallar ve topluluklar bu konuda ipuçları sunar."}]}',
 ARRAY['kripto'],
 ARRAY['telegram altcoin kanalları', 'altcoin telegram', 'yeni coin telegram', 'gem telegram'],
 520, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 4) Borsa Kanalları
('telegram-borsa-kanallari-detay',
 '📈 Telegram Borsa Kanalları 2026 ᐅ BIST Analizleri',
 '✅ Borsa İstanbul kanalları. Hisse analizi, BIST haberleri, teknik grafikler.',
 'Telegram Borsa Kanalları - BIST ve Hisse Analizleri',
 '{"intro": "Borsa İstanbul yatırımcıları için Telegram kanalları. BIST 100, BIST 30 haberleri, şirket analizleri, teknik yorumlar ve piyasa değerlendirmelerini paylaşan kanallar.", "sections": [{"heading": "Borsa Kanallarında Neler Var?", "body": "Günlük açılış-kapanış değerlendirmeleri, önemli şirket haberleri (kâr açıklamaları, bedelsiz, temettü), teknik analiz grafikleri ve ekonomik takvim paylaşılır."}, {"heading": "SPK Uyarısı", "body": "Telegram kanallarındaki tavsiyeler yatırım danışmanlığı değildir. Kararlarınızı SPK lisanslı kuruluşlar ve kendi araştırmanıza dayanarak verin."}], "faqs": [{"question": "BIST için en iyi kanallar?", "answer": "Geçmiş önerilerini açıkça paylaşan, kaynak gösteren kanalları tercih edin."}, {"question": "Borsa sinyalleri ücretli mi?", "answer": "Hem ücretsiz hem ücretli kanallar mevcut. Kalite her zaman fiyatla orantılı değil."}]}',
 ARRAY['kripto'],
 ARRAY['telegram borsa kanalları', 'BIST telegram', 'hisse telegram', 'borsa analiz telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 5) Yatırım Kanalları
('telegram-yatirim-kanallari-detay',
 '💎 Telegram Yatırım Kanalları 2026 ᐅ Finansal Tavsiyeler',
 '✅ Yatırım odaklı Telegram kanalları. Altın, döviz, kripto, hisse portföy önerileri.',
 'Telegram Yatırım Kanalları - Portföy ve Finansal İçerikler',
 '{"intro": "Parasını değerlendirmek isteyen herkes için Telegram yatırım kanalları. Altın, dolar, euro, kripto, hisse ve gayrimenkul yatırımları hakkında içerik sunan kanalları keşfedin.", "sections": [{"heading": "Yatırım Türleri", "body": "Kısa vadeli trading, uzun vadeli yatırım, pasif gelir, temettü yatırımcılığı gibi farklı stratejilere odaklanan kanallar mevcuttur."}, {"heading": "Risk Uyarısı", "body": "Her yatırım risk taşır. Kaybetmeyi göze alamayacağınız parayı yatırmayın. Profesyonel danışmanlık alın."}], "faqs": [{"question": "Yatırım kanalları güvenilir mi?", "answer": "Şeffaf geçmiş, gerçekçi hedefler ve eğitici yaklaşım güvenilirlik işaretleridir."}, {"question": "Nereden başlamalıyım?", "answer": "Önce temel yatırım bilgilerini öğrenin, sonra kanalları takip edin."}]}',
 ARRAY['kripto'],
 ARRAY['telegram yatırım kanalları', 'yatırım telegram', 'para kazanma telegram', 'finansal telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 6) Trading Kanalları
('telegram-trading-kanallari',
 '📊 Telegram Trading Kanalları 2026 ᐅ Al-Sat Sinyalleri',
 '✅ Trading sinyalleri ve teknik analizler. Spot, futures, scalping stratejileri.',
 'Telegram Trading Kanalları - Al-Sat Sinyalleri ve Stratejiler',
 '{"intro": "Aktif trader''lar için Telegram kanalları. Spot, perpetual futures, scalping ve swing trading stratejileri, entry-exit noktaları ve risk yönetimi paylaşan kanallar.", "sections": [{"heading": "Trading Kanal Türleri", "body": "Scalping (dakikalık işlemler), day trading (günlük), swing trading (haftalık), position trading (aylık) stratejilerine göre farklı kanallar bulunur."}, {"heading": "Dikkat Edilmesi Gerekenler", "body": "Kaldıraç kullanımı riski artırır. Position sizing ve stop-loss kullanımı şarttır. Demo hesapla pratik yapın."}], "faqs": [{"question": "Trading sinyalleri işe yarar mı?", "answer": "Başarı oranları kanal ve piyasa koşullarına göre değişir. Körü körüne takip etmeyin."}, {"question": "Hangi borsa kullanılmalı?", "answer": "Güvenilir ve lisanslı borsaları tercih edin. Türk kullanıcılar için BTCTurk, Paribu gibi yerel borsalar mevcuttur."}]}',
 ARRAY['kripto'],
 ARRAY['telegram trading kanalları', 'trading sinyalleri telegram', 'al-sat telegram', 'trader telegram'],
 550, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 7) Sinyal Kanalları
('telegram-sinyal-kanallari',
 '🎯 Telegram Sinyal Kanalları 2026 ᐅ Ücretsiz Sinyaller',
 '✅ Kripto ve borsa sinyalleri. Entry, take profit, stop loss seviyeleri.',
 'Telegram Sinyal Kanalları - Kripto ve Borsa Sinyalleri',
 '{"intro": "Hazır alım-satım sinyalleri sunan Telegram kanalları. Entry fiyatı, take profit hedefleri ve stop loss seviyeleriyle birlikte paylaşılan profesyonel sinyaller.", "sections": [{"heading": "Sinyal Nasıl Kullanılır?", "body": "Entry: Alım yapılacak fiyat. TP (Take Profit): Kar alma seviyeleri. SL (Stop Loss): Zarar durdurma seviyesi. Pozisyon büyüklüğünü riskinize göre ayarlayın."}, {"heading": "Sinyal Kanalı Değerlendirme", "body": "Geçmiş performansı kanıtlayan, win rate paylaşan ve risk uyarısı yapan kanallar tercih edilmelidir."}], "faqs": [{"question": "Ücretsiz sinyal kanalları var mı?", "answer": "Evet, birçok kanal ücretsiz sinyal paylaşır. Premium kanallar genellikle daha detaylı analiz sunar."}, {"question": "Sinyalleri körü körüne takip etmeli miyim?", "answer": "Hayır, her sinyali kendi araştırmanızla doğrulayın. Kendi risk yönetiminizi uygulayın."}]}',
 ARRAY['kripto'],
 ARRAY['telegram sinyal kanalları', 'kripto sinyal telegram', 'borsa sinyal telegram', 'ücretsiz sinyal'],
 520, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 8) Forex Kanalları
('telegram-forex-kanallari',
 '💹 Telegram Forex Kanalları 2026 ᐅ Döviz Analizleri',
 '✅ Forex trading kanalları. EUR/USD, GBP/USD, USD/TRY analizleri ve sinyaller.',
 'Telegram Forex Kanalları - Döviz Piyasası Analizleri',
 '{"intro": "Döviz piyasalarını takip eden Telegram kanalları. Major, minor ve exotic döviz çiftleri, ekonomik takvim ve merkez bankası kararları hakkında analizler.", "sections": [{"heading": "Forex Kanallarında Neler Paylaşılır?", "body": "Teknik analizler, support-resistance seviyeleri, ekonomik takvim olayları (NFP, faiz kararları), temel analiz yorumları."}, {"heading": "Forex Riskleri", "body": "Forex yüksek kaldıraç imkanı sunar bu da hem yüksek kazanç hem yüksek kayıp potansiyeli demektir. Demo hesapla başlayın."}], "faqs": [{"question": "Forex yasal mı?", "answer": "Türkiye''de SPK lisanslı kuruluşlar üzerinden forex işlemi yapmak yasaldır. Offshore brokerlardan kaçının."}, {"question": "En çok işlem gören pariteler?", "answer": "EUR/USD, GBP/USD ve USD/JPY en likit ve popüler pariteledir."}]}',
 ARRAY['kripto'],
 ARRAY['telegram forex kanalları', 'forex telegram', 'döviz telegram', 'forex sinyal telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 9) NFT Kanalları
('telegram-nft-kanallari',
 '🎨 Telegram NFT Kanalları 2026 ᐅ Dijital Sanat',
 '✅ NFT dünyası Telegram''da. OpenSea, Blur, yeni koleksiyonlar, mint bilgileri.',
 'Telegram NFT Kanalları - Dijital Sanat ve Koleksiyonlar',
 '{"intro": "NFT dünyasını Telegram''dan takip edin. Yeni koleksiyon duyuruları, mint tarihleri, floor price takipleri ve alpha bilgiler paylaşan kanallar.", "sections": [{"heading": "NFT Kanal İçerikleri", "body": "Yeni proje incelemeleri, whitelist fırsatları, free mint bilgileri, blue chip koleksiyon haberleri ve piyasa analizleri."}, {"heading": "NFT Yatırımı Riskleri", "body": "NFT piyasası volatildir. Projelerin ekip geçmişini, roadmap''ini ve topluluk gücünü araştırın. FOMO''ya kapılmayın."}], "faqs": [{"question": "NFT nasıl alınır?", "answer": "Ethereum cüzdanı (MetaMask vb.) oluşturup OpenSea, Blur gibi marketlerden satın alabilirsiniz."}, {"question": "Hangi NFT''ler değerli?", "answer": "Bored Ape, CryptoPunks gibi etabli koleksiyonlar ve güçlü topluluğa sahip projeler genellikle değerini korur."}]}',
 ARRAY['kripto'],
 ARRAY['telegram nft kanalları', 'nft telegram', 'opensea telegram', 'nft mint telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 10) Airdrop Kanalları
('telegram-airdrop-kanallari',
 '🪂 Telegram Airdrop Kanalları 2026 ᐅ Ücretsiz Coin',
 '✅ Airdrop fırsatları Telegram''da. Ücretsiz kripto, testnet görevleri, retroactive ödüller.',
 'Telegram Airdrop Kanalları - Ücretsiz Kripto Fırsatları',
 '{"intro": "Ücretsiz kripto para kazanma fırsatları sunan Telegram kanalları. Airdrop duyuruları, testnet görevleri, retroactive reward beklentileri ve early adopter avantajları.", "sections": [{"heading": "Airdrop Türleri", "body": "Holder airdropları, task-based airdroplar, retroactive airdroplar (geçmişe dönük ödüller), referral airdropları bulunur."}, {"heading": "Güvenlik Uyarıları", "body": "Scam aidroplara dikkat edin. Asla seed phrase paylaşmayın. Doğrulanmış projelerin resmi kanallarını takip edin."}], "faqs": [{"question": "Airdrop gerçekten bedava mı?", "answer": "Meşru airdroplar ücretsizdir. Ödeme yapmanızı isteyen her şey muhtemelen scam''dır."}, {"question": "Büyük airdroplar nasıl bulunur?", "answer": "Yeni ağların testnetlerini kullanın, mainnet öncesi projeleri deneyin. Alpha kanalları takip edin."}]}',
 ARRAY['kripto'],
 ARRAY['telegram airdrop kanalları', 'airdrop telegram', 'ücretsiz kripto telegram', 'crypto airdrop telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 11) DeFi Kanalları
('telegram-defi-kanallari',
 '🏦 Telegram DeFi Kanalları 2026 ᐅ Merkezi Olmayan Finans',
 '✅ DeFi dünyası Telegram''da. Yield farming, staking, liquidity mining fırsatları.',
 'Telegram DeFi Kanalları - Merkezi Olmayan Finans',
 '{"intro": "Decentralized Finance (DeFi) dünyasını Telegram''dan takip edin. Yield farming stratejileri, staking fırsatları, DEX haberleri ve new protocol launches.", "sections": [{"heading": "DeFi Kanal İçerikleri", "body": "APY karşılaştırmaları, IL (impermanent loss) hesaplamaları, bridge güncellemeleri, audit raporları ve governance kararları."}, {"heading": "DeFi Riskleri", "body": "Smart contract riskleri, rug pull tehlikesi, impermanent loss. Sadece kaybetmeyi göze alacağınız miktarları kullanın."}], "faqs": [{"question": "DeFi nedir?", "answer": "Bankasız, merkezi otorite olmadan çalışan finansal hizmetlerdir. Lending, borrowing, trading gibi işlemler yapılır."}, {"question": "DeFi güvenli mi?", "answer": "Audit edilmiş protokoller daha güvenlidir ancak her zaman risk vardır. DYOR."}]}',
 ARRAY['kripto'],
 ARRAY['telegram defi kanalları', 'defi telegram', 'yield farming telegram', 'staking telegram'],
 480, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 12) Coin Haberleri
('telegram-coin-haberleri',
 '📰 Telegram Coin Haberleri 2026 ᐅ Kripto Haberler',
 '✅ Güncel kripto para haberleri. Piyasa gelişmeleri, regülasyonlar, büyük duyurular.',
 'Telegram Coin Haberleri - Güncel Kripto Gelişmeleri',
 '{"intro": "Kripto para dünyasından anlık haberler sunan Telegram kanalları. SEC kararları, büyük borsaların duyuruları, hacking olayları ve piyasayı etkileyen tüm gelişmeler.", "sections": [{"heading": "Haber Kanal Türleri", "body": "Breaking news kanalları, analitik haber kanalları, Türkçe kripto haber kanalları ve özel kaynaklı insider kanalları."}, {"heading": "Haberlerin Önemi", "body": "Kripto piyasası haberlere çok duyarlıdır. FUD ve FOMO etkilerini yönetmek için doğru ve hızlı haber kaynakları kritiktir."}], "faqs": [{"question": "En hızlı haber kaynağı hangisi?", "answer": "Telegram kanalları genellikle Twitter''dan bile önce haber verebilir. Birden fazla kaynağı takip edin."}, {"question": "Fake news nasıl anlaşılır?", "answer": "Birden fazla güvenilir kaynaktan doğrulama yapın. Tek kaynağa güvenmeyin."}]}',
 ARRAY['kripto', 'haber'],
 ARRAY['telegram coin haberleri', 'kripto haber telegram', 'bitcoin haber telegram', 'crypto news telegram'],
 520, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 13) Pasif Gelir Kanalları
('telegram-pasif-gelir-kanallari',
 '💸 Telegram Pasif Gelir Kanalları 2026 ᐅ Para Kazanma',
 '✅ Pasif gelir fırsatları. Staking, lending, affiliate, online gelir yöntemleri.',
 'Telegram Pasif Gelir Kanalları - Online Para Kazanma',
 '{"intro": "Pasif gelir elde etme yöntemlerini paylaşan Telegram kanalları. Kripto staking, DeFi yield, affiliate marketing, freelancing ve dijital ürün satışı hakkında bilgiler.", "sections": [{"heading": "Pasif Gelir Türleri", "body": "Kripto staking geliri, lending faizi, divident (temettü) yatırımları, royalty gelirleri, affiliate komisyonları."}, {"heading": "Gerçekçi Beklentiler", "body": "Çok yüksek getiri vaatleri genellikle scam''dır. Sürdürülebilir pasif gelir zaman ve sabır gerektirir."}], "faqs": [{"question": "Pasif gelir gerçek mi?", "answer": "Evet ama ''para yatırmadan zengin ol'' vaatleri genellikle yalandır. Her pasif gelir bir başlangıç yatırımı gerektirir."}, {"question": "Nereden başlamalıyım?", "answer": "Küçük miktarlarla staking veya lending deneyebilirsiniz. Önce öğrenin, sonra yatırın."}]}',
 ARRAY['kripto', 'egitim'],
 ARRAY['telegram pasif gelir', 'para kazanma telegram', 'online gelir telegram', 'staking gelir telegram'],
 500, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 14) Telegram Para Kazanma
('telegram-para-kazanma-detay',
 '💵 Telegram''dan Para Kazanma Rehberi 2026 ᐅ Yöntemler',
 '✅ Telegram üzerinden para kazanma yolları. Kanal geliri, affiliate, reklam satışı.',
 'Telegram''dan Para Kazanma - Detaylı Rehber',
 '{"intro": "Telegram platformunu kullanarak nasıl para kazanabilirsiniz? Kendi kanalınızdan reklam geliri, affiliate marketing, premium içerik satışı ve daha fazlası bu rehberde.", "sections": [{"heading": "Para Kazanma Yöntemleri", "body": "1) Kanal reklamları: Sponsorlu post paylaşarak gelir elde edin. 2) Affiliate linkler: Ürün/hizmet tanıtıp komisyon kazanın. 3) Premium gruplar: Ücretli özel içerik sunun. 4) Danışmanlık: Uzmanlığınızı satın."}, {"heading": "Ne Kadar Kazanılır?", "body": "Gelir abone sayısı ve niş''e göre değişir. 10K+ aboneli kanallar reklam alabilir. Kripto ve finans niş''leri daha yüksek gelir getirir."}], "faqs": [{"question": "Kaç aboneyle para kazanılır?", "answer": "Genellikle 5.000-10.000 aboneden sonra ciddi reklam teklifleri gelir. Nişe göre değişir."}, {"question": "Telegram''dan ne kadar kazanılır?", "answer": "Birkaç yüz dolardan onlarca bin dolara kadar değişir. Kitle büyüklüğü ve etkileşim belirleyicidir."}]}',
 ARRAY['egitim'],
 ARRAY['telegram para kazanma', 'telegram gelir', 'telegram reklam', 'telegram kazanç'],
 550, true, 'spoke', 'telegram-kanallari-rehberi'),

-- 15) Telegram Pump Kanalları (Uyarılı)
('telegram-pump-uyari',
 '⚠️ Telegram Pump Grupları UYARI 2026 ᐅ Dolandırıcılık Riski',
 '✅ Pump grupları hakkında uyarılar. Neden tehlikelidir, nasıl korunulur?',
 'Telegram Pump Grupları - Risk Uyarısı ve Korunma',
 '{"intro": "Pump-and-dump grupları hakkında önemli uyarı. Bu grupların çoğu dolandırıcılık amaçlıdır ve katılımcıların büyük çoğunluğu para kaybeder. Bu sayfa bilgilendirme amaçlıdır.", "sections": [{"heading": "Pump-Dump Nedir?", "body": "Düşük hacimli bir coinin fiyatını yapay olarak şişirip (pump) sonra satarak kâr etmek (dump). Organizatörler satın alır, duyuru yapar, geç kalanlar zarar eder."}, {"heading": "Neden Tehlikeli?", "body": "Matematiksel olarak çoğunluk kaybeder. İçeriden bilgi sahipleri kazanır. Yasal olarak manipulation suçu kapsamına girer. Para kaybı garantidir."}], "faqs": [{"question": "Pump gruplarına katılmalı mıyım?", "answer": "HAYIR. Bu gruplar her zaman birilerini zengin eder - ve o sizsiniz değilsiniz."}, {"question": "Pump grupları yasal mı?", "answer": "Hayır, piyasa manipülasyonu suçtur. Türkiye dahil birçok ülkede yasaktır."}]}',
 ARRAY['kripto'],
 ARRAY['telegram pump grupları', 'pump dump telegram', 'kripto dolandırıcılık', 'pump uyarı'],
 480, true, 'spoke', 'telegram-kanallari-rehberi')

ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  word_count = EXCLUDED.word_count,
  page_type = EXCLUDED.page_type,
  updated_at = NOW();

-- Done Phase 3 Money Pages
