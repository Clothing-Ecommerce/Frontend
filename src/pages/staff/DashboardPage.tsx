import { useMemo } from "react"
import { useOutletContext } from "react-router-dom"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  LifeBuoy,
  Package,
  PackageCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import type { StaffOutletContext } from "./StaffLayout"

function renderSparkline(values: number[]) {
  const maxValue = Math.max(...values, 1)
  return (
    <div className="flex h-16 items-end gap-1">
      {values.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-sm bg-gradient-to-t from-slate-200 to-slate-400"
          style={{ height: `${Math.max(12, Math.round((value / maxValue) * 60))}%` }}
        />
      ))}
    </div>
  )
}

export default function StaffDashboardPage() {
  const {
    profile,
    orders,
    inventory,
    chartView,
    setChartView,
    tasks,
    setTasks,
    setOrderStatusFilter,
    navigateToSection,
    formatCurrency,
  } = useOutletContext<StaffOutletContext>()

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.quantity <= item.reorderPoint),
    [inventory],
  )

  const orderSummary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += order.total
        acc.byStatus[order.status] += 1
        return acc
      },
      { total: 0, byStatus: { new: 0, processing: 0, delivered: 0, returned: 0 } },
    )
  }, [orders])

  const handleTaskToggle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Xin chào, {profile.name}</h1>
          <p className="text-sm text-slate-500">Theo dõi nhanh hiệu suất và công việc ưu tiên trong ngày.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setOrderStatusFilter("new")
              navigateToSection("orders", { status: "new" })
            }}
          >
            <PackageCheck className="h-4 w-4" /> Xử lý đơn mới
          </Button>
          <Button variant="default" className="gap-2" onClick={() => navigateToSection("support")}>
            <LifeBuoy className="h-4 w-4" /> Trả lời yêu cầu hỗ trợ
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-100 bg-blue-50/40">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base text-blue-900">Đơn mới hôm nay</CardTitle>
              <CardDescription>{orderSummary.byStatus.new} đơn chờ xác nhận</CardDescription>
            </div>
            <Package className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-900">{orderSummary.byStatus.new}</div>
            <div className="mt-4">{renderSparkline(staffMockData.dashboard.miniCharts[chartView].newOrders)}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-amber-50/40">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base text-amber-900">Đơn đang xử lý</CardTitle>
              <CardDescription>Đã đóng gói {orderSummary.byStatus.processing} đơn</CardDescription>
            </div>
            <ClipboardList className="h-6 w-6 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-900">{orderSummary.byStatus.processing}</div>
            <div className="mt-4">{renderSparkline(staffMockData.dashboard.miniCharts[chartView].tickets)}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base text-emerald-900">Đơn đã giao</CardTitle>
              <CardDescription>{orderSummary.byStatus.delivered} đơn hoàn thành</CardDescription>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-900">{orderSummary.byStatus.delivered}</div>
            <div className="mt-4 text-sm text-emerald-700">Doanh thu: {formatCurrency(orderSummary.total)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Việc cần làm hôm nay</CardTitle>
              <CardDescription>Ưu tiên hoàn thành trước các mốc đã đặt.</CardDescription>
            </div>
            <Tabs value={chartView} onValueChange={(value) => setChartView(value as "daily" | "weekly")}>
              <TabsList>
                <TabsTrigger value="daily">Theo ngày</TabsTrigger>
                <TabsTrigger value="weekly">Theo tuần</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-dashed p-4">
                <div className="flex items-start gap-3">
                  <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleTaskToggle(task.id)} />
                  <div>
                    <label htmlFor={task.id} className="font-medium text-slate-900">
                      {task.title}
                    </label>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Trước {task.due}
                      </span>
                      <Button
                        variant="link"
                        className="h-auto px-0 text-xs"
                        onClick={() =>
                          navigateToSection(task.relatedSection, {
                            status: task.relatedSection === "orders" ? "new" : undefined,
                          })
                        }
                      >
                        Đi tới nghiệp vụ <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {task.completed ? (
                  <Badge variant="secondary" className="border-green-200 bg-green-50 text-green-700">
                    Đã xong
                  </Badge>
                ) : (
                  <Badge variant="secondary">Đang mở</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Cảnh báo tồn kho thấp
            </CardTitle>
            <CardDescription>Sản phẩm dưới mức cảnh báo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.length === 0 && (
              <p className="text-sm text-slate-500">Tồn kho an toàn. Không có sản phẩm nào dưới hạn mức.</p>
            )}
            {lowStockItems.map((item) => (
              <div key={item.sku} className="flex items-start justify-between rounded-lg bg-amber-50 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.variant}</div>
                  <div className="mt-2 text-xs text-amber-700">
                    Còn {item.quantity} | Mức cảnh báo {item.reorderPoint}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigateToSection("inventory")}>
                  Gửi yêu cầu nhập kho
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}