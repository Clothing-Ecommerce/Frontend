import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { orderMock, slaSummary, type OrderItem, type OrderStatus } from "@/data/adminMock"

const statusLabels: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  packed: "Đã đóng gói",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
  refunded: "Hoàn tiền",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(orderMock)
  const [search, setSearch] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [onlyHighValue, setOnlyHighValue] = useState(false)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search.trim().length === 0 ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase())
      const matchesChannel =
        selectedChannels.length === 0 || selectedChannels.includes(order.channel)
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesValue = !onlyHighValue || order.value >= 2000000
      return matchesSearch && matchesChannel && matchesStatus && matchesValue
    })
  }, [orders, search, selectedChannels, statusFilter, onlyHighValue])

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  const toggleSplitOrder = (id: string) => {
    setOrders((prev) => {
      const isSplitChild = id.includes("-")
      const baseId = isSplitChild ? id.split("-")[0] : id
      const existingSplit = prev.filter((order) => order.id.startsWith(`${baseId}-`))
      if (existingSplit.length > 0) {
        const original = prev.find((order) => order.id === baseId) ?? orderMock.find((order) => order.id === baseId)
        const merged: OrderItem =
          original ?? {
            ...existingSplit[0],
            id: baseId,
            value: existingSplit.reduce((sum, item) => sum + item.value, 0),
          }
        return prev.filter((order) => !order.id.startsWith(`${baseId}-`)).map((order) => (order.id === baseId ? merged : order))
      }

      const target = prev.find((order) => order.id === id)
      if (!target) return prev
      const splitA: OrderItem = {
        ...target,
        id: `${id}-A`,
        value: Math.round(target.value * 0.6),
        status: "processing",
      }
      const splitB: OrderItem = {
        ...target,
        id: `${id}-B`,
        value: Math.round(target.value * 0.4),
        status: "pending",
      }
      return prev.filter((order) => order.id !== id).concat([splitA, splitB])
    })
  }

  const changePaymentMethod = (id: string, method: OrderItem["payment"]) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, payment: method } : order)))
  }

  const resetWorkflow = (statusSequence: OrderStatus[]) => {
    setOrders((prev) =>
      prev.map((order) => ({
        ...order,
        status: statusSequence.includes(order.status) ? order.status : statusSequence[0],
      })),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Quản lý đơn hàng</CardTitle>
            {/* <CardDescription>
              Bộ lọc nâng cao theo trạng thái, kênh bán và giá trị; can thiệp quy trình xử lý đặc biệt
            </CardDescription> */}
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
            {/* <Select
              onValueChange={(value) => {
                setSelectedChannels((prev) =>
                  prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
                )
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Kênh bán" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Website",
                  "Shopee",
                  "Lazada",
                  "Tiktok Shop",
                ].map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {selectedChannels.includes(channel) ? "✔ " : ""}
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            {/* <label className="flex items-center gap-2 text-xs text-slate-600">
              <Checkbox
                checked={onlyHighValue}
                onCheckedChange={(value) => setOnlyHighValue(Boolean(value))}
              />
              Chỉ hiển thị đơn &gt; 2 triệu
            </label>
            <Button variant="outline" onClick={() => resetWorkflow(["pending", "processing", "shipping", "completed"]) }>
              Chuẩn hoá pipeline
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Giao hàng đúng hạn</p>
              <p className="text-2xl font-semibold text-emerald-600">{slaSummary.delivery.onTime}%</p>
              <p className="text-xs text-slate-500">Trễ {slaSummary.delivery.delayed}% • TB {slaSummary.delivery.averageHours}h</p>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Hoàn trả</p>
              <p className="text-2xl font-semibold text-sky-600">{slaSummary.returns.within}%</p>
              <p className="text-xs text-slate-500">Quá hạn {slaSummary.returns.overdue}% • TB {slaSummary.returns.averageHours}h</p>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Đơn giá trị cao (2tr)</p>
              <p className="text-2xl font-semibold text-amber-600">
                {orders.filter((order) => order.value > 2000000).length}
              </p>
              {/* <p className="text-xs text-slate-500">Theo dõi sát các đơn có rủi ro hoàn trả</p> */}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Đơn</th>
                  {/* <th className="px-4 py-3">Kênh</th> */}
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Giá trị</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  {/* <th className="px-4 py-3">SLA</th> */}
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{order.id}</td>
                    {/* <td className="px-4 py-3">
                      <Badge variant="secondary">{order.channel}</Badge>
                    </td> */}
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {new Intl.NumberFormat("vi-VN").format(order.value)}đ
                    </td>
                    <td className="px-4 py-3">
                      <Select value={order.payment} onValueChange={(value) => changePaymentMethod(order.id, value as OrderItem["payment"])}>
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
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}>
                        <SelectTrigger className="h-8 w-32 text-xs">
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
                    {/* <td className="px-4 py-3 text-xs text-slate-500">
                      Giao: {order.sla.fulfillment}h
                      <br />Hoàn: {order.sla.return || "-"}h
                    </td> */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {/* <Button size="sm" variant="outline" onClick={() => toggleSplitOrder(order.id)}>
                          Tách/Gộp
                        </Button> */}
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "refunded") }>
                          Hoàn tiền
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Tự động hoá quy trình</CardTitle>
          <CardDescription>
            Thiết lập pipeline trạng thái đơn, cảnh báo COD và quy tắc hoàn tiền
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => resetWorkflow(["pending", "processing", "packed", "shipping", "completed"]) }>
              Chuẩn hoá 5 bước
            </Button>
            <Button size="sm" variant="outline" onClick={() => resetWorkflow(["pending", "processing", "completed"]) }>
              Pipeline rút gọn
            </Button>
            <Button size="sm">Tạo automation mới</Button>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Quy tắc COD</p>
              <p className="text-xs text-slate-500">
                Tự động gọi xác nhận với đơn COD &gt; 2 triệu, gửi cảnh báo nếu khách từng hoàn trả.
              </p>
              <Button size="sm" className="mt-3" variant="outline">
                Chỉnh quy tắc
              </Button>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Hoàn trả nhanh</p>
              <p className="text-xs text-slate-500">
                SLA hoàn tiền 24h sau khi nhận kho, phân loại lý do hoàn theo danh mục.
              </p>
              <Button size="sm" className="mt-3" variant="outline">
                Thiết lập biểu mẫu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}