import { Hero } from "@/components/features/hero";
import { ProductGrid } from "@/components/features/product-grid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <ProductGrid title="Best Sellers" />
      <ProductGrid title="New Arrivals" />
    </div>
  );
}
