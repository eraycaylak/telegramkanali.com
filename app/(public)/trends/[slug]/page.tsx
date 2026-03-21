import { getTrendBySlug } from '@/app/actions/trendsPublic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Flame, Clock, Tag } from 'lucide-react';
import { Metadata, ResolvingMetadata } from 'next';

export const revalidate = 60; // ISR 1 minute

export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const trend = await getTrendBySlug(params.slug);
    if (!trend) return { title: 'Bulunamadı | TelegramKanali' };

    // Strip HTML for description
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
        <article className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Hero */}
            <div className="relative bg-white border-b border-gray-100 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-purple-50/50 z-0"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                    <Link href="/trends" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                            <ChevronLeft size={16} />
                        </div>
                        Trendlere Dön
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {trend.trend_categories?.name && (
                            <span className="bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-blue-100">
                                {trend.trend_categories.name}
                            </span>
                        )}
                        {trend.subcategory && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <Tag size={12} /> {trend.subcategory}
                            </span>
                        )}
                         <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                            <Clock size={12} /> {dateStr}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
                            <Flame size={12} /> {trend.view_count || 0} Görüntülenme
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-8">
                        {trend.title}
                    </h1>

                    {trend.image && (
                        <div className="w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100">
                            <img src={trend.image} alt={trend.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-[2rem] p-6 md:p-12 shadow-xl shadow-gray-200/30 border border-gray-100">
                    <div 
                        className="prose prose-lg md:prose-xl max-w-none prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-2xl prose-img:shadow-lg"
                        dangerouslySetInnerHTML={{ __html: trend.content || '' }}
                    />
                </div>
            </div>
        </article>
    );
}
