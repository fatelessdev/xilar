"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { Check, CreditCard, Truck, MapPin } from "lucide-react"
import { CheckoutBargain } from "@/components/features/checkout-bargain"

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart()
    const [step, setStep] = useState(1)
    const [orderPlaced, setOrderPlaced] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

    const handleApplyCoupon = (discount: number, code: string) => {
        setAppliedCoupon({ code, discount })
    }

    const handlePlaceOrder = () => {
        setOrderPlaced(true)
        clearCart()
    }

    // Calculate final total with discount
    const shippingCost = totalPrice >= 2000 ? 0 : 99
    const discount = appliedCoupon?.discount || 0
    const finalTotal = totalPrice + shippingCost - discount

    if (items.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <Link href="/shop">
                        <Button variant="outline" className="rounded-none">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md px-6">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <Check className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Order Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Thank you for shopping with XILAR. Your order has been placed and will be delivered soon.
                    </p>
                    {appliedCoupon && (
                        <p className="text-sm text-gold">You saved ₹{appliedCoupon.discount} with coupon {appliedCoupon.code}!</p>
                    )}
                    <p className="text-sm text-muted-foreground">Order ID: #XIL{Date.now().toString().slice(-8)}</p>
                    <Link href="/shop">
                        <Button className="rounded-none h-12 px-8 uppercase tracking-widest">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="px-6 py-8 border-b border-border">
                <h1 className="text-3xl font-black tracking-tighter uppercase">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Form Section */}
                <div className="p-6 lg:p-12 space-y-8 border-r border-border">
                    {/* Progress */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className={step >= 1 ? "text-foreground" : "text-muted-foreground"}>1. Shipping</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={step >= 2 ? "text-foreground" : "text-muted-foreground"}>2. Payment</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={step >= 3 ? "text-foreground" : "text-muted-foreground"}>3. Review</span>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5" />
                                <h2 className="text-xl font-bold uppercase tracking-tight">Shipping Address</h2>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <textarea
                                    placeholder="Address"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <input
                                        type="text"
                                        placeholder="PIN Code"
                                        className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                            </div>
                            <Button className="w-full h-14 rounded-none uppercase tracking-widest" onClick={() => setStep(2)}>
                                Continue to Payment
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5" />
                                <h2 className="text-xl font-bold uppercase tracking-tight">Payment Method</h2>
                            </div>
                            <div className="space-y-3">
                                {["UPI", "Credit/Debit Card", "Net Banking", "Cash on Delivery"].map((method) => (
                                    <label
                                        key={method}
                                        className="flex items-center gap-3 p-4 border border-input hover:border-foreground cursor-pointer transition-colors"
                                    >
                                        <input type="radio" name="payment" className="accent-foreground" />
                                        <span>{method}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Coupon Code Input */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <h3 className="text-sm font-bold uppercase tracking-wide">Have a coupon code?</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="couponInput"
                                        placeholder="Enter coupon code"
                                        className="flex-1 h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                                    />
                                    <Button
                                        variant="outline"
                                        className="h-12 px-6 rounded-none uppercase tracking-wide"
                                        onClick={() => {
                                            const input = document.getElementById("couponInput") as HTMLInputElement
                                            const code = input?.value?.trim().toUpperCase()
                                            if (!code) return

                                            // Validate BARGAIN codes (BARGAIN + amount + 4 chars)
                                            const bargainMatch = code.match(/^BARGAIN(\d+)[A-Z]{4}$/)
                                            if (bargainMatch) {
                                                const discountAmount = parseInt(bargainMatch[1])
                                                if ([50, 100, 150, 200].includes(discountAmount)) {
                                                    handleApplyCoupon(discountAmount, code)
                                                    input.value = ""
                                                } else {
                                                    alert("Invalid coupon code")
                                                }
                                            } else {
                                                alert("Invalid coupon code. Try getting one from the bargain bot!")
                                            }
                                        }}
                                        disabled={!!appliedCoupon}
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30">
                                        <span className="text-sm text-green-600 dark:text-green-400">
                                            ✓ Coupon {appliedCoupon.code} applied! You save ₹{appliedCoupon.discount}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                            onClick={() => setAppliedCoupon(null)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 h-14 rounded-none uppercase" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button className="flex-1 h-14 rounded-none uppercase tracking-widest" onClick={() => setStep(3)}>
                                    Review Order
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5" />
                                <h2 className="text-xl font-bold uppercase tracking-tight">Review Order</h2>
                            </div>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-border pb-4">
                                        <div
                                            className="w-16 h-20 bg-cover bg-center bg-neutral-900 flex-shrink-0"
                                            style={{ backgroundImage: `url(${item.image})` }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                                            <p className="font-semibold">{item.displayPrice}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 h-14 rounded-none uppercase" onClick={() => setStep(2)}>
                                    Back
                                </Button>
                                <Button className="flex-1 h-14 rounded-none uppercase tracking-widest" onClick={handlePlaceOrder}>
                                    Place Order
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="p-6 lg:p-12 bg-secondary/20">
                    <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                                <span>{item.name} ({item.size}) × {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                            </div>
                        ))}
                        <hr className="border-border" />
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>-₹{appliedCoupon.discount}</span>
                            </div>
                        )}
                        <hr className="border-border" />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>₹{Math.max(0, finalTotal).toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    {/* Bargain Chatbot */}
                    <CheckoutBargain
                        totalPrice={totalPrice}
                        onApplyCoupon={handleApplyCoupon}
                        appliedCoupon={appliedCoupon}
                    />
                </div>
            </div>
        </div>
    )
}
