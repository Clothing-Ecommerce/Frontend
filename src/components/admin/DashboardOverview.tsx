import type React from "react"
import { useMemo } from "react"

import { AlertTriangle, ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ReportRange = "24h" | "7d" | "30d" | "this_month"

export interface OverviewKpiBlock {
  current: number
  previous: number
  growth: number | null
}

export interface OverviewTimelinePoint {
  label: string
  revenue: number
  orders: number
}

export interface ReportOverviewResponse {
  range: ReportRange
  generatedAt: string
  kpis: {
    revenue: OverviewKpiBlock
    newOrders: OverviewKpiBlock
    productsSold: OverviewKpiBlock
    newCustomers: OverviewKpiBlock
  }
  timeline: {
    granularity: "hour" | "day"
    points: OverviewTimelinePoint[]
  }
}

export interface CategoryAnalyticsItem {
  categoryId: number | null
  name: string
  revenue: number
  percentage: number
  orders: number
  units: number
}

export interface CategoryAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  totalRevenue: number
  categories: CategoryAnalyticsItem[]
}

export interface LocationAnalyticsItem {
  location: string
  orders: number
  percentage: number
}

export interface LocationAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  totalOrders: number
  locations: LocationAnalyticsItem[]
}

export interface PaymentAnalyticsItem {
  method: string
  methodLabel: string
  total: number
  succeeded: number
  failed: number
  successRate: number
  revenue: number
}

export interface PaymentAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  methods: PaymentAnalyticsItem[]
}

export interface InventoryBestSellerItem {
  productId: number
  name: string
  category: string | null
  revenue: number
  unitsSold: number
  orders: number
  inventory: number
}

export interface InventoryAlertItem {
  productId: number
  name: string
  inventory: number
  severity: "medium" | "high"
}

export interface InventoryAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  bestSellers: InventoryBestSellerItem[]
  lowStockAlerts: InventoryAlertItem[]
}

export interface VipCustomerItem {
  userId: number
  name: string
  email: string
  totalSpent: number
  orders: number
}

export interface VipCustomerResponse {
  range: ReportRange
  generatedAt: string
  customers: VipCustomerItem[]
}

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8"]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)

const formatCompactNumber = (value: number) => {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (absValue >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (absValue >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

const formatGrowth = (growth: number | null) => {
  if (growth === null) return { label: "No change", trend: "neutral" as const }
  const percent = (growth * 100).toFixed(1)
  const label = `${growth >= 0 ? "+" : ""}${percent}%`
  const trend = growth > 0 ? ("up" as const) : growth < 0 ? ("down" as const) : ("neutral" as const)
  return { label, trend }
}

interface DashboardOverviewProps {
  timeRange: ReportRange
  onTimeRangeChange: (value: ReportRange) => void
  overview: ReportOverviewResponse | null
  categories: CategoryAnalyticsResponse | null
  locations: LocationAnalyticsResponse | null
  inventory: InventoryAnalyticsResponse | null
  loading: boolean
  showRangeSelector?: boolean
}

export default function DashboardOverview({
  timeRange,
  onTimeRangeChange,
  overview,
  categories,
  locations,
  inventory,
  loading,
  showRangeSelector = true,
}: DashboardOverviewProps) {
  const revenueChartData = useMemo(() => {
    if (!overview) return []
    return overview.timeline.points.map((point, index) => ({
      name: point.label || `${index + 1}`,
      revenue: point.revenue,
      orders: point.orders,
    }))
  }, [overview])

  const topLocations = useMemo(() => locations?.locations ?? [], [locations])
  const bestSellers = useMemo(() => inventory?.bestSellers ?? [], [inventory])
  const lowStockAlerts = useMemo(() => inventory?.lowStockAlerts ?? [], [inventory])

  return (
    <TabsContentLayout
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
      overview={overview}
      categories={categories}
      revenueChartData={revenueChartData}
      bestSellers={bestSellers}
      lowStockAlerts={lowStockAlerts}
      topLocations={topLocations}
      loading={loading}
      showRangeSelector={showRangeSelector}
    />
  )
}

function TabsContentLayout({
  timeRange,
  onTimeRangeChange,
  overview,
  categories,
  revenueChartData,
  bestSellers,
  lowStockAlerts,
  topLocations,
  loading,
  showRangeSelector,
}: {
  timeRange: ReportRange
  onTimeRangeChange: (value: ReportRange) => void
  overview: ReportOverviewResponse | null
  categories: CategoryAnalyticsResponse | null
  revenueChartData: { name: string; revenue: number; orders: number }[]
  bestSellers: InventoryBestSellerItem[]
  lowStockAlerts: InventoryAlertItem[]
  topLocations: LocationAnalyticsItem[]
  loading: boolean
  showRangeSelector: boolean
}) {
  return (
    <div className="space-y-4">
      {showRangeSelector && (
        <div className="flex items-center justify-between">
          <Select value={timeRange} onValueChange={(value) => onTimeRangeChange(value as ReportRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="this_month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={overview ? formatCurrency(overview.kpis.revenue.current) : "—"}
          change={formatGrowth(overview?.kpis.revenue.growth ?? null).label}
          trend={formatGrowth(overview?.kpis.revenue.growth ?? null).trend}
          icon={<DollarSign className="h-4 w-4 text-slate-500" />}
          loading={loading}
        />
        <KPICard
          title="New Orders"
          value={overview ? overview.kpis.newOrders.current.toLocaleString("vi-VN") : "—"}
          change={formatGrowth(overview?.kpis.newOrders.growth ?? null).label}
          trend={formatGrowth(overview?.kpis.newOrders.growth ?? null).trend}
          icon={<ShoppingBag className="h-4 w-4 text-slate-500" />}
          loading={loading}
        />
        <KPICard
          title="Products Sold"
          value={overview ? overview.kpis.productsSold.current.toLocaleString("vi-VN") : "—"}
          change={formatGrowth(overview?.kpis.productsSold.growth ?? null).label}
          trend={formatGrowth(overview?.kpis.productsSold.growth ?? null).trend}
          icon={<Package className="h-4 w-4 text-slate-500" />}
          loading={loading}
        />
        <KPICard
          title="New Customers"
          value={overview ? overview.kpis.newCustomers.current.toLocaleString("vi-VN") : "—"}
          change={formatGrowth(overview?.kpis.newCustomers.growth ?? null).label}
          trend={formatGrowth(overview?.kpis.newCustomers.growth ?? null).trend}
          icon={<Users className="h-4 w-4 text-slate-500" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue chart</CardTitle>
            <CardDescription>Revenue and order volume over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="revenue"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCompactNumber(value as number)}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    stroke="#f59e0b"
                    fontSize={12}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => Math.round(value as number).toString()}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    formatter={(value: number, name) => [
                      name === "revenue" ? formatCurrency(value) : value,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    yAxisId="revenue"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line type="monotone" dataKey="orders" yAxisId="orders" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Revenue share by product groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories?.categories ?? []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="revenue">
                    {(categories?.categories ?? []).map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [formatCurrency(value as number), name as string]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Best-selling products with low inventory</CardDescription>
            </div>
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle size={12} /> Need restocking
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(lowStockAlerts.length ? lowStockAlerts : bestSellers.slice(0, 3)).map((item) => (
                <div key={item.productId} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Inventory: {"inventory" in item ? item.inventory : "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${"severity" in item && item.severity === "high" ? "text-red-600" : "text-amber-600"}`}>
                      {"inventory" in item ? item.inventory : 0} units
                    </p>
                    {"orders" in item && <p className="text-xs text-slate-500">Sold: {item.orders}</p>}
                  </div>
                </div>
              ))}
              {!lowStockAlerts.length && !bestSellers.length && <p className="text-sm text-slate-500">No inventory data yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Purchasing Locations</CardTitle>
            <CardDescription>Top provinces/cities by order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topLocations.slice(0, 5).map((item, index) => (
                <div key={item.location} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{item.location}</span>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-800" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              ))}
              {!topLocations.length && <p className="text-sm text-slate-500">No geographic data yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon,
  loading,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
  loading: boolean
}) {
  const changeColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-500"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{loading ? "…" : value}</div>
        <p className="text-xs text-slate-500 mt-1 flex items-center">
          <span className={`flex items-center ${changeColor} font-medium mr-1`}>
            {trend === "up" && <ArrowUpRight className="h-3 w-3 mr-1" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3 mr-1" />}
            {trend === "neutral" && <span className="mr-1">—</span>}
            {change}
          </span>
          compared to previous period
        </p>
      </CardContent>
    </Card>
  )
}
