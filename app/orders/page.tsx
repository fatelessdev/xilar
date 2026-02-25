import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { getUserOrders } from "@/lib/actions/orders"
import { getServerSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { CancelOrderButton } from "./cancel-button"

export const metadata: Metadata = {
    title: "My Orders",
    description: "View and track your XILAR orders.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "/orders",
    },
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-500",
    confirmed: "bg-blue-500/20 text-blue-500",
    processing: "bg-purple-500/20 text-purple-500",
    shipped: "bg-orange-500/20 text-orange-500",
    delivered: "bg-green-500/20 text-green-500",
    cancelled: "bg-red-500/20 text-red-500",
}

export default async function OrdersPage() {
    const session = await getServerSession()
    
    if (!session) {
        redirect("/account")
    }

    const orders = await getUserOrders()

    return (
        <div className="min-h-screen">
            <div className="px-6 py-12 border-b border-border">
                <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
                    <Package className="h-8 w-8" /> My Orders
                </h1>
            </div>

            <div className="p-6 max-w-4xl space-y-6">
                {orders.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="text-lg text-muted-foreground">No orders yet</p>
                        <p className="text-sm text-muted-foreground">
                            Start shopping to see your orders here
                        </p>
                        <Link href="/shop">
                            <Button className="rounded-none uppercase tracking-wide mt-4">
                                Browse Products
                            </Button>
                        </Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="border border-border p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs uppercase px-2 py-1 ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                                        {order.status}
                                    </span>
                                    <p className="font-bold mt-1">₹{parseFloat(order.total).toLocaleString("en-IN")}</p>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex-shrink-0">
                                        <div
                                            className="w-16 h-20 bg-cover bg-center bg-neutral-900"
                                            style={{ backgroundImage: item.productImage ? `url(${item.productImage})` : undefined }}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-16">
                                            {item.productName}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Details */}
                            <div className="text-sm text-muted-foreground space-y-1 border-t border-border pt-4">
                                <div className="flex justify-between">
                                    <span>Items</span>
                                    <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                </div>
                                {order.couponCode && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Discount ({order.couponCode})</span>
                                        <span>-₹{parseFloat(order.couponDiscount || "0").toLocaleString("en-IN")}</span>
                                    </div>
                                )}
                                {order.codFee && parseFloat(order.codFee) > 0 && (
                                    <div className="flex justify-between text-orange-600 dark:text-orange-400">
                                        <span>COD Fee</span>
                                        <span>+₹{parseFloat(order.codFee).toLocaleString("en-IN")}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Payment</span>
                                    <span className="capitalize">{order.paymentMethod || "N/A"}</span>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            {order.shippingAddress && (
                                <div className="text-sm text-muted-foreground border-t border-border pt-4">
                                    <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>
                                        {order.shippingAddress.city}
                                        {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} - {order.shippingAddress.pincode}
                                    </p>
                                    <p>{order.shippingAddress.phone}</p>
                                </div>
                            )}

                            {/* Cancel button for eligible COD orders */}
                            {order.paymentMethod === "cod" && ["pending", "confirmed"].includes(order.status) && (
                                <CancelOrderButton orderId={order.id} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
