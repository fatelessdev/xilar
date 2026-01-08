"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { Star, ChevronRight } from "lucide-react"

interface Product {
    id: string
    name: string
    price: string
    image: string
    category: string
    rating: number
    reviews: number
    colors?: string[]
    soldOut?: boolean
}

const FEATURED_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Oversized Cargo",
        price: "₹1,999",
        image: "/clothes/pants1.jpeg",
        category: "Bottoms",
        rating: 5,
        reviews: 101,
        colors: ["#0a0a0a", "#6b7280", "#854d0e"],
    },
    {
        id: "2",
        name: "Essential Tee",
        price: "₹899",
        image: "/clothes/shirt1.jpeg",
        category: "Tops",
        rating: 5,
        reviews: 63,
        colors: ["#0a0a0a", "#374151", "#ffffff"],
    },
    {
        id: "3",
        name: "Denim Jacket",
        price: "₹2,499",
        image: "/clothes/jackets-men1.jpeg",
        category: "Outerwear",
        rating: 5,
        reviews: 75,
        colors: ["#1e3a5f", "#0a0a0a"],
        soldOut: true,
    },
    {
        id: "4",
        name: "Baggy Jeans",
        price: "₹2,299",
        image: "/clothes/denim1.jpeg",
        category: "Denim",
        rating: 5,
        reviews: 21,
        colors: ["#1e3a5f", "#0a0a0a", "#dc2626"],
    },
]

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
    return (
        <div className="flex items-center gap-1">
            <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating ? 'fill-current' : 'fill-none stroke-current opacity-30'}`}
                    />
                ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>
    )
}

function ColorSwatches({ colors }: { colors: string[] }) {
    return (
        <div className="flex items-center gap-1">
            {colors.map((color, i) => (
                <div
                    key={i}
                    className="w-4 h-4 border border-border"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    )
}

export function ProductGrid({ title = "Featured Drops" }: { title?: string }) {
    const [activeTab, setActiveTab] = useState<"him" | "her">("him")

    return (
        <section className="py-16 px-6 md:px-12 bg-background">
            {/* Header with tabs */}
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter uppercase mb-6">{title}</h2>

                {/* FOR HIM / FOR HER Tabs */}
                <div className="flex items-center gap-8 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab("him")}
                        className={`tracking-wider uppercase pb-2 border-b-2 transition-colors ${activeTab === "him"
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        For Him
                    </button>
                    <button
                        onClick={() => setActiveTab("her")}
                        className={`tracking-wider uppercase pb-2 border-b-2 transition-colors ${activeTab === "her"
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        For Her
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {FEATURED_PRODUCTS.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id} className="group">
                        <Card className="rounded-none border-0 bg-transparent shadow-none hover-lift">
                            <CardContent className="p-0 relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                {/* Sold Out Badge */}
                                {product.soldOut && (
                                    <div className="absolute top-3 left-3 z-10 badge-sold-out">
                                        Sold Out
                                    </div>
                                )}

                                {/* Product Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${product.image})` }}
                                />

                                {/* Hover Overlay with Arrow */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                        <ChevronRight className="h-5 w-5 text-black" />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col items-start p-4 space-y-2">
                                {/* Product Name & Price */}
                                <div className="w-full">
                                    <h3 className="font-medium tracking-tight text-sm uppercase">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-semibold mt-1">{product.price}</p>
                                </div>

                                {/* Color Swatches */}
                                {product.colors && <ColorSwatches colors={product.colors} />}

                                {/* Star Rating */}
                                <StarRating rating={product.rating} reviews={product.reviews} />
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-10">
                <Link
                    href="/shop"
                    className="text-sm font-medium uppercase tracking-wider underline underline-offset-4 hover:text-gold transition-colors"
                >
                    View All Products
                </Link>
            </div>
        </section>
    )
}
