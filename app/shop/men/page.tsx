import type { Metadata } from "next"
import { ShopClient } from "@/components/features/shop-client"

export const metadata: Metadata = {
    title: "Men",
    description: "Shop men’s streetwear essentials from XILAR. Elevated fits, bold silhouettes, everyday comfort.",
    alternates: {
        canonical: "/shop/men",
    },
    openGraph: {
        title: "Men | XILAR",
        description: "Shop men’s streetwear essentials from XILAR. Elevated fits, bold silhouettes, everyday comfort.",
        url: "/shop/men",
    },
}

export default function ShopMenPage() {
    return <ShopClient genderFilter="men" title="Men" subtitle="Streetwear essentials for him" />
}
