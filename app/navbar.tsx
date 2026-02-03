"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, ShoppingBag, Heart, Menu, X, User, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useTheme } from "@/lib/theme-context"

export function Navbar() {
    const router = useRouter()
    const { totalItems, setIsOpen } = useCart()
    const { items: wishlistItems } = useWishlist()
    const { theme, toggleTheme, mounted } = useTheme()
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearch, setShowSearch] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
            setShowSearch(false)
            setSearchQuery("")
        }
    }

    return (
        <>
            {/* Announcement Bar */}
            <div className="announcement-bar">
                <span className="highlight">FREE SHIPPING</span> FOR ORDERS OVER ₹2,000
            </div>

            <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
                <div className="flex h-14 md:h-16 items-center px-4 md:px-6">
                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden mr-2"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                    >
                        {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>

                    {/* Questions - Desktop */}
                    <div className="hidden lg:flex items-center text-xs tracking-wide text-muted-foreground">
                        QUESTIONS? <span className="ml-2 text-foreground">+91 8090644991</span>
                    </div>

                    {/* Logo - Centered */}
                    {/* <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2">
                        <span className="text-xl md:text-2xl font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">XILAR</span>
                    </Link> */}

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-medium ml-auto mr-8 xl:mr-16">
                        <Link href="/shop/men" className="tracking-wider uppercase text-xs hover:text-gold transition-colors">
                            For Him
                        </Link>
                        <Link href="/shop/women" className="tracking-wider uppercase text-xs hover:text-gold transition-colors">
                            For Her
                        </Link>
                        <Link href="/new" className="tracking-wider uppercase text-xs hover:text-gold transition-colors">
                            New Drop
                        </Link>
                        <Link href="/collections" className="tracking-wider uppercase text-xs hover:text-gold transition-colors">
                            Collections
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="ml-auto flex items-center space-x-0.5 md:space-x-1">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={toggleTheme}
                            title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
                        >
                            {mounted ? (
                                theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        {/* Search */}
                        {showSearch ? (
                            <form onSubmit={handleSearch} className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="h-9 w-28 md:w-48 px-3 bg-secondary/50 border border-input rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <Button type="submit" variant="ghost" size="icon" className="h-9 w-9">
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowSearch(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </form>
                        ) : (
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowSearch(true)}>
                                <Search className="h-4 w-4" />
                                <span className="sr-only">Search</span>
                            </Button>
                        )}

                        {/* Account - Hidden on mobile */}
                        <Link href="/account" className="hidden sm:block">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <User className="h-4 w-4" />
                                <span className="sr-only">Account</span>
                            </Button>
                        </Link>

                        {/* Wishlist */}
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                                <Heart className="h-4 w-4" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-black text-xs flex items-center justify-center font-medium">
                                        {wishlistItems.length}
                                    </span>
                                )}
                                <span className="sr-only">Wishlist</span>
                            </Button>
                        </Link>

                        {/* Cart */}
                        <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => setIsOpen(true)}>
                            <ShoppingBag className="h-4 w-4" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-black text-xs flex items-center justify-center font-medium">
                                    {totalItems}
                                </span>
                            )}
                            <span className="sr-only">Cart</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-border py-4 px-4 space-y-1 bg-background">
                        <Link href="/shop" className="block py-3 text-sm font-medium tracking-wider uppercase border-b border-border" onClick={() => setShowMobileMenu(false)}>
                            Shop All
                        </Link>
                        <Link href="/shop/men" className="block py-3 text-sm font-medium tracking-wider uppercase border-b border-border" onClick={() => setShowMobileMenu(false)}>
                            For Him
                        </Link>
                        <Link href="/shop/women" className="block py-3 text-sm font-medium tracking-wider uppercase border-b border-border" onClick={() => setShowMobileMenu(false)}>
                            For Her
                        </Link>
                        <Link href="/new" className="block py-3 text-sm font-medium tracking-wider uppercase border-b border-border" onClick={() => setShowMobileMenu(false)}>
                            New Drop
                        </Link>
                        <Link href="/collections" className="block py-3 text-sm font-medium tracking-wider uppercase border-b border-border" onClick={() => setShowMobileMenu(false)}>
                            Collections
                        </Link>
                        <Link href="/account" className="block py-3 text-sm font-medium tracking-wider uppercase text-muted-foreground" onClick={() => setShowMobileMenu(false)}>
                            Account
                        </Link>
                        <Link href="/about" className="block py-3 text-sm font-medium tracking-wider uppercase text-muted-foreground" onClick={() => setShowMobileMenu(false)}>
                            About
                        </Link>
                    </div>
                )}
            </header>
        </>
    )
}
