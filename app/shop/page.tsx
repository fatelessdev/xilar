import type { Metadata } from "next"
import { ShopClient } from "@/components/features/shop-client"
import { Suspense } from "react"

export const metadata: Metadata = {
    title: "Shop",
    description: "Explore the full XILAR streetwear collection. Premium basics, bold fits, and everyday essentials.",
    alternates: {
        canonical: "/shop",
    },
    openGraph: {
        title: "Shop | XILAR",
        description: "Explore the full XILAR streetwear collection. Premium basics, bold fits, and everyday essentials.",
        url: "/shop",
    },
}

export default function ShopPage({
    searchParams,
}: {
    searchParams?: { search?: string }
}) {
    const search = searchParams?.search || ""
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${baseUrl}/`,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Shop",
                item: `${baseUrl}/shop`,
            },
        ],
    }

    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ShopClient
                genderFilter="all"
                title="All Products"
                subtitle="Explore the full XILAR collection"
                initialSearch={search}
            />
        </Suspense>
    )
}
