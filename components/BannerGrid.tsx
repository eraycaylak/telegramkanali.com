import { getBanners, BannerType } from '@/app/actions/banners';

interface BannerGridProps {
    type?: BannerType;
    categoryId?: string;
}

export default async function BannerGrid({ type = 'homepage', categoryId }: BannerGridProps) {
    const banners = await getBanners(type, categoryId);

    // If no banners, return null or fallback? 
    // Return null to hide section if empty. 
    // Note: Admin limits to 4, but we should handle 0-4 gracefully.
    if (!banners || banners.length === 0) return null;

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
                <a
                    key={banner.id}
                    href={banner.link_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg flex items-center justify-between px-4 md:px-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all ${!banner.image_url ? `h-24 md:h-32 bg-gradient-to-r ${banner.bg_color}` : ''}`}
                >
                    {/* Background Image if exists */}
                    {banner.image_url && (
                        <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-auto md:absolute md:inset-0 md:w-full md:h-full md:object-cover z-0"
                        />
                    )}

                    {/* No overlay when image exists - clean look */}

                    {/* Content - Hide when image exists for clean look */}
                    {!banner.image_url && (
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
                    )}

                    {/* Floating Logo (New Feature) */}
                    {banner.floating_logo_url && (
                        <div className="absolute right-4 bottom-4 w-16 h-16 opacity-90 z-10 pointer-events-none">
                            <img src={banner.floating_logo_url} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                    )}

                    {/* SEO Hidden Description */}
                    <span className="sr-only">
                        {banner.title} Telegram kanalı{banner.subtitle ? ` - ${banner.subtitle}` : ''} - Aktif ve güncel kanal
                    </span>

                    {/* Button - Hide when image exists */}
                    {!banner.image_url && (
                        <div className="bg-white text-black px-4 py-1 rounded-full font-bold text-sm z-10 relative shadow-lg whitespace-nowrap group-hover:bg-gray-100 transition-colors pointer-events-none">
                            {banner.button_text || 'Katıl'}
                        </div>
                    )}
                </a>
            ))}
        </section>
    );
}
