// components/CryptoRankingPolicy.tsx
// E-E-A-T şeffaflık kutusu — her kripto landing page'e eklenir
import { ShieldCheck } from 'lucide-react';

export default function CryptoRankingPolicy() {
  return (
    <div className="my-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={22} />
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-2">
            Kanalları Nasıl Sıralıyoruz?
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              Telegram API'den doğrulanan gerçek üye sayısı
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              Son 30 güne ait aktivite skoru (paylaşım sıklığı)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              Editör manuel incelemesi (içerik kalitesi)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span>
              Kullanıcı şikayet oranı (negatif sinyal)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-red-500 font-bold">✗</span>
              Ücretli sıralama yapılmaz — reklamlar ayrıca işaretlenir
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
