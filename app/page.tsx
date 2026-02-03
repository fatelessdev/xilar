import type { Metadata } from "next";
import { Hero } from "@/components/features/hero";
import { ProductGrid } from "@/components/features/product-grid";

export const metadata: Metadata = {
  title: "Home",
  description: "Shop next-gen streetwear essentials, premium basics, and bold drops from XILAR.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "XILAR | The Future Wear",
    description: "Shop next-gen streetwear essentials, premium basics, and bold drops from XILAR.",
    url: "/",
  },
};

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "XILAR",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "XILAR",
        url: baseUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/shop?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ProductGrid title="Best Sellers" />
      <ProductGrid title="New Arrivals" />
    </div>
  );
}
