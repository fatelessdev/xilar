import { streamText } from "ai";
import { bargainModel } from "@/lib/nim";
import { db, user, coupons, bargainSessions, products } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const maxDuration = 30;

// Generate unique coupon code
function generateCouponCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "BRG-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Calculate discount based on rules AND per-product limits
function calculateMaxDiscount(
  cartTotal: number, 
  isFirstTimeUser: boolean,
  productMaxDiscounts: number // Sum of all products' maxBargainDiscount
): { maxDiscount: number; discountType: string } {
  // Start with the sum of per-product max discounts as the absolute ceiling
  let productBasedMax = productMaxDiscounts;
  
  // If no product limits set, use cart-based rules
  if (productBasedMax <= 0) {
    productBasedMax = Infinity;
  }
  
  let cartBasedMax: number;
  let discountType: string;
  
  // First-time user with cart > ₹2000: 10% off (max ₹200)
  if (isFirstTimeUser && cartTotal >= 2000) {
    const tenPercent = cartTotal * 0.10;
    cartBasedMax = Math.min(tenPercent, 200);
    discountType = "first_time_premium";
  }
  // Cart < ₹1000: max ₹70
  else if (cartTotal < 1000) {
    cartBasedMax = 70;
    discountType = "low_value";
  }
  // Default for other cases: progressive discount (5-8% max ₹150)
  else {
    const percentage = Math.min(0.08, 0.05 + (cartTotal / 10000) * 0.03);
    cartBasedMax = Math.min(cartTotal * percentage, 150);
    discountType = "standard";
  }
  
  // Take the minimum of cart-based rules and product-based limits
  const maxDiscount = Math.min(cartBasedMax, productBasedMax);
  
  return { maxDiscount, discountType };
}

// Determine discount amount based on negotiation round
function calculateOfferAmount(round: number, maxDiscount: number): number {
  // Round 1: 30-40% of max
  // Round 2: 50-60% of max
  // Round 3+: 80-100% of max (final offer)
  if (round <= 1) {
    return Math.floor(maxDiscount * 0.35);
  } else if (round === 2) {
    return Math.floor(maxDiscount * 0.55);
  } else {
    return Math.floor(maxDiscount * 0.9);
  }
}

const BARGAIN_SYSTEM_PROMPT = `You are "Bargain AI" - a friendly, Gen-Z style negotiator for XILAR, an exclusive Indian streetwear brand.

PERSONALITY:
- Friendly, witty, and playful
- Use Hinglish (mix of Hindi and English) naturally
- Like a cool friend who runs a shop
- Create urgency but never be pushy

CONVERSATION FLOW:
1. GREETING: Welcome them and acknowledge their cart
   Example: "Hey! 👋 Nice picks! Ready to negotiate? Tell me - kitna discount chahiye?"

2. FIRST COUNTER: When they ask for discount, offer the CURRENT_OFFER amount
   Example: "Hmm 🤔 That's steep yaar, but I can do ₹[CURRENT_OFFER] off for you!"

3. HAGGLING: If they push back, acknowledge and say you'll try harder
   Example: "Okay okay, let me see what I can do..."

4. FINAL OFFER: ONLY when GIVE_FINAL_COUPON is explicitly set to true, present the coupon:
   - Use the EXACT COUPON_CODE and DISCOUNT_AMOUNT from the context — do NOT change them
   - Create urgency about 5-minute expiry
   - The coupon will appear as a clickable button below the chat — just mention the discount
   Example: "Alright FINAL offer 🤝 ₹[DISCOUNT_AMOUNT] off! The code is ready below — use it before it expires in 5 mins! Jaldi karo!"

5. CLOSING: After giving coupon, wish them well
   Example: "Done! 🙌 You're a pro bargainer! That code expires in 5 mins so hurry!"

CRITICAL RULES — MUST FOLLOW:
- ABSOLUTELY NEVER invent, fabricate, or mention ANY coupon code unless GIVE_FINAL_COUPON is true
- If GIVE_FINAL_COUPON is false or not present, you have NO coupon code to give. Do not make one up.
- When GIVE_FINAL_COUPON is true, use EXACTLY the COUPON_CODE and DISCOUNT_AMOUNT from the context
- If the user asks for the code before the final round, say something like "Abhi nahi yaar, thoda aur convince karo!" or "Let me check with my manager..." — but NEVER give a code
- NEVER reveal the maximum discount limit
- Keep responses short (2-3 sentences max)
- Use emojis sparingly 👋🤝🔥
- Only discuss discount amounts, never say a code string (like BRG-XXXX) unless GIVE_FINAL_COUPON is true`;

export async function POST(req: Request) {
  try {
    const { messages, cartItems, cartTotal, negotiationRound = 0 } = await req.json();
    
    if (!cartItems || !cartTotal) {
      return new Response(
        JSON.stringify({ error: "Cart information required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    const userId = session?.user?.id;
    let isFirstTimeUser = true;
    
    // Check if returning user (has previous orders)
    if (userId) {
      const userData = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { ordersCount: true }
      });
      isFirstTimeUser = (userData?.ordersCount ?? 0) === 0;
    }
    
    // Fetch per-product max bargain discounts
    let productMaxDiscounts = 0;
    const productIds = cartItems
      .map((item: { id?: string; productId?: string }) => item.id || item.productId)
      .filter(Boolean);
    
    if (productIds.length > 0) {
      try {
        const productData = await db
          .select({ 
            id: products.id, 
            maxBargainDiscount: products.maxBargainDiscount 
          })
          .from(products)
          .where(inArray(products.id, productIds));
        
        // Sum up max discounts for items in cart (considering quantity)
        for (const item of cartItems) {
          const itemId = item.id || item.productId;
          const product = productData.find(p => p.id === itemId);
          if (product && product.maxBargainDiscount) {
            const maxDisc = parseFloat(product.maxBargainDiscount);
            const qty = item.quantity || 1;
            productMaxDiscounts += maxDisc * qty;
          }
        }
      } catch (err) {
        console.error("Failed to fetch product discounts:", err);
        // Continue with cart-based rules only
      }
    }
    
    // Calculate max discount based on rules AND per-product limits
    const { maxDiscount } = calculateMaxDiscount(cartTotal, isFirstTimeUser, productMaxDiscounts);
    
    // Calculate current offer based on negotiation round
    const currentOffer = calculateOfferAmount(negotiationRound, maxDiscount);
    
    // Determine if this should be the final offer (after 2+ rounds of user pushing back)
    // Only authenticated users can receive a persisted coupon code.
    const shouldGiveFinalCoupon = negotiationRound >= 3 && Boolean(userId);
    
    // Generate coupon code (we'll save it if final offer is given)
    const couponCode = generateCouponCode();
    const finalDiscountAmount = Math.floor(maxDiscount * 0.9); // 90% of max for final
    
    // Build cart context
    const cartItemsList = cartItems.map((item: { name: string; quantity: number; price: number }) => 
      `- ${item.name} x${item.quantity} @ ₹${item.price}`
    ).join("\n");

    const contextMessage = shouldGiveFinalCoupon
      ? `
CURRENT CART:
${cartItemsList}
Cart Total: ₹${cartTotal}

NEGOTIATION STATE:
- Round: ${negotiationRound}
- GIVE_FINAL_COUPON: true
- COUPON_CODE: ${couponCode}
- DISCOUNT_AMOUNT: ₹${finalDiscountAmount}

IMPORTANT: This is the FINAL round. Present the coupon code ${couponCode} for ₹${finalDiscountAmount} off enthusiastically. The code button will appear in the UI below your message. Mention the 5-minute expiry.
`
      : `
CURRENT CART:
${cartItemsList}
Cart Total: ₹${cartTotal}

NEGOTIATION STATE:
- Round: ${negotiationRound}
- CURRENT_OFFER: ₹${currentOffer}
- GIVE_FINAL_COUPON: false

IMPORTANT: You are still negotiating. Offer ₹${currentOffer} off. NO coupon code has been generated yet. DO NOT mention any coupon code, DO NOT invent any code. If user pushes for a code, tell them to keep negotiating. If they are not logged in, ask them to sign in to unlock final coupon generation.
`;

    // If giving final coupon, save to database BEFORE streaming
    let couponSaved = false;
    if (shouldGiveFinalCoupon && userId) {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      try {
        // Save coupon to database
        await db.insert(coupons).values({
          code: couponCode,
          discountType: "fixed",
          discountValue: finalDiscountAmount.toString(),
          maxUses: 1,
          usedCount: 0,
          userId: userId,
          isBargainGenerated: true,
          expiresAt: expiresAt,
          validFrom: new Date(),
          validUntil: expiresAt,
          isActive: true,
        });
        
        // Save bargain session
        await db.insert(bargainSessions).values({
          userId: userId,
          couponCode: couponCode,
          cartValue: cartTotal.toString(),
          discountAmount: finalDiscountAmount.toString(),
          used: false,
          expiresAt: expiresAt,
        });
        
        couponSaved = true;
      } catch (dbError) {
        console.error("Failed to save coupon:", dbError);
      }
    }

    const result = streamText({
      model: bargainModel,
      system: BARGAIN_SYSTEM_PROMPT + contextMessage,
      messages,
      temperature: 0.8,
    });

    // Create response with custom headers for coupon info
    const response = result.toTextStreamResponse();
    
    // Add coupon info to headers so client can track it
    if (shouldGiveFinalCoupon && couponSaved) {
      response.headers.set("X-Coupon-Code", couponCode);
      response.headers.set("X-Coupon-Discount", finalDiscountAmount.toString());
      response.headers.set("X-Coupon-Expires", (Date.now() + 5 * 60 * 1000).toString());
    }
    
    return response;
  } catch (error) {
    console.error("Bargain AI error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process bargain request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
