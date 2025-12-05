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
  AdminOrderDetailResponse,
  AdminOrderListResult,
  AdminOrderStatus,
  AdminOrderSummary,
  AdminOrderStatusUpdateResponse,
} from "@/types/adminType";

import type { StaffOutletContext } from "./StaffLayout";
import {
  orderStatusAccent,
  orderStatusBadge,
  orderStatusLabel,
} from "./StaffLayout";

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
  } = useOutletContext<StaffOutletContext>();

  type StaffStatus = Exclude<StaffOutletContext["orderStatusFilter"], "all">;

  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<(typeof orders)[number] | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(orderSearchTerm);

  // State cho Dialog cập nhật trạng thái
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isStatusSaving, setIsStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // State cho Dialog yêu cầu hoàn tiền
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  // State cho ghi chú nội bộ
  // const [orderNoteDraft, setOrderNoteDraft] = useState("")
  const mapAdminStatusToStaff = (status: AdminOrderStatus): StaffStatus => {
    switch (status) {
      case "pending":
        return "new";
      case "processing":
      case "packed":
      case "shipping":
        return "processing";
      case "completed":
        return "delivered";
      default:
        return "returned";
    }
  };

  const staffStatusToAdmin = (status: StaffStatus): AdminOrderStatus => {
    switch (status) {
      case "new":
        return "pending";
      case "processing":
        return "processing";
      case "delivered":
        return "completed";
      case "returned":
        return "cancelled";
    }
  };

  const buildStatusFilterParam = (
    status: StaffOutletContext["orderStatusFilter"],
  ): string | undefined => {
    if (status === "all") return undefined;
    const adminStatuses =
      status === "new"
        ? ["pending"]
        : status === "processing"
        ? ["processing", "packed", "shipping"]
        : status === "delivered"
        ? ["completed"]
        : ["cancelled", "refunded"];

    return adminStatuses.join(",");
  };

  const mapSummaryToOrder = (summary: AdminOrderSummary) => ({
    id: String(summary.id),
    adminId: summary.id,
    code: summary.code,
    customerName: summary.customer,
    customerEmail: summary.customerEmail,
    customerPhone: summary.customerPhone,
    status: mapAdminStatusToStaff(summary.status),
    adminStatus: summary.status,
    total: summary.value,
    createdAt: summary.createdAt,
    address: "",
    items: [],
    notes: [],
    isReturnRequested:
      summary.status === "cancelled" || summary.status === "refunded",
    timeline: [],
  });

  const mapDetailToOrder = (detail: AdminOrderDetailResponse) => ({
    id: String(detail.id),
    adminId: detail.id,
    code: detail.code,
    customerName: detail.customer.name,
    customerEmail: detail.customer.email,
    customerPhone: detail.customer.phone,
    status: mapAdminStatusToStaff(detail.status),
    adminStatus: detail.status,
    total: detail.totals.total,
    createdAt: detail.createdAt,
    address: detail.address?.line ?? "Không có địa chỉ giao hàng",
    items: detail.items.map((item) => ({
      name: item.name,
      sku: item.sku ?? "N/A",
      quantity: item.quantity,
      price: item.price,
    })),
    notes: detail.notes,
    isReturnRequested:
      detail.status === "cancelled" || detail.status === "refunded",
    timeline: detail.timeline.map((entry) => ({
      label: entry.label,
      time: formatDateTime(entry.at),
    })),
  });

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(orderSearchTerm.trim());
    }, 400);

    return () => window.clearTimeout(handle);
  }, [orderSearchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    setIsListLoading(true);
    setListError(null);

    api
      .get<AdminOrderListResult>("/admin/orders", {
        params: {
          page: 1,
          pageSize: 50,
          search: debouncedSearch || undefined,
          status: buildStatusFilterParam(orderStatusFilter),
        },
        signal: controller.signal,
      })
      .then((response) => {
        const mapped = response.data.orders.map(mapSummaryToOrder);
        setOrders(mapped);

        if (!selectedOrderId && mapped.length) {
          setSelectedOrderId(mapped[0].id);
          return;
        }

        if (
          selectedOrderId &&
          mapped.every((order) => order.id !== selectedOrderId)
        ) {
          setSelectedOrderId(mapped[0]?.id ?? null);
        }
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Không thể tải danh sách đơn hàng";
        setListError(message);
        setOrders([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsListLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    debouncedSearch,
    orderStatusFilter,
    selectedOrderId,
    setOrders,
    setSelectedOrderId,
  ]);

  const filteredOrders = useMemo(() => orders, [orders]);

  const selectedOrderSummary = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const selectedOrder = orderDetail ?? selectedOrderSummary;

  useEffect(() => {
    if (!selectedOrderSummary) {
      setOrderDetail(null);
      setDetailError(null);
      return;
    }

    if (orderDetail?.adminId === selectedOrderSummary.adminId) {
      return;
    }

    const orderKey = selectedOrderSummary.adminId ?? Number(selectedOrderSummary.id);
    if (!Number.isFinite(orderKey) || orderKey <= 0) return;

    const controller = new AbortController();
    setIsDetailLoading(true);
    setDetailError(null);

    api
      .get<AdminOrderDetailResponse>(`/admin/orders/${orderKey}`, {
        signal: controller.signal,
      })
      .then((response) => {
        const mapped = mapDetailToOrder(response.data);
        setOrderDetail(mapped);
      })
      .catch((error) => {
        if (axios.isCancel(error)) return;
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Không thể tải chi tiết đơn hàng";
        setDetailError(message);
        setOrderDetail(selectedOrderSummary);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsDetailLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedOrderSummary, formatDateTime, orderDetail]);

  useEffect(() => {
    if (statusDialogOpen) {
      setStatusError(null);
    }
  }, [statusDialogOpen]);

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const applyOrderUpdate = (payload: AdminOrderStatusUpdateResponse) => {
    const mappedSummary = mapSummaryToOrder(payload.summary);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === mappedSummary.id
          ? {
              ...order,
              ...mappedSummary,
            }
          : order,
      ),
    );

    const mappedDetail = mapDetailToOrder(payload.order);
    setOrderDetail(mappedDetail);
    setSelectedOrderId(mappedDetail.id);
    return mappedDetail;
  };

  // Chức năng: Cập nhật trạng thái đơn hàng (Quy trình bình thường)
  const updateOrderStatus = (status: (typeof orders)[number]["status"]) => {
    if (!selectedOrder?.adminId) return;

    const adminStatus = staffStatusToAdmin(status as StaffStatus);
    setIsStatusSaving(true);
    setStatusError(null);

    api
      .patch<AdminOrderStatusUpdateResponse>(
        `/admin/orders/${selectedOrder.adminId}/status`,
        { status: adminStatus },
      )
      .then((response) => {
        const updated = applyOrderUpdate(response.data);
        setStatusDialogOpen(false);
        showToast({
          title: "Cập nhật thành công",
          description: `Đơn ${updated.code ?? updated.id} đã chuyển sang "${
            orderStatusLabel[updated.status]
          }"`,
          type: "success",
        });
      })
      .catch((error) => {
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Không thể cập nhật trạng thái đơn hàng";
        setStatusError(message);
      })
      .finally(() => setIsStatusSaving(false));
  };

  // Chức năng: Gửi yêu cầu hoàn tiền (Gửi cho Admin duyệt)
  const submitRefundRequest = () => {
    if (!selectedOrder?.adminId || !refundReason.trim()) return;

    const currentAdminStatus =
      (selectedOrder.adminStatus as AdminOrderStatus | undefined) ??
      staffStatusToAdmin(selectedOrder.status as StaffStatus);

    setIsDetailLoading(true);

    api
      .patch<AdminOrderStatusUpdateResponse>(
        `/admin/orders/${selectedOrder.adminId}/status`,
        {
          status: currentAdminStatus,
          note: `[YÊU CẦU HOÀN TIỀN]: ${refundReason.trim()}`,
        },
      )
      .then((response) => {
        applyOrderUpdate(response.data);
        setRefundDialogOpen(false);
        setRefundReason("");
        showToast({
          title: "Đã gửi yêu cầu",
          description: `Yêu cầu hoàn tiền cho đơn ${
            response.data.order.code ?? response.data.order.id
          } đã được ghi nhận.`,
          type: "success",
        });
      })
      .catch((error) => {
        const message =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Không thể gửi yêu cầu hoàn tiền";
        showToast({
          title: "Gửi yêu cầu thất bại",
          description: message,
          type: "error",
        });
      })
      .finally(() => setIsDetailLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between flex-shrink-0">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">
            Orders Management
          </p>
          <h2 className="text-2xl font-bold text-[#1f1b16]">Quản lý vận đơn</h2>
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
                  {status === "all" ? "Tất cả" : orderStatusLabel[status]}
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
                placeholder="Tìm kiếm theo Mã đơn, Tên khách, SĐT..."
                className="h-10 rounded-xl border-[#ead7b9] bg-[#fdfbf7] pl-9 text-sm focus-visible:ring-[#c87d2f]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#7a6f60]">
              <span>
                Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 hover:text-[#c87d2f]"
              >
                <Filter className="h-3 w-3" /> Lọc nâng cao
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#f9f4ea] text-xs font-semibold uppercase text-[#7a6f60]">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="hidden md:table-cell px-4 py-3">Ngày đặt</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
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
                      Không tìm thấy đơn hàng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = order.id === selectedOrderId;
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
                          {order.isReturnRequested && (
                            <span
                              className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"
                              title="Có yêu cầu hoàn tiền"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-[#9a8f7f] md:hidden">
                            {formatDateTime(order.createdAt)}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-4 text-[#6c6252]">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-[#1f1b16]">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge
                            className={cn(
                              "border font-normal",
                              orderStatusBadge[order.status]
                            )}
                          >
                            {orderStatusLabel[order.status]}
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
                      {selectedOrder.isReturnRequested && (
                        <Badge variant="destructive" className="animate-pulse">
                          Yêu cầu hoàn tiền
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#1f1b16]">
                      {selectedOrder.customerName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#7a6f60] mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(selectedOrder.createdAt)}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1b16] text-white text-sm font-bold">
                    {getInitials(selectedOrder.customerName)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-xl bg-[#f4f1ea] border border-[#e6decb]">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a8f7f] mb-1">
                      Trạng thái
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          orderStatusAccent[selectedOrder.status]
                        )}
                      />
                      <span className="font-medium text-sm">
                        {orderStatusLabel[selectedOrder.status]}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f1ea] border border-[#e6decb]">
                    <p className="text-[10px] uppercase tracking-wider text-[#9a8f7f] mb-1">
                      Tổng thanh toán
                    </p>
                    <p className="font-bold text-[#c87d2f] text-sm">
                      {formatCurrency(selectedOrder.total)}
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
                    Đang tải chi tiết đơn hàng...
                  </div>
                )}

                {/* Shipping Info */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1f1b16] mb-3">
                    <MapPin className="h-4 w-4 text-[#c87d2f]" /> Thông tin giao
                    nhận
                  </h4>
                  <div className="text-sm text-[#6c6252] pl-6 leading-relaxed">
                    <p>
                      {selectedOrder.address || "Không có địa chỉ giao hàng"}
                    </p>
                    <p className="text-[#9a8f7f] text-xs mt-1">
                      Giao hàng tiêu chuẩn (COD)
                    </p>
                  </div>
                </div>

                {/* Product List */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1f1b16] mb-3">
                    <Package className="h-4 w-4 text-[#c87d2f]" /> Sản phẩm (
                    {selectedOrder.items.length})
                  </h4>
                  {selectedOrder.items.length === 0 ? (
                    <p className="pl-2 text-sm text-[#9a8f7f]">
                      Chưa có sản phẩm nào trong đơn.
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
                  {/* Nút cập nhật trạng thái */}
                  <Button
                    className="bg-[#1f1b16] text-white hover:bg-[#332b22] rounded-full"
                    onClick={() => setStatusDialogOpen(true)}
                    disabled={isDetailLoading || isStatusSaving}
                  >
                    Cập nhật trạng thái
                  </Button>

                  {/* Menu hành động phụ */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-full border-[#ead7b9] hover:bg-[#fcf9f4]"
                        disabled={isDetailLoading}
                      >
                        Hành động khác <MoreVertical className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Tùy chọn xử lý</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                // Logic in hóa đơn
                                showToast({ title: "Đang in", description: "Đang tạo file PDF hóa đơn...", type: "info" })
                            }}>
                                <Package className="mr-2 h-4 w-4" /> In phiếu giao hàng
                            </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                        onClick={() => setRefundDialogOpen(true)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Yêu cầu hoàn tiền
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#9a8f7f] border-2 border-dashed border-[#ead7b9] rounded-xl bg-[#fdfbf7]/50">
              <Package className="h-12 w-12 mb-3 opacity-20" />
              <p>Chọn một đơn hàng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* 1. Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái hiện tại của đơn #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {(["new", "processing", "delivered"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={
                    selectedOrder?.status === status ? "secondary" : "outline"
                  }
                  className={cn(
                    "justify-start h-auto py-3 px-4",
                    selectedOrder?.status === status &&
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
                          ? "Đơn hàng mới tạo, chưa xử lý."
                          : status === "processing"
                          ? "Đang đóng gói và vận chuyển."
                          : status === "delivered"
                          ? "Khách hàng đã nhận được hàng."
                          : "Đơn hàng hoàn tất."}
                      </span>
                    </div>
                  </div>
                  {selectedOrder?.status === status && (
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
              <AlertCircle className="h-5 w-5" /> Yêu cầu hoàn tiền
            </DialogTitle>
            <DialogDescription>
              Gửi yêu cầu hoàn tiền/trả hàng cho đơn #{selectedOrder?.id}.{" "}
              <br />
              Yêu cầu sẽ được chuyển đến Admin để phê duyệt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Lý do hoàn tiền</Label>
              <Textarea
                id="refund-reason"
                placeholder="VD: Sản phẩm lỗi, Khách đổi ý, Sai size..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800">
              <strong>Lưu ý:</strong> Hành động này sẽ không hoàn tiền ngay lập
              tức. Tiền chỉ được hoàn sau khi Admin xác nhận.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={submitRefundRequest}
              disabled={!refundReason.trim()}
            >
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
