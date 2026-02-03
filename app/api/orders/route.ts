import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createOrder({
      items: body.items,
      subtotal: body.subtotal,
      shippingCost: body.shippingCost,
      discount: body.discount,
      couponCode: body.couponCode,
      codFee: body.codFee,
      total: body.total,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
