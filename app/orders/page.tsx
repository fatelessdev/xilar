import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
    const orders = [
        {
            id: "XIL12345678",
            date: "Dec 28, 2025",
            status: "Delivered",
            total: "₹2,898",
            items: [
                { name: "Oversized Cargo", size: "L", image: "/clothes/pants1.jpeg" },
            ],
        },
    ]

    return (
        <div className="min-h-screen">
            <div className="px-6 py-12 border-b border-white/10">
                <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
                    <Package className="h-8 w-8" /> My Orders
                </h1>
            </div>

            <div className="p-6 max-w-4xl space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="border border-white/10 p-6">
                        <div className="flex justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">{order.date}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs uppercase bg-green-500/20 text-green-500 px-2 py-1">
                                    {order.status}
                                </span>
                                <p className="font-bold mt-1">{order.total}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-none text-xs uppercase">
                            Track Order
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
