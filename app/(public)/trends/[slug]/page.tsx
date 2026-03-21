import { getTrendBySlug } from '@/app/actions/trendsPublic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Flame, Clock, Tag, Share2 } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const trend = await getTrendBySlug(params.slug);
    if (!trend) return { title: 'Bulunamadı | TelegramKanali' };

    const strippedContent = trend.content ? trend.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...' : '';

    return {
        title: `${trend.title} | Günün Trendi`,
        description: strippedContent,
        openGraph: {
            title: trend.title,
            description: strippedContent,
            images: trend.image ? [trend.image] : [],
        }
    };
}

export default async function TrendDetailPage({ params }: { params: { slug: string } }) {
    const trend = await getTrendBySlug(params.slug);

    if (!trend) {
        notFound();
    }

    const dateStr = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(trend.created_at));

    return (
        <article className="min-h-screen bg-[#fafafa]">
            {/* Dark & Sleek Article Header */}
            <div className="bg-[#0a0a0a] text-white pt-12 pb-24 md:pt-16 md:pb-32 relative overflow-hidden flex flex-col items-center border-b border-[#222]">
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
                
                <div className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="w-full flex justify-between items-center mb-8">
                        <Link href="/trends" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group px-3 py-1.5 rounded-full hover:bg-white/10">
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Geri Dön
                        </Link>
                        
                        <button className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10">
                            <Share2 size={14} /> Paylaş
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        {trend.trend_categories?.name && (
                            <span className="bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border border-white/10">
                                {trend.trend_categories.name}
                            </span>
                        )}
                        {trend.subcategory && (
                            <span className="text-orange-400 text-[11px] font-bold uppercase tracking-wider">
                                #{trend.subcategory}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-snug mb-6 max-w-3xl">
                        {trend.title}
                    </h1>

                    <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {dateStr}</span>
                        <span className="flex items-center gap-1.5 text-orange-400"><Flame size={14} /> {trend.view_count || 0} okuma</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-20 pb-20">
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    
                    {/* Featured Image */}
                    {trend.image && (
                        <div className="w-full aspect-video md:aspect-[21/9] bg-gray-100 border-b border-gray-100">
                            <img src={trend.image} alt={trend.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Article Body */}
                    <div className="p-6 md:p-12 lg:px-16 lg:py-14">
                        <div 
                            className="prose prose-base md:prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl prose-img:shadow-md prose-p:leading-relaxed text-gray-800"
                            dangerouslySetInnerHTML={{ __html: trend.content || '' }}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}
