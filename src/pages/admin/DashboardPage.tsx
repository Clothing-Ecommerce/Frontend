import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  alerts,
  bestSellingProducts,
  dashboardKPIs,
  slowProducts,
  type TimeRange,
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

  useEffect(() => {
    const pinFromQuery = searchParams.get("pin")
    if (pinFromQuery && !pinnedReports.includes(pinFromQuery)) {
      setPinnedReports((prev) => [...prev, pinFromQuery])
      searchParams.delete("pin")
      setSearchParams(searchParams, { replace: true })
    }
  }, [pinnedReports, searchParams, setSearchParams])

  const activeKpi = dashboardKPIs[timeRange]

  const toggleWidget = (id: WidgetId) => {
    setWidgets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const togglePinned = (title: string) => {
    setPinnedReports((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
  }

  const renderOrderStatusBar = () => {
    const total = Object.values(activeKpi.orders).reduce((sum, val) => sum + val, 0)
    return (
      <div className="mt-3 flex overflow-hidden rounded-full border text-xs">
        {Object.entries(activeKpi.orders).map(([status, value]) => (
          <div
            key={status}
            className={cn(
              "flex-1 px-3 py-1 text-center text-white",
              status === "completed" && "bg-emerald-500",
              status === "processing" && "bg-amber-500",
              status === "pending" && "bg-slate-500",
              status === "cancelled" && "bg-rose-500",
            )}
            style={{ width: `${(value / total) * 100}%` }}
          >
            {status} ({value})
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl">Hiệu quả tổng quan</CardTitle>
            <CardDescription>
              So sánh theo mốc thời gian và drill-down vào dữ liệu chi tiết
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chu kỳ</p>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
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
            <Button variant="outline">Thiết lập so sánh kỳ trước</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {widgets.revenue && (
            <div
              className="cursor-pointer rounded-xl border bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-6 text-white shadow-lg"
              onClick={() => navigate("/admin/reports")}
            >
              <p className="text-sm uppercase tracking-widest text-blue-100">Doanh thu</p>
              <h3 className="text-3xl font-semibold">{formatter.format(activeKpi.revenue)}</h3>
              <p className="mt-2 text-sm text-blue-100">+12% so với kỳ trước</p>
              <div className="mt-4 flex items-center justify-between text-xs text-blue-100">
                <span>Tỉ lệ chuyển đổi 3.2%</span>
                <span>Giá trị trung bình 1.54 triệu</span>
              </div>
            </div>
          )}
          {widgets.orders && (
            <Card className="border-dashed border-blue-100 bg-white/90 hover:border-blue-400">
              <CardHeader>
                <CardTitle>Đơn hàng</CardTitle>
                <CardDescription>Phân bổ trạng thái và SLA giao nhận</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(activeKpi.orders).map(([status, value]) => (
                    <div key={status} className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{status}</p>
                      <p className="text-xl font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                {renderOrderStatusBar()}
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => navigate("/admin/orders")}
                >
                  Drill-down đơn hàng
                </Button>
              </CardContent>
            </Card>
          )}
          {widgets.customers && (
            <Card className="border-emerald-200 bg-white">
              <CardHeader>
                <CardTitle>Khách hàng</CardTitle>
                <CardDescription>Khách mới vs quay lại</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Khách mới</p>
                    <p className="text-2xl font-semibold text-emerald-600">{activeKpi.customers.new}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Quay lại</p>
                    <p className="text-2xl font-semibold text-sky-600">{activeKpi.customers.returning}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-emerald-200 p-4 text-sm text-slate-600">
                  <p>
                    Loyalty campaign đang tăng tỷ lệ quay lại thêm <strong>8%</strong>.
                  </p>
                </div>
                <Button onClick={() => navigate("/admin/customers")}>Xem phân khúc</Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

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