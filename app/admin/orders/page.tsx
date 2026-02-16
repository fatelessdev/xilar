import { getOrders } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "./status-select";
import Link from "next/link";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">Order ID</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-left p-4 font-medium">Customer</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Payment</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders yet. Orders will appear here when customers make purchases.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="p-4">
                    <span className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {order.shippingAddress?.name || "Guest"}
                    {order.shippingAddress?.phone && (
                      <div className="text-sm text-muted-foreground">
                        {order.shippingAddress.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">₹{order.total}</div>
                    {order.couponCode && (
                      <div className="text-sm text-muted-foreground">
                        Coupon: {order.couponCode}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <span className="uppercase">{order.paymentMethod || "—"}</span>
                    </div>
                    <div className={`text-xs ${
                      order.paymentStatus === "paid" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}>
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </div>
                  </td>
                  <td className="p-4">
                    <OrderStatusSelect
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
