import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import {
  Filter,
  MapPin,
  Package,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { StaffOutletContext } from "./StaffLayout"
import { orderStatusAccent, orderStatusBadge, orderStatusLabel } from "./StaffLayout"

export default function StaffOrdersPage() {
  const {
    orders,
    setOrders,
    orderStatusFilter,
    setOrderStatusFilter,
    orderSearchTerm,
    setOrderSearchTerm,
    selectedOrderId,
    setSelectedOrderId,
    formatCurrency,
    formatDateTime,
    getInitials,
    showToast,
  } = useOutletContext<StaffOutletContext>()

  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderNoteDraft, setOrderNoteDraft] = useState("")

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter
      const keyword = orderSearchTerm.trim().toLowerCase()
      const matchesKeyword =
        keyword.length === 0 ||
        order.id.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        formatDateTime(order.createdAt).toLowerCase().includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [orders, orderStatusFilter, orderSearchTerm, formatDateTime])

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId(null)
      return
    }

    if (!filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0]?.id ?? null)
    }
  }, [filteredOrders, selectedOrderId, setSelectedOrderId])

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null

  const openOrderDetail = (order: typeof orders[number], options?: { openDialog?: boolean }) => {
    setSelectedOrderId(order.id)
    setOrderNoteDraft("")
    if (options?.openDialog) {
      setOrderDialogOpen(true)
    }
  }

  const updateOrderStatus = (status: typeof orders[number]["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrderId
          ? {
              ...order,
              status,
            }
          : order,
      ),
    )
    showToast({
      title: "Cập nhật trạng thái",
      description: `Đơn ${selectedOrderId ?? ""} đã chuyển sang "${orderStatusLabel[status]}"`,
      type: "success",
    })
  }

  const appendOrderNote = () => {
    if (!orderNoteDraft.trim() || !selectedOrder) return
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              notes: [...order.notes, orderNoteDraft.trim()],
            }
          : order,
      ),
    )
    setOrderNoteDraft("")
    showToast({
      title: "Đã thêm ghi chú",
      description: "Ghi chú nội bộ đã được lưu.",
      type: "info",
    })
  }

  const acceptReturnRequest = () => {
    if (!selectedOrder) return
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: "returned",
              isReturnRequested: false,
              notes: [...order.notes, "Đã tiếp nhận yêu cầu đổi/hoàn."],
            }
          : order,
      ),
    )
    showToast({
      title: "Xử lý hoàn trả",
      description: `Đơn ${selectedOrder.id} đã chuyển sang trạng thái hoàn trả.`,
      type: "success",
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Orders</p>
          <h2 className="text-2xl font-semibold text-[#1f1b16]">Quản lý đơn hàng</h2>
          <p className="text-sm text-[#7a6f60]">
            Hiển thị nhanh tình trạng đơn và truy cập thông tin chi tiết ở bảng điều khiển bên phải.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "processing", "delivered", "returned"] as const).map((status) => {
            const isActive = orderStatusFilter === status
            return (
              <Button
                key={status}
                variant="outline"
                className={cn(
                  "rounded-full border-[#ead7b9] bg-white/70 text-[#6c6252] backdrop-blur transition hover:bg-[#efe2c6]",
                  isActive &&
                    "border-transparent bg-[#1f1b16] text-white shadow-[0_12px_30px_rgba(23,20,16,0.25)] hover:bg-[#1f1b16]",
                )}
                onClick={() => setOrderStatusFilter(status)}
              >
                {status === "all" ? "Tất cả" : orderStatusLabel[status]}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden border-none bg-[#fdfbf7] shadow-[0_24px_60px_rgba(23,20,16,0.12)]">
          <CardHeader className="space-y-4 border-b border-[#ead7b9] bg-[#f7efe1]/70 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c87d2f]" />
                <Input
                  value={orderSearchTerm}
                  onChange={(event) => setOrderSearchTerm(event.target.value)}
                  placeholder="Tìm mã đơn, khách hàng, thời gian"
                  className="h-11 rounded-xl border-[#ead7b9] bg-white/70 pl-10 text-sm text-[#1f1b16] placeholder:text-[#b8a47a]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7a6f60]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full border border-[#ead7b9] bg-white/70 px-4 text-[#6c6252] hover:bg-[#efe2c6]"
                >
                  <Filter className="h-4 w-4" /> Bộ lọc nâng cao
                </Button>
                <span className="hidden lg:inline">•</span>
                <span>
                  {filteredOrders.length} / {orders.length} đơn hiển thị
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.28em] text-[#b8a47a]">
                    <th className="px-6 py-4 text-left font-medium">Đơn</th>
                    <th className="px-6 py-4 text-left font-medium">Khách hàng</th>
                    <th className="px-6 py-4 text-left font-medium">Ngày tạo</th>
                    <th className="px-6 py-4 text-left font-medium">Tổng tiền</th>
                    <th className="px-6 py-4 text-left font-medium">Trạng thái</th>
                    <th className="px-6 py-4 text-right font-medium"> </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isSelected = order.id === selectedOrderId
                    return (
                      <tr
                        key={order.id}
                        onClick={() => openOrderDetail(order)}
                        className={cn(
                          "cursor-pointer border-b border-[#f0e4cc] text-sm transition-colors",
                          isSelected ? "bg-[#f7efe1]" : "hover:bg-[#f9f4ea]",
                        )}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-[#1f1b16]">
                          <div className="flex items-center gap-3">
                            <span className={cn("h-2.5 w-2.5 rounded-full", orderStatusAccent[order.status])} />
                            {order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6c6252]">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-[#6c6252]">{formatDateTime(order.createdAt)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#1f1b16]">{formatCurrency(order.total)}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn("border", orderStatusBadge[order.status])}>
                            {orderStatusLabel[order.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full border border-[#ead7b9] px-3 py-1 text-xs text-[#1f1b16] hover:bg-[#efe2c6]"
                            onClick={(event) => {
                              event.stopPropagation()
                              openOrderDetail(order, { openDialog: true })
                            }}
                          >
                            Cập nhật
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedOrder ? (
            <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-[#ead7b9] bg-white/80 p-6 shadow-[0_20px_50px_rgba(23,20,16,0.1)]">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8a47a]">
                      Order #{selectedOrder.id}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#1f1b16]">{selectedOrder.customerName}</h3>
                    <p className="text-sm text-[#7a6f60]">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7efe1] text-lg font-semibold text-[#c87d2f]">
                    {getInitials(selectedOrder.customerName)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("border", orderStatusBadge[selectedOrder.status])}>
                    {orderStatusLabel[selectedOrder.status]}
                  </Badge>
                  <span className="text-sm font-medium text-[#1f1b16]">{formatCurrency(selectedOrder.total)}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#1f1b16]">Thông tin giao nhận</h4>
                  <div className="rounded-2xl border border-[#ead7b9] bg-white/60 p-4 text-sm text-[#6c6252]">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-[#c87d2f]" />
                      <span>{selectedOrder.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#1f1b16]">Sản phẩm</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.sku}
                        className="flex items-center justify-between rounded-2xl border border-[#ead7b9] bg-white/60 px-4 py-3 text-sm text-[#6c6252]"
                      >
                        <div>
                          <div className="font-medium text-[#1f1b16]">{item.name}</div>
                          <div className="text-xs text-[#9a8f7f]">SKU: {item.sku}</div>
                        </div>
                        <div className="text-right text-sm font-medium text-[#1f1b16]">
                          x{item.quantity} • {formatCurrency(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#1f1b16]">Tiến trình đơn</h4>
                  <ol className="space-y-2">
                    {selectedOrder.timeline.map((step, index) => (
                      <li
                        key={`${step.label}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-[#ead7b9]/70 bg-white/60 px-4 py-2 text-xs text-[#6c6252]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#c87d2f]/70" />
                          <span className="font-medium text-[#1f1b16]">{step.label}</span>
                        </div>
                        <span className="font-mono text-[#9a8f7f]">{step.time}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#1f1b16]">Ghi chú gần đây</h4>
                  <div className="space-y-2 text-xs text-[#6c6252]">
                    {selectedOrder.notes.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-[#ead7b9] bg-white/40 p-3 text-center">
                        Chưa có ghi chú nội bộ.
                      </p>
                    ) : (
                      selectedOrder.notes.slice(-3).map((note, index) => (
                        <div key={`${note}-${index}`} className="rounded-2xl border border-[#ead7b9] bg-white/60 p-3">
                          {note}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full gap-2 rounded-full bg-[#1f1b16] text-white hover:bg-[#332b22]"
                  onClick={() => setOrderDialogOpen(true)}
                >
                  <Package className="h-4 w-4" /> Cập nhật đơn hàng
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full border-[#ead7b9] bg-white/70 text-[#1f1b16] hover:bg-[#efe2c6]"
                  >
                    Theo dõi vận đơn
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full border-[#ead7b9] bg-white/70 text-[#1f1b16] hover:bg-[#ffe0e0]"
                  >
                    Tạo hoàn tiền
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-[#ead7b9] bg-white/60 p-6 text-sm text-[#7a6f60]">
              Chọn một đơn ở bảng bên trái để xem chi tiết.
            </div>
          )}
        </div>
      </div>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder ? (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Cập nhật đơn {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Điều chỉnh trạng thái, thêm ghi chú và đánh dấu xử lý hoàn trả.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                {(["new", "processing", "delivered", "returned"] as const).map((status) => {
                  const isActive = selectedOrder.status === status
                  return (
                    <Button
                      key={status}
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "justify-start gap-3 rounded-xl border px-4 py-3 text-left text-sm",
                        isActive && "border-transparent",
                      )}
                      onClick={() => updateOrderStatus(status)}
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full", orderStatusAccent[status])} />
                      <span>{orderStatusLabel[status]}</span>
                    </Button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="order-note">
                  Thêm ghi chú nội bộ
                </label>
                <Textarea
                  id="order-note"
                  value={orderNoteDraft}
                  onChange={(event) => setOrderNoteDraft(event.target.value)}
                  placeholder="Ví dụ: Đã gọi xác nhận khách lúc 9h00..."
                />
                <Button size="sm" className="mt-2" onClick={appendOrderNote}>
                  Lưu ghi chú
                </Button>
              </div>

              {selectedOrder.isReturnRequested && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  Khách hàng đã yêu cầu đổi/hoàn hàng.
                  <Button size="sm" variant="link" className="ml-2 px-0" onClick={acceptReturnRequest}>
                    Đánh dấu đã xử lý
                  </Button>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-900">Ghi chú đã lưu</h4>
                <ul className="mt-2 space-y-2 text-xs">
                  {selectedOrder.notes.map((note, index) => (
                    <li key={index} className="rounded border bg-slate-50 p-2">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogDescription>Không tìm thấy đơn hàng.</DialogDescription>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}