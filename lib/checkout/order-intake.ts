// Order intake: the single write path that turns a server-built checkout quote
// into an order. Deliberately NOT a "use server" module: anything exported from
// one becomes a client-callable action endpoint, and createOrder must never be
// reachable with client-supplied totals or payment status. Route handlers call
// createOrderFromQuote() after building the quote with createCheckoutQuote().
import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, user, bargainSessions, coupons } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, sql, and, isNull, or, gt, lt, lte } from "drizzle-orm";
import { calculateCouponDiscount } from "@/lib/coupon-validation";
import type { CheckoutQuote } from "@/lib/checkout/pricing";
import { consumeWalletReservation } from "@/lib/wallet";

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
  comboDiscount?: number;
  couponDiscount?: number;
  couponCode?: string;
  codFee?: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  walletReservationReferenceId?: string;
  walletPaidPaise?: number;
  externalPaidPaise?: number;
}

export type CreateOrderFromQuoteInput = {
  quote: CheckoutQuote;
  shippingAddress: ShippingAddress;
  paymentMethod: CreateOrderInput["paymentMethod"];
  paymentStatus?: CreateOrderInput["paymentStatus"];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  walletReservationReferenceId?: string;
  walletPaidPaise?: number;
  externalPaidPaise?: number;
};

export type OrderMutationClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type InventoryMutationItem = {
  productId: string | null;
  productName: string;
  size: string;
  color?: string | null;
  quantity: number;
};

function describeInventoryItem(item: InventoryMutationItem) {
  return `${item.productName} (${item.size}${item.color ? `, ${item.color}` : ""})`;
}

function variantColorCondition(item: InventoryMutationItem) {
  return item.color
    ? eq(productVariants.color, item.color)
    : isNull(productVariants.color);
}

async function productHasVariants(tx: OrderMutationClient, productId: string) {
  const [variantCountRow] = await tx
    .select({ count: sql<number>`count(*)` })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return Number(variantCountRow?.count ?? 0) > 0;
}

async function recalculateProductStockFromVariants(tx: OrderMutationClient, productId: string) {
  const [stockRow] = await tx
    .select({ totalStock: sql<number>`COALESCE(SUM(${productVariants.stock}), 0)` })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  await tx
    .update(products)
    .set({
      stock: Number(stockRow?.totalStock ?? 0),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
}

async function decrementOrderItemStock(tx: OrderMutationClient, item: InventoryMutationItem) {
  if (!item.productId) {
    throw new Error(`Product is unavailable: ${item.productName}`);
  }

  const [activeProduct] = await tx
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, item.productId), eq(products.isActive, true)));

  if (!activeProduct) {
    throw new Error(`Product is unavailable: ${item.productName}`);
  }

  if (await productHasVariants(tx, item.productId)) {
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
          variantColorCondition(item),
          sql`${productVariants.stock} >= ${item.quantity}`
        )
      )
      .returning({ id: productVariants.id });

    if (decrementedVariant.length === 0) {
      const [variant] = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, item.productId),
            eq(productVariants.size, item.size),
            variantColorCondition(item)
          )
        );

      if (!variant) {
        throw new Error(`Selected variant is unavailable for ${describeInventoryItem(item)}`);
      }

      throw new Error(`Insufficient stock for ${describeInventoryItem(item)}`);
    }

    await recalculateProductStockFromVariants(tx, item.productId);
    return;
  }

  const decrementedProduct = await tx
    .update(products)
    .set({
      stock: sql`${products.stock} - ${item.quantity}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(products.id, item.productId),
        eq(products.isActive, true),
        sql`${products.stock} >= ${item.quantity}`
      )
    )
    .returning({ id: products.id });

  if (decrementedProduct.length === 0) {
    throw new Error(`Insufficient stock for ${item.productName}`);
  }
}

export async function restoreOrderItemStock(tx: OrderMutationClient, item: InventoryMutationItem) {
  if (!item.productId) return null;

  if (await productHasVariants(tx, item.productId)) {
    await tx
      .update(productVariants)
      .set({
        stock: sql`${productVariants.stock} + ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productVariants.productId, item.productId),
          eq(productVariants.size, item.size),
          variantColorCondition(item)
        )
      );

    await recalculateProductStockFromVariants(tx, item.productId);
    return item.productId;
  }

  await tx
    .update(products)
    .set({
      stock: sql`${products.stock} + ${item.quantity}`,
      updatedAt: new Date(),
    })
    .where(eq(products.id, item.productId));

  return item.productId;
}

// ============================================
// ORDER ACTIONS
// ============================================

async function consumeCouponForOrder(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  code: string,
  orderTotal: number,
  userId: string,
  expectedDiscount: number
) {
  const couponCode = code.toUpperCase();
  const now = new Date();

  const [coupon] = await tx
    .select()
    .from(coupons)
    .where(eq(coupons.code, couponCode));

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new Error("This coupon is no longer active");
  }

  if (coupon.isBargainGenerated && coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error("This bargain code has expired. Try negotiating again!");
  }

  if (coupon.validUntil && coupon.validUntil < now) {
    throw new Error("This coupon has expired");
  }

  if (coupon.validFrom > now) {
    throw new Error("This coupon is not yet valid");
  }

  if (coupon.minOrderValue && orderTotal < parseFloat(coupon.minOrderValue)) {
    throw new Error(`Minimum order value is ₹${coupon.minOrderValue}`);
  }

  if (coupon.userId && coupon.userId !== userId) {
    throw new Error("This coupon is not valid for your account");
  }

  const discount = calculateCouponDiscount(coupon, orderTotal);
  if (Math.abs(discount - expectedDiscount) > 0.01) {
    throw new Error("Coupon discount changed. Please re-apply the coupon.");
  }

  const consumed = await tx
    .update(coupons)
    .set({
      usedCount: sql`${coupons.usedCount} + 1`,
    })
    .where(
      and(
        eq(coupons.id, coupon.id),
        eq(coupons.isActive, true),
        lte(coupons.validFrom, now),
        or(isNull(coupons.validUntil), gt(coupons.validUntil, now))!,
        or(eq(coupons.isBargainGenerated, false), isNull(coupons.expiresAt), gt(coupons.expiresAt, now))!,
        or(isNull(coupons.maxUses), lt(coupons.usedCount, coupons.maxUses))!,
        or(isNull(coupons.userId), eq(coupons.userId, userId))!,
        or(isNull(coupons.minOrderValue), lte(coupons.minOrderValue, orderTotal.toFixed(2)))!
      )
    )
    .returning();

  if (consumed.length === 0) {
    throw new Error("This coupon has reached its usage limit");
  }

  if (coupon.isBargainGenerated) {
    await tx
      .update(bargainSessions)
      .set({ used: true })
      .where(eq(bargainSessions.couponCode, couponCode));
  }

  return { code: couponCode, discount };
}

async function createOrder(input: CreateOrderInput) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to place an order.",
    };
  }

  let order;
  try {
    order = await db.transaction(async (tx) => {
      let couponCode: string | null = null;
      let couponDiscount = 0;

      if (input.couponCode) {
        const consumedCoupon = await consumeCouponForOrder(
          tx,
          input.couponCode,
          input.subtotal,
          userId,
          input.couponDiscount ?? input.discount
        );
        couponCode = consumedCoupon.code;
        couponDiscount = consumedCoupon.discount;
      }

      const codFee = input.codFee ?? 0;
      const discount = input.discount;
      const total = input.subtotal + input.shippingCost + codFee - discount;

      if (discount < couponDiscount) {
        throw new Error("Invalid order discount");
      }

      if (total <= 0) {
        throw new Error("Invalid order total");
      }

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          userId,
          status: "pending",
          subtotal: input.subtotal.toString(),
          discount: discount.toString(),
          shipping: input.shippingCost.toString(),
          total: total.toString(),
          couponCode,
          couponDiscount: couponCode ? couponDiscount.toString() : null,
          codFee: codFee ? codFee.toString() : null,
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
          walletPaidPaise: input.walletPaidPaise ?? 0,
          externalPaidPaise: input.externalPaidPaise ?? 0,
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

        await decrementOrderItemStock(tx, item);
      }

      if ((input.walletPaidPaise ?? 0) > 0) {
        if (!input.walletReservationReferenceId) throw new Error("Missing wallet payment reservation");
        await consumeWalletReservation(tx, { referenceType: "checkout_payment", referenceId: input.walletReservationReferenceId, ledgerType: "order_payment", note: `Order ${createdOrder.id.slice(0, 8).toUpperCase()}` });
      }

      await tx
        .update(user)
        .set({
          ordersCount: sql`${user.ordersCount} + 1`,
          totalSpent: sql`${user.totalSpent} + ${total}`,
          shippingAddress: {
            name: input.shippingAddress.name,
            phone: input.shippingAddress.phone,
            address: input.shippingAddress.address,
            city: input.shippingAddress.city,
            state: input.shippingAddress.state || "",
            pincode: input.shippingAddress.pincode,
          },
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return createdOrder;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    if (
      message.toLowerCase().includes("insufficient stock") ||
      message.toLowerCase().includes("variant is unavailable") ||
      message.toLowerCase().includes("coupon") ||
      message.toLowerCase().includes("minimum order") ||
      message.toLowerCase().includes("expired") ||
      message.toLowerCase().includes("usage limit") ||
      message.toLowerCase().includes("invalid order total")
    ) {
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

  return {
    success: true,
    orderId: order.id,
  };
}

export async function createOrderFromQuote(input: CreateOrderFromQuoteInput) {
  return createOrder({
    items: input.quote.items,
    subtotal: input.quote.subtotal,
    shippingCost: input.quote.shippingCost,
    discount: input.quote.discount,
    comboDiscount: input.quote.comboDiscount,
    couponDiscount: input.quote.couponDiscount,
    couponCode: input.quote.couponCode,
    codFee: input.quote.codFee,
    total: input.quote.total,
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
    walletReservationReferenceId: input.walletReservationReferenceId,
    walletPaidPaise: input.walletPaidPaise,
    externalPaidPaise: input.externalPaidPaise,
  });
}

