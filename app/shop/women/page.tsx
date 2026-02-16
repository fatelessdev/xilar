import type { Metadata } from "next"
// import { ShopClient } from "@/components/features/shop-client"

export const metadata: Metadata = {
    title: "Women",
    description: "Shop women's streetwear essentials from XILAR. Clean lines, premium basics, bold fits.",
    alternates: {
        canonical: "/shop/women",
    },
    openGraph: {
        title: "Women | XILAR",
        description: "Shop women's streetwear essentials from XILAR. Clean lines, premium basics, bold fits.",
        url: "/shop/women",
    },
}

export default function ShopWomenPage() {
    // return <ShopClient genderFilter="women" title="Women" subtitle="Streetwear essentials for her" />
    return (
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
    )
}
