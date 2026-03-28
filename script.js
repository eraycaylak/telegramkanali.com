const fs = require('fs');

const channels = [{"id":"7b69f7de-996a-4124-8e5d-60061050a8cc","name":"Linkimiyolla"},{"id":"95a050af-e82b-4e40-888c-a60c5bb14259","name":"TÜRK İFŞA VİP +18"},{"id":"67d2c927-0e90-4e9b-8e60-ca72f2f9ebd4","name":"ifşaburada"},{"id":"45ccc1c5-35e9-4e71-9638-a342c734db3e","name":"Onlyfns Türkiye"},{"id":"c93b8ec3-e9f6-4b32-8b62-bfd066d84b11","name":"MeriovaTR"},{"id":"0c5d4dc2-72f8-4e2c-92ec-a9eb63dd071f","name":"Ateşli Geceler 🥵"},{"id":"5efeffb0-35bf-40bd-a827-06e8c02ed55b","name":"Fenomen PORN 🥵"},{"id":"e5d8c6e7-f833-4bde-bc95-0068bec6dd07","name":"🧡 TANGO'NUN MELEKLERİ ÜCRETSİZ 🧡"},{"id":"2081eb77-ec3b-4f82-b515-e08b544ff812","name":"🔞🏳️‍🌈İZMIR GAY ARAYIŞ🏳️‍🌈🔞"},{"id":"dea244f4-bac6-41ae-bff1-104a11cc2218","name":"ÜNLÜ İFŞA İZLE 💋"},{"id":"77368bce-418f-4fb9-bfc1-810f6f585c67","name":"VİP ESC SİK1Ş😼 +18"},{"id":"8b244286-f169-45f2-b938-cc0abefbf405","name":"Eylülhrny"},{"id":"bace89d4-c704-4fdb-b013-a9b33c155de0","name":"TürkHub+18"},{"id":"ff552eab-a582-47bf-80f5-0fe775d8b659","name":"TÜRK İFŞA"},{"id":"6089fce3-3ef9-4aea-9793-9d85aa7cbf2e","name":"+18 ÜCRETSİZ KATIL"},{"id":"17276064-f69f-4231-8443-25c9e9800a9a","name":"Alemdar - Giriş"},{"id":"3261e5f0-6d6f-4807-93dc-10b66a3352ec","name":"Cum & Tribute"},{"id":"a336c505-85b1-46d2-8aea-0db53c79b30e","name":"Telegram: Contact @feetfoottr"},{"id":"323463c2-ed20-4502-ac1d-1d3feb357bc2","name":"İstanbul Eskort Plus"},{"id":"697d9648-b72d-4587-97bc-cd7395972599","name":"Meriova Vİp"},{"id":"2236e27c-9e8d-4e54-b15b-a6016d0efa07","name":"VİSKİ SADECE \"YOUTUBE\" TANITIM"},{"id":"809ee2d6-044f-435b-975b-3eec5c83c064","name":"Liseli Vip"},{"id":"601736b6-2f8b-4903-847d-7dc0f100a90a","name":"Red Room VIP Xtreme🤯"},{"id":"766dfa18-194a-414a-9372-bfaeac43e3e6","name":"⚔️İRİNA VİP⚔️"},{"id":"f4f09626-5c12-4853-a4c3-942e98cd3c4d","name":"Asya Koral"},{"id":"ef4454b8-5ba4-434a-a4fb-fe18ae12d792","name":"HAREM - TÜRK İFŞA"},{"id":"26c2eb08-f41c-47f9-8249-928bb9d18b40","name":"Telegram: Contact @belaltii"},{"id":"f09e597f-543e-4a99-a66a-e1f8188d7a79","name":"Telegram: Contact @Sexolojivip"},{"id":"91553888-e5ff-44cd-9d0f-2326fd438b2a","name":"Ücretli Canlı Show"},{"id":"b3fe0bf8-b773-45e4-8bb9-8294f7aab849","name":"VANİTAS LİNK PAYLAŞIM"},{"id":"5d1a1f93-c235-43bd-ac7a-fd9c659e7b18","name":"7/24 Türk"},{"id":"93f791d5-718a-4366-96f7-e13110adb338","name":"Sexymottions sohbet"},{"id":"38c51b42-8ea3-42f3-8a22-d393bab0f59a","name":"laranin zindani💋"},{"id":"94bbe990-9618-45f7-a97e-966d35986b42","name":"Türk Yetişkin Videoları"},{"id":"a3503545-d8a9-42a7-95bd-69c30e3ac8c4","name":"0NLYFANS VİP💕 +"},{"id":"58e9fc01-4189-42da-a118-d71d4052594b","name":"SÜT"},{"id":"4162df56-d152-4957-9567-7dd976e125c1","name":"Barış Reus İfşa"},{"id":"211023ef-5bdc-45aa-abd6-e3ec0c6e2963","name":"Türk Club"},{"id":"afec8538-9992-44f3-8ccc-1d92904270dc","name":"Feet🧦"},{"id":"19fd3f01-33f8-4a4e-beb9-f588be9c459d","name":"LUXURY PAYLAŞIM GURUBU"},{"id":"84087e1f-1be6-494c-a52f-816f92191918","name":"Telegram: Contact @turkifsaalink"},{"id":"9227c349-3bcd-48f7-b5e5-c7110e91b0c8","name":"Banu Show Teyit"},{"id":"dcd9c808-429e-4592-a449-1510e0cb62b5","name":"Telegram: Contact @zehrayicik"},{"id":"8c4f608f-b9ed-4493-8ec9-8438d4d1908a","name":"VIP ONLYFANS"},{"id":"441265c3-3b91-4c37-89e8-bbed35248430","name":"Şampiyon Kullanıcı Arşivi"},{"id":"9d6808a6-f8f2-4d08-9413-5a2355cc1952","name":"Escobar VIP Turkzzers"},{"id":"3c5d914a-3f88-4a21-9412-85ed085e1754","name":"dasdas"},{"id":"5ba03a94-18c9-4e4b-a281-7f029367f337","name":"Zeynep kaya"},{"id":"29959d7d-ca19-4f31-af58-32152661edc1","name":"TÜRBANLI İ*ŞACIM 🧕🏻"},{"id":"50d4c739-7df7-463c-9472-351670484b53","name":"PAYLAŞIMLI TÜRK"},{"id":"c15d99dc-c4ff-414d-b1c9-4dd8cc998b16","name":"TERBİYESİZ BEYLER VIP🔥❤️"},{"id":"0897fd07-6ad1-4c98-bccb-5cd6feb8adf7","name":"V YOU TANITIM"},{"id":"eca62f58-2f2d-44bf-8477-1311739f063f","name":"LİNKSİZ İFŞA"},{"id":"c44bdc7f-175e-4826-aed9-1db9913e885d","name":"İfşa avcısı"},{"id":"a1f922b4-be40-4ed4-a0f6-13b74f87ffd3","name":"😈SEXTUBE🔞"},{"id":"9d525622-15ef-40d2-b3ef-26fc84751822","name":"SOHBET ARKADAŞLIK 2022 +18"},{"id":"865b4748-3b27-4abd-a34b-f07d8ed3589f","name":"Quality <\\>"},{"id":"27461397-ad5f-468e-9c6c-4e8d5d81fdc0","name":"Özel nur ❤️‍🔥"},{"id":"1c718c88-5473-4290-b143-a56f7c0a9866","name":"Turki$h 0F"},{"id":"096db949-ba3e-47ce-9ef1-163958194f9e","name":"Nudes film"},{"id":"ff2344c4-9c18-459c-a928-846b3147bcc3","name":"Join group chat on Telegram"},{"id":"b1d9cc27-fa3e-4a81-9ee2-fbf7b366d70c","name":"TÜRK GÜNCEL İFSALAR"},{"id":"f0b748da-7c67-4680-9730-fe96ef24e4fc","name":"Turkish Panter"},{"id":"e77854d2-aff4-4f41-8889-099e6f3b5205","name":"Premium İfşa"},{"id":"f30886e3-0802-4a4a-ad1d-acf687aefb19","name":"VİSKİ VİP / YOUTUBE"},{"id":"8bc6bc50-1d35-47d9-a054-d09e614b77c2","name":"TÜRK İFŞA YENİ💋"},{"id":"2afcb45d-2cca-43f1-8f54-af4cd1b62211","name":"Gizli Temas"},{"id":"1a259828-e06a-40d8-a846-60d918f83cd2","name":"Dilan Türbanlı Türk İfşa"},{"id":"aeda822f-369c-4ee8-a23d-33e1a9ca319b","name":"AZOTUBE I PREMIUM"},{"id":"cf1a9178-6c62-4fb3-9e74-66bf4e1ca8aa","name":"ZagorResmi"},{"id":"8d2d4bf1-038f-4c63-87ff-b69c9a7b17ff","name":"URFA ARAYIŞ ESC GRUBU"},{"id":"a4cfdd13-48d6-40b6-a076-a59a23082aa9","name":"Adultchanel"},{"id":"dd08eb14-1f22-4c99-b75a-cf036457cebb","name":"Fatmanın Teyitleri💕"},{"id":"97c61170-fac5-4bea-8d0a-4418cf198c4b","name":"ifşaburada"},{"id":"98938b4c-c9e5-46a3-9c9f-57cc6b71d1eb","name":"TürkHub +18"},{"id":"70e73105-a4a5-4f5a-8dd3-1ce0f624ad8e","name":"ParsVIP+ İstekler Anında Onaylanır"},{"id":"9c5ecb14-7df5-4f77-8ae9-e66e8ca963b4","name":"Lanet İfşa"},{"id":"63a7442d-904e-4660-8b92-cb09a1461e1d","name":"TÜRK LİSELİ İFŞA 🔞"},{"id":"447893f7-5764-4388-baa4-3ab01a85d163","name":"Karoliny"},{"id":"f7e7fdc9-de23-4a67-b419-11237fdc80ab","name":"TİB İfşa "},{"id":"bee03b71-4065-4578-968a-1bba736bfca9","name":"TürbanIı HatunIar"},{"id":"7e20cc7d-9dc2-4136-ae74-a776c42c5e8b","name":"VİP ALTYAZILI P*RNO 🐋"},{"id":"9c8b3bed-c05f-4322-afaf-7f35ad84d236","name":"LİS3Lİ İFŞ4👅 +18"},{"id":"2e3daa59-aada-4e68-8160-666df114be73","name":"TÜRK ÜNLÜ İFŞ4👙"},{"id":"b2613d53-b9fb-4399-8c32-580e3010dfc4","name":"LİSELİ - TÜRBANLI"},{"id":"b0999dd6-9129-4090-a6c4-3118692fbaff","name":"🔞SEXTUBE NUDE🔞"},{"id":"1cc5350c-9fb2-45d5-a77d-65310cf4ca01","name":"SANSÜRSÜZ SİKİŞ +18"},{"id":"1f411fd8-9e45-46f3-8a87-e107c87e76ee","name":"ÜNLÜ TÜRK İFŞA 😇"},{"id":"ca59b062-55c1-42f4-b7af-fedfdb0f701b","name":"OROSPU ÜVEY İFŞA 😝"},{"id":"8a0bd2e5-5322-4e5d-9a9f-43bc241b7b77","name":"İfşalar ve Kendi Paylaşımlarım"},{"id":"795a49c3-3f5d-4e5c-bd71-0c6e73725ed9","name":"TÜRK ÜNLÜ SİKİŞ ❤️‍🔥"},{"id":"e7a557ee-33dc-4414-88e8-18d96cb3934c","name":"TÜRK KIZLARI V.İ.P"},{"id":"f9287f8d-6a81-4054-9188-348aec09e6bf","name":"B4KİRE İFŞ4 PLUS🥵"},{"id":"a8895549-32d3-4b9c-8d3f-511e13d3e361","name":"Turkz İçerikler"},{"id":"0bdce26a-e6ef-4caf-ae8e-c127b39d8709","name":"ÇILGIN VİP 1FŞA"},{"id":"20c5ddb7-3f40-44d5-9fa3-3358aa4e1891","name":"Alemdar - Türk İçerikler"},{"id":"c05c1898-0801-4968-81cc-2c5fa732b2df","name":"Buse nin kanalı"},{"id":"d693ba10-c667-48b5-9951-ed9fd85d9948","name":"Türk İfşa"},{"id":"0330f3e2-e67f-440c-8516-61c84f6f58fa","name":"Buse Ateş"},{"id":"377ef39e-1cd1-4a5c-80f4-0cc00f58d63e","name":"Şovcu Banu"},{"id":"312320ce-95c2-4351-babf-1bf608e48009","name":"TÜRK SİKİŞ İFŞA 🥰"},{"id":"40c23cbb-269b-4688-9577-6c15d6c2de8a","name":"GW - Media"},{"id":"80cc4a96-032b-485a-969e-1159a3a51513","name":"2026 EN YENİ ÜCRETSİZ İFŞA"},{"id":"9e05ebce-d6f0-41e1-87c4-f2972ddfbc53","name":"SANSÜRSÜZ İFŞALAR🔥"},{"id":"a195f72a-656e-456e-8929-4fde91ff31ce","name":"TÜRK ANAL İFŞA"},{"id":"37a3d927-5eb2-4e2d-b2b2-5e87d83e0f55","name":"TÜRK ÜNLÜ İFŞA 💚"},{"id":"49d23f22-96cb-4dbe-b450-53759b8b4811","name":"Y PLUS TANITIM"},{"id":"52609d18-dc24-40b6-8230-d189cbd95026","name":"İfşalarım"},{"id":"cb072091-1311-48f6-8815-ca729a26e5f8","name":"Edepsiz Ortamm"},{"id":"811ab5d3-13b1-467d-b4de-f3c7323f272a","name":"Turkzzers Türk Ifşa +18"},{"id":"648b6e4e-8991-431f-ae94-f97f3b20f5a3","name":"Telegram: Contact @azeriturkp"},{"id":"d7566793-ecbb-44dd-83ea-fdec7edde7b7","name":"TERBİYESİZ BEYLER GİRİŞ"},{"id":"aadcc903-17fc-4ec6-ae2d-bf88aa1ffdd2","name":"ÜNLÜ KIZLAR İFŞA 😍"},{"id":"0a7c26b1-4d24-44f5-b029-43c9d513c764","name":"CelebrityGirlsClub"},{"id":"739f93c2-1219-442d-9b22-aadeaa77aa5d","name":"YOUTUBE KATİL PLUS"},{"id":"6557ae83-f3ef-496d-a2f5-94a2ea758396","name":"BC BAHİS ANALİZ"},{"id":"8f4db0f6-bfbd-4e99-8355-bfb9c19fa6db","name":"Ayse yakından tanı"},{"id":"13cad113-aa68-4818-bf45-c6dd1d71ebe0","name":"Anadolu İfşa"},{"id":"b5fbec5a-2032-4d4a-b06f-d116dc6f65e2","name":"Sude Kurt 🥵"},{"id":"8e9818d0-4b08-4699-a246-940bc3bbdfd4","name":"Alya"},{"id":"fe2d39f6-70c1-430a-b063-38da000d2ad0","name":"VipTürkPro"}];

const riskyWords = ['ifşa', 'escort', 'eskort', 'liseli', 'üvey', 'porn', 'sikiş', 'deepweb'];

// Regex to match any of the words, case-insensitively with Turkish characters support (as best as JS regex allows, but safer to loop with lowercase conversion if needed, but modern JS handles it okay with strings).
// Better approach: manual casing check for robustness
function containsRiskyWord(str) {
  const lowerStr = str.toLocaleLowerCase('tr-TR');
  for (const word of riskyWords) {
    if (lowerStr.includes(word.toLocaleLowerCase('tr-TR'))) {
      const matchPos = lowerStr.indexOf(word.toLocaleLowerCase('tr-TR'));
      return { found: true, word: word, lower: lowerStr };
    }
  }
  // also check with standard lower
  const normStr = str.toLowerCase();
  for (const word of riskyWords) {
    if (normStr.includes(word.toLowerCase())) {
        return { found: true, word: word, lower: normStr };
    }
  }
  // catch 1fşa or İFŞA directly with a regex to be safe
  const fallbackRegex = /(ifşa|escort|eskort|liseli|üvey|porn|sikiş|deepweb|1fşa|İfşa|İFŞA|IFSA)/i;
  if(fallbackRegex.test(str)) {
    return { found: true, word: 'regex-match' };
  }
  
  return { found: false };
}

function cleanName(str) {
  let cleaned = str;
  // Replace all cases
  const patterns = [
    /ifşa/gi, /İfşa/gi, /İFŞA/gi, /1fşa/gi, /IFSA/gi,
    /escort/gi, /eskort/gi, /ESCORT/gi, /ESKORT/gi,
    /liseli/gi, /LİSELİ/gi, /LISELI/gi,
    /üvey/gi, /ÜVEY/gi, /UVEY/gi,
    /porn/gi, /PORN/gi,
    /sikiş/gi, /SİKİŞ/gi, /SIKIS/gi, /sikis/gi,
    /deepweb/gi, /DEEPWEB/gi
  ];
  
  for (const p of patterns) {
    cleaned = cleaned.replace(p, '');
  }
  
  // Clean up dangling characters like hyphens or extra spaces
  cleaned = cleaned.replace(/^[-\s|_+*.]+/, '').replace(/[-\s|_+*.]+$/, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  if (!cleaned || cleaned.trim() === '' || cleaned.length < 2) {
    return '+18 Yetişkin Sohbet';
  } else {
    return `+18 Yetişkin Sohbet - ${cleaned}`;
  }
}

let rollbackSql = "BEGIN;\n";
let updateSql = "BEGIN;\n";
let updatedCount = 0;

for (const ch of channels) {
  const check = containsRiskyWord(ch.name);
  if (check.found) {
    const originalName = ch.name.replace(/'/g, "''");
    const newName = cleanName(ch.name).replace(/'/g, "''");
    
    rollbackSql += `UPDATE channels SET name = '${originalName}' WHERE id = '${ch.id}';\n`;
    updateSql += `UPDATE channels SET name = '${newName}' WHERE id = '${ch.id}';\n`;
    updatedCount++;
    console.log(`Matched: ${ch.name} -> ${cleanName(ch.name)}`);
  }
}

rollbackSql += "COMMIT;\n";
updateSql += "COMMIT;\n";

fs.writeFileSync('c:\\Users\\Eray\\.gemini\\antigravity\\scratch\\eraycaylak_repos\\telegramkanali.com\\rollback_channels.sql', rollbackSql);
fs.writeFileSync('c:\\Users\\Eray\\.gemini\\antigravity\\scratch\\eraycaylak_repos\\telegramkanali.com\\update_channels.sql', updateSql);

console.log(`\nTotal updated: ${updatedCount}`);
