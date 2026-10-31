// Single source of truth for product categories. The DB enum, admin forms,
// shop filters, SEO pages, and try-on rules all derive from this list, so a
// new category is added here (plus a migration) and TypeScript flags every
// Record<ProductCategory, ...> that still needs an entry.
export const PRODUCT_CATEGORIES = [
  "tshirt",
  "cargo",
  "jogger",
  "shirt",
  "jeans",
  "hoodie",
  "jacket",
  "shacket",
  "sweatshirt",
  "trousers",
  "shorts",
  "accessory",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, { singular: string; plural: string }> = {
  tshirt: { singular: "T-Shirt", plural: "T-Shirts" },
  cargo: { singular: "Cargo", plural: "Cargos" },
  jogger: { singular: "Jogger", plural: "Joggers" },
  shirt: { singular: "Shirt", plural: "Shirts" },
  jeans: { singular: "Jeans", plural: "Jeans" },
  hoodie: { singular: "Hoodie", plural: "Hoodies" },
  jacket: { singular: "Jacket", plural: "Jackets" },
  shacket: { singular: "Shacket", plural: "Shackets" },
  sweatshirt: { singular: "Sweatshirt", plural: "Sweatshirts" },
  trousers: { singular: "Trousers", plural: "Trousers" },
  shorts: { singular: "Shorts", plural: "Shorts" },
  accessory: { singular: "Accessory", plural: "Accessories" },
}

// Bottoms sized by waist (26–34) instead of S–XXL.
export const WAIST_SIZED_CATEGORIES: readonly ProductCategory[] = ["jogger", "jeans", "cargo", "shorts", "trousers"]

// Categories merchandised together as the Winter Collection.
export const WINTER_CATEGORIES: readonly ProductCategory[] = ["jacket", "hoodie", "shacket", "sweatshirt", "trousers"]

export function isProductCategory(value: unknown): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory)
}

export function isWaistSizedCategory(category: string) {
  return WAIST_SIZED_CATEGORIES.includes(category as ProductCategory)
}
