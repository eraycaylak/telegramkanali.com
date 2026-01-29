import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
                {children}
            </main>
            <Footer />
        </>
    );
}
