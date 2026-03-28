import Link from 'next/link';
import { Channel } from '@/lib/types';
import ChannelCard from './ChannelCard';
import { Star } from 'lucide-react';

export default function FeaturedPremium({ channels }: { channels: Channel[] }) {
    if (!channels || channels.length === 0) return null;

    return (
        <section className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/80 border border-indigo-100/50 p-4 md:p-6 lg:p-8">
            {/* Background Blob Effects */}
            <div className="absolute top-0 right-0 p-8 opacity-20 filter blur-3xl pointer-events-none">
                <div className="w-64 h-64 bg-fuchsia-300 rounded-full mix-blend-multiply opacity-50 absolute -top-10 -right-10"></div>
                <div className="w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply opacity-50 absolute top-20 right-20"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg ring-4 ring-indigo-50/50">
                        <Star className="w-6 h-6 text-white fill-amber-300" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
                            Öne Çıkan VIP Kanallar
                        </h2>
                        <p className="text-sm font-semibold text-indigo-700/70 mt-0.5">Editörün Seçimi & En Popülerler</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {channels.map((channel) => (
                    <div key={channel.id} className="relative group rounded-3xl transition-transform duration-300 hover:-translate-y-1">
                      {/* Glow effect behind the card */}
                      <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-purple-400 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition duration-300 group-hover:duration-200"></div>
                      <div className="relative h-full bg-white rounded-3xl overflow-hidden ring-1 ring-gray-100 group-hover:ring-0">
                        <ChannelCard channel={channel} />
                      </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
