import { ProductClient } from "@/components/features/product-client"

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <ProductClient id={id} />
}
