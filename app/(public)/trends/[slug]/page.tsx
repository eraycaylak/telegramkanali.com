import { getTrendBySlug } from '@/app/actions/trendsPublic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Flame, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const safeSlug = decodeURIComponent(resolvedParams.slug);
    const trend = await getTrendBySlug(safeSlug);
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

export default async function TrendDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const safeSlug = decodeURIComponent(resolvedParams.slug);
    const trend = await getTrendBySlug(safeSlug);

    if (!trend) {
        notFound();
    }

    const dateStr = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(trend.created_at));

    return (
        <article className="min-h-screen bg-white pb-32 overflow-x-hidden w-full max-w-full">
            {/* Minimal App Header (Stark Contrast) */}
            <div className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex items-center justify-between">
                <Link href="/trends" className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={24} className="text-black" />
                </Link>
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">
                    Sıcak İçerik
                </div>
            </div>

            {/* Featured Image (Full bleed style) */}
            {trend.image && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <div className="w-full aspect-square md:aspect-[16/9] rounded-[2rem] overflow-hidden bg-gray-100 relative shadow-xl">
                        <img src={trend.image} alt={trend.title} className="w-full h-full object-cover" />
                        <div className="absolute top-6 left-6 flex gap-2">
                            {trend.trend_categories?.name && (
                                <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                    {trend.trend_categories.name}
                                </span>
                            )}
                            {trend.subcategory && (
                                <span className="bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                    #{trend.subcategory}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Headline section */}
            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 mb-10 w-full overflow-hidden">
                {!trend.image && (
                    <div className="flex gap-2 mb-6">
                        {trend.trend_categories?.name && (
                            <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                {trend.trend_categories.name}
                            </span>
                        )}
                    </div>
                )}
                
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5 md:mb-6 break-words">
                    {trend.title}
                </h1>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md"><Clock size={16} className="text-gray-400" /> {dateStr}</span>
                    <span className="flex items-center gap-1.5 bg-orange-50/50 text-orange-500 px-3 py-1.5 rounded-md"><Flame size={16} /> {trend.view_count || 0}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 w-full overflow-hidden break-words">
                <div 
                    className="prose prose-lg max-w-full prose-headings:font-black md:prose-xl prose-headings:tracking-tighter prose-headings:uppercase prose-p:leading-relaxed prose-p:text-gray-800 prose-a:text-black prose-a:font-bold prose-a:break-all prose-img:rounded-[1.5rem] prose-img:shadow-lg break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: trend.content || '' }}
                />
            </div>

            {/* Sticky Action Footer for App Feel */}
            <div className="fixed bottom-safe left-0 right-0 p-4 pointer-events-none z-50 flex justify-center">
                <div className="pointer-events-auto bg-black text-white px-8 py-4 rounded-full flex items-center justify-between gap-6 shadow-2xl w-full max-w-sm">
                    <div className="text-sm font-black uppercase tracking-widest">İÇERİĞİ PAYLAŞ</div>
                    <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                        PAYLAŞ
                    </button>
                </div>
            </div>

        </article>
    );
}
