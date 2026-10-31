import { NextRequest, NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { and, eq } from "drizzle-orm";
import razorpay from "@/lib/razorpay";
import { requireAuth } from "@/lib/auth-server";
import { createOrderFromQuote, type ShippingAddress } from "@/lib/checkout/order-intake";
import { db } from "@/lib/db";
import { walletCheckoutPayments } from "@/lib/db/schema";
import { assertSameOrigin } from "@/lib/request-security";
import type { CheckoutQuote } from "@/lib/checkout/pricing";
import { releaseWalletReservation } from "@/lib/wallet";
import { refundUnfulfilledPayment } from "@/lib/checkout/refund";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await requireAuth();
    const body = await request.json();
    if (typeof body.paymentId !== "string") return NextResponse.json({ error: "Invalid checkout payment." }, { status: 400 });
    const [payment] = await db.select().from(walletCheckoutPayments).where(and(eq(walletCheckoutPayments.id, body.paymentId), eq(walletCheckoutPayments.userId, session.user.id))).limit(1);
    if (!payment) return NextResponse.json({ error: "Checkout payment not found." }, { status: 404 });
    if (payment.orderId) return NextResponse.json({ success: true, orderId: payment.orderId });
    if (payment.status !== "created") return NextResponse.json({ error: "This checkout is no longer active. Please start again." }, { status: 409 });
    let capturedPaymentId: string | null = null;
    if (payment.externalPaidPaise > 0) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
      if (!payment.razorpayOrderId || typeof razorpay_payment_id !== "string" || razorpay_order_id !== payment.razorpayOrderId || !validatePaymentVerification({ order_id: razorpay_order_id, payment_id: razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_KEY_SECRET!)) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
      const captured = await razorpay.payments.fetch(razorpay_payment_id);
      if (captured.order_id !== payment.razorpayOrderId || captured.status !== "captured" || Number(captured.amount) !== payment.externalPaidPaise) return NextResponse.json({ error: "Captured payment does not match checkout." }, { status: 400 });
      capturedPaymentId = razorpay_payment_id;
    } else if (payment.expiresAt < new Date()) {
      // Expiry only blocks checkouts with nothing captured yet; once the customer has paid we try to fulfil and refund on failure.
      return NextResponse.json({ error: "Checkout payment expired. Please start again." }, { status: 400 });
    }
    const [claimed] = await db.update(walletCheckoutPayments).set({ status: "processing", razorpayPaymentId: capturedPaymentId, updatedAt: new Date() }).where(and(eq(walletCheckoutPayments.id, payment.id), eq(walletCheckoutPayments.status, "created"))).returning();
    if (!claimed) return NextResponse.json({ error: "Checkout is already processing." }, { status: 409 });
    let result: Awaited<ReturnType<typeof createOrderFromQuote>>;
    try {
      result = await createOrderFromQuote({ quote: payment.quote as CheckoutQuote, shippingAddress: payment.shippingAddress as ShippingAddress, paymentMethod: payment.walletPaidPaise > 0 && payment.externalPaidPaise > 0 ? "wallet_razorpay" : payment.walletPaidPaise > 0 ? "wallet" : payment.paymentMethod, paymentStatus: "paid", razorpayOrderId: payment.razorpayOrderId || undefined, razorpayPaymentId: capturedPaymentId || undefined, razorpaySignature: capturedPaymentId ? body.razorpay_signature : undefined, walletReservationReferenceId: payment.id, walletPaidPaise: payment.walletPaidPaise, externalPaidPaise: payment.externalPaidPaise });
    } catch (error) {
      console.error("Checkout order creation threw:", error);
      result = { success: false, error: "Could not create order." };
    }
    if (!result.success || !result.orderId) {
      await releaseWalletReservation("checkout_payment", payment.id);
      // The customer's card/UPI was charged but no order exists: send the money back.
      const refunded = capturedPaymentId ? await refundUnfulfilledPayment({ razorpayPaymentId: capturedPaymentId, amountPaise: payment.externalPaidPaise, checkoutPaymentId: payment.id, reason: result.error || "Order creation failed" }) : false;
      await db.update(walletCheckoutPayments).set({ status: refunded ? "refunded" : "failed", updatedAt: new Date() }).where(eq(walletCheckoutPayments.id, payment.id));
      const error = result.error || "Could not create order.";
      return NextResponse.json({ error: refunded ? `${error} Your payment has been refunded.` : capturedPaymentId ? `${error} Please contact support for a refund.` : error }, { status: 400 });
    }
    await db.update(walletCheckoutPayments).set({ status: "completed", orderId: result.orderId, updatedAt: new Date() }).where(eq(walletCheckoutPayments.id, payment.id));
    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finish checkout payment.";
    return NextResponse.json({ error: message }, { status: /unauthorized/i.test(message) ? 401 : 400 });
  }
}
