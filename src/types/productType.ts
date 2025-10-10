// src/types/productType.ts — patched to align with new backend responses

// ====== Basic catalog entities ======
export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string | null;
}

export interface ProductImage {
  id: number;
  productId?: number;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface Size {
  id: number;
  name: string;
  note?: string | null;
}

export interface Color {
  id: number;
  name: string;
  hex?: string | null;
}

// ====== Pricing types (Decimal as string from API) ======
export interface Price {
  id: number;
  variantId: number;
  type: "LIST" | "SALE";
  amount: string;           // Prisma Decimal -> string
  currency: string;
  startAt?: string | null;
  endAt?: string | null;
  cost?: string | null;     // Decimal -> string
  isTaxInclusive: boolean;
  taxRate?: string | null;  // Decimal -> string (e.g. "10.00")
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ====== Product & Variant (detail payload) ======
export interface ProductVariant {
  id: number;
  productId: number;
  sizeId?: number | null;
  colorId?: number | null;
  sku?: string | null;
  price?: number | null; // FE converts string -> number when mapping response
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // relations
  size?: Size | null;
  color?: Color | null;
  prices?: Price[];
}

export interface Product {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  basePrice: number; // FE converts string -> number when mapping response
  categoryId: number;
  brandId?: number | null;
  features?: Record<string, unknown> | null;
  specifications?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;

  // relations (detail endpoint includes these)
  category?: { id: number; name: string };
  brand?: { id: number; name: string } | null;
  images: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface Review {
  id: number;
  productId: number;
  userId?: number;
  orderItemId?: number;
  rating: number;
  title?: string | null;
  content?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  media?: {
    id: number;
    type: "IMAGE" | "VIDEO";
    url: string;
    thumbnailUrl: string | null;
    width: number | null;
    height: number | null;
    durationSeconds: number | null;
    originalFileName: string | null;
    fileSize: number | null;
    createdAt: string;
  }[];
}


// ====== List payload (GET /products) ======
export interface ProductCard {
  id: number;
  name: string;
  slug?: string | null;
  category: { id: number; name: string };
  brand: { id: number; name: string } | null;
  image?: { id: number; url: string; alt?: string | null } | null;
  effectivePrice: number;
  compareAtPrice?: number | null;
}

export interface ProductListResponse {
  products: ProductCard[];
  total: number;
  totalPrePrice?: number;
  page: number;
  pageSize: number;
}

// ====== UI helper types ======
export interface ColorOption {
  name: string;
  value: string; // hex color
}

// export interface CategoryOption {
//   id: string;
//   name: string;
//   count: number;
// }
export interface CategoryOption {
  slug: string;          // dùng slug để lọc
  name: string;
  count: number;
}

export interface BrandOption {
  id: string | number;
  name: string;
}

export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  // productCount: number;
  children: CategoryNode[];
}