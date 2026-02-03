import type { Metadata } from "next"
import { ShopClient } from "@/components/features/shop-client"

export const metadata: Metadata = {
    title: "Women",
    description: "Shop women’s streetwear essentials from XILAR. Clean lines, premium basics, bold fits.",
    alternates: {
        canonical: "/shop/women",
    },
    openGraph: {
        title: "Women | XILAR",
        description: "Shop women’s streetwear essentials from XILAR. Clean lines, premium basics, bold fits.",
        url: "/shop/women",
    },
}

export default function ShopWomenPage() {
    return <ShopClient genderFilter="women" title="Women" subtitle="Streetwear essentials for her" />
}
