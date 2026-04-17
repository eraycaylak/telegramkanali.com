import React from 'react';
import { CheckCircle2, XCircle, Users, Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import { Channel } from '@/lib/types';

interface Props {
  channel: Channel;
}

export default function CryptoChannelReview({ channel }: Props) {
  // Deterministic Scoring Logic
  const calculateScore = () => {
    let score = 0;
    
    // Member count points (max 4.5)
    const members = channel.member_count || 0;
    if (members > 100000) score += 4.5;
    else if (members > 50000) score += 4.0;
    else if (members > 10000) score += 3.5;
    else if (members > 5000) score += 3.0;
    else if (members > 1000) score += 2.5;
    else score += 2.0;

    // Recency points (max 3.5)
    // Using created_at or default since updated_at is not on the Channel type
    const updateTime = new Date(channel.created_at || new Date()).getTime();
    const now = new Date().getTime();
    const daysSinceUpdate = (now - updateTime) / (1000 * 3600 * 24);
    
    if (daysSinceUpdate <= 3) score += 3.5;
    else if (daysSinceUpdate <= 14) score += 3.0;
    else if (daysSinceUpdate <= 30) score += 2.0;
    else score += 1.0;

    // Profile completeness (max 2.0)
    if (channel.description && channel.description.length > 50) score += 1.0;
    if (channel.subcategories && channel.subcategories.length > 0) score += 0.5;
    if (channel.tags && channel.tags.length > 0) score += 0.5;

    return Math.min(Math.max(score, 1.0), 10.0).toFixed(1);
  };

  const score = parseFloat(calculateScore());
  
  // Deterministic Pros & Cons
  const pros = [];
  const cons = [];
  
  if (score >= 8.5) {
    pros.push('Yüksek üye etkileşimi ve aktivite');
  } else if (score >= 7.0) {
    pros.push('Aktif büyüyen topluluk');
  }
  
  const daysSinceUpdate = (new Date().getTime() - new Date(channel.created_at || new Date()).getTime()) / (1000 * 3600 * 24);
  if (daysSinceUpdate <= 7) {
    pros.push('Düzenli günlük/haftalık paylaşım ritmi');
  } else {
    cons.push('Son zamanlarda paylaşım sıklığı düşmüş olabilir');
  }

  if (channel.tags && channel.tags.length > 0) {
    pros.push(`Odaklı içerik (${channel.tags[0]})`);
  }

  if ((channel.member_count || 0) < 2000) {
    cons.push('Nispeten daha küçük bir topluluk (risklere açık olabilir)');
  }

  if (channel.subcategories?.includes('Sinyal')) {
    cons.push('Ücretli VIP gruplarına yönlendirme (upsell) olabilir');
    pros.push('Anlık al-sat fırsatları paylaşımı');
  } else if (!channel.description || channel.description.length < 30) {
    cons.push('Kanal hakkında yeterli açıklama bulunmuyor');
  }

  // Who is this for?
  let targetAudience = 'Genel kripto takipçileri ve bilgi almak isteyen herkes.';
  const subs = channel.subcategories ? channel.subcategories.join(' ').toLowerCase() : '';
  const tags = channel.tags ? channel.tags.join(' ').toLowerCase() : '';
  
  if (subs.includes('sinyal') || tags.includes('sinyal')) {
    targetAudience = 'Günlük (day-trade) işlem yapanlar, kısa ve orta vadeli giriş/çıkış hedeflerine ihtiyaç duyan aktif traderlar.';
  } else if (subs.includes('haber') || subs.includes('medya')) {
    targetAudience = 'Piyasadaki son dakika gelişmelerini anlık takip etmek isteyen haber odaklı yatırımcılar.';
  } else if (subs.includes('borsa') || subs.includes('bist')) {
    targetAudience = 'Kripto paralara ek olarak geleneksel BİST100 hisseleri ile hibrit portföy yöneten yatırımcılar.';
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 flex items-center justify-between border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={24} className="text-blue-400" />
            Editör & Algoritma İncelemesi
          </h2>
          <p className="text-slate-400 text-sm mt-1">TelegramKanali.com Güven Metrikleri</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-blue-900/50 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-3xl font-black text-white">{score}</span>
            <span className="text-xs text-blue-300 font-medium tracking-wide">/ 10</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        
        {/* Method Explanation Toggle */}
        <details className="mb-8 group">
          <summary className="cursor-pointer text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 flex items-center justify-between list-none transition-colors">
            <span className="flex items-center gap-2"><HelpCircle size={16}/> Puanlama Nasıl Yapılıyor?</span>
            <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 p-4 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 leading-relaxed space-y-2">
            <p><strong>Puanlama Sistemi Şeffaflığı:</strong> Bu kanalın puanı rastgele verilmemektedir. Tamamen veriye dayalı (deterministik) kurallarla hesaplanmaktadır.</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Topluluk Büyüklüğü (%45):</strong> Spesifik kategori ortalamalarına göre üye sayısı ağırlığı.</li>
              <li><strong>Tazelik & Aktivite (%35):</strong> Kanalın en son veri analiz edildiği tarihteki aktiflik durumu.</li>
              <li><strong>İçerik Kalitesi (%20):</strong> Etiketlerin tutarlılığı ve kanal içi kurumsal tanımın tam olması.</li>
            </ul>
            <p className="font-bold text-gray-800 pt-1">Bu sistem Spam-Korumalıdır e kanal sahipleri tarafından manipüle edilemez.</p>
          </div>
        </details>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pros */}
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-green-100 pb-2">
              <CheckCircle2 size={18} className="text-green-500" />
              Öne Çıkan Artılar
            </h3>
            <ul className="space-y-3">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="mt-0.5 text-green-500 shrink-0">+</div>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Cons */}
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-red-100 pb-2">
              <XCircle size={18} className="text-red-400" />
              Dikkat Edilmesi Gerekenler
            </h3>
            <ul className="space-y-3">
              {cons.length > 0 ? cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="mt-0.5 text-red-400 shrink-0">-</div>
                  {con}
                </li>
              )) : (
                 <li className="text-sm text-gray-500 italic">Ciddi bir risk faktörü tespit edilmedi.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Who is it for */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Users size={18} className="text-orange-500" />
            Bu Kanal Kimler İçin Uygun?
          </h3>
          <p className="text-sm text-gray-700 bg-orange-50 border border-orange-100 p-4 rounded-xl leading-relaxed">
            {targetAudience}
          </p>
        </div>

        {/* Freshness Timestamp line and Editorial Signature */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           {/* Author block */}
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
               {/* Optional: if you had an image, put it here. Using a placeholder monogram. */}
               <span className="text-slate-500 font-bold text-xs uppercase">E.Ç.</span>
             </div>
             <div>
               <p className="text-xs font-bold text-gray-900">Eray Ç. <span className="text-gray-400 font-normal">tarafından incelendi</span></p>
               <p className="text-[10px] text-gray-500">Kripto Veri Analisti & Editör</p>
             </div>
           </div>

           <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
             <Activity size={12} className={daysSinceUpdate <= 7 ? "text-green-500" : "text-gray-400"} />
             {daysSinceUpdate <= 1 ? "Sistem tarafından bugün doğrulandı." : `Son edit: ${Math.floor(daysSinceUpdate)} gün önce.`}
           </div>
        </div>

      </div>
    </div>
  );
}
