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