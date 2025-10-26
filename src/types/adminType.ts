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