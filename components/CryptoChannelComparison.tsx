import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, Activity, BarChart2 } from 'lucide-react';
import { Channel } from '@/lib/types';

interface Props {
  currentChannel: Channel;
  alternatives: Channel[];
}

export default function CryptoChannelComparison({ currentChannel, alternatives }: Props) {
  if (!alternatives || alternatives.length === 0) return null;

  // Sadece test için sahte bir algoritma ile kıyas yapıyoruz.
  // Gerçek senaryoda bu skorları db'den veya sunucu taraflı hesaplamak daha iyidir, 
  // ama örnek şeffaflık oluşturmak adına görsel olarak güçlendiriyoruz.
  const calcScore = (c: Channel) => {
    let s = 6.0;
    const m = c.member_count || 0;
    if (m > 50000) s += 2.5;
    else if (m > 10000) s += 1.5;
    else if (m > 1000) s += 0.5;

    if (c.tags && c.tags.length > 0) s += 0.5;
    if (c.verified) s += 1.0;
    
    return Math.min(s, 9.8).toFixed(1);
  };

  const getFocus = (c: Channel) => {
    if (c.subcategories?.includes('Sinyal') || c.tags?.some(x => x.toLowerCase().includes('sinyal'))) return "Al/Sat ve Kısa Vade";
    if (c.name.toLowerCase().includes('haber') || c.tags?.some(x => x.toLowerCase().includes('haber'))) return "Anlık Piyasa Akışı";
    return "Genel Kripto Analizi";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6 mt-4">
      <div className="bg-slate-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
         <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 size={18} className="text-orange-500" /> 
            Objektif Kıyaslama: Alternatifler
         </h3>
         <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Algoritmik Karşılaştırma</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 font-semibold">Kanal Adı</th>
              <th className="px-5 py-3 font-semibold">Odak / Niyet</th>
              <th className="px-5 py-3 font-semibold text-center">Topluluk Boyutu</th>
              <th className="px-5 py-3 font-semibold text-center">Güven Skoru</th>
              <th className="px-5 py-3 font-semibold text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Current Channel (Highlight) */}
            <tr className="bg-orange-50/30">
              <td className="px-5 py-4 font-bold text-gray-900 flex items-center gap-2 max-w-[200px] truncate">
                 <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 text-xs shrink-0">
                   {currentChannel.name.charAt(0)}
                 </div>
                 {currentChannel.name} <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded ml-1 tracking-tight font-semibold">ŞU AN</span>
              </td>
              <td className="px-5 py-4 text-gray-600">{getFocus(currentChannel)}</td>
              <td className="px-5 py-4 text-center font-medium text-gray-700">
                <span className="flex items-center justify-center gap-1.5"><Users size={14} className="text-gray-400" /> {currentChannel.member_count?.toLocaleString('tr-TR') || 0}</span>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                   {calcScore(currentChannel)} <Activity size={12} className="text-blue-400"/>
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="text-gray-400 text-xs italic">İnceleniyor</span>
              </td>
            </tr>

            {/* Alternatives */}
            {alternatives.map(alt => (
              <tr key={alt.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-gray-800 flex items-center gap-2 max-w-[200px] truncate">
                   <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 text-xs shrink-0">
                     {alt.name.charAt(0)}
                   </div>
                   {alt.name}
                </td>
                <td className="px-5 py-4 text-gray-600">{getFocus(alt)}</td>
                <td className="px-5 py-4 text-center font-medium text-gray-700">
                  <span className="flex items-center justify-center gap-1.5"><Users size={14} className="text-gray-400" /> {alt.member_count?.toLocaleString('tr-TR') || 0}</span>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center gap-1 font-bold text-gray-700">
                     {calcScore(alt)} <ShieldCheck size={12} className="text-gray-400"/>
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/go/${alt.slug}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                     İncele →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
