"use client"

import { useState } from "react"
import { ProductGrid } from "@/components/features/product-grid"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { Heart, Check } from "lucide-react"

interface Product {
    id: string
    name: string
    price: number
    displayPrice: string
    description: string
    images: string[]
    sizes: string[]
    fit: string
    category: string
}

// Mock products database
const PRODUCTS: Record<string, Product> = {
    "1": { id: "1", name: "Oversized Cargo", price: 1999, displayPrice: "₹1,999", description: "Constructed from heavy-weight cotton canvas. Features raw hems and a relaxed, stackable fit. The ultimate everyday essential.", images: ["/clothes/pants1.jpeg", "/clothes/denim1.jpeg"], sizes: ["S", "M", "L", "XL"], fit: "Oversized Fit", category: "Bottoms" },
    "2": { id: "2", name: "Essential Tee", price: 899, displayPrice: "₹899", description: "Premium cotton essential. Boxy fit with dropped shoulders. A wardrobe staple.", images: ["/clothes/shirt1.jpeg", "/clothes/tshirt1.jpeg"], sizes: ["S", "M", "L", "XL"], fit: "Regular Fit", category: "Tops" },
    "3": { id: "3", name: "Denim Jacket", price: 2499, displayPrice: "₹2,499", description: "Classic denim in a modern silhouette. Washed for a lived-in feel.", images: ["/clothes/jackets-men1.jpeg"], sizes: ["M", "L", "XL"], fit: "Regular Fit", category: "Outerwear" },
    "4": { id: "4", name: "Baggy Jeans", price: 2299, displayPrice: "₹2,299", description: "Wide-leg denim with a vintage wash. High-rise waist. Made to stack.", images: ["/clothes/denim1.jpeg"], sizes: ["S", "M", "L", "XL"], fit: "Baggy Fit", category: "Denim" },
    "5": { id: "5", name: "Classic Shirt", price: 1299, displayPrice: "₹1,299", description: "Timeless button-down in premium cotton. Relaxed cut.", images: ["/clothes/shirt2.jpeg"], sizes: ["S", "M", "L"], fit: "Regular Fit", category: "Tops" },
    "6": { id: "6", name: "Relaxed Fit Shirt", price: 1199, displayPrice: "₹1,199", description: "Soft cotton blend with a relaxed drape. Easy styling.", images: ["/clothes/shirt3.jpeg"], sizes: ["XS", "S", "M", "L"], fit: "Relaxed Fit", category: "Tops" },
    "7": { id: "7", name: "Structured Shirt", price: 1399, displayPrice: "₹1,399", description: "Elevated basics. Structured shoulders, clean lines.", images: ["/clothes/shirt4.jpeg"], sizes: ["S", "M", "L", "XL"], fit: "Slim Fit", category: "Tops" },
    "8": { id: "8", name: "Premium Tee", price: 999, displayPrice: "₹999", description: "Heavyweight cotton tee. Pre-shrunk. Built to last.", images: ["/clothes/tshirt1.jpeg"], sizes: ["S", "M", "L", "XL"], fit: "Regular Fit", category: "Tops" },
    "9": { id: "9", name: "Linen Blend", price: 1599, displayPrice: "₹1,599", description: "Summer-ready linen blend. Breathable and lightweight.", images: ["/clothes/shirts5.jpeg"], sizes: ["M", "L", "XL"], fit: "Regular Fit", category: "Tops" },
    "10": { id: "10", name: "Cropped Top", price: 799, displayPrice: "₹799", description: "Cropped silhouette. Perfect for layering.", images: ["/clothes/topwear-women.jpeg"], sizes: ["XS", "S", "M"], fit: "Cropped Fit", category: "Tops" },
    "11": { id: "11", name: "Oversized Blouse", price: 1099, displayPrice: "₹1,099", description: "Flowy oversized blouse. Effortless style.", images: ["/clothes/topwear-women2.jpeg"], sizes: ["S", "M", "L"], fit: "Oversized Fit", category: "Tops" },
    "12": { id: "12", name: "Graphic Tee", price: 1199, displayPrice: "₹1,199", description: "Statement graphic on heavyweight cotton.", images: ["/clothes/topwear-men1.jpeg"], sizes: ["S", "M", "L", "XL"], fit: "Regular Fit", category: "Tops" },
}

export function ProductClient({ id }: { id: string }) {
    const product = PRODUCTS[id] || PRODUCTS["1"]
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [added, setAdded] = useState(false)
    const { addItem } = useCart()
    const { isInWishlist, toggleItem } = useWishlist()

    const inWishlist = isInWishlist(product.id)

    const handleAddToCart = () => {
        if (!selectedSize) return
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            displayPrice: product.displayPrice,
            image: product.images[0],
            size: selectedSize,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleWishlist = () => {
        toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            displayPrice: product.displayPrice,
            image: product.images[0],
        })
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Gallery Section */}
                <div className="grid grid-cols-1 gap-1 bg-white/5">
                    {product.images.map((img, i) => (
                        <div
                            key={i}
                            className={`aspect-[4/5] w-full relative overflow-hidden bg-neutral-900 border-b border-white/10 lg:border-r lg:border-b-0 cursor-pointer ${selectedImage === i ? "ring-2 ring-foreground" : ""}`}
                            onClick={() => setSelectedImage(i)}
                        >
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                        </div>
                    ))}
                </div>

                {/* Product Info Section */}
                <div className="lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 p-8 lg:p-12 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">{product.fit}</h3>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{product.name}</h1>
                        </div>
                        <p className="text-2xl font-medium">{product.displayPrice}</p>
                        <p className="text-muted-foreground leading-relaxed max-w-md">{product.description}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Size Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                                <span>Select Size</span>
                                {!selectedSize && <span className="text-destructive font-normal normal-case">Required</span>}
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {product.sizes.map((size) => (
                                    <Button
                                        key={size}
                                        variant={selectedSize === size ? "default" : "outline"}
                                        className="w-12 h-12 rounded-none border-input hover:border-foreground transition-colors"
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 rounded-none text-lg uppercase tracking-widest font-bold disabled:opacity-50"
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize}
                                >
                                    {added ? (
                                        <>
                                            <Check className="h-5 w-5 mr-2" /> Added
                                        </>
                                    ) : (
                                        "Add to Cart"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 w-14 rounded-none"
                                    onClick={handleWishlist}
                                >
                                    <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                                </Button>
                            </div>
                            <p className="text-xs text-center text-muted-foreground uppercase">Free shipping on all orders over ₹2000</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="border-t border-white/10 mt-20">
                <ProductGrid title="You May Also Like" />
            </div>
        </div>
    )
}
