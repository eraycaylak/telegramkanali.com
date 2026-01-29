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
                    className={`h-32 rounded-lg flex items-center justify-between px-8 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all ${!banner.image_url ? `bg-gradient-to-r ${banner.bg_color}` : ''}`}
                >
                    {/* Background Image if exists */}
                    {banner.image_url && (
                        <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                    )}

                    {/* Overlay for readability if image exists */}
                    {banner.image_url && <div className="absolute inset-0 bg-black/40 z-0 transition-opacity group-hover:bg-black/50" />}

                    {/* Content */}
                    <div className="z-10 relative flex-1 min-w-0 pr-4 pointer-events-none">
                        {/* Skewed Badge (New Feature) */}
                        {banner.badge_text && (
                            <div className={`inline-block transform -skew-x-12 px-2 py-0.5 mb-2 font-black text-sm uppercase shadow-sm ${banner.badge_bg_color || 'bg-red-600'} text-white`}>
                                <span className="block transform skew-x-12">{banner.badge_text}</span>
                            </div>
                        )}

                        <h3 className="font-bold text-lg text-blue-100 uppercase truncate drop-shadow-md">
                            {banner.title}
                        </h3>
                        {banner.subtitle && (
                            <h2 className="text-3xl font-black italic truncate drop-shadow-lg leading-tight">
                                {banner.subtitle}
                            </h2>
                        )}
                    </div>

                    {/* Button */}
                    <div className="bg-white text-black px-4 py-1 rounded-full font-bold text-sm z-10 relative shadow-lg whitespace-nowrap group-hover:bg-gray-100 transition-colors pointer-events-none">
                        {banner.button_text || 'Katıl'}
                    </div>
                </a>
            ))}
        </section>
    );
}
