import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Loader2, MapPin, Package, X } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import api from "@/utils/axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type {
  AdminOrderDetailResponse,
  AdminOrderListResult,
  AdminOrderStatus,
  AdminOrderSummary,
  AdminOrderStatusUpdateResponse,
} from "@/types/adminType"

const statusLabels: Record<AdminOrderStatus, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  packed: "Đã đóng gói",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
  refunded: "Hoàn tiền",
}

const statusBadge: Record<AdminOrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  packed: "border-sky-200 bg-sky-50 text-sky-700",
  shipping: "border-indigo-200 bg-indigo-50 text-indigo-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
  refunded: "border-rose-200 bg-rose-50 text-rose-700",
}

const statusAccent: Record<AdminOrderStatus, string> = {
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

const DEFAULT_PAGE_SIZE = 11

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
  const [orders, setOrders] = useState<AdminOrderSummary[]>([])
  const [pagination, setPagination] = useState<AdminOrderListResult["pagination"] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "all">("all")
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isListLoading, setIsListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetailResponse | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailReloadKey, setDetailReloadKey] = useState(0)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [statusSelection, setStatusSelection] = useState<AdminOrderStatus | null>(null)
  const [statusNote, setStatusNote] = useState("")
  const [isStatusSaving, setIsStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 400)
    return () => {
      window.clearTimeout(handle)
    }
  }, [search])

  useEffect(() => {
    setCurrentPage((prev) => (prev === 1 ? prev : 1))
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    const controller = new AbortController()
    setIsListLoading(true)
    setListError(null)

    api
      .get<AdminOrderListResult>("/admin/orders", {
        params: {
          page: currentPage,
          pageSize: DEFAULT_PAGE_SIZE,
          search: debouncedSearch.length ? debouncedSearch : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
        signal: controller.signal,
      })
      .then((response) => {
        setOrders(response.data.orders)
        setPagination(response.data.pagination)
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Không thể tải danh sách đơn hàng"
        setListError(message)
        setPagination(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsListLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [currentPage, debouncedSearch, statusFilter])

  useEffect(() => {
    if (!pagination) return
    const maxPage = Math.max(pagination.totalPages, 1)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, pagination])

  useEffect(() => {
    if (!selectedOrderId) return
    const stillVisible = orders.some((order) => order.id === selectedOrderId)
    if (!stillVisible) {
      setSelectedOrderId(null)
      setIsDetailOpen(false)
      setOrderDetail(null)
      setDetailError(null)
    }
  }, [orders, selectedOrderId])

  useEffect(() => {
    if (!selectedOrderId) {
      setIsDetailLoading(false)
      setOrderDetail(null)
      setDetailError(null)
    }
  }, [selectedOrderId])

  useEffect(() => {
    if (!selectedOrderId) return

    const controller = new AbortController()
    setIsDetailLoading(true)
    setDetailError(null)
    setOrderDetail(null)

    api
      .get<AdminOrderDetailResponse>(`/admin/orders/${selectedOrderId}`, {
        signal: controller.signal,
      })
      .then((response) => {
        setOrderDetail(response.data)
      })
      .catch((error) => {
        if (axios.isCancel(error)) return
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Không thể tải chi tiết đơn hàng"
        setDetailError(message)
        setOrderDetail(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsDetailLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [selectedOrderId, detailReloadKey])

  // const updateOrderStatus = (id: number, status: AdminOrderStatus) => {
  //   setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
  //   setOrderDetail((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  // }

  // const changePaymentMethod = (id: number, method: AdminOrderPaymentDisplay) => {
  //   setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, payment: method } : order)))
  //   setOrderDetail((prev) =>
  //     prev && prev.id === id ? { ...prev, payment: { ...prev.payment, display: method } } : prev,
  //   )
  // }

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  )

  const currentEffectiveStatus: AdminOrderStatus | null =
    orderDetail?.status ?? selectedOrder?.status ?? null

  const handlePageChange = useCallback(
    (targetPage: number) => {
      const maxPage = pagination ? Math.max(pagination.totalPages, 1) : Number.MAX_SAFE_INTEGER
      const normalized = Math.min(Math.max(targetPage, 1), maxPage)
      setCurrentPage((prev) => (prev === normalized ? prev : normalized))
    },
    [pagination],
  )

  const buildPageHref = useCallback(
    (targetPage: number) => {
      if (!pagination) return "#"

      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost"
      const baseLink =
        pagination.nextLink ??
        pagination.previousLink ??
        (typeof window !== "undefined" ? window.location.href : `${origin}/admin/orders`)

      try {
        const url = new URL(baseLink, origin)
        url.searchParams.set("page", String(targetPage))
        url.searchParams.set("pageSize", String(pagination.pageSize))

        if (baseLink.startsWith("http")) {
          return url.toString()
        }

        return `${url.pathname}${url.search}`
      } catch (error) {
        console.error("Failed to build admin orders pagination href", error)
        return `?page=${targetPage}&pageSize=${pagination.pageSize}`
      }
    },
    [pagination],
  )

  const paginationItems = useMemo(() => {
    if (!pagination) return []
    const { totalPages, page } = pagination
    if (totalPages <= 0) return []

    const pages = new Set<number>()
    pages.add(1)
    pages.add(totalPages)

    for (let offset = -2; offset <= 2; offset += 1) {
      const value = page + offset
      if (value >= 1 && value <= totalPages) {
        pages.add(value)
      }
    }

    const sorted = Array.from(pages).sort((a, b) => a - b)
    const items: Array<number | "ellipsis"> = []

    for (let index = 0; index < sorted.length; index += 1) {
      const current = sorted[index]
      const previous = sorted[index - 1]
      if (previous !== undefined && current - previous > 1) {
        items.push("ellipsis")
      }
      items.push(current)
    }

    return items
  }, [pagination])

  const openOrderDetail = (orderId: number) => {
    setSelectedOrderId(orderId)
    setDetailReloadKey((prev) => prev + 1)
    setIsDetailOpen(true)
  }

  const closeDetail = () => setIsDetailOpen(false)

  const handleRetryDetail = () => {
    setDetailReloadKey((prev) => prev + 1)
  }

  const openStatusDialog = (status: AdminOrderStatus) => {
    setStatusSelection(status)
    setStatusNote("")
    setStatusError(null)
    setIsStatusSaving(false)
    setIsStatusDialogOpen(true)
  }

  const handleCloseStatusDialog = () => {
    setIsStatusDialogOpen(false)
    setStatusSelection(null)
    setStatusNote("")
    setStatusError(null)
    setIsStatusSaving(false)
  }

  const handleSaveStatus = async () => {
    if (!selectedOrderId || !statusSelection) {
      setIsStatusDialogOpen(false)
      return
    }

    const trimmedNote = statusNote.trim()
    setIsStatusSaving(true)
    setStatusError(null)

    try {
      const response = await api.patch<AdminOrderStatusUpdateResponse>(
        `/admin/orders/${selectedOrderId}/status`,
        {
          status: statusSelection,
          note: trimmedNote.length ? trimmedNote : undefined,
        },
      )

      const data = response.data

      setOrders((prev) => prev.map((order) => (order.id === data.summary.id ? data.summary : order)))
      setOrderDetail(data.order)

      const successMessage =
        typeof data.message === "string" && data.message.trim().length
          ? data.message
          : "Cập nhật trạng thái thành công"
      toast.success(successMessage, `Trạng thái hiện tại: ${statusLabels[data.status]}`)

      setIsStatusDialogOpen(false)
      setStatusSelection(null)
      setStatusNote("")
      setStatusError(null)
    } catch (error) {
      console.error("Failed to update admin order status", error)
      let message = "Không thể cập nhật trạng thái đơn hàng"
      if (axios.isAxiosError(error)) {
        const responseMessage = error.response?.data?.message
        if (typeof responseMessage === "string" && responseMessage.trim().length) {
          message = responseMessage
        }
      }
      setStatusError(message)
      toast.error("Cập nhật không thành công", message)
    } finally {
      setIsStatusSaving(false)
    }
  }

  const OrderDetailContent = ({
    summary,
    detail,
    loading,
    error,
    onUpdateStatus,
  }: {
    summary: AdminOrderSummary | null
    detail: AdminOrderDetailResponse | null
    loading: boolean
    error: string | null
    onUpdateStatus: (status: AdminOrderStatus) => void
  }) => {
    if (!summary && !loading) {
      return (
        <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500">
          Chọn một đơn để xem chi tiết.
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50/70 p-6 text-center text-sm text-rose-600">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={handleRetryDetail}>
            Thử lại
          </Button>
        </div>
      )
    }

    if (loading && !detail) {
      return (
        <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-6">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (!summary) {
      return null
    }

    const effectiveStatus: AdminOrderStatus = detail?.status ?? summary.status
    const accent = statusAccent[effectiveStatus]
    const displayCode = detail?.code ?? summary.code
    const displayCustomer = detail?.customer.name?.trim() || summary.customer
    const createdAt = detail?.createdAt ?? summary.createdAt
    const paymentDisplay = detail?.payment.display ?? summary.payment
    const addressLine = detail?.address?.line ?? "Không có thông tin địa chỉ"
    const timelineEntries = detail?.timeline ?? []
    const notes = detail?.notes ?? []
    const items = detail?.items ?? []

    return (
      <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Order {displayCode}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">{displayCustomer}</h3>
              <p className="text-sm text-slate-500">{formatDateTime(createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600 lg:flex">
                {getInitials(displayCustomer)}
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
            <Badge className={cn("border", statusBadge[effectiveStatus])}>{statusLabels[effectiveStatus]}</Badge>
            <span className="text-sm font-semibold text-slate-800">{formatCurrency(summary.value)}</span>
            <span className="hidden sm:inline">•</span>
            <span>Thanh toán: {paymentDisplay}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">Thông tin giao nhận</h4>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                <span>{addressLine}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">Sản phẩm</h4>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                  Không có thông tin sản phẩm
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{item.name}</div>
                      {/* <div className="text-xs text-slate-500">SKU: {item.sku ?? "—"}</div> */}
                    </div>
                    <div className="text-right text-sm font-semibold text-slate-800">
                      x{item.quantity} • {formatCurrency(item.price)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800">Tiến trình đơn hàng</h4>
            <ol className="space-y-2">
              {timelineEntries.length === 0 ? (
                <li className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-xs text-slate-500">
                  Chưa có lịch sử trạng thái.
                </li>
              ) : (
                timelineEntries.map((step, index) => {
                  const isCompleted = Boolean(step.at)

                  return (
                    <li
                      key={`${step.label}-${index}`}
                      className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs text-slate-600"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("h-2.5 w-2.5 rounded-full", isCompleted ? accent : "bg-slate-300")} />
                          <span className="font-medium text-slate-800">{step.label}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {step.at ? formatDateTime(step.at) : "--"}
                        </span>
                      </div>
                      {step.note ? (
                        <p className="rounded-lg bg-slate-100/70 p-2 text-[11px] text-slate-500">
                          {step.note}
                        </p>
                      ) : null}
                    </li>
                  )
                })
              )}
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">Ghi chú</h4>
            <div className="space-y-2 text-xs text-slate-600">
              {notes.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-slate-500">
                  Không có ghi chú.
                </div>
              ) : (
                notes.map((note, index) => (
                  <div key={`${note}-${index}`} className="rounded-2xl border border-slate-200 bg-white/70 p-3 leading-relaxed">
                    {note}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button type="button" className="w-full gap-2" onClick={() => onUpdateStatus(effectiveStatus)}>
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

  const trimmedStatusNote = statusNote.trim()
  const canSubmitStatusUpdate =
    Boolean(statusSelection) &&
    (statusSelection !== currentEffectiveStatus || trimmedStatusNote.length > 0)

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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminOrderStatus | "all")}>
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
                  </tr>
                </thead>
                <tbody className="divide-y bg-white text-sm">
                  {isListLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        <div className="flex items-center justify-center gap-3">
                          <LoadingSpinner />
                          <span>Đang tải đơn hàng...</span>
                        </div>
                      </td>
                    </tr>
                  ) : listError ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-rose-600">
                        {listError}
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        Không có đơn hàng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const isSelected = order.id === selectedOrderId
                      return (
                        <tr
                          key={order.id}
                          onClick={() => openOrderDetail(order.id)}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-slate-50",
                            isSelected && "bg-slate-50",
                          )}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800">{order.code}</td>
                          <td className="px-4 py-3">{order.customer}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(order.value)}</td>
                          <td className="px-4 py-3 text-slate-700">{order.payment}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                aria-hidden
                                className={cn("h-2 w-2 rounded-full", statusAccent[order.status])}
                              />
                              <Badge className={cn("border", statusBadge[order.status])}>
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
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
              <OrderDetailContent
                summary={selectedOrder}
                detail={orderDetail}
                loading={isDetailLoading}
                error={detailError}
                onUpdateStatus={openStatusDialog}
              />
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination className="justify-start pt-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      pagination.previousLink ??
                      buildPageHref(Math.max(pagination.page - 1, 1))
                    }
                    onClick={(event) => {
                      event.preventDefault()
                      if (pagination.page <= 1) return
                      handlePageChange(pagination.page - 1)
                    }}
                    className={
                      pagination.page <= 1 ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
                {paginationItems.map((item, index) => (
                  <PaginationItem key={`admin-orders-page-${item}-${index}`}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={buildPageHref(item)}
                        size="default"
                        isActive={pagination.page === item}
                        onClick={(event) => {
                          event.preventDefault()
                          if (pagination.page === item) return
                          handlePageChange(item)
                        }}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={
                      pagination.nextLink ??
                      buildPageHref(
                        Math.min(pagination.page + 1, Math.max(pagination.totalPages, 1)),
                      )
                    }
                    onClick={(event) => {
                      event.preventDefault()
                      if (pagination.page >= pagination.totalPages) {
                        return
                      }
                      handlePageChange(pagination.page + 1)
                    }}
                    className={
                      pagination.page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

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
            <OrderDetailContent
              summary={selectedOrder}
              detail={orderDetail}
              loading={isDetailLoading}
              error={detailError}
              onUpdateStatus={openStatusDialog}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isStatusDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseStatusDialog()
          } else {
            setIsStatusDialogOpen(true)
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden bg-white flex flex-col">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Chọn trạng thái phù hợp cho đơn hàng này. Bạn chỉ có thể chọn một trạng thái tại một thời điểm.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <RadioGroup className="space-y-3">
              {Object.entries(statusLabels).map(([status, label]) => {
                const typedStatus = status as AdminOrderStatus

                return (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{label}</span>
                      {/* <span className="text-xs text-slate-500">Mã trạng thái: {status}</span> */}
                    </div>
                    <RadioGroupItem
                      value={status}
                      name="admin-order-status"
                      checked={statusSelection === typedStatus}
                      onChange={() => {
                        setStatusSelection(typedStatus)
                        setStatusError(null)
                      }}
                      aria-label={label}
                    />
                  </label>
                )
              })}
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="admin-order-status-note">Ghi chú (tuỳ chọn)</Label>
              <Textarea
                id="admin-order-status-note"
                placeholder="Thêm ghi chú cho lần cập nhật trạng thái này"
                value={statusNote}
                onChange={(event) => {
                  setStatusNote(event.target.value)
                  if (statusError) {
                    setStatusError(null)
                  }
                }}
                className="min-h-24"
              />
              <p className="text-xs text-slate-500">
                Ghi chú sẽ được lưu lại trong lịch sử trạng thái của đơn hàng.
              </p>
            </div>
          </div>

          {statusError ? <p className="px-1 text-sm text-rose-600">{statusError}</p> : null}

          <DialogFooter className="gap-2 shrink-0 pt-2">
            <Button variant="outline" onClick={handleCloseStatusDialog} disabled={isStatusSaving}>
              Huỷ
            </Button>
            <Button
              onClick={handleSaveStatus}
              disabled={!canSubmitStatusUpdate || isStatusSaving}
            >
              {isStatusSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer
        toasts={toasts.map((toastItem) => ({ ...toastItem, onClose: removeToast }))}
        onClose={removeToast}
      />
    </div>
  )
}