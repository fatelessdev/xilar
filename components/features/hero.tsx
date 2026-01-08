import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

export function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 bg-neutral-900 z-0">
                <div className="absolute inset-0 bg-[url('/clothes/clothes-men1.jpeg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-black/50" /> {/* Overlay */}
            </div>

            <div className="relative z-10 text-center space-y-8 max-w-5xl px-6">
                {/* Brand Name - YoungLA Style */}
                <p className="text-gold text-lg md:text-xl tracking-[0.5em] uppercase font-medium">
                    XILAR
                </p>

                {/* Main Tagline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.9]">
                    THE FUTURE WEAR
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light tracking-wide">
                    Elevate your everyday with bold streetwear that defines the next generation.
                </p>

                {/* CTA Buttons */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <Link href="/shop/men">
                        <Button size="lg" className="h-14 px-10 text-sm tracking-[0.2em] uppercase rounded-none bg-white text-black hover:bg-gold hover:text-black transition-all font-medium">
                            Shop Men
                        </Button>
                    </Link>
                    <Link href="/shop/women">
                        <Button size="lg" variant="outline" className="h-14 px-10 text-sm tracking-[0.2em] uppercase rounded-none border-white/40 hover:border-gold bg-transparent text-white hover:text-gold transition-all font-medium">
                            Shop Women
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <ChevronDown className="h-8 w-8 text-white/60" />
            </div>
        </section>
    )
}
