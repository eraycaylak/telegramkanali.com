// components/CryptoStatBar.tsx
// Canlı kripto kanal istatistikleri — DB'den gelen gerçek veri
import { Users, Activity, Clock } from 'lucide-react';

interface CryptoStatBarProps {
  channelCount: number;
  totalMembers: number;
}

function formatMembersShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatChannels(n: number): string {
  return new Intl.NumberFormat('tr-TR').format(n);
}

export default function CryptoStatBar({ channelCount, totalMembers }: CryptoStatBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 mb-5">
      <div className="flex items-center gap-1.5 text-gray-700">
        <Activity size={14} className="text-orange-500" />
        <span className="font-bold text-orange-600">{formatChannels(channelCount)}</span>
        <span>aktif kanal</span>
      </div>
      <div className="w-px h-4 bg-gray-200 hidden sm:block" />
      <div className="flex items-center gap-1.5 text-gray-700">
        <Users size={14} className="text-blue-500" />
        <span className="font-bold text-blue-600">{formatMembersShort(totalMembers)}+</span>
        <span>toplam üye</span>
      </div>
      <div className="w-px h-4 bg-gray-200 hidden sm:block" />
      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <Clock size={12} className="text-green-500" />
        <span className="text-green-600 font-semibold">Bugün güncellendi</span>
      </div>
    </div>
  );
}
