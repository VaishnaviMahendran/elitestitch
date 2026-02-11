import type { Metadata } from "next";
// Navbar removed from root layout
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import "./globals.css";

export const metadata: Metadata = {
    title: "Elite Stitch World | Premium Bespoke Tailoring",
    description: "Custom garments tailored exclusively for you. Browse designs, order custom fits, and track your delivery.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <LanguageProvider>
                    <CartProvider>
                        {children}
                        <Footer />
                    </CartProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
