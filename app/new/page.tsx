import { ProductGrid } from "@/components/features/product-grid"

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
