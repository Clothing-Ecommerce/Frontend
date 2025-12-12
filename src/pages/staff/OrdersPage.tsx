import { useEffect, useMemo, useState } from "react";
import axios from "axios"
import { useOutletContext } from "react-router-dom";
import {
  Filter,
  MapPin,
  Package,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import api from "@/utils/axios";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type {
  StaffOrderDetail,
  StaffOrderDisplayStatus,
  StaffOrderListResult,
  StaffOrderStatus,
  StaffOrderStatusUpdateResponse,
  StaffOrderSummary,
} from "@/types/staffType"

import type { StaffOutletContext } from "./StaffLayout"
import {
  orderStatusAccent,
  orderStatusBadge,
  orderStatusLabel,
} from "./StaffLayout"

export default function StaffOrdersPage() {
  const { formatCurrency, formatDateTime, showToast } = useOutletContext<StaffOutletContext>()

  const [orders, setOrders] = useState<StaffOrderSummary[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState<StaffOrderDisplayStatus | "all">("all")
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<StaffOrderDetail | null>(null)

  const [isListLoading, setIsListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // State cho Dialog cập nhật trạng thái
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [isStatusSaving, setIsStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // State cho Dialog yêu cầu hoàn tiền
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundReason, setRefundReason] = useState("")

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "ST"

  // State cho ghi chú nội bộ
  // const [orderNoteDraft, setOrderNoteDraft] = useState("")
  const mapAdminStatusToStaff = (
    status: StaffOrderStatus,
  ): StaffOrderDisplayStatus => {
    switch (status) {
      case "pending":
        return "new"
      case "processing":
      case "packed":
      case "shipping":
        return "processing"
      case "completed":
        return "delivered"
      default:
        return "returned"
    }
  }

  const staffStatusToAdmin = (status: StaffOrderDisplayStatus): StaffOrderStatus => {
    switch (status) {
      case "new":
        return "pending"
      case "processing":
        return "processing"
      case "delivered":
        return "completed"
      case "returned":
        return "cancelled"
    }
  }

  const buildStatusFilterParam = (
    status: StaffOrderDisplayStatus | "all",
  ): string | undefined => {
    if (status === "all") return undefined
    const adminStatuses =
      status === "new"
        ? ["pending"]
        : status === "processing"
        ? ["processing", "packed", "shipping"]
        : status === "delivered"
        ? ["completed"]
        : ["cancelled", "refunded"]

    return adminStatuses.join(",")
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(orderSearchTerm.trim())
    }, 400)

    return () => window.clearTimeout(handle)
  }, [orderSearchTerm])

  useEffect(() => {
    const controller = new AbortController()
    setIsListLoading(true)
    setListError(null)

    api
      .get<StaffOrderListResult>("/admin/orders", {
        params: {
          page: 1,
          pageSize: 50,
          search: debouncedSearch || undefined,
          status: buildStatusFilterParam(orderStatusFilter),
        },
        signal: controller.signal,
      })
      .then((response) => {
        setOrders(response.data.orders)

        if (!selectedOrderId && response.data.orders.length) {
          setSelectedOrderId(response.data.orders[0].id)
          return
        }

        if (
          selectedOrderId &&
          response.data.orders.every((order) => order.id !== selectedOrderId)
        ) {
          setSelectedOrderId(response.data.orders[0]?.id ?? null)
        }
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Unable to load order list"
        setListError(message)
        setOrders([])
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsListLoading(false)
        }
      })

    return () => controller.abort()
  }, [
    debouncedSearch,
    orderStatusFilter,
    selectedOrderId,
    setSelectedOrderId,
  ])

  const filteredOrders = useMemo(() => orders, [orders])

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null)
      setDetailError(null)
      return
    }

    const controller = new AbortController()
    setIsDetailLoading(true)
    setDetailError(null)

    api
      .get<StaffOrderDetail>(`/admin/orders/${selectedOrderId}`, {
        signal: controller.signal,
      })
      .then((response) => {
        setSelectedOrder(response.data)
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Unable to load order details"
        setDetailError(message)
        setSelectedOrder(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsDetailLoading(false)
        }
      })

    return () => controller.abort()
  }, [selectedOrderId])

  useEffect(() => {
    if (statusDialogOpen) {
      setStatusError(null)
    }
  }, [statusDialogOpen])

  const openOrderDetail = (orderId: number) => {
    setSelectedOrderId(orderId)
  }

  const applyOrderUpdate = (payload: StaffOrderStatusUpdateResponse) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === payload.summary.id ? payload.summary : order)),
    )

    setSelectedOrder(payload.order)
    setSelectedOrderId(payload.order.id)
    return payload.order
  }

  // Chức năng: Cập nhật trạng thái đơn hàng (Quy trình bình thường)
  const updateOrderStatus = (status: StaffOrderDisplayStatus) => {
    if (!selectedOrder?.id) return

    const adminStatus = staffStatusToAdmin(status)
    setIsStatusSaving(true)
    setStatusError(null)

    api
      .patch<StaffOrderStatusUpdateResponse>(
        `/admin/orders/${selectedOrder.id}/status`,
        { status: adminStatus },
      )
      .then((response) => {
        const updated = applyOrderUpdate(response.data)
        setStatusDialogOpen(false)
        showToast({
          title: "Update successful",
          description: `Order ${updated.code ?? updated.id} has been changed to "${
            orderStatusLabel[mapAdminStatusToStaff(updated.status)]
          }"`,
          type: "success",
        })
      })
      .catch((error) => {
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Unable to update order status"
        setStatusError(message)
      })
      .finally(() => setIsStatusSaving(false))
  }

  // Function: Submit refund request (Send to Admin for approval)
  const submitRefundRequest = () => {
    if (!selectedOrder?.id || !refundReason.trim()) return

    const currentAdminStatus = selectedOrder.status

    setIsDetailLoading(true)

    api
      .patch<StaffOrderStatusUpdateResponse>(
        `/admin/orders/${selectedOrder.id}/status`,
        {
          status: currentAdminStatus,
          note: `[REFUND REQUEST]: ${refundReason.trim()}`,
        },
      )
      .then((response) => {
        applyOrderUpdate(response.data)
        setRefundDialogOpen(false)
        setRefundReason("")
        showToast({
          title: "Request sent",
          description: `Refund request for order ${
            response.data.order.code ?? response.data.order.id
          } has been recorded.`,
          type: "success",
        })
      })
      .catch((error) => {
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Unable to submit refund request"
        showToast({
          title: "Failed to submit request",
          description: message,
          type: "error",
        })
      })
      .finally(() => setIsDetailLoading(false))
  }

  const selectedOrderStatus = selectedOrder
    ? mapAdminStatusToStaff(selectedOrder.status)
    : null
  const selectedOrderReturnRequested = selectedOrder
    ? selectedOrder.status === "cancelled" || selectedOrder.status === "refunded"
    : false

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between flex-shrink-0">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">
            Orders Management
          </p>
          <h2 className="text-2xl font-bold text-[#1f1b16]">Order Management</h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(["all", "new", "processing", "delivered", "returned"] as const).map(
            (status) => {
              const isActive = orderStatusFilter === status;
              return (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full border-[#ead7b9] bg-white/50 text-[#6c6252] backdrop-blur transition hover:bg-[#efe2c6]",
                    isActive &&
                      "border-transparent bg-[#1f1b16] text-white shadow-md hover:bg-[#332b22]"
                  )}
                  onClick={() => setOrderStatusFilter(status)}
                >
                  {status === "all" ? "All" : orderStatusLabel[status]}
                </Button>
              );
            }
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT (SPLIT VIEW) --- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] items-start">
        {/* LEFT COLUMN: ORDER LIST */}
        <Card className="flex flex-col overflow-hidden border-none bg-white shadow-sm h-full">
          <CardHeader className="flex-shrink-0 space-y-4 border-b border-[#f0e4cc] py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c87d2f]" />
              <Input
                value={orderSearchTerm}
                onChange={(event) => setOrderSearchTerm(event.target.value)}
                placeholder="Search by Order Code, Customer Name..."
                className="h-10 rounded-xl border-[#ead7b9] bg-[#fdfbf7] pl-9 text-sm focus-visible:ring-[#c87d2f]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#7a6f60]">
              <span>
                Displaying <strong>{filteredOrders.length}</strong> orders
              </span>
              {/* <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 hover:text-[#c87d2f]"
              >
                <Filter className="h-3 w-3" /> Advanced filter
              </Button> */}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#f9f4ea] text-xs font-semibold uppercase text-[#7a6f60]">
                <tr>
                  <th className="px-4 py-3">Order code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="hidden md:table-cell px-4 py-3">Order date</th>
                  <th className="px-4 py-3 text-right">Total amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e4cc]">
                {isListLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <LoadingSpinner className="mx-auto text-[#c87d2f]" />
                    </td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-red-600"
                    >
                      {listError}
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-[#9a8f7f]"
                    >
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = order.id === selectedOrderId;
                    const staffStatus = mapAdminStatusToStaff(order.status);
                    const isReturnRequested =
                      order.status === "cancelled" || order.status === "refunded"
                    return (
                      <tr
                        key={order.id}
                        onClick={() => openOrderDetail(order.id)}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-[#fcf9f4]",
                          isSelected
                            ? "bg-[#f7efe1] border-l-4 border-l-[#c87d2f]"
                            : "border-l-4 border-l-transparent"
                        )}
                      >
                        <td className="px-4 py-4 font-medium text-[#1f1b16]">
                          #{order.code ?? order.id}
                          {isReturnRequested && (
                            <span
                              className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"
                              title="Refund requested"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {order.customer}
                          </div>
                          <div className="text-xs text-[#9a8f7f] md:hidden">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 text-[#6c6252]">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-[#1f1b16]">
                          {formatCurrency(order.value)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            className={cn(
                              "border font-normal",
                              orderStatusBadge[staffStatus]
                            )}
                          >
                            {orderStatusLabel[staffStatus]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: ORDER DETAILS */}
        <div className="flex flex-col h-full min-h-0">
          {selectedOrder ? (
            <Card className="flex flex-col border-[#ead7b9] bg-[#fdfbf7] shadow-lg">
              {/* Detail Header */}
              <div className="flex-shrink-0 border-b border-[#f0e4cc] p-6 bg-white/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="border-[#b8a47a] text-[#8b7e66]"
                      >
                        #{selectedOrder.code ?? selectedOrder.id}
                      </Badge>
                      {selectedOrderReturnRequested && (
                        <Badge variant="destructive" className="animate-pulse">
                          Cancel request
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#1f1b16]">
                      {selectedOrder.customer.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#7a6f60] mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(selectedOrder.createdAt)}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1b16] text-white text-sm font-bold">
                    {getInitials(selectedOrder.customer.name)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-xl bg-[#f4f1ea] border border-[#e6decb]">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a8f7f] mb-1">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          orderStatusAccent[selectedOrderStatus ?? "new"]
                        )}
                      />
                      <span className="font-medium text-sm">
                        {selectedOrderStatus ? orderStatusLabel[selectedOrderStatus] : "--"}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f1ea] border border-[#e6decb]">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a8f7f] mb-1">
                      Total payment
                    </p>
                    <p className="font-bold text-[#c87d2f] text-sm">
                      {formatCurrency(selectedOrder.totals.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail Scrollable Content */}
              <div className="p-6 space-y-6">
                {detailError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {detailError}
                  </div>
                )}
                {isDetailLoading && (
                  <div className="flex items-center gap-2 text-sm text-[#7a6f60]">
                    <LoadingSpinner className="h-4 w-4 text-[#c87d2f]" />
                    Loading order details...
                  </div>
                )}

                {/* Shipping Info */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1f1b16] mb-3">
                    <MapPin className="h-4 w-4 text-[#c87d2f]" /> Shipping
                    information
                  </h4>
                  <div className="text-sm text-[#6c6252] pl-6 leading-relaxed">
                    <p>
                      {selectedOrder.address?.line || "No shipping address"}
                    </p>
                    <p className="text-[#9a8f7f] text-xs mt-1">
                      Standard delivery (COD)
                    </p>
                  </div>
                </div>

                {/* Product List */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1f1b16] mb-3">
                    <Package className="h-4 w-4 text-[#c87d2f]" /> Products (
                    {selectedOrder.items.length})
                  </h4>
                  {selectedOrder.items.length === 0 ? (
                    <p className="pl-2 text-sm text-[#9a8f7f]">
                      There are no products in this order.
                    </p>
                  ) : (
                    <div className="space-y-3 pl-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 rounded-xl border border-[#f0e4cc] bg-white"
                        >
                          {/* Placeholder image - replace with item.image if available */}
                          <div className="h-12 w-12 rounded-lg bg-[#f4f1ea] flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-[#d1c4a7]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1f1b16] truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-[#9a8f7f] mt-0.5">
                              SKU: {item.sku || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="text-xs text-[#9a8f7f]">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Detail Footer Actions */}
              <div className="flex-shrink-0 p-6 border-t border-[#f0e4cc] bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {/* Status update button */}
                  <Button
                    className="bg-[#1f1b16] text-white hover:bg-[#332b22] rounded-full"
                    onClick={() => setStatusDialogOpen(true)}
                    disabled={isDetailLoading || isStatusSaving}
                  >
                    Update status
                  </Button>

                  {/* Secondary action menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-full border-[#ead7b9] hover:bg-[#fcf9f4]"
                        disabled={isDetailLoading}
                      >
                        Other actions <MoreVertical className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Action options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                // Invoice printing logic
                                showToast({ title: "Printing", description: "Generating invoice PDF file...", type: "info" })
                            }}>
                                <Package className="mr-2 h-4 w-4" /> Print delivery note
                            </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                        onClick={() => setRefundDialogOpen(true)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Refund request
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#9a8f7f] border-2 border-dashed border-[#ead7b9] rounded-xl bg-[#fdfbf7]/50">
              <Package className="h-12 w-12 mb-3 opacity-20" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* 1. Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update order status</DialogTitle>
            <DialogDescription>
              Change the current status of order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {(["new", "processing", "delivered"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={
                    selectedOrderStatus === status ? "secondary" : "outline"
                  }
                  className={cn(
                    "justify-start h-auto py-3 px-4",
                    selectedOrderStatus === status &&
                      "border-[#c87d2f] bg-[#fdfbf7]"
                  )}
                  onClick={() => updateOrderStatus(status)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        orderStatusAccent[status]
                      )}
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm">
                        {orderStatusLabel[status]}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {status === "new"
                          ? "Newly created order, not yet processed."
                          : status === "processing"
                          ? "Being packed and shipped."
                          : status === "delivered"
                          ? "The customer has received the goods."
                          : "Order completed."}
                      </span>
                    </div>
                  </div>
                  {selectedOrderStatus === status && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-[#c87d2f]" />
                  )}
                </Button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" /> Refund request
            </DialogTitle>
            <DialogDescription>
              Send a refund/return request for order #{selectedOrder?.id}.{" "}
              <br />
              The request will be sent to Admin for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Refund reason</Label>
              <Textarea
                id="refund-reason"
                placeholder="e.g.: Defective product, customer changed mind, wrong size..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
              <strong>Note:</strong> This action will not refund immediately. The
              money will only be refunded after the Admin confirms.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitRefundRequest}
              disabled={!refundReason.trim()}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
