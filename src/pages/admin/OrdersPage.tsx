import { useEffect, useMemo, useState } from "react"
import { MapPin, Package, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { orderMock, type OrderItem, type OrderStatus } from "@/data/adminMock"

const statusLabels: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  packed: "Đã đóng gói",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
  refunded: "Hoàn tiền",
}

const statusBadge: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  packed: "border-sky-200 bg-sky-50 text-sky-700",
  shipping: "border-indigo-200 bg-indigo-50 text-indigo-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
  refunded: "border-rose-200 bg-rose-50 text-rose-700",
}

const statusAccent: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  packed: "bg-sky-500",
  shipping: "bg-indigo-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-400",
  refunded: "bg-rose-500",
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  hour12: false,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDateTime(iso: string) {
  try {
    return dateTimeFormatter.format(new Date(iso))
  } catch {
    return iso
  }
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

  return initials || "AD"
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(orderMock)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search.trim().length === 0 ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  useEffect(() => {
    if (!selectedOrderId) return
    const stillVisible = filteredOrders.some((order) => order.id === selectedOrderId)
    if (!stillVisible) {
      setSelectedOrderId(null)
      setIsDetailOpen(false)
    }
  }, [filteredOrders, selectedOrderId])

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  const changePaymentMethod = (id: string, method: OrderItem["payment"]) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, payment: method } : order)))
  }

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsDetailOpen(true)
  }

  const closeDetail = () => setIsDetailOpen(false)

  const OrderDetailContent = ({ order }: { order: OrderItem | null }) => {
    if (!order?.detail) {
      return (
        <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
          Chọn một đơn để xem chi tiết.
        </div>
      )
    }

  const accent = statusAccent[order.status]

  return (
      <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Order #{order.id}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">{order.customer}</h3>
              <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 lg:flex">
                {getInitials(order.customer)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-slate-200 hover:bg-slate-100"
                onClick={closeDetail}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge className={cn("border", statusBadge[order.status])}>{statusLabels[order.status]}</Badge>
            <span className="text-sm font-semibold text-slate-800">{formatCurrency(order.value)}</span>
            <span className="hidden sm:inline">•</span>
            <span>Kênh: {order.channel}</span>
            <span>Thanh toán: {order.payment}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">Thông tin giao nhận</h4>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                <span>{order.detail.address}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">Sản phẩm</h4>
            <div className="space-y-2">
              {order.detail.items.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"
                >
                  <div>
                    <div className="font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-800">
                    x{item.quantity} • {formatCurrency(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">Tiến trình đơn</h4>
            <ol className="space-y-2">
              {order.detail.timeline.map((step, index) => {
                const isCompleted = step.time !== "--" && step.time.toLowerCase() !== "đang xử lý"

                return (
                  <li
                    key={`${step.label}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs text-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 rounded-full", isCompleted ? accent : "bg-slate-300")} />
                      <span className="font-medium text-slate-800">{step.label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{step.time}</span>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">Ghi chú gần đây</h4>
            <div className="space-y-2 text-xs text-slate-600">
              {order.detail.notes.map((note, index) => (
                <div key={`${note}-${index}`} className="rounded-2xl border border-slate-200 bg-white/70 p-3 leading-relaxed">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button type="button" className="w-full gap-2">
            <Package className="h-4 w-4" /> Cập nhật đơn hàng
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="flex-1">
              Theo dõi vận đơn
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Xuất hoá đơn
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-6 overflow-x-hidden">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Quản lý đơn hàng</CardTitle>
            <CardDescription>
              Hiển thị nhanh tình trạng đơn hàng, truy cập thông tin chi tiết
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Tìm mã đơn hoặc khách hàng"
              className="w-56"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div
            className={cn(
              "flex flex-col gap-6 lg:grid",
              isDetailOpen ? "lg:grid-cols-[minmax(0,1fr)_400px]" : "lg:grid-cols-[minmax(0,1fr)_0px]",
            )}
            style={{ transition: "grid-template-columns 0.4s ease" }}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Đơn</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Giá trị</th>
                    <th className="px-4 py-3">Thanh toán</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white text-sm">
                  {filteredOrders.map((order) => {
                    const isSelected = order.id === selectedOrderId
                    return (
                      <tr
                        key={order.id}
                        className={cn("transition-colors hover:bg-slate-50", isSelected && "bg-slate-50")}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">{order.id}</td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(order.value)}</td>
                        <td className="px-4 py-3">
                          <Select
                            value={order.payment}
                            onValueChange={(value) => changePaymentMethod(order.id, value as OrderItem["payment"])}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COD">COD</SelectItem>
                              <SelectItem value="Online">Online</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                          >
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(statusLabels).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {statusLabels[status as OrderStatus]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => openOrderDetail(order.id)}>
                              Xem chi tiết
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div
              className={cn(
                "hidden min-h-[28rem] lg:flex",
                isDetailOpen ? "opacity-100" : "pointer-events-none opacity-0",
                "transition-opacity duration-300",
              )}
            >
              <OrderDetailContent order={selectedOrder} />
            </div>
          </div>

          <div
            className={cn(
              "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
              isDetailOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={closeDetail}
          />

          <div
            className={cn(
              "fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 transition-transform duration-300 lg:hidden",
              isDetailOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            <OrderDetailContent order={selectedOrder} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}