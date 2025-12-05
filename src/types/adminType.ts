// Dashboard
export type TimeRange = "today" | "week" | "month" | "quarter" | "year"

export interface DashboardOverviewResponse {
  range: TimeRange
  generatedAt: string
  revenue: {
    current: number
    previous: number
    growth: number | null
    averageOrderValue: number | null
    trend: number[]
  }
  orders: {
    total: number
    previousTotal: number
    counts: Record<"pending" | "processing" | "completed" | "cancelled", number>
  }
  customers: {
    new: number
    returning: number
    total: number
    growth: number | null
    previous: {
      new: number
      returning: number
      total: number
    }
  }
}

export interface DashboardInventoryBestSeller {
  productId: number
  name: string
  category: string | null
  inventory: number
  revenue: number
  orders: number
  conversion: number
}

export interface DashboardInventorySlowMover {
  productId: number
  name: string
  category: string | null
  inventory: number
  turnoverDays: number
  unitsSold: number
}

export interface DashboardInventoryAlert {
  id: string
  type: "inventory" | "performance"
  severity: "low" | "medium" | "high"
  title: string
  description: string
  productId: number | null
}

export interface DashboardInventoryResponse {
  range: TimeRange
  generatedAt: string
  bestSellers: DashboardInventoryBestSeller[]
  slowMovers: DashboardInventorySlowMover[]
  alerts: DashboardInventoryAlert[]
}

// Products
export type AdminProductStockStatus = "in-stock" | "low-stock" | "out-of-stock"

export interface AdminProductListItem {
  id: number
  name: string
  slug: string
  category: { id: number; name: string }
  brand: { id: number; name: string } | null
  price: number
  totalStock: number
  stockStatus: AdminProductStockStatus
  variants: number
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminProductListResponse {
  products: AdminProductListItem[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface AdminCreateProductRequest {
  name: string
  slug: string
  basePrice: number
  categoryId: number
  brandId?: number | null
  description?: string | null
  features?: unknown
  specifications?: unknown
  images?: Array<{ url: string; alt?: string | null; isPrimary?: boolean; sortOrder?: number }>
  variants?: Array<{
    sku?: string | null
    price?: number | null
    stock?: number | null
    sizeId?: number | null
    colorId?: number | null
    isActive?: boolean | null
  }>
}

export interface AdminCreateProductResponse {
  message: string
  product: AdminProductListItem
}

export interface AdminProductDetailImage {
  id: number
  url: string
  alt: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface AdminProductDetailVariant {
  id: number
  sku: string | null
  price: number
  stock: number
  sizeId: number | null
  sizeName: string | null
  colorId: number | null
  colorName: string | null
  colorHex: string | null
  isActive: boolean
}

export interface AdminProductDetail {
  id: number
  name: string
  slug: string
  description: string | null
  basePrice: number
  totalStock: number
  category: { id: number; name: string } | null
  brand: { id: number; name: string } | null
  features: unknown
  specifications: unknown
  images: AdminProductDetailImage[]
  variants: AdminProductDetailVariant[]
  createdAt: string
  updatedAt: string
}

// Orders
export type AdminOrderStatus =
  | "pending"
  | "processing"
  | "packed"
  | "shipping"
  | "completed"
  | "cancelled"
  | "refunded"

export type AdminOrderPaymentDisplay = "COD" | "Online"

export interface AdminOrderSummary {
  id: number
  code: string
  customer: string
  customerEmail: string | null
  customerPhone: string | null
  value: number
  payment: AdminOrderPaymentDisplay
  paymentMethod: string | null
  status: AdminOrderStatus
  rawStatus: string
  createdAt: string
  updatedAt: string
  sla: {
    fulfillment: number | null
    return: number | null
  }
}

export interface AdminOrderListResult {
  orders: AdminOrderSummary[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    previousLink: string | null
    nextLink: string | null
  }
}

export interface AdminOrderDetailItem {
  id: number
  productId: number
  variantId: number
  name: string
  sku: string | null
  quantity: number
  price: number
  total: number
  taxAmount: number
}

export interface AdminOrderTimelineEntry {
  status: AdminOrderStatus
  rawStatus: string
  label: string
  at: string
  note: string | null
  actor: {
    id: number | null
    name: string | null
  } | null
}

export interface AdminOrderDetailResponse {
  id: number
  code: string
  status: AdminOrderStatus
  rawStatus: string
  createdAt: string
  updatedAt: string
  customer: {
    id: number
    name: string
    email: string | null
    phone: string | null
  }
  payment: {
    method: string | null
    display: AdminOrderPaymentDisplay
  }
  totals: {
    subtotal: number
    discount: number
    shipping: number
    tax: number
    total: number
  }
  address: {
    id: number
    recipient: string
    phone: string | null
    company: string | null
    line: string
    detail: {
      houseNumber: string | null
      street: string | null
      ward: string | null
      district: string | null
      province: string | null
      postalCode: string | null
    }
    notes: string | null
  } | null
  items: AdminOrderDetailItem[]
  timeline: AdminOrderTimelineEntry[]
  notes: string[]
  coupons: {
    code: string
    discount: number
    freeShipping: boolean
  }[]
  sla: {
    fulfillment: number | null
    return: number | null
  }
}

export interface AdminOrderStatusUpdateResponse {
  message: string
  order: AdminOrderDetailResponse
  summary: AdminOrderSummary
  status: AdminOrderStatus
  rawStatus: string
  changed: boolean
}

export type AdminUserRole = "Admin" | "Staff" | "Customer";

export type AdminUserStatus = "active" | "suspended";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  lastActive: string | null;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string | null;
}