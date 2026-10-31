"use server";

import { db } from "@/lib/db";
import { orders, orderItems, user } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { getCustomerCodCancellationFailure } from "@/lib/order-cancellation";
import { restoreOrderItemStock } from "@/lib/checkout/order-intake";

export async function getUserOrders() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return [];
  }

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  if (userOrders.length === 0) {
    return [];
  }

  // Fetch items for all orders in a single query
  const orderIds = userOrders.map((order) => order.id);
  const allItems = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  // Group items by orderId for O(1) lookups
  const itemsByOrderId = new Map<string, typeof allItems>();
  for (const item of allItems) {
    if (!item.orderId) continue;
    const items = itemsByOrderId.get(item.orderId) || [];
    items.push(item);
    itemsByOrderId.set(item.orderId, items);
  }

  const ordersWithItems = userOrders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) || [],
  }));

  return ordersWithItems;
}

// ============================================
// CANCEL ORDER (COD only, pending/confirmed)
// ============================================

export async function cancelOrder(orderId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required" };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const cancellationFailure = getCustomerCodCancellationFailure({
    orderUserId: order.userId,
    currentUserId: session.user.id,
    paymentMethod: order.paymentMethod,
    status: order.status,
  });

  if (cancellationFailure) {
    return { success: false, error: cancellationFailure };
  }

  const productIds = new Set<string>();

  try {
    await db.transaction(async (tx) => {
      const cancelledOrder = await tx
        .update(orders)
        .set({
          status: "cancelled",
          paymentStatus: "cancelled",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.userId, session.user.id),
            eq(orders.paymentMethod, "cod"),
            inArray(orders.status, ["pending", "confirmed"])
          )
        )
        .returning({ id: orders.id });

      if (cancelledOrder.length === 0) {
        throw new Error("Order is no longer cancellable");
      }

      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      for (const item of items) {
        const restoredProductId = await restoreOrderItemStock(tx, item);
        if (restoredProductId) productIds.add(restoredProductId);
      }

      await tx
        .update(user)
        .set({
          ordersCount: sql`GREATEST(${user.ordersCount} - 1, 0)`,
          totalSpent: sql`GREATEST(${user.totalSpent} - ${Number(order.total)}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    if (message.toLowerCase().includes("no longer cancellable")) {
      return { success: false, error: "This order is no longer cancellable." };
    }
    console.error("Cancel order failed:", error);
    return { success: false, error: "Failed to cancel order" };
  }

  return { success: true };
}

// ============================================
// SHIPPING ADDRESS (saved on user profile)
// ============================================

export async function getSavedShippingAddress() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const [userData] = await db
    .select({
      name: user.name,
      email: user.email,
      phone: user.phone,
      shippingAddress: user.shippingAddress,
    })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (!userData) return null;

  return {
    name: userData.shippingAddress?.name || userData.name,
    email: userData.email,
    phone: userData.shippingAddress?.phone || userData.phone || "",
    address: userData.shippingAddress?.address || "",
    city: userData.shippingAddress?.city || "",
    state: userData.shippingAddress?.state || "",
    pincode: userData.shippingAddress?.pincode || "",
  };
}

export async function getOrderById(orderId: string) {
  const session = await getServerSession();
  
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  if (!order) {
    return null;
  }

  // Check if user owns this order (unless admin)
  if (session?.user?.role !== "admin" && order.userId !== session?.user?.id) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    ...order,
    items,
  };
}
