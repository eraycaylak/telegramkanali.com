import { getBanners, BannerType } from '@/app/actions/banners';
import { Banner } from '@/lib/types';
import Image from 'next/image';

interface BannerGridProps {
    type?: BannerType;
    categoryId?: string;
}

export default async function BannerGrid({ type = 'homepage', categoryId }: BannerGridProps) {
    let banners: Banner[] = [];
    try {
        banners = await getBanners(type, categoryId, true);
    } catch (e) {
        console.error('Banner fetch failed', e);
    }

    if (!banners || banners.length === 0) return null;

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 my-4">
            {banners.map((banner) => (
                <a
                    key={banner.id}
                    href={banner.link_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                        block relative group cursor-pointer transition-all
                        ${banner.image_url
                            ? 'w-full h-auto rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01]'
                            : `h-28 md:h-32 rounded-xl flex items-center justify-between px-6 text-white overflow-hidden shadow-lg hover:shadow-xl bg-gradient-to-r ${banner.bg_color || 'from-blue-600 to-blue-400'}`
                        }
                    `}
                >
                    {/* 1. Image Banner Content */}
                    {banner.image_url && (
                        <Image
                            src={banner.image_url}
                            alt={banner.title || 'Banner'}
                            width={1200}
                            height={300}
                            className="w-full h-auto object-cover"
                        />
                    )}

                    {/* 2. Text/Color Banner Content (Only if NO image) */}
                    {!banner.image_url && (
                        <>
                            <div
                                className={`z-10 relative flex-1 min-w-0 pr-4 pointer-events-none flex flex-col justify-center h-full ${banner.text_align === 'center' ? 'items-center text-center' :
                                    banner.text_align === 'right' ? 'items-end text-right' : 'items-start text-left'
                                    }`}
                                style={{ color: banner.text_color || '#FFFFFF' }}
                            >
                                {/* Skewed Badge */}
                                {banner.badge_text && (
                                    <div className={`inline-block transform -skew-x-12 px-2 py-0.5 mb-2 font-black text-sm uppercase shadow-sm ${banner.badge_bg_color || 'bg-red-600'} text-white`}>
                                        <span className="block transform skew-x-12">{banner.badge_text}</span>
                                    </div>
                                )}

                                <h3 className="font-bold text-lg uppercase truncate w-full drop-shadow-lg">
                                    {banner.title}
                                </h3>
                                {banner.subtitle && (
                                    <h2 className={`font-black italic truncate leading-tight w-full drop-shadow-lg ${banner.font_size === 'small' ? 'text-xl' : banner.font_size === 'large' ? 'text-4xl' : banner.font_size === 'xl' ? 'text-5xl' : 'text-3xl'}`}>
                                        {banner.subtitle}
                                    </h2>
                                )}
                            </div>

                            {/* Floating Logo */}
                            {banner.floating_logo_url && (
                                <div className="absolute right-4 bottom-4 w-16 h-16 opacity-90 z-10 pointer-events-none">
                                    <Image src={banner.floating_logo_url} alt="" width={64} height={64} className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                            )}

                            {/* Button */}
                            <div className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-sm z-10 relative shadow-lg whitespace-nowrap group-hover:bg-gray-100 transition-colors pointer-events-none">
                                {banner.button_text || 'Katıl'}
                            </div>
                        </>
                    )}

                    <span className="sr-only">
                        {banner.title} Telegram kanalı {banner.subtitle}
                    </span>
                </a>
            ))}
        </section>
    );
}
