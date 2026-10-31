import razorpay from "@/lib/razorpay";

/**
 * Refunds a captured Razorpay payment that could not be turned into an order
 * (stock ran out, coupon expired, checkout expired, DB failure). Without this
 * the customer is charged with nothing to show for it.
 *
 * Returns false instead of throwing so callers can still record the failed
 * checkout; a failed refund is logged loudly for manual reconciliation.
 */
export async function refundUnfulfilledPayment(input: {
  razorpayPaymentId: string;
  amountPaise: number;
  checkoutPaymentId: string;
  reason: string;
}) {
  try {
    await razorpay.payments.refund(input.razorpayPaymentId, {
      amount: input.amountPaise,
      speed: "normal",
      receipt: input.checkoutPaymentId.replace(/-/g, "").slice(0, 40),
      notes: { reason: input.reason.slice(0, 250), checkoutPaymentId: input.checkoutPaymentId },
    });
    return true;
  } catch (error) {
    console.error(
      `[checkout] REFUND FAILED for captured payment ${input.razorpayPaymentId} (checkout ${input.checkoutPaymentId}, ₹${input.amountPaise / 100}). Refund manually in Razorpay.`,
      error,
    );
    return false;
  }
}
