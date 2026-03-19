import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import CategoryStrip from "@/components/CategoryStrip";
import { getCategories } from "@/lib/data";
import { Suspense } from "react";

export default async function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const categories = await getCategories();

    return (
        <>
            <Header />
            {/* Mobile category strip - horizontal scrollable chips */}
            <Suspense fallback={null}>
                <CategoryStrip categories={categories} />
            </Suspense>
            <main className="flex-1 container mx-auto px-3 md:px-6 py-4 md:py-8 pb-4">
                {children}
            </main>
            <Footer />
            {/* Mobile bottom navigation - fixed to bottom */}
            <Suspense fallback={null}>
                <MobileBottomNav categories={categories} />
            </Suspense>
        </>
    );
}
