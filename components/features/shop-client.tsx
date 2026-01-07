"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, SlidersHorizontal, X } from "lucide-react"

interface Product {
    id: string
    name: string
    price: number
    displayPrice: string
    image: string
    category: string
    gender: "men" | "women" | "unisex"
    size: string[]
    isNew?: boolean
}

const ALL_PRODUCTS: Product[] = [
    { id: "1", name: "Oversized Cargo", price: 1999, displayPrice: "₹1,999", image: "/clothes/pants1.jpeg", category: "Bottoms", gender: "unisex", size: ["S", "M", "L", "XL"] },
    { id: "2", name: "Essential Tee", price: 899, displayPrice: "₹899", image: "/clothes/shirt1.jpeg", category: "Tops", gender: "unisex", size: ["S", "M", "L", "XL"], isNew: true },
    { id: "3", name: "Denim Jacket", price: 2499, displayPrice: "₹2,499", image: "/clothes/jackets-men1.jpeg", category: "Outerwear", gender: "men", size: ["M", "L", "XL"] },
    { id: "4", name: "Baggy Jeans", price: 2299, displayPrice: "₹2,299", image: "/clothes/denim1.jpeg", category: "Denim", gender: "unisex", size: ["S", "M", "L", "XL"] },
    { id: "5", name: "Classic Shirt", price: 1299, displayPrice: "₹1,299", image: "/clothes/shirt2.jpeg", category: "Tops", gender: "men", size: ["S", "M", "L"] },
    { id: "6", name: "Relaxed Fit Shirt", price: 1199, displayPrice: "₹1,199", image: "/clothes/shirt3.jpeg", category: "Tops", gender: "women", size: ["XS", "S", "M", "L"] },
    { id: "7", name: "Structured Shirt", price: 1399, displayPrice: "₹1,399", image: "/clothes/shirt4.jpeg", category: "Tops", gender: "unisex", size: ["S", "M", "L", "XL"], isNew: true },
    { id: "8", name: "Premium Tee", price: 999, displayPrice: "₹999", image: "/clothes/tshirt1.jpeg", category: "Tops", gender: "unisex", size: ["S", "M", "L", "XL"] },
    { id: "9", name: "Linen Blend", price: 1599, displayPrice: "₹1,599", image: "/clothes/shirts5.jpeg", category: "Tops", gender: "men", size: ["M", "L", "XL"] },
    { id: "10", name: "Cropped Top", price: 799, displayPrice: "₹799", image: "/clothes/topwear-women.jpeg", category: "Tops", gender: "women", size: ["XS", "S", "M"] },
    { id: "11", name: "Oversized Blouse", price: 1099, displayPrice: "₹1,099", image: "/clothes/topwear-women2.jpeg", category: "Tops", gender: "women", size: ["S", "M", "L"], isNew: true },
    { id: "12", name: "Graphic Tee", price: 1199, displayPrice: "₹1,199", image: "/clothes/topwear-men1.jpeg", category: "Tops", gender: "men", size: ["S", "M", "L", "XL"] },
]

const CATEGORIES = ["All", "Tops", "Bottoms", "Denim", "Outerwear"]
const SIZES = ["XS", "S", "M", "L", "XL"]
const PRICE_RANGES = [
    { label: "All Prices", min: 0, max: Infinity },
    { label: "Under ₹1000", min: 0, max: 1000 },
    { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
    { label: "Over ₹2000", min: 2000, max: Infinity },
]

interface ShopClientProps {
    genderFilter?: "men" | "women" | "unisex" | "all"
    title?: string
    subtitle?: string
    initialSearch?: string
}

export function ShopClient({ genderFilter = "all", title = "All Products", subtitle, initialSearch = "" }: ShopClientProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearch)
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0])
    const [showFilters, setShowFilters] = useState(false)
    const [visibleCount, setVisibleCount] = useState(8)

    const filteredProducts = useMemo(() => {
        return ALL_PRODUCTS.filter((product) => {
            // Gender filter
            if (genderFilter !== "all" && product.gender !== genderFilter && product.gender !== "unisex") {
                return false
            }
            // Search
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }
            // Category
            if (selectedCategory !== "All" && product.category !== selectedCategory) {
                return false
            }
            // Size
            if (selectedSize && !product.size.includes(selectedSize)) {
                return false
            }
            // Price
            if (product.price < selectedPriceRange.min || product.price > selectedPriceRange.max) {
                return false
            }
            return true
        })
    }, [genderFilter, searchQuery, selectedCategory, selectedSize, selectedPriceRange])

    const visibleProducts = filteredProducts.slice(0, visibleCount)
    const hasMore = visibleCount < filteredProducts.length

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCategory("All")
        setSelectedSize(null)
        setSelectedPriceRange(PRICE_RANGES[0])
    }

    const activeFilterCount = [
        selectedCategory !== "All",
        selectedSize !== null,
        selectedPriceRange !== PRICE_RANGES[0],
    ].filter(Boolean).length

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="px-6 py-8 border-b border-white/10">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{title}</h1>
                {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-6 py-4 border-b border-white/10 glass sticky top-16 z-40">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>

                {/* Filter Toggle & Sort */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none h-10 text-xs uppercase gap-2"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Button>
                    {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" className="rounded-none h-10 text-xs uppercase" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="px-6 py-4 border-b border-white/10 bg-secondary/20 flex flex-wrap gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-none h-8 text-xs"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Size */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Size</label>
                        <div className="flex flex-wrap gap-2">
                            {SIZES.map((size) => (
                                <Button
                                    key={size}
                                    variant={selectedSize === size ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-none h-8 w-10 text-xs"
                                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price</label>
                        <div className="flex flex-wrap gap-2">
                            {PRICE_RANGES.map((range) => (
                                <Button
                                    key={range.label}
                                    variant={selectedPriceRange === range ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-none h-8 text-xs"
                                    onClick={() => setSelectedPriceRange(range)}
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="py-8 px-6">
                <p className="text-sm text-muted-foreground mb-6">{filteredProducts.length} products</p>
                {visibleProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {visibleProducts.map((product) => (
                            <Link href={`/product/${product.id}`} key={product.id} className="group">
                                <Card className="rounded-none border-0 bg-transparent shadow-none hover-lift">
                                    <CardContent className="p-0 relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${product.image})` }}
                                        />
                                        {product.isNew && (
                                            <span className="absolute top-2 left-2 bg-foreground text-background text-xs px-2 py-1 uppercase tracking-wider">
                                                New
                                            </span>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex flex-col items-start p-4 space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
                                        <div className="flex w-full items-center justify-between">
                                            <h3 className="font-medium tracking-tight text-lg">{product.name}</h3>
                                            <span className="font-semibold">{product.displayPrice}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No products found matching your filters.</p>
                        <Button variant="link" onClick={clearFilters} className="mt-2">
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="py-12 flex justify-center border-t border-white/10">
                    <Button
                        variant="outline"
                        className="uppercase tracking-widest text-xs rounded-none h-12 px-8"
                        onClick={() => setVisibleCount((prev) => prev + 8)}
                    >
                        Load More ({filteredProducts.length - visibleCount} remaining)
                    </Button>
                </div>
            )}
        </div>
    )
}
