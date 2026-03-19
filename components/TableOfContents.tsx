'use client';

import { useState, useEffect } from 'react';
import { List, ChevronUp } from 'lucide-react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content?: {
        sections?: { heading: string }[];
    };
    showProgress?: boolean;
}

export default function TableOfContents({ content, showProgress = true }: TableOfContentsProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [activeId, setActiveId] = useState<string>('');
    const [progress, setProgress] = useState(0);

    // Generate TOC items from content sections
    const tocItems: TocItem[] = content?.sections?.map((section, index) => ({
        id: `section-${index}`,
        text: section.heading,
        level: 2
    })) || [];

    // Add FAQ and Related sections
    const allItems: TocItem[] = [
        ...tocItems,
        { id: 'related-channels', text: '📱 Önerilen Telegram Kanalları', level: 2 },
        { id: 'faq-section', text: '❓ Sık Sorulan Sorular', level: 2 }
    ];

    // Scroll progress tracking
    useEffect(() => {
        if (!showProgress) return;

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollTop / docHeight) * 100;
            setProgress(Math.min(100, Math.max(0, scrollProgress)));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showProgress]);

    // Active section tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -35% 0px' }
        );

        allItems.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [allItems]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (allItems.length === 0) return null;

    return (
        <>
            {/* Progress Bar - Fixed at top */}
            {showProgress && (
                <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Table of Contents */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
                {/* Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
                >
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                        <List size={18} className="text-blue-500" />
                        İçindekiler
                    </div>
                    <ChevronUp
                        size={18}
                        className={`text-gray-400 transition-transform ${isOpen ? '' : 'rotate-180'}`}
                    />
                </button>

                {/* Content */}
                {isOpen && (
                    <nav className="p-4 pt-0 space-y-1">
                        {allItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all ${activeId === item.id
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                            >
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                {item.text}
                            </button>
                        ))}
                    </nav>
                )}

                {/* Quick Stats */}
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📖 Okuma ilerlemeniz</span>
                        <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            {/* Back to Top Button */}
            {progress > 20 && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
                    title="Başa Dön"
                >
                    <ChevronUp size={20} />
                </button>
            )}
        </>
    );
}
