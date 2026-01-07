import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center border-b border-white/10">
            {/* Background Image Placeholder - In production, this would be a high-res image or video */}
            <div className="absolute inset-0 bg-neutral-900 z-0">
                <div className="absolute inset-0 bg-[url('/clothes/clothes-men1.jpeg')] bg-cover bg-center opacity-60 grayscale hover:grayscale-0 transition-all duration-1000" />
                <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
            </div>

            <div className="relative z-10 text-center space-y-6 max-w-4xl px-6">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white uppercase drop-shadow-xl">
                    Streetwise <br className="hidden md:block" /> Minimalism
                </h1>
                <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-light tracking-wide">
                    Elevate your everyday with the XILAR Essentials Collection. <br /> Bold. Luxury. Affordable.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                    <Link href="/shop/men">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-none border-white text-black transition-all">
                            Shop Men
                        </Button>
                    </Link>
                    <Link href="/shop/women">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-none border-white/20 hover:border-white bg-transparent text-white backdrop-blur-sm transition-all">
                            Shop Women
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
