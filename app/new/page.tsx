import type { Metadata } from "next"
import { ProductGrid } from "@/components/features/product-grid"

export const metadata: Metadata = {
    title: "New Arrivals",
    description: "Fresh drops and first access. Discover the latest XILAR arrivals.",
    alternates: {
        canonical: "/new",
    },
    openGraph: {
        title: "New Arrivals | XILAR",
        description: "Fresh drops and first access. Discover the latest XILAR arrivals.",
        url: "/new",
    },
}

export default function NewArrivalsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-6 py-12 border-b border-white/10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">New Arrivals</h1>
                <p className="text-muted-foreground mt-2">Fresh drops. First access.</p>
            </div>
            <ProductGrid title="" />
        </div>
    )
}
