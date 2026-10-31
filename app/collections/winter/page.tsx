import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductGrid, ProductGridSkeleton } from "@/components/features/product-grid"
import { JsonLd, breadcrumbJsonLd, collectionJsonLd } from "@/components/seo/structured-data"
import { filterCatalogProducts } from "@/lib/catalog-filter"
import { getCatalogProducts, type CatalogProduct } from "@/lib/product-catalog"
import { WINTER_CATEGORIES } from "@/lib/product-categories"
import { normalizeSiteUrl } from "@/lib/seo"

export const metadata: Metadata = {
    title: "Winter Collection — Jackets, Hoodies, Shackets & Sweatshirts",
    description:
        "Layer up with the XILAR Winter collection — jackets, hoodies, shackets, sweatshirts, and trousers built for Indian winters.",
    alternates: {
        canonical: "/collections/winter",
    },
    openGraph: {
        title: "Winter Collection | XILAR",
        description:
            "Jackets, hoodies, shackets, sweatshirts, and trousers built for Indian winters.",
        url: "/collections/winter",
    },
}

async function WinterGridAndSeo({
    productsPromise,
    baseUrl,
}: {
    productsPromise: Promise<{ products: CatalogProduct[] }>
    baseUrl: string
}) {
    const { products } = await productsPromise
    // Filter only for JSON-LD. The grid gets the full catalog because every
    // ProductGrid shares one client query cache entry; seeding it with a
    // filtered list would empty other grids after client-side navigation.
    const winterProducts = filterCatalogProducts(products, { categories: WINTER_CATEGORIES })

    return (
        <>
            <JsonLd
                data={collectionJsonLd(baseUrl, {
                    name: "Winter Collection — XILAR",
                    description: "Jackets, hoodies, shackets, sweatshirts, and trousers for colder days.",
                    url: "/collections/winter",
                    products: winterProducts.map((product) => ({
                        name: product.name,
                        slug: product.slug,
                        image: product.images[0],
                        sellingPrice: product.sellingPrice,
                    })),
                })}
            />
            <ProductGrid
                title=""
                categories={WINTER_CATEGORIES}
                initialProducts={products}
                maxProducts={null}
                showGenderTabs={false}
                enableInfiniteScroll={true}
            />
        </>
    )
}

export default function WinterPage() {
    const baseUrl = normalizeSiteUrl()
    const productsPromise = getCatalogProducts()

    return (
        <div className="flex flex-col min-h-screen">
            <JsonLd
                data={breadcrumbJsonLd(baseUrl, [
                    { name: "Home", url: "/" },
                    { name: "Collections", url: "/" },
                    { name: "Winter", url: "/collections/winter" },
                ])}
            />
            <div className="px-6 md:px-12 py-14 md:py-20 border-b border-border/60">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium mb-3">Collection</p>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl">Winter</h1>
                <p className="text-sm text-muted-foreground mt-2">Jackets, hoodies, shackets, sweatshirts, and trousers. Layer up.</p>
            </div>
            <Suspense fallback={<ProductGridSkeleton />}>
                <WinterGridAndSeo productsPromise={productsPromise} baseUrl={baseUrl} />
            </Suspense>
        </div>
    )
}
