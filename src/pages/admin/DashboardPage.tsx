import { useEffect, useId, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import {
  alerts,
  bestSellingProducts,
  slowProducts,
} from "@/data/adminMock"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { CalendarClock, Info } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import api from "@/utils/axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { DashboardOverviewResponse, TimeRange } from "@/types/adminType"

const SPARKLINE_POINTS = 7

const widgetDefinitions = [
  {
    id: "revenue",
    title: "Doanh thu",
    description: "Theo dõi tổng doanh thu ở từng chu kỳ",
    drilldown: "/admin/reports",
  },
  {
    id: "orders",
    title: "Đơn hàng",
    description: "Tỷ lệ đơn theo trạng thái",
    drilldown: "/admin/orders",
  },
  {
    id: "customers",
    title: "Khách hàng",
    description: "Khách mới vs quay lại",
    drilldown: "/admin/customers",
  },
  {
    id: "inventory",
    title: "Cảnh báo tồn kho",
    description: "Sản phẩm bán chạy và chậm",
    drilldown: "/admin/products",
  },
  {
    id: "alerts",
    title: "Cảnh báo vận hành",
    description: "SLA hỗ trợ và hoàn trả",
    drilldown: "/admin/support",
  },
] as const

type WidgetId = (typeof widgetDefinitions)[number]["id"]

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const alertRoutes: Record<(typeof alerts)[number]["type"], string> = {
  inventory: "/admin/inventory",
  returns: "/admin/orders",
  support: "/admin/support",
}

function Sparkline({
  data,
  stroke = "#fff",
  fillFrom = "rgba(255,255,255,0.35)",
  fillTo = "rgba(255,255,255,0)",
}: {
  data: ReadonlyArray<number>
  stroke?: string
  fillFrom?: string
  fillTo?: string
}) {
  const gradientId = useId()
  const values = Array.from(data)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100
      const y = ((max - value) / Math.max(max - min, 1)) * 100
      return `${x},${y}`
    })
    .join(" ")

  const areaPoints = `${points} 100,100 0,100`

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor={fillTo} />
        </linearGradient>
      </defs>
      <polyline
        points={areaPoints}
        fill={`url(#${gradientId})`}
        stroke="none"
        strokeLinejoin="round"
      />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CustomerDonut({
  newPercent,
  newColor,
  returningColor,
}: {
  newPercent: number
  newColor: string
  returningColor: string
}) {
  const normalized = Math.min(Math.max(newPercent, 0), 100)

  const data = [
    { type: "new", value: normalized },
    { type: "returning", value: Math.max(100 - normalized, 0) },
  ]

  return (
    <div className="relative h-32 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="72%"
            outerRadius="100%"
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.type} fill={index === 0 ? newColor : returningColor} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {normalized}%
        </span>
        <span className="text-xs uppercase tracking-wide text-slate-500">Khách mới</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [timeRange, setTimeRange] = useState<TimeRange>("week")
  const [widgets, setWidgets] = useState<Record<WidgetId, boolean>>({
    revenue: true,
    orders: true,
    customers: true,
    inventory: true,
    alerts: true,
  })
  const [pinnedReports, setPinnedReports] = useState<string[]>(["Doanh thu theo kênh", "Tồn kho rủi ro"])
  const [comparePrevious, setComparePrevious] = useState(false)
  const [hoveredKpi, setHoveredKpi] = useState<WidgetId | null>(null)
  const [activeModal, setActiveModal] = useState<WidgetId | null>(null)
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null)
  const [isOverviewLoading, setIsOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  useEffect(() => {
    const pinFromQuery = searchParams.get("pin")
    if (pinFromQuery && !pinnedReports.includes(pinFromQuery)) {
      setPinnedReports((prev) => [...prev, pinFromQuery])
      searchParams.delete("pin")
      setSearchParams(searchParams, { replace: true })
    }
  }, [pinnedReports, searchParams, setSearchParams])

  useEffect(() => {
    let ignore = false
    setIsOverviewLoading(true)
    setOverviewError(null)

    void (async () => {
      try {
        const { data } = await api.get<DashboardOverviewResponse>("/admin/dashboard/overview", {
          params: { range: timeRange },
        })
        if (!ignore) {
          setOverview(data)
        }
      } catch (error) {
        if (ignore) return
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data as { message?: string } | undefined
          setOverviewError(responseData?.message ?? "Không thể lấy số liệu dashboard")
        } else {
          setOverviewError("Không thể lấy số liệu dashboard")
        }
      } finally {
        if (!ignore) {
          setIsOverviewLoading(false)
        }
      }
    })()

    return () => {
      ignore = true
    }
  }, [timeRange])

  const defaultOverview = useMemo<DashboardOverviewResponse>(
    () => ({
      range: timeRange,
      generatedAt: new Date().toISOString(),
      revenue: {
        current: 0,
        previous: 0,
        growth: 0,
        averageOrderValue: null,
        trend: Array.from({ length: SPARKLINE_POINTS }, () => 0),
      },
      orders: {
        total: 0,
        previousTotal: 0,
        counts: {
          pending: 0,
          processing: 0,
          completed: 0,
          cancelled: 0,
        },
      },
      customers: {
        new: 0,
        returning: 0,
        total: 0,
        growth: 0,
        previous: {
          new: 0,
          returning: 0,
          total: 0,
        },
      },
    }),
    [timeRange],
  )

  const hasOverviewData = overview?.range === timeRange
  const metrics: DashboardOverviewResponse = hasOverviewData && overview ? overview : defaultOverview

  const activeKpi = useMemo(
    () => ({
      revenue: metrics.revenue.current,
      orders: metrics.orders.counts,
      customers: {
        new: metrics.customers.new,
        returning: metrics.customers.returning,
      },
    }),
    [metrics],
  )

  const previousKpi = useMemo(
    () => ({
      revenue: metrics.revenue.previous,
      orders: metrics.orders.previousTotal,
      customers: metrics.customers.previous.total,
    }),
    [metrics],
  )

  const kpiGrowth = useMemo(
    () => ({
      revenue: metrics.revenue.growth ?? 0,
      orders:
        metrics.orders.previousTotal > 0
          ? (metrics.orders.total - metrics.orders.previousTotal) / metrics.orders.previousTotal
          : 0,
      customers: metrics.customers.growth ?? 0,
    }),
    [metrics],
  )

  const revenueTrend = metrics.revenue.trend

  const orderStatusMeta = {
    pending: { label: "Chờ xử lý", color: "bg-slate-500", icon: "🕓" },
    processing: { label: "Đang xử lý", color: "bg-amber-500", icon: "⚙️" },
    completed: { label: "Hoàn tất", color: "bg-emerald-500", icon: "✅" },
    cancelled: { label: "Hủy", color: "bg-rose-500", icon: "❌" },
  } as const

  const totalOrders = metrics.orders.total
  const newCustomerPercent = metrics.customers.total
    ? Math.round((metrics.customers.new / metrics.customers.total) * 100)
    : 0
  const averageOrderValueLabel =
    metrics.revenue.averageOrderValue != null ? formatter.format(metrics.revenue.averageOrderValue) : "—"

  const toggleWidget = (id: WidgetId) => {
    setWidgets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const togglePinned = (title: string) => {
    setPinnedReports((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
  }

  return (
    <div className="space-y-6">
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Hiệu quả tổng quan
                <span
                  className="inline-flex"
                  title="So sánh theo mốc thời gian và drill-down vào dữ liệu chi tiết"
                >
                  <Info className="size-4 text-slate-400" aria-hidden />
                </span>
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Dữ liệu realtime cho các chỉ số cốt lõi của vận hành thương mại.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <CalendarClock className="size-3.5" /> Chu kỳ
                </p>
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                  <SelectTrigger className="flex w-48 items-center gap-2 border-slate-200 text-sm shadow-sm transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="week">7 ngày</SelectItem>
                    <SelectItem value="month">30 ngày</SelectItem>
                    <SelectItem value="quarter">Quý hiện tại</SelectItem>
                    <SelectItem value="year">Năm nay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={() => setComparePrevious((prev) => !prev)}
                className={cn(
                  "flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition",
                  comparePrevious
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                    : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                )}
                aria-pressed={comparePrevious}
              >
                <span>So sánh kỳ trước</span>
                <span
                  className={cn(
                    "relative inline-flex h-5 w-10 items-center rounded-full transition",
                    comparePrevious ? "bg-white/25" : "bg-slate-200 dark:bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-1 top-1 inline-block size-3 rounded-full bg-white shadow-sm transition-transform",
                      comparePrevious && "translate-x-5 bg-emerald-300",
                    )}
                  />
                </span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {overviewError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                {overviewError}
              </div>
            )}

            {isOverviewLoading && !hasOverviewData ? (
              <div className="flex h-48 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <LoadingSpinner />
                  <span>Đang tải số liệu...</span>
                </div>
              </div>
            ) : !hasOverviewData ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Chưa có dữ liệu cho chu kỳ này.
              </div>
            ) : (
              <motion.div
                key={`${metrics.range}-${metrics.generatedAt}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("grid gap-6 lg:grid-cols-3", isOverviewLoading && "pointer-events-none opacity-60")}
              >
          {widgets.revenue && (
            <div
              className="group relative cursor-pointer overflow-visible rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#2563EB] via-[#2F6FF0] to-[#60A5FA] p-6 text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-2xl"
              onClick={() => setActiveModal("revenue")}
              onMouseEnter={() => setHoveredKpi("revenue")}
              onMouseLeave={() => setHoveredKpi(null)}
            >
              <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-blue-100">
                <span className="text-lg">💰</span>
                <span>Doanh thu</span>
              </div>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                {formatter.format(activeKpi.revenue)}
              </h3>
              {comparePrevious && hasOverviewData && (
                <p className="mt-1 text-sm font-medium text-emerald-200">
                  {kpiGrowth.revenue >= 0 ? "+" : "-"}
                  {(Math.abs(kpiGrowth.revenue) * 100).toFixed(0)}% so với kỳ trước
                </p>
              )}
              <div className="mt-6 h-20">
                <Sparkline data={revenueTrend} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-blue-100/90">
                <span>Tỉ lệ chuyển đổi 3.2% (bỏ)</span>
                <span>Giá trị trung bình {averageOrderValueLabel}</span>
              </div>
              <div
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full z-20 -translate-x-1/2 -translate-y-4 rounded-xl bg-slate-900/90 px-4 py-2 text-xs text-white opacity-0 shadow-lg backdrop-blur-sm transition",
                  hoveredKpi === "revenue" && "top-[102%] opacity-100",
                )}
              >
                Doanh thu kỳ trước: {formatter.format(previousKpi.revenue)}
              </div>
            </div>
          )}
          {widgets.orders && (
            <div
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/80"
              onClick={() => setActiveModal("orders")}
              onMouseEnter={() => setHoveredKpi("orders")}
              onMouseLeave={() => setHoveredKpi(null)}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Đơn hàng</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Phân bổ trạng thái và SLA giao nhận
                    </p>
                  </div>
                  {comparePrevious && hasOverviewData && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                      +{(kpiGrowth.orders * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="mt-6 flex h-3 overflow-hidden rounded-full">
                  {Object.entries(activeKpi.orders).map(([status, value]) => {
                    const percent = totalOrders > 0 ? (value / totalOrders) * 100 : 0
                    return (
                      <div
                        key={status}
                        className={cn(
                          "transition-all",
                          orderStatusMeta[status as keyof typeof orderStatusMeta]?.color ?? "bg-slate-400",
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    )
                  })}
                </div>
                <div className="mt-6 space-y-4 text-sm">
                  {Object.entries(activeKpi.orders).map(([status, value]) => {
                    const meta = orderStatusMeta[status as keyof typeof orderStatusMeta]
                    const percent = totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg" aria-hidden>
                            {meta?.icon}
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {meta?.label ?? status}
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{percent}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <Button
                className="mt-6 w-full border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation()
                  navigate("/admin/orders")
                }}
              >
                Drill-down đơn hàng
              </Button>
              <div
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full z-20 -translate-x-1/2 -translate-y-4 rounded-xl bg-slate-900/90 px-4 py-2 text-xs text-white opacity-0 shadow-lg backdrop-blur-sm transition",
                  hoveredKpi === "orders" && "top-[102%] opacity-100",
                )}
              >
                Đơn hàng kỳ trước: {previousKpi.orders.toLocaleString("vi-VN")}
              </div>
            </div>
          )}
          {widgets.customers && (
            <div
              className="group relative flex h-full flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-xl dark:border-emerald-500/30 dark:bg-slate-900/80"
              onClick={() => setActiveModal("customers")}
              onMouseEnter={() => setHoveredKpi("customers")}
              onMouseLeave={() => setHoveredKpi(null)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Khách hàng</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Khách mới vs quay lại</p>
                </div>
                {comparePrevious && hasOverviewData && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    +{(kpiGrowth.customers * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <CustomerDonut
                  newPercent={newCustomerPercent}
                  newColor="#34d399"
                  returningColor="#1d4ed8"
                />
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Khách mới</p>
                    <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                      {activeKpi.customers.new.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Quay lại</p>
                    <p className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                      {activeKpi.customers.returning.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    ⬆ Tăng 8%
                  </span>
                </div>
              </div>
              <Button
                className="mt-6 inline-flex items-center gap-2"
                onClick={(event) => {
                  event.stopPropagation()
                  navigate("/admin/customers")
                }}
              >
                <span role="img" aria-hidden>
                  📊
                </span>
                Xem phân khúc
              </Button>
              <div
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full z-20 -translate-x-1/2 -translate-y-4 rounded-xl bg-slate-900/90 px-4 py-2 text-xs text-white opacity-0 shadow-lg backdrop-blur-sm transition",
                  hoveredKpi === "customers" && "top-[102%] opacity-100",
                )}
              >
                Khách kỳ trước: {previousKpi.customers.toLocaleString("vi-VN")}
              </div>
            </div>
          )}
            </motion.div>
            )}
          </CardContent>
        </Card>

        {activeModal && (
          <DialogContent className="max-w-2xl" showCloseButton>
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>
                  {activeModal === "revenue" && "Chi tiết doanh thu"}
                  {activeModal === "orders" && "Hiệu suất đơn hàng"}
                  {activeModal === "customers" && "Phân bổ khách hàng"}
                </DialogTitle>
                <DialogDescription>
                  {activeModal === "revenue" && "Biểu đồ xu hướng 7 ngày gần nhất"}
                  {activeModal === "orders" && "Tỷ trọng trạng thái đơn hàng trong chu kỳ đã chọn"}
                  {activeModal === "customers" && "Tỷ lệ khách mới so với khách quay lại"}
                </DialogDescription>
              </DialogHeader>
              {activeModal === "revenue" && (
                <div className="rounded-2xl bg-gradient-to-br from-blue-600/90 to-blue-400/80 p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-widest text-blue-100">Doanh thu</p>
                      <p className="text-3xl font-semibold">{formatter.format(activeKpi.revenue)}</p>
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      {kpiGrowth.revenue >= 0 ? "+" : "-"}
                      {(Math.abs(kpiGrowth.revenue) * 100).toFixed(0)}% so với kỳ trước
                    </span>
                  </div>
                  <div className="mt-6 h-40">
                    <Sparkline data={revenueTrend} />
                  </div>
                </div>
              )}
              {activeModal === "orders" && (
                <div className="space-y-4">
                  {Object.entries(activeKpi.orders).map(([status, value]) => {
                    const meta = orderStatusMeta[status as keyof typeof orderStatusMeta]
                    const percent = totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0
                    return (
                      <div key={status} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg" aria-hidden>
                              {meta?.icon}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {meta?.label ?? status}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{percent}% tổng đơn</p>
                            </div>
                          </div>
                          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {value.toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={cn(
                              "h-full",
                              orderStatusMeta[status as keyof typeof orderStatusMeta]?.color ?? "bg-slate-400",
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {activeModal === "customers" && (
                <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                  <div className="flex flex-col items-center justify-center">
                    <CustomerDonut
                      newPercent={newCustomerPercent}
                      newColor="#22c55e"
                      returningColor="#1e40af"
                    />
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                      Khách mới kỳ này tăng {kpiGrowth.customers >= 0 ? "+" : "-"}
                      {(Math.abs(kpiGrowth.customers) * 100).toFixed(0)}% so với kỳ trước.
                    </div>
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Khách mới</p>
                        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                          {activeKpi.customers.new.toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Quay lại</p>
                        <p className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                          {activeKpi.customers.returning.toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {widgets.inventory && (
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Tình trạng sản phẩm</CardTitle>
              <CardDescription>Sản phẩm bán chạy, chậm quay vòng và cảnh báo tồn kho</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/products?tab=inventory")}>Ghép vào danh sách kiểm kho</Button>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Top sản phẩm bán chạy</p>
                  <p className="text-xs text-slate-500">Theo doanh thu</p>
                </div>
                <Badge variant="secondary">3 sản phẩm</Badge>
              </div>
              <ul className="divide-y">
                {bestSellingProducts.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category} • Tồn kho {item.inventory}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{formatter.format(item.revenue)}</p>
                      <p className="text-xs text-emerald-600">Chuyển đổi {item.conversion}%</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border bg-amber-50">
                <div className="border-b px-6 py-3 text-sm font-semibold text-amber-800">
                  Sản phẩm quay vòng chậm
                </div>
                <ul className="divide-y">
                  {slowProducts.map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-6 py-4 text-sm">
                      <span>
                        {item.name} <span className="text-xs text-slate-500">({item.category})</span>
                      </span>
                      <span className="text-xs font-medium text-amber-700">{item.turnoverDays} ngày</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border bg-rose-50">
                <div className="border-b px-6 py-3 text-sm font-semibold text-rose-800">Cảnh báo</div>
                <ul>
                  {alerts.map((alert) => (
                    <li key={alert.id} className="flex items-start gap-3 px-6 py-3 text-sm">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "mt-1",
                          alert.severity === "high" && "bg-rose-600 text-white",
                          alert.severity === "medium" && "bg-amber-500 text-white",
                          alert.severity === "low" && "bg-slate-200 text-slate-700",
                        )}
                      >
                        {alert.type}
                      </Badge>
                      <div>
                        <p className="font-medium text-slate-900">{alert.title}</p>
                        <p className="text-xs text-slate-600">{alert.description}</p>
                        <Button
                          variant="link"
                          className="px-0 text-xs"
                          onClick={() => navigate(alertRoutes[alert.type])}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {widgets.alerts && (
        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo vận hành & báo cáo ghim (thay thành bảng thống kê mã khuyến mãi)</CardTitle>
            <CardDescription>
              Theo dõi SLA hỗ trợ, hoàn trả và các báo cáo được ghim lên dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_minmax(0,320px)]">
            <div className="space-y-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">SLA hỗ trợ</p>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Vé đang xử lý</p>
                    <p className="text-xl font-semibold text-slate-900">36</p>
                    <p className="text-xs text-emerald-600">92% trong SLA</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Vé quá hạn</p>
                    <p className="text-xl font-semibold text-rose-600">8</p>
                    <p className="text-xs text-rose-500">+3 so với tuần trước</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Thời gian phản hồi TB</p>
                    <p className="text-xl font-semibold text-slate-900">38 phút</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/support")}>Điều chỉnh SLA</Button>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Tùy biến Dashboard</p>
                <p className="text-xs text-slate-500">
                  Bật/tắt widget để phù hợp với nhu cầu quản trị của bạn.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {widgetDefinitions.map((widget) => (
                    <label
                      key={widget.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border bg-slate-50 p-3 text-sm hover:bg-slate-100"
                    >
                      <Checkbox
                        checked={widgets[widget.id]}
                        onCheckedChange={() => toggleWidget(widget.id)}
                      />
                      <div>
                        <p className="font-medium text-slate-800">{widget.title}</p>
                        <p className="text-xs text-slate-500">{widget.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Báo cáo đã ghim</p>
                <Button size="sm" variant="outline" onClick={() => togglePinned("Doanh thu theo kênh")}>
                  Thêm báo cáo
                </Button>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {pinnedReports.map((report) => (
                  <li key={report} className="flex items-center justify-between rounded-lg border bg-slate-50 p-3">
                    <div>
                      <p className="font-medium text-slate-800">{report}</p>
                      <p className="text-xs text-slate-500">Cập nhật 15 phút trước</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => togglePinned(report)}>
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* <Separator /> */}

      {/* <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Hành trình vận hành</CardTitle>
            <CardDescription>
              Drill-down nhanh: nhấp vào thẻ để mở trang tương ứng
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {widgetDefinitions.map((widget) => (
              <button
                key={widget.id}
                className="rounded-xl border border-dashed bg-slate-50 p-4 text-left text-sm transition hover:border-slate-400 hover:bg-white"
                onClick={() => navigate(widget.drilldown)}
              >
                <p className="font-semibold text-slate-800">{widget.title}</p>
                <p className="mt-1 text-xs text-slate-500">{widget.description}</p>
                <p className="mt-3 text-xs font-medium text-primary">Đi tới {widget.drilldown.replace("/admin/", "")}</p>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Ghim nhanh báo cáo quan trọng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Ghim báo cáo tồn kho</p>
              <Button size="sm" onClick={() => togglePinned("Tồn kho rủi ro")}>Ghim vào dashboard</Button>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">Automation</p>
              <p className="font-semibold text-slate-800">Cảnh báo tồn kho thấp</p>
              <p className="text-xs text-slate-500">Kích hoạt mỗi 6 giờ khi SKU &lt; 15 sản phẩm</p>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">So sánh kỳ trước</p>
              <p className="font-semibold text-slate-800">Tự động so sánh tháng liền kề</p>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}