import { useState, useEffect, useMemo, useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import {
  User,
  MapPin,
  Package,
  Settings,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Download,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  X,
  Camera,
  Upload,
  CalendarDays,
  ChevronDown,
  Star,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import api from "@/utils/axios";
import type { UserProfile } from "@/types/userType";
import { AddressFormDialog } from "@/components/address/addressFormDialog";
import { DeleteAddressDialog } from "@/components/address/deleteAddressDialog";
import type { Address } from "@/types/addressType";
import { formatPrice } from "@/utils/formatPrice";
import type {
  OrderItemSummary,
  OrderDetailResponse,
  OrderListResponse,
  OrderSummaryResponse,
  OrderItemReview,
} from "@/types/orderType";
import { OrderReviewDialog } from "@/components/review/OrderReviewDialog";
import {
  OrderCancelDialog,
  type CancelReasonOption,
} from "@/components/order/OrderCancelDialog";
import axios from "axios";

type ProfileSection = "profile" | "addresses" | "orders" | "settings";

type ProfileLocationState = Partial<{
  section: ProfileSection;
  tab: ProfileSection;
  defaultSection: ProfileSection;
  activeSection: ProfileSection;
  expandOrderId: number;
  orderId: number;
}>;

const PROFILE_SECTIONS: readonly ProfileSection[] = [
  "profile",
  "addresses",
  "orders",
  "settings",
] as const;

const parseProfileSection = (value: unknown): ProfileSection | null => {
  if (typeof value !== "string") return null;
  const normalized = value.toLowerCase() as ProfileSection;
  return PROFILE_SECTIONS.includes(normalized) ? normalized : null;
};

const parseOrderIdValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const CANCEL_REASON_OTHER_VALUE = "other" as const;

const ORDER_CANCEL_REASON_OPTIONS: CancelReasonOption[] = [
  {
    value: "change_of_mind",
    label: "Tôi đổi ý, không muốn mua nữa",
  },
  {
    value: "found_better_price",
    label: "Tôi tìm được giá tốt hơn ở nơi khác",
  },
  {
    value: "shipping_delay",
    label: "Thời gian giao hàng dự kiến quá lâu",
  },
  {
    value: "incorrect_order",
    label: "Tôi đặt nhầm sản phẩm hoặc số lượng",
  },
  {
    value: CANCEL_REASON_OTHER_VALUE,
    label: "Lý do khác",
    description: "Vui lòng chia sẻ chi tiết để chúng tôi phục vụ tốt hơn",
    requiresDetails: true,
  },
];

const DEFAULT_ORDER_CANCEL_REASON =
  ORDER_CANCEL_REASON_OPTIONS[0]?.value ?? CANCEL_REASON_OTHER_VALUE;

interface CancelDialogState {
  orderId: number | null;
  open: boolean;
  selectedReason: string;
  customReason: string;
}

const createInitialCancelDialogState = (): CancelDialogState => ({
  orderId: null,
  open: false,
  selectedReason: DEFAULT_ORDER_CANCEL_REASON,
  customReason: "",
});

const parseSectionFromLocation = (
  search: string,
  state: ProfileLocationState
): ProfileSection => {
  const searchParams = new URLSearchParams(search);
  const candidates: Array<unknown> = [
    state.section,
    state.tab,
    state.defaultSection,
    state.activeSection,
    searchParams.get("section"),
    searchParams.get("tab"),
  ];

  for (const candidate of candidates) {
    const section = parseProfileSection(candidate);
    if (section) {
      return section;
    }
  }

  return "profile";
};

const parseExpandedOrderFromLocation = (
  search: string,
  state: ProfileLocationState
): number | null => {
  const searchParams = new URLSearchParams(search);
  const candidates: Array<unknown> = [
    state.expandOrderId,
    state.orderId,
    searchParams.get("orderId"),
    searchParams.get("expandOrderId"),
  ];

  for (const candidate of candidates) {
    const parsed = parseOrderIdValue(candidate);
    if (parsed != null) {
      return parsed;
    }
  }

  return null;
};

const emptyUser: UserProfile = {
  userId: 0,
  username: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: null,
  avatar: "/placeholder.svg?height=100&width=100",
  createdAt: "",
};

const getStatusColor = (status: string) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "CONFIRMED":
    case "PAID":
    case "FULFILLING":
    case "PENDING":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4" />;
    case "SHIPPED":
      return <Truck className="w-4 h-4" />;
    case "CONFIRMED":
    case "PAID":
    case "FULFILLING":
    case "PENDING":
      return <Clock className="w-4 h-4" />;
    case "CANCELLED":
    case "REFUNDED":
      return <X className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const formatOrderDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getLabelText = (label: string) => {
  switch (label) {
    case "HOME":
      return "Nhà";
    case "WORK":
      return "Chỗ Làm";
    case "OTHER":
      return "Khác";
    default:
      return label;
  }
};

export default function ProfilePage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<ProfileSection>(() =>
    parseSectionFromLocation(
      location.search,
      (location.state ?? {}) as ProfileLocationState
    )
  );
  const [isEditing, setIsEditing] = useState(false);
  // const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserProfile>(emptyUser); // dữ liệu hiển thị đã “lưu”
  const [draft, setDraft] = useState<UserProfile>(emptyUser); // dữ liệu đang chỉnh sửa
  // const [loading, setLoading] = useState(true);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Address management states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressDialogMode, setAddressDialogMode] = useState<"add" | "edit">(
    "add"
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  // Orders management states
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [ordersPagination, setOrdersPagination] = useState<
    OrderListResponse["pagination"] | null
  >(null);
  const [ordersRequest, setOrdersRequest] = useState({ page: 1, pageSize: 5 });
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [orderDetails, setOrderDetails] = useState<
    Record<number, OrderDetailResponse>
  >({});
  const [orderDetailErrors, setOrderDetailErrors] = useState<
    Record<number, string>
  >({});
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(() =>
    parseExpandedOrderFromLocation(
      location.search,
      (location.state ?? {}) as ProfileLocationState
    )
  );
  useEffect(() => {
    const state = (location.state ?? {}) as ProfileLocationState;
    const nextSection = parseSectionFromLocation(location.search, state);
    setActiveSection((current) =>
      current === nextSection ? current : nextSection
    );

    const nextExpanded = parseExpandedOrderFromLocation(
      location.search,
      state
    );
    setExpandedOrderId(nextExpanded);
  }, [location]);
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const [cancelDialogState, setCancelDialogState] =
    useState<CancelDialogState>(createInitialCancelDialogState);
  const [cancelDialogError, setCancelDialogError] = useState<string | null>(
    null
  );
  const [reorderingOrderId, setReorderingOrderId] = useState<number | null>(
    null
  );

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<
    | (OrderItemSummary & {
        orderId: number;
        orderCode: string;
        deliveredAt: string | null;
      })
    | null
  >(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    details: "",
    files: [] as File[],
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFilePreviews, setReviewFilePreviews] = useState<string[]>([]);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<OrderItemReview | null>(
    null
  );
  const [reviewError, setReviewError] = useState<string | null>(null);

  const REVIEW_DETAILS_MAX_LENGTH = 500;
  const REVIEW_MAX_FILES = 5;
  const REVIEW_MAX_FILE_SIZE_MB = 5;

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // CHỈ update draft khi đang Edit
  const handleDraftInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!isEditing) return;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  // ====== Date helpers ======
  // Chuẩn hoá chuỗi ngày bất kỳ (ISO hoặc 'yyyy-mm-dd') -> 'yyyy-mm-dd' cho <input type="date">
  const toYMD = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    // Nếu đã là 'yyyy-mm-dd' thì trả lại luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Hiển thị ra UI: 'dd/mm/yyyy'
  const toDMY = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    const d = new Date(toYMD(dateStr)); // đảm bảo parse đúng
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  };

  // Load hồ sơ từ API /user/profile khi mở trang
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get<UserProfile>("/user/profile");
        if (!mounted) return;
        // setFormData({
        //   ...data,
        //   // đảm bảo hợp <input type="date">
        //   // dateOfBirth: data.dateOfBirth ?? "",
        //   dateOfBirth: toYMD(data.dateOfBirth), // giữ 'yyyy-mm-dd' trong state
        //   avatar: data.avatar ?? "/placeholder.svg?height=100&width=100",
        // });

        const loaded = {
          ...data,
          dateOfBirth: toYMD(data.dateOfBirth), // chuẩn hoá cho <input type="date">
          avatar: data.avatar ?? "/placeholder.svg?height=100&width=100",
        };
        setFormData(loaded);
        setDraft(loaded); // đồng bộ draft ban đầu
      } catch (e) {
        console.error("Failed to fetch profile", e);
      } finally {
        // if (mounted) setLoading(false);
        /* loading state removed */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // So sánh thay đổi để disable Save khi không đổi gì
  const hasChanges = useMemo(() => {
    const pick = (u: UserProfile) => ({
      username: u.username,
      email: u.email,
      phone: u.phone ?? null,
      gender: u.gender ?? null,
      dateOfBirth: toYMD(u.dateOfBirth) || null,
    });
    return JSON.stringify(pick(draft)) !== JSON.stringify(pick(formData));
  }, [draft, formData]);

  const handleSaveProfile = async () => {
    try {
      const payload = {
        username: draft.username,
        email: draft.email,
        // phone: draft.phone ?? null,
        phone: (draft.phone ?? "").trim() || null,
        gender: draft.gender || null,
        dateOfBirth: draft.dateOfBirth || null,
      };
      const { data } = await api.patch<UserProfile>("/user/profile", payload);
      const updated = {
        ...data,
        dateOfBirth: toYMD(data.dateOfBirth) || "",
        avatar: data.avatar ?? "/placeholder.svg?height=100&width=100",
      };
      setFormData(updated); // cập nhật dữ liệu đã “lưu”
      setDraft(updated); // đồng bộ lại draft
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (avatarFile && avatarPreview) {
      // In a real app, you would upload the file to your server/cloud storage
      setFormData((prev) => ({ ...prev, avatar: avatarPreview }));
      console.log("Saving avatar:", avatarFile);
    }
    setShowAvatarDialog(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleDeleteAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "/placeholder.svg?height=100&width=100",
    }));
    setShowAvatarDialog(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    console.log("Avatar deleted");
  };

  const handleCancelAvatarEdit = () => {
    setShowAvatarDialog(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const { logout } = useAuth();
  const { toast } = useToast();
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out", "You have been successfully logged out");
    // setIsDropdownOpen(false);
  };

  // nạp danh sách địa chỉ
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Address[]>("/user/addresses");
        setAddresses(data);
      } catch (e) {
        console.error(e);
        toast.error("Lỗi", "Không tải được danh sách địa chỉ");
      }
    })();
  }, [toast]);

  const fetchOrders = useCallback(
    async (query: { page: number; pageSize: number }) => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const { data } = await api.get<OrderListResponse>("/order/list", {
          params: {
            page: query.page,
            pageSize: query.pageSize,
          },
        });
        setOrders(data.orders);
        setOrdersPagination(data.pagination);
        setOrdersRequest((prev) => {
          const next = {
            page: data.pagination.page,
            pageSize: data.pagination.pageSize,
          };
          if (prev.page === next.page && prev.pageSize === next.pageSize) {
            return prev;
          }
          return next;
        });
      } catch (e) {
        console.error("Failed to load orders", e);
        setOrders([]);
        setOrdersPagination(null);
        setOrdersError("Không thể tải danh sách đơn hàng");
        toast.error("Lỗi", "Không thể tải danh sách đơn hàng");
      } finally {
        setOrdersLoading(false);
        setOrdersLoaded(true);
      }
    },
    [toast]
  );

  useEffect(() => {
    const previews = reviewForm.files.map((file) => URL.createObjectURL(file));
    setReviewFilePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [reviewForm.files]);

  const fetchOrderDetail = useCallback(
    async (orderId: number) => {
      setLoadingDetailId(orderId);
      setOrderDetailErrors((prev) => {
        const { [orderId]: _removed, ...rest } = prev;
        void _removed;
        return rest;
      });

      try {
        const { data } = await api.get<OrderDetailResponse>(
          `/order/${orderId}`
        );
        setOrderDetails((prev) => ({ ...prev, [orderId]: data }));
      } catch (e) {
        console.error(`Failed to load order detail ${orderId}`, e);
        setOrderDetailErrors((prev) => ({
          ...prev,
          [orderId]: "Không thể tải chi tiết đơn hàng",
        }));
        toast.error("Lỗi", "Không thể tải chi tiết đơn hàng");
      } finally {
        setLoadingDetailId((current) => (current === orderId ? null : current));
      }
    },
    [toast]
  );

  useEffect(() => {
    if (activeSection !== "orders") return;
    if (
      ordersLoaded &&
      ordersPagination &&
      ordersPagination.page === ordersRequest.page &&
      ordersPagination.pageSize === ordersRequest.pageSize
    ) {
      return;
    }
    void fetchOrders(ordersRequest);
  }, [
    activeSection,
    ordersLoaded,
    ordersPagination,
    ordersRequest,
    fetchOrders,
  ]);

  const handleOrdersPageChange = useCallback(
    (targetPage: number) => {
      if (!ordersPagination) return;
      const maxPage = Math.max(ordersPagination.totalPages, 1);
      const normalizedPage = Math.min(Math.max(targetPage, 1), maxPage);
      setOrdersRequest((prev) => {
        const next = {
          page: normalizedPage,
          pageSize: ordersPagination.pageSize,
        };
        if (prev.page === next.page && prev.pageSize === next.pageSize) {
          return prev;
        }
        return next;
      });
    },
    [ordersPagination]
  );

  const buildOrdersPageHref = useCallback(
    (targetPage: number) => {
      if (!ordersPagination) return "#";
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost";
      const baseLink =
        ordersPagination.nextLink ??
        ordersPagination.previousLink ??
        (typeof window !== "undefined"
          ? window.location.href
          : `${origin}/order/list`);

      try {
        const url = new URL(baseLink, origin);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("pageSize", String(ordersPagination.pageSize));

        if (baseLink.startsWith("http")) {
          return url.toString();
        }

        return `${url.pathname}${url.search}`;
      } catch (err) {
        console.error("Failed to build orders pagination href", err);
        return `?page=${targetPage}&pageSize=${ordersPagination.pageSize}`;
      }
    },
    [ordersPagination]
  );

  const ordersPageItems = useMemo(() => {
    if (!ordersPagination) return [];
    const { totalPages, page } = ordersPagination;
    if (totalPages <= 0) return [];

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let offset = -2; offset <= 2; offset += 1) {
      const value = page + offset;
      if (value >= 1 && value <= totalPages) {
        pages.add(value);
      }
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const items: Array<number | "ellipsis"> = [];

    for (let i = 0; i < sorted.length; i += 1) {
      const current = sorted[i];
      const previous = sorted[i - 1];
      if (previous !== undefined && current - previous > 1) {
        items.push("ellipsis");
      }
      items.push(current);
    }

    return items;
  }, [ordersPagination]);

  useEffect(() => {
    if (expandedOrderId == null) return;
    if (orderDetails[expandedOrderId]) return;
    void fetchOrderDetail(expandedOrderId);
  }, [expandedOrderId, orderDetails, fetchOrderDetail]);

  const openCancelDialog = useCallback((orderId: number) => {
    setCancelDialogState({
      orderId,
      open: true,
      selectedReason: DEFAULT_ORDER_CANCEL_REASON,
      customReason: "",
    });
    setCancelDialogError(null);
  }, []);

  const handleCancelDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setCancelDialogState(createInitialCancelDialogState());
      setCancelDialogError(null);
      return;
    }
    setCancelDialogState((prev) => ({ ...prev, open }));
  }, []);

  const handleSelectCancelReason = useCallback((value: string) => {
    setCancelDialogState((prev) => ({
      ...prev,
      selectedReason: value,
      customReason:
        value === CANCEL_REASON_OTHER_VALUE ? prev.customReason : "",
    }));
    setCancelDialogError(null);
  }, []);

  const handleCustomCancelReasonChange = useCallback((value: string) => {
    setCancelDialogState((prev) => ({ ...prev, customReason: value }));
    setCancelDialogError(null);
  }, []);

  const handleCancelOrder = useCallback(
    async (orderId: number, reason?: string) => {
      setCancelingOrderId(orderId);
      let wasSuccessful = false;
      try {
        const { data } = await api.post<OrderDetailResponse>(
          `/order/${orderId}/cancel`,
          reason ? { reason } : undefined
        );

        const summary: OrderSummaryResponse = {
          id: data.id,
          code: data.code,
          status: data.status,
          statusLabel: data.statusLabel,
          placedAt: data.placedAt,
          updatedAt: data.updatedAt,
          deliveredAt: data.deliveredAt,
          canCancel: data.canCancel,
          canReorder: data.canReorder,
          totals: data.totals,
          items: data.items,
        };

        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? summary : order))
        );
        setOrderDetails((prev) => ({ ...prev, [orderId]: data }));
        setOrderDetailErrors((prev) => {
          const { [orderId]: _removed, ...rest } = prev;
          void _removed;
          return rest;
        });
        toast.success("Thành công", "Đơn hàng đã được hủy");
        wasSuccessful = true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Không thể hủy đơn hàng lúc này";
        toast.error("Lỗi", message);
      } finally {
        setCancelingOrderId((current) =>
          current === orderId ? null : current
        );
      }
      return wasSuccessful;
    },
    [toast]
  );

  const handleConfirmCancelOrder = useCallback(async () => {
    const { orderId, selectedReason, customReason } = cancelDialogState;
    if (!orderId) return;

    const selectedOption = ORDER_CANCEL_REASON_OPTIONS.find(
      (option) => option.value === selectedReason
    );

    const requiresDetails = selectedOption?.requiresDetails ?? false;
    const trimmedCustomReason = customReason.trim();
    const reasonMessage = requiresDetails
      ? trimmedCustomReason
      : selectedOption?.label ?? selectedReason;

    if (!reasonMessage) {
      setCancelDialogError(
        requiresDetails
          ? "Vui lòng nhập lý do hủy đơn hàng."
          : "Vui lòng chọn lý do hủy đơn hàng."
      );
      return;
    }

    const wasCancelled = await handleCancelOrder(orderId, reasonMessage);
    if (wasCancelled) {
      setCancelDialogState(createInitialCancelDialogState());
      setCancelDialogError(null);
    }
  }, [cancelDialogState, handleCancelOrder]);

  const handleCancelDialogSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await handleConfirmCancelOrder();
    },
    [handleConfirmCancelOrder]
  );

  const handleReorder = useCallback(
    async (orderId: number) => {
      setReorderingOrderId(orderId);
      try {
        const { data } = await api.post<{
          addedItems: { variantId: number; quantity: number }[];
        }>(`/order/${orderId}/reorder`);

        const itemCount = data?.addedItems?.reduce(
          (sum, item) => sum + (item?.quantity ?? 0),
          0
        );
        toast.success(
          "Thành công",
          itemCount && itemCount > 0
            ? `Đã thêm ${itemCount} sản phẩm vào giỏ hàng`
            : "Đã thêm sản phẩm vào giỏ hàng"
        );
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Không thể mua lại đơn hàng";
        toast.error("Lỗi", message);
      } finally {
        setReorderingOrderId((current) =>
          current === orderId ? null : current
        );
      }
    },
    [toast]
  );

  // Address management functions
  const handleAddAddress = () => {
    setAddressDialogMode("add");
    setEditingAddress(null);
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setAddressDialogMode("edit");
    setEditingAddress(address);
    setShowAddressDialog(true);
  };

  const handleDeleteAddress = (address: Address) => {
    setDeletingAddress(address);
    setShowDeleteDialog(true);
  };

  const handleSaveAddress = async (addressData: Address) => {
    try {
      if (addressDialogMode === "add") {
        //  const { addressId, isDefault, ...payload } = addressData;
        const {
          addressId: _addressId,
          isDefault: _isDefault,
          ...payload
        } = addressData;
        void _addressId;
        void _isDefault;

        const { data } = await api.post<Address>("/user/addresses", {
          ...payload,
          setDefault: !!addressData.isDefault,
        });
        setAddresses((prev) => {
          const next = data.isDefault
            ? prev.map((a) => ({ ...a, isDefault: false }))
            : prev.slice();
          return [...next, data];
        });
        toast.success("Thành công", "Đã thêm địa chỉ");
      } else if (editingAddress?.addressId) {
        //  const { addressId: _ignore, isDefault, ...payload } = addressData;
        const {
          addressId: _ignore,
          isDefault: _isDefault,
          ...payload
        } = addressData;
        void _ignore;
        void _isDefault;

        const { data } = await api.patch<Address>(
          `/user/addresses/${editingAddress.addressId}`,
          {
            ...payload,
            setDefault: !!addressData.isDefault,
          }
        );
        setAddresses((prev) => {
          const next = data.isDefault
            ? prev.map((a) => ({ ...a, isDefault: false }))
            : prev.slice();
          return next.map((a) => (a.addressId === data.addressId ? data : a));
        });
        toast.success("Thành công", "Đã cập nhật địa chỉ");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi", "Không lưu được địa chỉ");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAddress?.addressId) return;
    try {
      const { data } = await api.delete(
        `/user/addresses/${deletingAddress.addressId}`
      );
      setAddresses((prev) => {
        const filtered = prev.filter(
          (a) => a.addressId !== deletingAddress.addressId
        );
        if (data.wasDefault && data.newDefaultAddressId) {
          return filtered.map((a) => ({
            ...a,
            isDefault: a.addressId === data.newDefaultAddressId,
          }));
        }
        return filtered;
      });
      toast.success("Thành công", "Đã xoá địa chỉ");
    } catch (e) {
      console.error(e);
      toast.error("Lỗi", "Không xoá được địa chỉ");
    } finally {
      setDeletingAddress(null);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await api.post(`/user/addresses/${addressId}/default`);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.addressId === addressId }))
      );
      toast.success("Thành công", "Đã đặt địa chỉ mặc định");
    } catch {
      toast.error("Lỗi", "Không đặt được địa chỉ mặc định");
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [];

    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.street) parts.push(address.street);
    if (address.wardName) parts.push(address.wardName);
    if (address.districtName) parts.push(address.districtName);
    if (address.provinceName) parts.push(address.provinceName);

    let formatted = parts.join(", ");

    // Add building details if available
    const buildingDetails = [];
    if (address.building) buildingDetails.push(address.building);
    if (address.block) buildingDetails.push(address.block);
    if (address.floor) buildingDetails.push(address.floor);
    if (address.room) buildingDetails.push(address.room);

    if (buildingDetails.length > 0) {
      formatted = `${buildingDetails.join(", ")}, ${formatted}`;
    }

    return formatted;
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleOpenReviewDialog = (
    order: OrderSummaryResponse,
    item: OrderItemSummary
  ) => {
    setReviewItem({
      ...item,
      orderId: order.id,
      orderCode: order.code,
      deliveredAt: order.deliveredAt ?? null,
    });
    setReviewForm({ rating: 0, details: "", files: [] });
    setExistingReview(null);
    setReviewError(null);
    setReviewDialogOpen(true);
    void loadExistingReview(order.id, item.id);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setReviewItem(null);
    setReviewForm({ rating: 0, details: "", files: [] });
    setReviewSubmitting(false);
    setReviewFilePreviews([]);
    setReviewLoading(false);
    setExistingReview(null);
    setReviewError(null);
  };

  const handleReviewRatingChange = (value: number) => {
    setReviewForm((prev) => ({
      ...prev,
      rating: prev.rating === value ? 0 : value,
    }));
  };

  const handleReviewDetailsChange = (value: string) => {
    setReviewForm((prev) => ({ ...prev, details: value }));
  };

  const handleReviewFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (existingReview) {
      toast.error("Không thể tải tệp", "Bạn đã gửi đánh giá cho sản phẩm này.");
      event.target.value = "";
      return;
    }

    const fileList = Array.from(event.target.files ?? []);
    if (fileList.length === 0) return;

    const validFiles = fileList.filter((file) => {
      const isValid = file.size <= REVIEW_MAX_FILE_SIZE_MB * 1024 * 1024;
      if (!isValid) {
        toast.error(
          "Tệp quá lớn",
          `${file.name} vượt quá dung lượng ${REVIEW_MAX_FILE_SIZE_MB}MB`
        );
      }
      return isValid;
    });

    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setReviewForm((prev) => {
      const remainingSlots = Math.max(REVIEW_MAX_FILES - prev.files.length, 0);
      const filesToAdd = validFiles.slice(0, remainingSlots);

      if (filesToAdd.length < validFiles.length) {
        toast.error(
          "Quá số lượng cho phép",
          `Chỉ có thể tải lên tối đa ${REVIEW_MAX_FILES} tệp`
        );
      }

      return {
        ...prev,
        files: [...prev.files, ...filesToAdd],
      };
    });

    event.target.value = "";
  };

  const handleRemoveReviewFile = (index: number) => {
    setReviewForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, fileIndex) => fileIndex !== index),
    }));
  };

  const loadExistingReview = useCallback(
    async (orderId: number, orderItemId: number) => {
      setReviewLoading(true);
      setReviewError(null);
      try {
        const { data } = await api.get<OrderItemReview>(
          `/order/${orderId}/items/${orderItemId}/review`
        );
        setExistingReview(data);
        setReviewForm({
          rating: data.rating,
          details: data.content ?? "",
          files: [],
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setExistingReview(null);
          } else {
            console.error(
              `Failed to load review for order item ${orderItemId}`,
              error
            );
            setReviewError("Không thể tải đánh giá hiện có");
            toast.error("Lỗi", "Không thể tải đánh giá hiện có");
          }
        } else {
          console.error(
            `Failed to load review for order item ${orderItemId}`,
            error
          );
          setReviewError("Không thể tải đánh giá hiện có");
          toast.error("Lỗi", "Không thể tải đánh giá hiện có");
        }
      } finally {
        setReviewLoading(false);
      }
    },
    [toast]
  );

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewItem || existingReview) {
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error("Thiếu thông tin", "Vui lòng chọn số sao đánh giá");
      return;
    }

    setReviewSubmitting(true);
    try {
      const payload = {
        rating: reviewForm.rating,
        content: reviewForm.details.trim()
          ? reviewForm.details.trim()
          : undefined,
      };
      const { data } = await api.post<OrderItemReview>(
        `/order/${reviewItem.orderId}/items/${reviewItem.id}/review`,
        payload
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === reviewItem.orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.id === reviewItem.id
                    ? { ...item, reviewed: true, canReview: false }
                    : item
                ),
              }
            : order
        )
      );
      setOrderDetails((prev) => {
        const current = prev[reviewItem.orderId];
        if (!current) return prev;
        return {
          ...prev,
          [reviewItem.orderId]: {
            ...current,
            items: current.items.map((item) =>
              item.id === reviewItem.id
                ? { ...item, reviewed: true, canReview: false }
                : item
            ),
          },
        };
      });

      setExistingReview(data);
      toast.success(
        "Đánh giá đã được gửi",
        "Cảm ơn bạn đã chia sẻ trải nghiệm sản phẩm!"
      );
      setReviewSubmitting(false);
      handleCloseReviewDialog();
    } catch (error) {
      setReviewSubmitting(false);
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string } | undefined)?.message ||
          "Không thể gửi đánh giá";
        toast.error("Lỗi", message);
      } else {
        toast.error("Lỗi", "Không thể gửi đánh giá");
      }
      console.error("Failed to submit review", error);
    }
  };

  const isReviewSubmitDisabled =
    reviewSubmitting ||
    reviewLoading ||
    reviewForm.rating === 0 ||
    !!existingReview;

  const sidebarItems: Array<{
    id: ProfileSection;
    label: string;
    icon: LucideIcon;
  }> = [
    { id: "profile", label: "Hồ Sơ", icon: User },
    { id: "addresses", label: "Địa Chỉ", icon: MapPin },
    { id: "orders", label: "Đơn Hàng", icon: Package },
    { id: "settings", label: "Cài Đặt", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">My Account</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="relative w-20 h-20 mx-auto mb-4 group">
                  <img
                    src={formData.avatar || "/placeholder.svg"}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
                  />
                  <Dialog
                    open={showAvatarDialog}
                    onOpenChange={setShowAvatarDialog}
                  >
                    <DialogTrigger asChild>
                      <button className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Profile Picture</DialogTitle>
                        <DialogDescription>
                          Upload a new profile picture or remove your current
                          one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Current/Preview Avatar */}
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32">
                            <img
                              src={
                                avatarPreview ||
                                formData.avatar ||
                                "/placeholder.svg"
                              }
                              alt="Profile preview"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                            />
                          </div>
                        </div>

                        {/* Upload Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="avatar-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG or GIF (MAX. 5MB)
                                </p>
                              </div>
                              <input
                                id="avatar-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                              />
                            </label>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              onClick={handleSaveAvatar}
                              disabled={!avatarFile}
                              className="flex-1 bg-black text-white hover:bg-gray-800"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Save Picture
                            </Button>
                            <Button
                              onClick={handleDeleteAvatar}
                              variant="outline"
                              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                          <Button
                            onClick={handleCancelAvatarEdit}
                            variant="outline"
                            className="w-full bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardTitle className="text-lg">{formData.username}</CardTitle>
                <CardDescription>{formData.email}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                          activeSection === item.id
                            ? "bg-amber-100 text-amber-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng Xuất
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!isEditing) {
                        // Bắt đầu Edit: copy formData -> draft
                        setDraft(formData);
                        setIsEditing(true);
                      } else {
                        // Cancel từ nút trên header: bỏ thay đổi
                        setDraft(formData);
                        setIsEditing(false);
                      }
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        // value={formData.username ?? ""}
                        // onChange={handleInputChange}
                        value={
                          (isEditing ? draft.username : formData.username) ?? ""
                        }
                        onChange={handleDraftInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={(isEditing ? draft.email : formData.email) ?? ""}
                        onChange={handleDraftInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={(isEditing ? draft.phone : formData.phone) ?? ""}
                        onChange={handleDraftInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={toYMD(draft.dateOfBirth)}
                          onChange={handleDraftInputChange}
                          disabled={!isEditing}
                        />
                      ) : (
                        // Khi không edit: hiển thị dd/mm/yyyy
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="text"
                          value={toDMY(formData.dateOfBirth)}
                          disabled
                          readOnly
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        disabled={!isEditing}
                        // value={formData.gender ?? ""}
                        value={
                          (isEditing ? draft.gender : formData.gender) ?? ""
                        }
                        onValueChange={(v) =>
                          // setFormData((p) => ({
                          //   ...p,
                          //   gender: v as UserProfile["gender"],
                          // }))
                          setDraft((p) =>
                            !isEditing
                              ? p
                              : { ...p, gender: v as UserProfile["gender"] }
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-black text-white hover:bg-gray-800"
                        disabled={!hasChanges} // không cho save nếu không đổi gì
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        // onClick={() => setIsEditing(false)}
                        onClick={() => {
                          // Cancel dưới form: bỏ thay đổi, khôi phục draft từ formData
                          setDraft(formData);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Account Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {ordersLoaded
                          ? ordersPagination?.totalItems ?? orders.length ?? 0
                          : "--"}
                      </div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {/* ${userData.totalSpent} */}
                        $--
                      </div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {/* {new Date(userData.joinDate).getFullYear()} */}
                        {formData.createdAt
                          ? new Date(formData.createdAt).getFullYear()
                          : "--"}
                      </div>
                      <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Addresses Section */}
            {activeSection === "addresses" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                    <CardDescription>
                      Quản lý địa chỉ giao hàng của bạn
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleAddAddress}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm địa chỉ
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.addressId}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="font-semibold text-gray-900">
                                {getLabelText(address.label)}
                              </h3>
                              {address.isDefault && (
                                <Badge className="bg-amber-100 text-amber-800">
                                  Mặc định
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-2 text-gray-600">
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-900 min-w-[100px]">
                                  Người nhận:
                                </span>
                                <span>{address.recipient}</span>
                              </div>

                              {address.phone && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">
                                    Điện thoại:
                                  </span>
                                  <span>{address.phone}</span>
                                </div>
                              )}

                              {address.company && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">
                                    Công ty:
                                  </span>
                                  <span>{address.company}</span>
                                </div>
                              )}

                              <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-900 min-w-[100px]">
                                  Địa chỉ:
                                </span>
                                <span>{formatAddress(address)}</span>
                              </div>

                              {address.postalCode && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">
                                    Mã bưu điện:
                                  </span>
                                  <span>{address.postalCode}</span>
                                </div>
                              )}

                              {address.notes && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">
                                    Ghi chú:
                                  </span>
                                  <span className="italic">
                                    {address.notes}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAddress(address)}
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            {!address.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSetDefault(address.addressId!)
                                }
                                className="text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50 bg-transparent w-full"
                              >
                                Mặc Định
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-4">
                          Chưa có địa chỉ giao hàng nào
                        </p>
                        <Button
                          onClick={handleAddAddress}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm địa chỉ đầu tiên
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Section */}
            {activeSection === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Lịch Sử Đơn Hàng</CardTitle>
                  <CardDescription>
                    Xem và theo dõi đơn hàng của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading && (
                    <div className="py-12 text-center text-sm text-gray-500">
                      Đang tải danh sách đơn hàng...
                    </div>
                  )}
                  {ordersError && !ordersLoading && (
                    <div className="py-12 text-center">
                      <p className="mb-4 text-sm text-red-600">{ordersError}</p>
                      <Button
                        onClick={() => {
                          void fetchOrders(ordersRequest);
                        }}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Thử lại
                      </Button>
                    </div>
                  )}
                  {!ordersLoading && !ordersError && orders.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-500">
                      Bạn chưa có đơn hàng nào.
                    </div>
                  )}
                  {!ordersLoading && !ordersError && orders.length > 0 && (
                    <div className="space-y-8">
                      <div className="space-y-6">
                        {orders.map((order) => {
                          const isExpanded = expandedOrderId === order.id;
                          const detail = orderDetails[order.id];
                          const items = detail?.items ?? order.items;
                          const totals = detail?.totals ?? order.totals;
                          const detailError = orderDetailErrors[order.id];
                          const isDetailLoading = loadingDetailId === order.id;
                          const deliveredAt =
                            detail?.deliveredAt ?? order.deliveredAt;
                          const shippingAddress = detail?.shippingAddress;
                          const shippingDisplay =
                            typeof totals.shipping === "number" &&
                            totals.shipping === 0
                              ? "FREE"
                              : formatPrice(totals.shipping);

                          return (
                            <div
                              key={order.id}
                              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                            >
                              <button
                                type="button"
                                onClick={() => toggleOrderExpansion(order.id)}
                                className="w-full px-4 py-4 text-left transition hover:bg-gray-50 focus-visible:outline-none"
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                      Đơn hàng #{order.code}
                                    </h3>
                                    <Badge
                                      className={`${getStatusColor(
                                        order.status
                                      )} flex items-center gap-1 px-2 py-0.5 text-xs font-medium`}
                                    >
                                      {getStatusIcon(order.status)}
                                      <span>{order.statusLabel}</span>
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      <span>
                                        Đã đặt vào ngày{" "}
                                        {formatOrderDate(order.placedAt)}
                                      </span>
                                    </div>
                                    <ChevronDown
                                      className={`h-5 w-5 text-gray-400 transition-transform ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>
                                </div>

                                {!isExpanded && (
                                  <div className="flex items-center gap-3">
                                    {items.map((item, index) => (
                                      <div
                                        key={`${order.id}-summary-${index}`}
                                        className="flex items-center gap-2"
                                      >
                                        <div className="relative h-16 w-16 overflow-hidden rounded border border-gray-200 bg-gray-50">
                                          <img
                                            src={
                                              item.imageUrl ||
                                              "/placeholder.svg"
                                            }
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          <div className="font-medium text-gray-900">
                                            {item.name}
                                          </div>
                                          <div>
                                            {item.color}{" "}
                                            {item.size ? ` · ${item.size}` : ""}{" "}
                                            x {item.quantity}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <div className="ml-auto text-right">
                                      <div className="text-xs text-gray-500">
                                        Tổng:
                                      </div>
                                      <div className="text-base font-semibold text-gray-900">
                                        {formatPrice(totals.total)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
                                  <div className="space-y-4">
                                    {isDetailLoading && !detail && (
                                      <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                                        Đang tải chi tiết đơn hàng...
                                      </div>
                                    )}
                                    {detailError && (
                                      <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:flex-row md:items-center md:justify-between">
                                        <span>{detailError}</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-red-200 text-red-600 hover:bg-red-100"
                                          onClick={() =>
                                            fetchOrderDetail(order.id)
                                          }
                                        >
                                          Thử lại
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-6">
                                    <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                                      {items.map((item, index) => (
                                        <div
                                          key={`${order.id}-${index}`}
                                          className="flex flex-wrap items-start gap-4 rounded-xl border border-gray-100 bg-white p-4"
                                        >
                                          <img
                                            src={
                                              item.imageUrl ||
                                              "/placeholder.svg"
                                            }
                                            alt={item.name}
                                            width={80}
                                            height={80}
                                            className="h-20 w-20 rounded-xl object-cover"
                                          />
                                          <div className="min-w-[200px] flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                              <p className="font-semibold text-gray-900">
                                                {item.name}
                                              </p>
                                              {item.reviewed && (
                                                <Badge className="flex items-center gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                  <CheckCircle className="h-3.5 w-3.5" />
                                                  <span className="text-xs font-medium uppercase">
                                                    Đã Đánh Giá
                                                  </span>
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                              {item.color && (
                                                <span>Màu: {item.color}</span>
                                              )}
                                              {item.size && (
                                                <span>
                                                  Kích Cỡ: {item.size}
                                                </span>
                                              )}
                                              <span>
                                                Số Lượng: {item.quantity}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex min-w-[120px] flex-col items-end gap-2">
                                            <p className="text-sm font-semibold text-gray-900">
                                              {formatPrice(item.unitPrice)}
                                            </p>
                                            {item.canReview && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="
                                                    border-[#D1A679] text-[#D1A679] 
                                                    hover:bg-[#D1A679] hover:text-white hover:border-[#C59660]
                                                    transition-colors duration-200
                                                  "
                                                type="button"
                                                onClick={() =>
                                                  handleOpenReviewDialog(
                                                    order,
                                                    item
                                                  )
                                                }
                                              >
                                                <Star
                                                  className="mr-2 h-4 w-4"
                                                  fill="currentColor"
                                                  strokeWidth={1.5}
                                                />
                                                Đánh Giá
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                                      <div className="rounded-lg border border-gray-200 bg-white p-6">
                                        <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                                          <MapPin className="h-5 w-5 text-gray-600" />
                                          Địa Chỉ Giao Hàng
                                        </h4>
                                        {shippingAddress ? (
                                          <div className="space-y-1 text-sm text-gray-700">
                                            <p className="font-semibold text-gray-900">
                                              {shippingAddress.recipient}
                                            </p>
                                            {shippingAddress.phone && (
                                              <p>{shippingAddress.phone}</p>
                                            )}
                                            <p className="text-gray-600 leading-relaxed">
                                              {shippingAddress.addressLine}
                                            </p>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-500">
                                            {isDetailLoading
                                              ? "Đang tải địa chỉ giao hàng..."
                                              : "Không có thông tin địa chỉ giao hàng"}
                                          </p>
                                        )}
                                      </div>

                                      <div className="rounded-lg border border-gray-200 bg-white p-6">
                                        <h4 className="mb-3 text-base font-semibold text-gray-900">
                                          Tóm Tắt Đơn Hàng
                                        </h4>
                                        <div className="space-y-2 text-sm text-gray-700">
                                          <div className="flex justify-between">
                                            <span>Tạm Tính</span>
                                            <span>
                                              {formatPrice(totals.subtotal)}
                                            </span>
                                          </div>
                                          {totals.discount > 0 && (
                                            <div className="flex justify-between text-red-600">
                                              <span>Giảm Giá</span>
                                              <span>
                                                -{formatPrice(totals.discount)}
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex justify-between">
                                            <span>Vận Chuyển</span>
                                            <span className="font-medium">
                                              {shippingDisplay}
                                            </span>
                                          </div>
                                          {typeof totals.tax === "number" &&
                                            totals.tax > 0 && (
                                              <div className="flex justify-between">
                                                <span>Thuế</span>
                                                <span>
                                                  {formatPrice(totals.tax)}
                                                </span>
                                              </div>
                                            )}
                                          <hr className="my-3 border-gray-200" />
                                          <div className="flex justify-between text-base font-semibold text-gray-900">
                                            <span>Tổng Cộng</span>
                                            <span>
                                              {formatPrice(totals.total)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-wrap items-center gap-3">
                                      {order.canCancel && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-red-200 text-red-600 hover:bg-red-50"
                                          onClick={() => openCancelDialog(order.id)}
                                          disabled={
                                            cancelingOrderId === order.id ||
                                            reorderingOrderId === order.id
                                          }
                                        >
                                          {cancelingOrderId === order.id
                                            ? "Đang hủy..."
                                            : "Hủy Đơn"}
                                        </Button>
                                      )}
                                      {order.canReorder && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-gray-200 text-gray-700 hover:bg-gray-100"
                                          onClick={() =>
                                            handleReorder(order.id)
                                          }
                                          disabled={
                                            reorderingOrderId === order.id ||
                                            cancelingOrderId === order.id
                                          }
                                        >
                                          {reorderingOrderId === order.id
                                            ? "Đang xử lý..."
                                            : "Mua Lại"}
                                        </Button>
                                      )}
                                    </div>

                                    {deliveredAt && (
                                      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                                        <CheckCircle className="h-4 w-4" />
                                        Đã giao vào ngày{" "}
                                        {formatOrderDate(deliveredAt)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {ordersPagination && ordersPagination.totalPages > 1 && (
                        <Pagination className="pt-2">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href={
                                  ordersPagination.previousLink ??
                                  buildOrdersPageHref(
                                    Math.max(ordersPagination.page - 1, 1)
                                  )
                                }
                                onClick={(event) => {
                                  event.preventDefault();
                                  if (ordersPagination.page <= 1) return;
                                  handleOrdersPageChange(
                                    ordersPagination.page - 1
                                  );
                                }}
                                className={
                                  ordersPagination.page <= 1
                                    ? "pointer-events-none opacity-50"
                                    : undefined
                                }
                              />
                            </PaginationItem>
                            {ordersPageItems.map((item, index) => (
                              <PaginationItem
                                key={`orders-page-${item}-${index}`}
                              >
                                {item === "ellipsis" ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    href={buildOrdersPageHref(item)}
                                    size="default"
                                    isActive={ordersPagination.page === item}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      if (ordersPagination.page === item)
                                        return;
                                      handleOrdersPageChange(item);
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
                                  ordersPagination.nextLink ??
                                  buildOrdersPageHref(
                                    Math.min(
                                      ordersPagination.page + 1,
                                      Math.max(ordersPagination.totalPages, 1)
                                    )
                                  )
                                }
                                onClick={(event) => {
                                  event.preventDefault();
                                  if (
                                    ordersPagination.page >=
                                    ordersPagination.totalPages
                                  ) {
                                    return;
                                  }
                                  handleOrdersPageChange(
                                    ordersPagination.page + 1
                                  );
                                }}
                                className={
                                  ordersPagination.page >=
                                  ordersPagination.totalPages
                                    ? "pointer-events-none opacity-50"
                                    : undefined
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive order updates and promotions
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amber-600"
                          defaultChecked
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            SMS Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive shipping updates via SMS
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amber-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Marketing Communications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive promotional offers and news
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amber-600"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div> */}

                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Security
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      {/* <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Two-Factor Authentication
                      </Button> */}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Data & Privacy
                    </h3>
                    <div className="space-y-3">
                      {/* <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download My Data
                      </Button> */}
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <OrderCancelDialog
        open={cancelDialogState.open}
        reasons={ORDER_CANCEL_REASON_OPTIONS}
        selectedReason={cancelDialogState.selectedReason}
        customReason={cancelDialogState.customReason}
        submitting={
          cancelDialogState.orderId != null &&
          cancelingOrderId === cancelDialogState.orderId
        }
        errorMessage={cancelDialogError}
        onOpenChange={handleCancelDialogOpenChange}
        onSelectReason={handleSelectCancelReason}
        onCustomReasonChange={handleCustomCancelReasonChange}
        onSubmit={handleCancelDialogSubmit}
      />

      <OrderReviewDialog
        open={reviewDialogOpen}
        reviewItem={reviewItem}
        reviewForm={reviewForm}
        reviewFilePreviews={reviewFilePreviews}
        reviewLoading={reviewLoading}
        existingReview={existingReview}
        reviewError={reviewError}
        reviewSubmitting={reviewSubmitting}
        isSubmitDisabled={isReviewSubmitDisabled}
        reviewDetailsMaxLength={REVIEW_DETAILS_MAX_LENGTH}
        reviewMaxFiles={REVIEW_MAX_FILES}
        reviewMaxFileSizeMb={REVIEW_MAX_FILE_SIZE_MB}
        formatOrderDate={formatOrderDate}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseReviewDialog();
          }
        }}
        onClose={handleCloseReviewDialog}
        onSubmit={handleReviewSubmit}
        onRatingChange={handleReviewRatingChange}
        onDetailsChange={handleReviewDetailsChange}
        onFilesChange={handleReviewFilesChange}
        onRemoveFile={handleRemoveReviewFile}
      />
      <Footer />

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        address={editingAddress}
        onSave={handleSaveAddress}
        mode={addressDialogMode}
      />

      {/* Delete Address Dialog */}
      <DeleteAddressDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        addressLabel={
          deletingAddress ? getLabelText(deletingAddress.label) : ""
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
