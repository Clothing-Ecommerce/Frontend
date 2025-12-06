import { useEffect, useState } from "react"

import DashboardOverview, {
  type CategoryAnalyticsResponse,
  type InventoryAnalyticsResponse,
  type LocationAnalyticsResponse,
  type ReportOverviewResponse,
  type ReportRange,
} from "@/components/admin/DashboardOverview"
import api from "@/utils/axios"

export default function StaffDashboardPage() {
  const [timeRange, setTimeRange] = useState<ReportRange>("7d")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [overview, setOverview] = useState<ReportOverviewResponse | null>(null)
  const [categories, setCategories] = useState<CategoryAnalyticsResponse | null>(null)
  const [locations, setLocations] = useState<LocationAnalyticsResponse | null>(null)
  const [inventory, setInventory] = useState<InventoryAnalyticsResponse | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchOverview = async () => {
      setLoading(true)
      setError(null)
      try {
        const [overviewRes, categoriesRes, locationsRes, inventoryRes] = await Promise.all([
          api.get<ReportOverviewResponse>("/admin/reports/overview", { params: { range: timeRange } }),
          api.get<CategoryAnalyticsResponse>("/admin/reports/categories", { params: { range: timeRange } }),
          api.get<LocationAnalyticsResponse>("/admin/reports/locations", { params: { range: timeRange } }),
          api.get<InventoryAnalyticsResponse>("/admin/reports/inventory", { params: { range: timeRange, limit: 5 } }),
        ])

        if (!isMounted) return
        setOverview(overviewRes.data)
        setCategories(categoriesRes.data)
        setLocations(locationsRes.data)
        setInventory(inventoryRes.data)
      } catch (err) {
        console.error("Failed to load staff dashboard overview", err)
        if (isMounted) setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOverview()

    return () => {
      isMounted = false
    }
  }, [timeRange])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tổng quan hiệu suất</h1>
        <p className="text-sm text-slate-500">Nhân viên theo dõi nhanh tình hình kinh doanh hiện tại.</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <DashboardOverview
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        overview={overview}
        categories={categories}
        locations={locations}
        inventory={inventory}
        loading={loading}
      />
    </div>
  )
}