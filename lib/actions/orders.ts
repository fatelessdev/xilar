"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products, user, coupons, bargainSessions } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, desc, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { markCouponUsed } from "./admin";

// ============================================
// ORDER TYPES
// ============================================

export interface OrderItemInput {
  productId: string;
  productName: string;
  productImage?: string;
  size: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  codFee?: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

// ============================================
// ORDER ACTIONS
// ============================================

export async function createOrder(input: CreateOrderInput) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  // Validate stock for all items
  for (const item of input.items) {
    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, item.productId));

    if (!product || product.stock < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${item.productName}`,
      };
    }
  }

  // Create the order
  const [order] = await db
    .insert(orders)
    .values({
      userId: userId || null,
      status: "pending",
      subtotal: input.subtotal.toString(),
      discount: input.discount.toString(),
      shipping: input.shippingCost.toString(),
      total: input.total.toString(),
      couponCode: input.couponCode,
      couponDiscount: input.couponCode ? input.discount.toString() : null,
      codFee: input.codFee ? input.codFee.toString() : null,
      codRemainingAmount: input.paymentMethod === "cod" ? input.total.toString() : null,
      shippingAddress: {
        name: input.shippingAddress.name,
        phone: input.shippingAddress.phone,
        address: input.shippingAddress.address,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state || "",
        pincode: input.shippingAddress.pincode,
      },
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
    })
    .returning();

  // Create order items
  for (const item of input.items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      totalPrice: item.totalPrice.toString(),
    });

    // Decrement product stock
    await db
      .update(products)
      .set({
        stock: sql`${products.stock} - ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, item.productId));
  }

  // Mark coupon as used if applicable
  if (input.couponCode) {
    await markCouponUsed(input.couponCode);
    
    // Also mark bargain session as used if it exists
    await db
      .update(bargainSessions)
      .set({ used: true })
      .where(eq(bargainSessions.couponCode, input.couponCode));
  }

  // Update user order stats if logged in
  if (userId) {
    await db
      .update(user)
      .set({
        ordersCount: sql`${user.ordersCount} + 1`,
        totalSpent: sql`${user.totalSpent} + ${input.total}`,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
  }

  revalidatePath("/orders");
  revalidatePath("/admin/orders");

  return {
    success: true,
    orderId: order.id,
  };
}

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

  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    userOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items,
      };
    })
  );

  return ordersWithItems;
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
