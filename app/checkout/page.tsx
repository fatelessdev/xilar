"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { Check, CreditCard, Truck, MapPin, Loader2, AlertCircle } from "lucide-react"
import { CheckoutBargain } from "@/components/features/checkout-bargain"

interface ShippingAddress {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
}

type PaymentMethod = "upi" | "card" | "netbanking" | "cod"

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart()
    const [step, setStep] = useState(1)
    const [orderPlaced, setOrderPlaced] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi")
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [couponInput, setCouponInput] = useState("")
    const [couponError, setCouponError] = useState<string | null>(null)
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
    
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    })

    const handleApplyCoupon = (discount: number, code: string) => {
        setAppliedCoupon({ code, discount })
        setCouponError(null)
        setCouponInput("")
    }

    const handleValidateCoupon = async () => {
        const code = couponInput.trim().toUpperCase()
        if (!code) return

        setIsValidatingCoupon(true)
        setCouponError(null)

        try {
            const response = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, orderTotal: totalPrice })
            })

            const result = await response.json()

            if (result.valid) {
                handleApplyCoupon(result.discount, code)
            } else {
                setCouponError(result.error || "Invalid coupon code")
            }
        } catch {
            setCouponError("Failed to validate coupon. Please try again.")
        } finally {
            setIsValidatingCoupon(false)
        }
    }

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true)

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.id,
                        productName: item.name,
                        productImage: item.image,
                        size: item.size,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.price * item.quantity
                    })),
                    subtotal: totalPrice,
                    shippingCost,
                    discount: appliedCoupon?.discount || 0,
                    couponCode: appliedCoupon?.code,
                    codFee: paymentMethod === "cod" ? 50 : 0,
                    total: finalTotal,
                    shippingAddress,
                    paymentMethod
                })
            })

            const result = await response.json()

            if (result.success) {
                setOrderId(result.orderId)
                setOrderPlaced(true)
                clearCart()
            } else {
                alert(result.error || "Failed to place order. Please try again.")
            }
        } catch {
            alert("Failed to place order. Please try again.")
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const isAddressValid = () => {
        return (
            shippingAddress.name.trim() &&
            shippingAddress.email.trim() &&
            shippingAddress.phone.trim() &&
            shippingAddress.address.trim() &&
            shippingAddress.city.trim() &&
            shippingAddress.pincode.trim()
        )
    }

    // Calculate pricing: free shipping above ₹999, otherwise ₹49
    const shippingCost = totalPrice >= 999 ? 0 : 49
    const codFee = paymentMethod === "cod" ? 50 : 0
    const discount = appliedCoupon?.discount || 0
    const finalTotal = totalPrice + shippingCost + codFee - discount

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
                    {orderId && (
                        <p className="text-sm text-muted-foreground">Order ID: #{orderId.slice(0, 8).toUpperCase()}</p>
                    )}
                    {paymentMethod === "cod" && (
                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-sm">
                            <p className="font-medium text-orange-600 dark:text-orange-400">Cash on Delivery</p>
                            <p className="text-muted-foreground mt-1">
                                Please keep ₹{Math.max(0, finalTotal).toLocaleString("en-IN")} ready at delivery.
                            </p>
                        </div>
                    )}
                    <Link href="/orders">
                        <Button className="rounded-none h-12 px-8 uppercase tracking-widest">
                            View Orders
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
                                    placeholder="Full Name *"
                                    value={shippingAddress.name}
                                    onChange={(e) => setShippingAddress(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={shippingAddress.email}
                                    onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number *"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <textarea
                                    placeholder="Address *"
                                    rows={3}
                                    value={shippingAddress.address}
                                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City *"
                                        value={shippingAddress.city}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={shippingAddress.state}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                                        className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <input
                                        type="text"
                                        placeholder="PIN Code *"
                                        value={shippingAddress.pincode}
                                        onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                                        className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                            </div>
                            <Button 
                                className="w-full h-14 rounded-none uppercase tracking-widest" 
                                onClick={() => setStep(2)}
                                disabled={!isAddressValid()}
                            >
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
                                {[
                                    { value: "upi", label: "UPI" },
                                    { value: "card", label: "Credit/Debit Card" },
                                    { value: "netbanking", label: "Net Banking" },
                                    { value: "cod", label: "Cash on Delivery (+₹50)" }
                                ].map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                                            paymentMethod === method.value
                                                ? "border-foreground bg-secondary/30"
                                                : "border-input hover:border-foreground"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.value}
                                            checked={paymentMethod === method.value}
                                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                            className="accent-foreground"
                                        />
                                        <span>{method.label}</span>
                                    </label>
                                ))}
                            </div>

                            {paymentMethod === "cod" && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-sm">
                                    <p className="font-medium text-orange-600 dark:text-orange-400">COD Fee: ₹50</p>
                                    <p className="text-muted-foreground mt-1">
                                        A ₹50 cash handling fee will be added to your order.
                                    </p>
                                </div>
                            )}

                            {/* Coupon Code Input */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <h3 className="text-sm font-bold uppercase tracking-wide">Have a coupon code?</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Enter coupon code"
                                        className="flex-1 h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                                        disabled={!!appliedCoupon || isValidatingCoupon}
                                    />
                                    <Button
                                        variant="outline"
                                        className="h-12 px-6 rounded-none uppercase tracking-wide"
                                        onClick={handleValidateCoupon}
                                        disabled={!!appliedCoupon || isValidatingCoupon || !couponInput.trim()}
                                    >
                                        {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                    </Button>
                                </div>
                                {couponError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {couponError}
                                    </div>
                                )}
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
                            
                            {/* Shipping Address Summary */}
                            <div className="p-4 bg-secondary/20 border border-border space-y-1">
                                <p className="font-medium">{shippingAddress.name}</p>
                                <p className="text-sm text-muted-foreground">{shippingAddress.address}</p>
                                <p className="text-sm text-muted-foreground">
                                    {shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ""} - {shippingAddress.pincode}
                                </p>
                                <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
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
                                <Button 
                                    className="flex-1 h-14 rounded-none uppercase tracking-widest" 
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        "Place Order"
                                    )}
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
                            <span>Shipping {totalPrice >= 999 && <span className="text-green-600 dark:text-green-400">(Free above ₹999)</span>}</span>
                            <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
                        </div>
                        {paymentMethod === "cod" && (
                            <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                                <span>COD Fee</span>
                                <span>+₹{codFee}</span>
                            </div>
                        )}
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
                        cartItems={items}
                        totalPrice={totalPrice}
                        onApplyCoupon={handleApplyCoupon}
                        appliedCoupon={appliedCoupon}
                    />
                </div>
            </div>
        </div>
    )
}
