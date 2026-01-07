"use client"

import { ShopClient } from "@/components/features/shop-client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get("search") || ""

    return (
        <ShopClient
            genderFilter="all"
            title="All Products"
            subtitle="Explore the full XILAR collection"
            initialSearch={search}
        />
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <ShopContent />
        </Suspense>
    )
}
