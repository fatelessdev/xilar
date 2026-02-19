// xilar.in/src/components/Schema.tsx
export default function Schema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "XILAR",
    "url": "https://xilar.in",
    "creator": {
      "@type": "Person",
      "name": "Aditya Singh",
      "alternateName": ["fatelessdev", "fate1ess"], 
      "url": "https://fateless.dev", // <--- THE BRIDGE
      "sameAs": [
        "https://github.com/fatelessdev",
        "https://x.com/fate1ess"
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}