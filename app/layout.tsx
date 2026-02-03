import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BargainAI } from "@/components/features/bargain-ai";
import { CartDrawer } from "@/components/features/cart-drawer";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "XILAR | The Future Wear",
    template: "%s | XILAR",
  },
  description: "Next-gen streetwear for the bold. Elevate your everyday with XILAR.",
  applicationName: "XILAR",
  keywords: [
    "XILAR",
    "streetwear",
    "unisex fashion",
    "Gen-Z clothing",
    "premium basics",
    "urban wear",
    "India streetwear",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "XILAR",
    title: "XILAR | The Future Wear",
    description: "Next-gen streetwear for the bold. Elevate your everyday with XILAR.",
    url: "/",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "XILAR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XILAR | The Future Wear",
    description: "Next-gen streetwear for the bold. Elevate your everyday with XILAR.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground tracking-tight min-h-screen flex flex-col`}
      >
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
