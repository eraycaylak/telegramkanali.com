import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    searchParams: any;
}

export default function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
    // Generate URL for a page
    const getPageUrl = (page: number) => {
        const params = new URLSearchParams();

        // Safely extract existing params from searchParams object
        if (searchParams) {
            Object.entries(searchParams).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.set(key, String(value));
                }
            });
        }

        params.set('page', page.toString());
        return `/?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-2 mt-8">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={getPageUrl(currentPage - 1)}
                    scroll={false}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition"
                >
                    <ChevronLeft size={20} />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                    <ChevronLeft size={20} />
                </span>
            )}

            {/* Page Numbers (Simplified logic for now) */}
            <span className="text-gray-600 font-medium px-4">
                Sayfa {currentPage} / {totalPages}
            </span>

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={getPageUrl(currentPage + 1)}
                    scroll={false}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition"
                >
                    <ChevronRight size={20} />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-gray-200 text-gray-300 cursor-not-allowed">
                    <ChevronRight size={20} />
                </span>
            )}
        </div>
    );
}
