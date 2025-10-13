type OrderStatusCode =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "FULFILLING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItemSummary {
  id: number;
  variantId: number;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
  color: string | null;
  size: string | null;
  taxAmount: number;
  reviewed?: boolean;
  canReview?: boolean;
}

export type ReviewMediaType = "IMAGE" | "VIDEO";

export interface OrderItemReviewMedia {
  id: number;
  type: ReviewMediaType;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  originalFileName: string | null;
  fileSize: number | null;
  createdAt: string;
}

export interface OrderItemReview {
  id: number;
  productId: number;
  orderItemId: number;
  userId?: number;
  rating: number;
  content: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  media: OrderItemReviewMedia[];
  variant?: {
    id: number;
    sku: string | null;
    size: { id: number; name: string; note: string | null } | null;
    color: { id: number; name: string; hex: string | null } | null;
  } | null;
}


export interface OrderTotalsSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderSummaryResponse {
  id: number;
  code: string;
  status: OrderStatusCode;
  statusLabel: string;
  placedAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  canCancel: boolean;
  canReorder: boolean;
  totals: OrderTotalsSummary;
  items: OrderItemSummary[];
}

export interface OrderShippingAddress {
  id: number;
  label: string | null;
  recipient: string;
  phone: string | null;
  company: string | null;
  addressLine: string;
  houseNumber: string | null;
  street: string | null;
  wardName: string | null;
  districtName: string | null;
  provinceName: string | null;
  postalCode: string | null;
  notes: string | null;
}

export interface OrderTimelineEntry {
  status: OrderStatusCode;
  statusLabel: string;
  note: string | null;
  createdAt: string;
  userId: number | null;
}

export interface OrderDetailResponse extends OrderSummaryResponse {
  notes: string | null;
  shippingAddress: OrderShippingAddress | null;
  coupons: { code: string; discount: number; freeShipping: boolean }[];
  statusHistory: OrderTimelineEntry[];
}

export interface OrderListResponse {
  orders: OrderSummaryResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    previousLink: string | null;
    nextLink: string | null;
  };
}