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