import type { Metadata } from "next"
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/structured-data"
// import { ShopClient } from "@/components/features/shop-client"

export const metadata: Metadata = {
    title: "Women's Streetwear",
    description:
        "Shop women's streetwear essentials from XILAR. Clean lines, premium basics, bold fits — launching soon.",
    alternates: {
        canonical: "/shop/women",
    },
    openGraph: {
        title: "Women's Streetwear | XILAR",
        description:
            "Shop women's streetwear essentials from XILAR. Clean lines, premium basics, bold fits — launching soon.",
        url: "/shop/women",
    },
}

export default function ShopWomenPage() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // return <ShopClient genderFilter="women" title="Women" subtitle="Streetwear essentials for her" />
    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd(baseUrl, [
                    { name: "Home", url: "/" },
                    { name: "Shop", url: "/shop" },
                    { name: "Women", url: "/shop/women" },
                ])}
            />
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
                    Coming Soon
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                    Women&apos;s streetwear essentials are on their way. Stay tuned for fresh drops.
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                    <span>Launching soon</span>
                </div>
            </div>
        </>
    )
}
