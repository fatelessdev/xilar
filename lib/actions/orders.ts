"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, user, bargainSessions } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, desc, sql, and, isNull } from "drizzle-orm";
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
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

// ============================================
// ORDER ACTIONS
// ============================================

export async function createOrder(input: CreateOrderInput) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to place an order.",
    };
  }

  // Validate per-variant stock for all items
  for (const item of input.items) {
    const [variantCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productVariants)
      .where(eq(productVariants.productId, item.productId));
    const hasVariants = Number(variantCountRow?.count ?? 0) > 0;

    const colorCondition = item.color
      ? eq(productVariants.color, item.color)
      : isNull(productVariants.color);

    const [variant] = await db
      .select({ stock: productVariants.stock })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, item.productId),
          eq(productVariants.size, item.size),
          colorCondition
        )
      );

    if (!variant) {
      if (hasVariants) {
        return {
          success: false,
          error: `Selected variant is unavailable for ${item.productName} (${item.size}${item.color ? `, ${item.color}` : ""})`,
        };
      }

      // Fallback: check product-level stock only for legacy products without variants
      const [product] = await db
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId));

      if (!product || product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.productName} (${item.size}${item.color ? `, ${item.color}` : ""})`,
        };
      }
    } else if (variant.stock < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${item.productName} (${item.size}${item.color ? `, ${item.color}` : ""})`,
      };
    }
  }

  let order;
  try {
    order = await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(orders)
      .values({
        userId,
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
        paymentStatus: input.paymentStatus || "pending",
        razorpayOrderId: input.razorpayOrderId || null,
        razorpayPaymentId: input.razorpayPaymentId || null,
        razorpaySignature: input.razorpaySignature || null,
      })
      .returning();

    for (const item of input.items) {
      await tx.insert(orderItems).values({
        orderId: createdOrder.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
      });

      const [variantCountRow] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(productVariants)
        .where(eq(productVariants.productId, item.productId));
      const hasVariants = Number(variantCountRow?.count ?? 0) > 0;

      if (hasVariants) {
        const colorCondition = item.color
          ? eq(productVariants.color, item.color)
          : isNull(productVariants.color);

        const decrementedVariant = await tx
          .update(productVariants)
          .set({
            stock: sql`${productVariants.stock} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(productVariants.productId, item.productId),
              eq(productVariants.size, item.size),
              colorCondition,
              sql`${productVariants.stock} >= ${item.quantity}`
            )
          )
          .returning();

        if (decrementedVariant.length === 0) {
          throw new Error(`Insufficient stock for ${item.productName} (${item.size}${item.color ? `, ${item.color}` : ""})`);
        }

        const [stockRow] = await tx
          .select({ totalStock: sql<number>`COALESCE(SUM(${productVariants.stock}), 0)` })
          .from(productVariants)
          .where(eq(productVariants.productId, item.productId));

        await tx
          .update(products)
          .set({
            stock: Number(stockRow?.totalStock ?? 0),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      } else {
        const decrementedProduct = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(products.id, item.productId),
              sql`${products.stock} >= ${item.quantity}`
            )
          )
          .returning();

        if (decrementedProduct.length === 0) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }
    }

      return createdOrder;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    if (message.toLowerCase().includes("insufficient stock") || message.toLowerCase().includes("variant is unavailable")) {
      return {
        success: false,
        error: message,
      };
    }

    console.error("Order transaction failed:", error);
    return {
      success: false,
      error: "Failed to create order",
    };
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
