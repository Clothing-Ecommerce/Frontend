import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Inbox, Mail, Package, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { StaffOutletContext } from "./StaffLayout"
import { orderStatusLabel } from "./StaffLayout"

export default function StaffCustomersPage() {
  const { customers, setCustomers, formatDate, formatCurrency, showToast } =
    useOutletContext<StaffOutletContext>()

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id ?? null)
  const [customerNoteDraft, setCustomerNoteDraft] = useState("")

  useEffect(() => {
    if (!selectedCustomerId && customers[0]) {
      setSelectedCustomerId(customers[0].id)
    }
  }, [customers, selectedCustomerId])

  const selectedCustomer = useMemo(
    () => (selectedCustomerId ? customers.find((customer) => customer.id === selectedCustomerId) ?? null : null),
    [customers, selectedCustomerId],
  )

  const appendCustomerNote = () => {
    if (!selectedCustomer || !customerNoteDraft.trim()) return
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              notes: [customerNoteDraft.trim(), ...customer.notes],
            }
          : customer,
      ),
    )
    setCustomerNoteDraft("")
    showToast({
      title: "Đã lưu ghi chú",
      description: `Thêm ghi chú chăm sóc cho ${selectedCustomer.name}.`,
      type: "success",
    })
  }

  const handleCustomerContact = (type: "call" | "email") => {
    if (!selectedCustomer) return
    showToast({
      title: type === "call" ? "Gọi khách" : "Gửi email",
      description:
        type === "call"
          ? `Đang quay số ${selectedCustomer.phone}`
          : `Đã mở mẫu email cho ${selectedCustomer.email}.`,
      type: "info",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Danh sách khách hàng</h3>
            <Badge variant="secondary">{customers.length}</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {customers.map((customer) => (
              <button
                key={customer.id}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  selectedCustomerId === customer.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent hover:bg-slate-50",
                )}
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                <div className="font-medium text-slate-900">{customer.name}</div>
                <div className="text-xs text-slate-500">{customer.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedCustomer ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{selectedCustomer.name}</CardTitle>
                <CardDescription>Mã khách: {selectedCustomer.id}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCustomerContact("email")}>
                  <Mail className="h-4 w-4" /> Gửi email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> {selectedCustomer.phone}
              </div>
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-slate-400" /> {selectedCustomer.email}
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" /> Địa chỉ: {selectedCustomer.defaultAddress}
              </div>
              <div>
                <h4 className="mb-1 font-medium text-slate-900">Ghi chú</h4>
                <ul className="space-y-2 text-xs">
                  {selectedCustomer.notes.map((note, index) => (
                    <li key={index} className="rounded border bg-slate-50 p-2">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
              <CardDescription>Theo dõi đơn đang mở và đã hoàn tất.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-500">Đơn đang mở</h4>
                {selectedCustomer.openOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">Không có đơn mở.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.openOrders.map((orderId) => (
                      <Badge key={orderId} variant="outline" className="font-mono">
                        {orderId}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-500">Gần đây</h4>
                <ul className="space-y-2 text-sm">
                  {selectedCustomer.recentOrders.map((order) => (
                    <li key={order.id} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2">
                      <div>
                        <div className="font-medium text-slate-900">{order.id}</div>
                        <div className="text-xs text-slate-500">{formatDate(order.placedAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-900">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-slate-500">{orderStatusLabel[order.status]}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thêm ghi chú chăm sóc</CardTitle>
              <CardDescription>Lưu lịch sử tương tác nội bộ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={customerNoteDraft}
                onChange={(event) => setCustomerNoteDraft(event.target.value)}
                placeholder="Ghi chú mới..."
              />
              <Button className="self-end" onClick={appendCustomerNote}>
                Lưu ghi chú
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Chọn khách hàng để xem chi tiết.
        </div>
      )}
    </div>
  )
}