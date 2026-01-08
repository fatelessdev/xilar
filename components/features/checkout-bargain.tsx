"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send, Copy, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutBargainProps {
    totalPrice: number
    onApplyCoupon: (discount: number, code: string) => void
    appliedCoupon: { code: string; discount: number } | null
}

const DISCOUNT_OPTIONS = [50, 100, 150, 200]

function generateCouponCode(discount: number): string {
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `BARGAIN${discount}${suffix}`
}

export function CheckoutBargain({ totalPrice, onApplyCoupon, appliedCoupon }: CheckoutBargainProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showPrompt, setShowPrompt] = useState(true)
    const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([])
    const [couponGenerated, setCouponGenerated] = useState<{ code: string; discount: number } | null>(null)
    const [copied, setCopied] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const handleOpenBargain = () => {
        setShowPrompt(false)
        setIsOpen(true)

        // Initial AI greeting
        setIsTyping(true)
        setTimeout(() => {
            setMessages([
                {
                    role: "ai",
                    text: "Hey there! 👋 Looking for a deal today? I can hook you up with a special discount coupon!"
                }
            ])
            setIsTyping(false)

            // Generate coupon after greeting
            setTimeout(() => {
                generateCoupon()
            }, 1500)
        }, 800)
    }

    const generateCoupon = () => {
        setIsTyping(true)
        setTimeout(() => {
            // Calculate max discount based on total (up to ₹200, but not more than 20% of total)
            const maxDiscount = Math.min(200, Math.floor(totalPrice * 0.2))
            const validOptions = DISCOUNT_OPTIONS.filter(d => d <= maxDiscount)
            const discount = validOptions.length > 0
                ? validOptions[Math.floor(Math.random() * validOptions.length)]
                : DISCOUNT_OPTIONS[0]

            const code = generateCouponCode(discount)
            setCouponGenerated({ code, discount })

            setMessages(prev => [...prev, {
                role: "ai",
                text: `🎉 You got lucky! Here's your exclusive discount:\n\n**₹${discount} OFF**\n\nUse code: **${code}**\n\nCopy it and apply to your order!`
            }])
            setIsTyping(false)
        }, 1200)
    }

    const handleCopyCode = async () => {
        if (couponGenerated) {
            await navigator.clipboard.writeText(couponGenerated.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleApplyCoupon = () => {
        if (couponGenerated && !appliedCoupon) {
            onApplyCoupon(couponGenerated.discount, couponGenerated.code)
            setMessages(prev => [...prev, {
                role: "ai",
                text: `✅ Awesome! Coupon **${couponGenerated.code}** applied! You're saving ₹${couponGenerated.discount} on this order. Enjoy your purchase! 🛍️`
            }])
        }
    }

    const handleSkip = () => {
        setShowPrompt(false)
    }

    // If coupon already applied, don't show bargain option
    if (appliedCoupon && !isOpen) {
        return (
            <div className="p-4 bg-green-500/10 border border-green-500/30 mt-4">
                <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-600 dark:text-green-400">
                        Coupon {appliedCoupon.code} applied! Saving ₹{appliedCoupon.discount}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Bargain Prompt */}
            {showPrompt && !appliedCoupon && (
                <div className="mt-6 p-4 bg-gold/10 border border-gold/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-gold" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Want a bargain? 💰</p>
                                <p className="text-xs text-muted-foreground">Chat with us for an exclusive discount!</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-none"
                                onClick={handleSkip}
                            >
                                Skip
                            </Button>
                            <Button
                                size="sm"
                                className="text-xs rounded-none bg-gold text-black hover:bg-gold-dark"
                                onClick={handleOpenBargain}
                            >
                                Yes! 🎉
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bargain Chatbot Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-background border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="p-4 bg-gold text-black flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                <span className="font-bold tracking-tight uppercase text-sm">Bargain Bot</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-black hover:bg-black/10"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Chat Area */}
                        <div className="h-72 p-4 overflow-y-auto space-y-4 bg-secondary/20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[85%] p-3 text-sm",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card border border-border"
                                    )}>
                                        <div className="whitespace-pre-wrap">
                                            {msg.text.split('**').map((part, i) =>
                                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border p-3 text-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {couponGenerated && (
                            <div className="p-4 border-t bg-background space-y-3">
                                {/* Coupon Display */}
                                <div className="flex items-center gap-2 p-3 bg-gold/10 border border-gold/30">
                                    <code className="flex-1 font-mono font-bold text-lg text-center">
                                        {couponGenerated.code}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-none"
                                        onClick={handleCopyCode}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>

                                {/* Apply Button */}
                                {!appliedCoupon ? (
                                    <Button
                                        className="w-full h-12 rounded-none uppercase tracking-widest bg-gold text-black hover:bg-gold-dark"
                                        onClick={handleApplyCoupon}
                                    >
                                        Apply ₹{couponGenerated.discount} Discount
                                    </Button>
                                ) : (
                                    <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium py-2">
                                        ✅ Coupon Applied Successfully!
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    className="w-full text-xs text-muted-foreground"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Continue to Checkout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
