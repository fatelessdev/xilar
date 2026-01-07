"use client"

import { Button } from "@/components/ui/button"
import { User, Package, Heart, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AccountPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showLogin, setShowLogin] = useState(true)

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-tighter uppercase">
                            {showLogin ? "Welcome Back" : "Join XILAR"}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {showLogin ? "Sign in to your account" : "Create an account to get started"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {!showLogin && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {!showLogin && (
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="w-full h-12 px-4 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        )}
                        <Button
                            className="w-full h-14 rounded-none uppercase tracking-widest"
                            onClick={() => setIsLoggedIn(true)}
                        >
                            {showLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </div>

                    <div className="text-center">
                        <button
                            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                            onClick={() => setShowLogin(!showLogin)}
                        >
                            {showLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="px-6 py-12 border-b border-white/10">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase flex items-center gap-4">
                    <User className="h-10 w-10" /> My Account
                </h1>
            </div>

            <div className="p-6 max-w-2xl">
                <div className="space-y-4">
                    <Link href="/orders" className="flex items-center gap-4 p-4 border border-white/10 hover:border-foreground transition-colors">
                        <Package className="h-6 w-6" />
                        <div>
                            <h3 className="font-medium">My Orders</h3>
                            <p className="text-sm text-muted-foreground">Track, return, or buy things again</p>
                        </div>
                    </Link>

                    <Link href="/wishlist" className="flex items-center gap-4 p-4 border border-white/10 hover:border-foreground transition-colors">
                        <Heart className="h-6 w-6" />
                        <div>
                            <h3 className="font-medium">Wishlist</h3>
                            <p className="text-sm text-muted-foreground">Your saved items</p>
                        </div>
                    </Link>

                    <button
                        className="flex items-center gap-4 p-4 border border-white/10 hover:border-destructive transition-colors w-full text-left"
                        onClick={() => setIsLoggedIn(false)}
                    >
                        <LogOut className="h-6 w-6" />
                        <div>
                            <h3 className="font-medium">Sign Out</h3>
                            <p className="text-sm text-muted-foreground">Log out of your account</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
