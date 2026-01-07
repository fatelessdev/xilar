import { ProductGrid } from "@/components/features/product-grid"

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
