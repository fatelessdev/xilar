import type { Metadata } from "next"
import { ProductClient } from "@/components/features/product-client"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

async function getProduct(id: string) {
    const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))

    return product
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
        return {
            title: "Product Not Found",
            description: "This product does not exist.",
            robots: {
                index: false,
                follow: false,
            },
        }
    }

    const price = parseFloat(product.sellingPrice)
    const title = `${product.name}`
    const description = product.description || `Shop ${product.name} from XILAR.`

    return {
        title,
        description,
        alternates: {
            canonical: `/product/${product.id}`,
        },
        openGraph: {
            title: `${product.name} | XILAR`,
            description,
            url: `/product/${product.id}`,
            type: "website",
            images: product.images?.length ? product.images : ["/logo.png"],
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.name} | XILAR`,
            description,
            images: product.images?.length ? product.images : ["/logo.png"],
        },
        other: {
            "product:price:amount": price.toString(),
            "product:price:currency": "INR",
        },
    }
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const product = await getProduct(id)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const jsonLd = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        image: product.images?.length ? product.images : undefined,
        brand: {
            "@type": "Brand",
            name: "XILAR",
        },
        offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: product.sellingPrice,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${baseUrl}/product/${product.id}`,
        },
    } : null

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ProductClient id={id} />
        </>
    )
}
