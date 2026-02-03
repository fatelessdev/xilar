"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/features/product-grid"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { Heart, Check, Loader2 } from "lucide-react"

interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    mrp: string
    sellingPrice: string
    images: string[]
    sizes: string[]
    colors: { name: string; hex: string; images?: string[] }[]
    fabric: string | null
    gsm: number | null
    features: string[]
    category: string
    gender: string
    stock: number
}

export function ProductClient({ id }: { id: string }) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [added, setAdded] = useState(false)
    const { addItem } = useCart()
    const { isInWishlist, toggleItem } = useWishlist()

    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true)
                const res = await fetch(`/api/products/${id}`)
                if (!res.ok) {
                    throw new Error("Product not found")
                }
                const data = await res.json()
                setProduct(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load product")
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Product Not Found</h1>
                    <p className="text-muted-foreground">{error || "This product doesn't exist."}</p>
                    <Button asChild variant="outline" className="rounded-none">
                        <a href="/shop">Back to Shop</a>
                    </Button>
                </div>
            </div>
        )
    }

    const price = parseFloat(product.sellingPrice)
    const mrp = parseFloat(product.mrp)
    const hasDiscount = mrp > price
    const displayPrice = `₹${price.toLocaleString("en-IN")}`
    const displayMrp = `₹${mrp.toLocaleString("en-IN")}`
    const images = product.images.length > 0 ? product.images : ["/clothes/placeholder.jpeg"]

    const inWishlist = isInWishlist(product.id)

    const handleAddToCart = () => {
        if (!selectedSize) return
        if (product.stock <= 0) return
        
        addItem({
            id: product.id,
            name: product.name,
            price: price,
            displayPrice: displayPrice,
            image: images[0],
            size: selectedSize,
            color: selectedColor || undefined,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleWishlist = () => {
        toggleItem({
            id: product.id,
            name: product.name,
            price: price,
            displayPrice: displayPrice,
            image: images[0],
        })
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Gallery Section */}
                <div className="grid grid-cols-1 gap-1 bg-white/5">
                    {images.map((img, i) => (
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
                            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">{product.category} • {product.gender}</h3>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{product.name}</h1>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <p className="text-2xl font-medium">{displayPrice}</p>
                            {hasDiscount && (
                                <>
                                    <p className="text-lg text-muted-foreground line-through">{displayMrp}</p>
                                    <span className="text-sm text-green-600 font-medium">
                                        {Math.round(((mrp - price) / mrp) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                        {product.description && (
                            <p className="text-muted-foreground leading-relaxed max-w-md">{product.description}</p>
                        )}
                        {product.fabric && (
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Fabric:</span> {product.fabric} {product.gsm && `(${product.gsm} GSM)`}
                            </p>
                        )}
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

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                                    <span>Select Color</span>
                                    {selectedColor && <span className="text-muted-foreground font-normal normal-case">{selectedColor}</span>}
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                                                selectedColor === color.name 
                                                    ? "ring-2 ring-offset-2 ring-foreground ring-offset-background border-foreground" 
                                                    : "border-border hover:border-foreground"
                                            }`}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => setSelectedColor(color.name)}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock indicator */}
                        {product.stock <= 5 && product.stock > 0 && (
                            <p className="text-sm text-orange-500 font-medium">Only {product.stock} left in stock!</p>
                        )}
                        {product.stock === 0 && (
                            <p className="text-sm text-red-500 font-medium">Out of stock</p>
                        )}

                        {/* Actions */}
                        <div className="pt-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 rounded-none text-lg uppercase tracking-widest font-bold disabled:opacity-50"
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || product.stock === 0}
                                >
                                    {product.stock === 0 ? (
                                        "Out of Stock"
                                    ) : added ? (
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
                            <p className="text-xs text-center text-muted-foreground uppercase">Free shipping on orders above ₹999</p>
                        </div>

                        {/* Features */}
                        {product.features.length > 0 && (
                            <div className="pt-4 border-t border-border space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest">Features</h4>
                                <ul className="space-y-1">
                                    {product.features.map((feature, i) => (
                                        <li key={i} className="text-sm text-muted-foreground">• {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
