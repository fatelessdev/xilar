import type { Metadata } from "next"
import { ProductGrid } from "@/components/features/product-grid"

export const metadata: Metadata = {
    title: "Summer '25 Collection",
    description: "Light fabrics. Bold statements. Shop the XILAR Summer '25 collection.",
    alternates: {
        canonical: "/collections/summer-25",
    },
    openGraph: {
        title: "Summer '25 Collection | XILAR",
        description: "Light fabrics. Bold statements. Shop the XILAR Summer '25 collection.",
        url: "/collections/summer-25",
    },
}

export default function Summer25Page() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-6 py-12 border-b border-white/10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Summer &apos;25</h1>
                <p className="text-muted-foreground mt-2">Light fabrics. Bold statements. Made for the heat.</p>
            </div>
            <ProductGrid title="" />
        </div>
    )
}
