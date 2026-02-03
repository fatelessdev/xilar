import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Accessories",
    description: "Accessories are coming soon. Stay tuned for fresh drops from XILAR.",
    alternates: {
        canonical: "/shop/accessories",
    },
    openGraph: {
        title: "Accessories | XILAR",
        description: "Accessories are coming soon. Stay tuned for fresh drops from XILAR.",
        url: "/shop/accessories",
    },
}

export default function AccessoriesPage() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center px-6">
            <div className="text-center space-y-6 max-w-lg">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Accessories</h1>
                <p className="text-muted-foreground text-lg">Coming Soon. Stay tuned for fresh drops.</p>
                <Link href="/shop">
                    <Button variant="outline" className="rounded-none h-12 px-8 uppercase tracking-widest">
                        Shop All
                    </Button>
                </Link>
            </div>
        </div>
    )
}
