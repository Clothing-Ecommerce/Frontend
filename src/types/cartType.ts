export interface CartItem {
  id: number;
  variantId: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string | null;
  };
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  listPrice: number | null;
  inStock: boolean;
  maxQuantity: number;
  totalPrice: number;
}

export interface CartSummary {
  subtotal: number;
  savings: number;
  promoDiscount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}