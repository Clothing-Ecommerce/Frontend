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
  promoDiscount: number; // tổng số tiền giảm do mã (nếu có)
  shipping: number;
  tax: number;
  total: number;
}

/** Thông tin mã đang áp dụng (persist trong giỏ) do BE trả về */
export interface AppliedPromo {
  code: string;           // mã (ví dụ: SAVE10)
  freeShipping: boolean;  // true nếu mã kích hoạt freeship
  appliedValue: number;   // số tiền đã trừ vào subtotal (có thể = 0 nếu mã chỉ freeship)
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
  appliedPromo?: AppliedPromo; // <-- thêm field này để FE hiển thị chip/“FREE (promo)”
}

export interface VariantOption {
  id: number;
  colorName: string | null;
  colorHex?: string | null;
  sizeName: string | null;
  stock: number;
  isActive: boolean;
};

export interface AvailableCoupon {
  code: string;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderValue: number;
  endsAt?: string | null;
  freeShipping: boolean;
  isEligible: boolean;   // FE dùng để disable lựa chọn
  missingAmount: number; // Số tiền còn thiếu để đủ điều kiện
}