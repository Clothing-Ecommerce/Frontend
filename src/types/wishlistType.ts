export interface WishlistProductImage {
  id: number;
  url: string;
  alt: string | null;
}

export interface WishlistBrand {
  id: number;
  name: string;
}

export interface WishlistCategory {
  id: number;
  name: string;
}

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  brand: WishlistBrand | null;
  category: WishlistCategory | null;
  basePrice: number;
  effectivePrice: number;
  image: WishlistProductImage | null;
  inStock: boolean;
}

export interface WishlistItem {
  id: number;
  productId: number;
  addedAt: string;
  product: WishlistProduct;
}

export interface WishlistItemsResponse {
  items: WishlistItem[];
}

export interface WishlistMutationResponse {
  item: WishlistItem;
  isNew: boolean;
}