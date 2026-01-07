import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Product {
    id: string
    name: string
    price: string
    image: string
    category: string
}

const FEATURED_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Oversized Cargo",
        price: "₹1,999",
        image: "/clothes/pants1.jpeg",
        category: "Bottoms",
    },
    {
        id: "2",
        name: "Essential Tee",
        price: "₹899",
        image: "/clothes/shirt1.jpeg",
        category: "Tops",
    },
    {
        id: "3",
        name: "Denim Jacket",
        price: "₹2,499",
        image: "/clothes/jackets-men1.jpeg",
        category: "Outerwear",
    },
    {
        id: "4",
        name: "Baggy Jeans",
        price: "₹2,299",
        image: "/clothes/denim1.jpeg",
        category: "Denim",
    },
]

export function ProductGrid({ title = "Featured Drops" }: { title?: string }) {
    return (
        <section className="py-16 px-6 md:px-12 bg-background">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tighter uppercase">{title}</h2>
                <Link href="/shop" className="text-sm font-medium underline-offset-4 hover:underline text-muted-foreground">
                    View all
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {FEATURED_PRODUCTS.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id} className="group">
                        <Card className="rounded-none border-0 bg-transparent shadow-none hover-lift">
                            <CardContent className="p-0 relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${product.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </CardContent>
                            <CardFooter className="flex flex-col items-start p-4 space-y-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
                                <div className="flex w-full items-center justify-between">
                                    <h3 className="font-medium tracking-tight text-lg">{product.name}</h3>
                                    <span className="font-semibold">{product.price}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    )
}
