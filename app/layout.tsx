import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BargainAI } from "@/components/features/bargain-ai";
import { CartDrawer } from "@/components/features/cart-drawer";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "XILAR | Streetwise Minimalism",
  description: "Next-gen streetwear for the bold.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground tracking-tight min-h-screen flex flex-col`}
      >
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-x-hidden relative">
                {children}
                <BargainAI />
              </main>
            </div>
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
