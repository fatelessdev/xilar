import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/shop/men`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/shop/women`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/shop/accessories`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/collections/essentials`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/collections/summer-25`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/new`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/policies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/policies/exchange`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/policies/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/policies/refunds`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/policies/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productRows = await db
    .select({ id: products.id, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.isActive, true));

  const productRoutes: MetadataRoute.Sitemap = productRows.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
