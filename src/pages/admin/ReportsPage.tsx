import type React from "react"
import { useEffect, useMemo, useState } from "react"

import { AlertTriangle, ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/utils/axios"

type ReportRange = "24h" | "7d" | "30d" | "this_month"

interface OverviewKpiBlock {
  current: number
  previous: number
  growth: number | null
}

interface OverviewTimelinePoint {
  label: string
  revenue: number
  orders: number
}

interface ReportOverviewResponse {
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

interface CategoryAnalyticsItem {
  categoryId: number | null
  name: string
  revenue: number
  percentage: number
  orders: number
  units: number
}

interface CategoryAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  totalRevenue: number
  categories: CategoryAnalyticsItem[]
}

interface LocationAnalyticsItem {
  location: string
  orders: number
  percentage: number
}

interface LocationAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  totalOrders: number
  locations: LocationAnalyticsItem[]
}

interface PaymentAnalyticsItem {
  method: string
  methodLabel: string
  total: number
  succeeded: number
  failed: number
  successRate: number
  revenue: number
}

interface PaymentAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  methods: PaymentAnalyticsItem[]
}

interface InventoryBestSellerItem {
  productId: number
  name: string
  category: string | null
  revenue: number
  unitsSold: number
  orders: number
  inventory: number
}

interface InventoryAlertItem {
  productId: number
  name: string
  inventory: number
  severity: "medium" | "high"
}

interface InventoryAnalyticsResponse {
  range: ReportRange
  generatedAt: string
  bestSellers: InventoryBestSellerItem[]
  lowStockAlerts: InventoryAlertItem[]
}

interface VipCustomerItem {
  userId: number
  name: string
  email: string
  totalSpent: number
  orders: number
}

interface VipCustomerResponse {
  range: ReportRange
  generatedAt: string
  customers: VipCustomerItem[]
}

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8"]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)

const formatGrowth = (growth: number | null) => {
  if (growth === null) return { label: "Không đổi", trend: "neutral" as const }
  const percent = (growth * 100).toFixed(1)
  const label = `${growth >= 0 ? "+" : ""}${percent}%`
  const trend = growth > 0 ? ("up" as const) : growth < 0 ? ("down" as const) : ("neutral" as const)
  return { label, trend }
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<ReportRange>("7d")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [overview, setOverview] = useState<ReportOverviewResponse | null>(null)
  const [categories, setCategories] = useState<CategoryAnalyticsResponse | null>(null)
  const [locations, setLocations] = useState<LocationAnalyticsResponse | null>(null)
  const [payments, setPayments] = useState<PaymentAnalyticsResponse | null>(null)
  const [inventory, setInventory] = useState<InventoryAnalyticsResponse | null>(null)
  const [vipCustomers, setVipCustomers] = useState<VipCustomerResponse | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const [overviewRes, categoryRes, locationRes, paymentRes, inventoryRes, vipRes] = await Promise.all([
          api.get<ReportOverviewResponse>("/admin/reports/overview", { params: { range: timeRange } }),
          api.get<CategoryAnalyticsResponse>("/admin/reports/categories", { params: { range: timeRange } }),
          api.get<LocationAnalyticsResponse>("/admin/reports/locations", { params: { range: timeRange } }),
          api.get<PaymentAnalyticsResponse>("/admin/reports/payments", { params: { range: timeRange } }),
          api.get<InventoryAnalyticsResponse>("/admin/reports/inventory", { params: { range: timeRange, limit: 5 } }),
          api.get<VipCustomerResponse>("/admin/reports/vip-customers", { params: { range: timeRange, limit: 5 } }),
        ])

        if (!isMounted) return
        setOverview(overviewRes.data)
        setCategories(categoryRes.data)
        setLocations(locationRes.data)
        setPayments(paymentRes.data)
        setInventory(inventoryRes.data)
        setVipCustomers(vipRes.data)
      } catch (err) {
        console.error("Failed to fetch reports", err)
        if (isMounted) setError("Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchReports()
    return () => {
      isMounted = false
    }
  }, [timeRange])

  const revenueChartData = useMemo(() => {
    if (!overview) return []
    return overview.timeline.points.map((point, index) => ({
      name: point.label || `${index + 1}`,
      revenue: point.revenue,
      orders: point.orders,
    }))
  }, [overview])

  const paymentSummary = useMemo(() => payments?.methods ?? [], [payments])
  const topLocations = useMemo(() => locations?.locations ?? [], [locations])
  const bestSellers = useMemo(() => inventory?.bestSellers ?? [], [inventory])
  const lowStockAlerts = useMemo(() => inventory?.lowStockAlerts ?? [], [inventory])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo &amp; Thống kê</h2>
          <p className="text-sm text-slate-500">Tổng quan tình hình kinh doanh, tồn kho và khách hàng.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as ReportRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 giờ qua</SelectItem>
              <SelectItem value="7d">7 ngày qua</SelectItem>
              <SelectItem value="30d">30 ngày qua</SelectItem>
              <SelectItem value="this_month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" disabled>
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="sales">Doanh thu &amp; Đơn hàng</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm &amp; Tồn kho</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Tổng doanh thu"
              value={overview ? formatCurrency(overview.kpis.revenue.current) : "—"}
              change={formatGrowth(overview?.kpis.revenue.growth ?? null).label}
              trend={formatGrowth(overview?.kpis.revenue.growth ?? null).trend}
              icon={<DollarSign className="h-4 w-4 text-slate-500" />}
              loading={loading}
            />
            <KPICard
              title="Đơn hàng mới"
              value={overview ? overview.kpis.newOrders.current.toLocaleString("vi-VN") : "—"}
              change={formatGrowth(overview?.kpis.newOrders.growth ?? null).label}
              trend={formatGrowth(overview?.kpis.newOrders.growth ?? null).trend}
              icon={<ShoppingBag className="h-4 w-4 text-slate-500" />}
              loading={loading}
            />
            <KPICard
              title="Sản phẩm đã bán"
              value={overview ? overview.kpis.productsSold.current.toLocaleString("vi-VN") : "—"}
              change={formatGrowth(overview?.kpis.productsSold.growth ?? null).label}
              trend={formatGrowth(overview?.kpis.productsSold.growth ?? null).trend}
              icon={<Package className="h-4 w-4 text-slate-500" />}
              loading={loading}
            />
            <KPICard
              title="Khách hàng mới"
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
                <CardTitle>Biểu đồ doanh thu</CardTitle>
                <CardDescription>Doanh thu và số lượng đơn theo từng mốc thời gian</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueChartData} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${Math.round((value as number) / 1_000_000)}M`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        formatter={(value: number, name) => [
                          name === "revenue" ? formatCurrency(value) : value,
                          name === "revenue" ? "Doanh thu" : "Đơn hàng",
                        ]}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
                <CardDescription>Tỷ trọng doanh thu các nhóm hàng</CardDescription>
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
                  <CardTitle>Cảnh báo tồn kho</CardTitle>
                  <CardDescription>Các sản phẩm bán chạy có tồn kho thấp</CardDescription>
                </div>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle size={12} /> Cần nhập hàng
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
                          <p className="text-xs text-slate-500">Tồn kho: {"inventory" in item ? item.inventory : "N/A"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${"severity" in item && item.severity === "high" ? "text-red-600" : "text-amber-600"}`}>
                          {"inventory" in item ? item.inventory : 0} cái
                        </p>
                        {"orders" in item && <p className="text-xs text-slate-500">Đã bán: {item.orders}</p>}
                      </div>
                    </div>
                  ))}
                  {!lowStockAlerts.length && !bestSellers.length && <p className="text-sm text-slate-500">Không có dữ liệu tồn kho.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Khu vực mua hàng nhiều nhất</CardTitle>
                <CardDescription>Top tỉnh thành có lượng đơn cao</CardDescription>
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
                  {!topLocations.length && <p className="text-sm text-slate-500">Chưa có dữ liệu địa lý.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Xu hướng dòng tiền</CardTitle>
                <CardDescription>Doanh thu thuần so với số lượng đơn hàng</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${Math.round((val as number) / 1_000_000)}M`} />
                      <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        formatter={(value, name) => [name === "revenue" ? formatCurrency(value as number) : value, name === "revenue" ? "Doanh thu" : "Đơn hàng"]}
                      />
                      <Bar yAxisId="left" dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={20} />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                  <CardDescription>Tỷ lệ thanh toán thành công theo kênh</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {paymentSummary.map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{method.methodLabel}</p>
                        <p className="text-xs text-slate-500">{method.total} giao dịch</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(method.revenue)}</p>
                        <p className="text-xs text-slate-500">Tỉ lệ thành công: {method.successRate}%</p>
                      </div>
                    </div>
                  ))}
                  {!paymentSummary.length && <p className="text-sm text-slate-500">Chưa có dữ liệu thanh toán.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top sản phẩm bán chạy</CardTitle>
              <CardDescription>Xếp hạng theo doanh thu trong kỳ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {bestSellers.map((item, index) => (
                  <div key={item.productId} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-lg border bg-slate-50 flex items-center justify-center font-bold text-slate-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                          {item.category && <Badge variant="secondary" className="font-normal">{item.category}</Badge>}
                          <span className="flex items-center">Đơn: {item.orders}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{item.unitsSold.toLocaleString("vi-VN")} đã bán</p>
                      <p className="text-xs text-emerald-600 font-medium">Doanh thu: {formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))}
                {!bestSellers.length && <p className="text-sm text-slate-500">Chưa có sản phẩm nào trong kỳ.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trạng thái kho hàng</CardTitle>
                <CardDescription>Theo dõi tồn kho của sản phẩm bán chạy</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full text-sm text-left caption-bottom">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                      <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Sản phẩm</th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-slate-500">Đã bán</th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-slate-500">Đơn hàng</th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-slate-500">Tồn kho</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {bestSellers.map((item) => (
                      <tr key={item.productId} className="border-b transition-colors hover:bg-slate-100/50">
                        <td className="p-4 align-middle font-medium">{item.name}</td>
                        <td className="p-4 align-middle text-center">{item.unitsSold.toLocaleString("vi-VN")}</td>
                        <td className="p-4 align-middle text-center">{item.orders.toLocaleString("vi-VN")}</td>
                        <td className={`p-4 align-middle text-center font-bold ${item.inventory <= 5 ? "text-red-600" : item.inventory <= 20 ? "text-amber-600" : "text-slate-900"}`}>
                          {item.inventory}
                        </td>
                        <td className="p-4 align-middle text-right">
                          {item.inventory <= 5 ? (
                            <Badge variant="destructive">Cực thấp</Badge>
                          ) : item.inventory <= 20 ? (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                              Sắp hết
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Đủ hàng
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!bestSellers.length && (
                      <tr>
                        <td className="p-4 text-center text-slate-500" colSpan={5}>
                          Không có dữ liệu sản phẩm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Khách hàng VIP</CardTitle>
                <CardDescription>Top chi tiêu trong kỳ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {(vipCustomers?.customers ?? []).map((user) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(user.totalSpent)}</p>
                        <p className="text-xs text-slate-500">{user.orders} đơn</p>
                      </div>
                    </div>
                  ))}
                  {(!vipCustomers || vipCustomers.customers.length === 0) && <p className="text-sm text-slate-500">Chưa có khách hàng VIP.</p>}
                </div>
              </CardContent>
            </Card>

            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân bổ địa lý</CardTitle>
                  <CardDescription>Nơi tập trung nhiều đơn hàng nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topLocations.slice(0, 6).map((item) => (
                      <div key={item.location} className="flex items-center text-sm">
                        <div className="w-32 font-medium text-slate-600">{item.location}</div>
                        <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-800" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <div className="w-12 text-right font-bold">{item.percentage}%</div>
                      </div>
                    ))}
                    {!topLocations.length && <p className="text-sm text-slate-500">Không có dữ liệu địa lý.</p>}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Tổng đơn hàng</div>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">{locations?.totalOrders ?? 0}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Tổng doanh thu</div>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{categories ? formatCurrency(categories.totalRevenue) : "—"}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
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
          so với kỳ trước
        </p>
      </CardContent>
    </Card>
  )
}