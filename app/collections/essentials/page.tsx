import type { Metadata } from "next"
import { ProductGrid } from "@/components/features/product-grid"

export const metadata: Metadata = {
    title: "Essentials Collection",
    description: "The foundation of your wardrobe. Shop XILAR Essentials — versatile, timeless, everyday streetwear.",
    alternates: {
        canonical: "/collections/essentials",
    },
    openGraph: {
        title: "Essentials Collection | XILAR",
        description: "The foundation of your wardrobe. Shop XILAR Essentials — versatile, timeless, everyday streetwear.",
        url: "/collections/essentials",
    },
}

export default function EssentialsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-6 py-12 border-b border-white/10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Essentials</h1>
                <p className="text-muted-foreground mt-2">The foundation of your wardrobe. Versatile. Timeless. Essential.</p>
            </div>
            <ProductGrid title="" />
        </div>
    )
}
