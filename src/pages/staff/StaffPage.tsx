import { useEffect, useMemo, useState, type JSX } from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileDown,
  Filter,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Mail,
  Package,
  PackageCheck,
  Phone,
  Search,
  Settings,
  Tag,
  User,
  UserCog,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToastContainer, type ToastProps } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  type CustomerRecord,
  type InventoryItem,
  type Order,
  type OrderStatus,
  type Product,
  type ProductivitySnapshot,
  type SupportTicket,
  staffMockData,
} from "@/data/staff"

type SectionKey =
  | "dashboard"
  | "orders"
  | "inventory"
  | "products"
  | "customers"
  | "support"
  | "profile"
  | "reports"

type DashboardTask = (typeof staffMockData.dashboard.todo)[number] & {
  completed: boolean
}

type ToastMessage = Omit<ToastProps, "onClose">

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
})

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  hour12: false,
})

const navItems: Array<{ key: SectionKey; label: string; icon: React.ElementType }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Đơn hàng", icon: ClipboardList },
  { key: "inventory", label: "Kho hàng (admin)", icon: Boxes },
  { key: "products", label: "Sản phẩm", icon: Tag },
  { key: "customers", label: "Khách hàng", icon: Users },
  { key: "support", label: "Hỗ trợ", icon: LifeBuoy },
  { key: "reports", label: "Báo cáo", icon: BarChart3 },
  { key: "profile", label: "Hồ sơ", icon: UserCog },
]

const orderStatusLabel: Record<OrderStatus, string> = {
  new: "Mới",
  processing: "Đang xử lý",
  delivered: "Đã giao",
  returned: "Hoàn trả",
}

const orderStatusBadge: Record<OrderStatus, string> = {
  new: "bg-[#dfe7ff] text-[#1b3a7a] border-[#c2d4ff]",
  processing: "bg-[#ffe8c7] text-[#8b4a00] border-[#ffd6a1]",
  delivered: "bg-[#dff6dd] text-[#276749] border-[#b7e4c7]",
  returned: "bg-[#ffe0e0] text-[#b42318] border-[#ffc2c2]",
}

const orderStatusAccent: Record<OrderStatus, string> = {
  new: "bg-[#4c6ef5]",
  processing: "bg-[#f59f00]",
  delivered: "bg-[#2f9e44]",
  returned: "bg-[#e03131]",
}

const ticketPriorityBadge: Record<SupportTicket['priority'], string> = {
  high: "bg-[#ffe0e0] text-[#b42318] border-[#ffc2c2]",
  medium: "bg-[#ffe8c7] text-[#8b4a00] border-[#ffd6a1]",
  low: "bg-[#dfe7ff] text-[#1b3a7a] border-[#c2d4ff]",
}

const ticketStatusLabel: Record<SupportTicket["status"], string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
}

const rangeLabel: Record<ProductivitySnapshot["range"], string> = {
  "7d": "7 ngày",
  "14d": "14 ngày",
  "30d": "30 ngày",
}

function formatDate(iso: string) {
  try {
    return dateFormatter.format(new Date(iso))
  } catch (error) {
    return iso
  }
}

function formatDateTime(iso: string) {
  try {
    return dateTimeFormatter.format(new Date(iso))
  } catch (error) {
    return iso
  }
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

  return initials || "ST"
}
export default function StaffAdminPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard")
  const [orders, setOrders] = useState<Order[]>(staffMockData.orders)
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "all">("all")
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    staffMockData.orders[0]?.id ?? null
  )
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [orderNoteDraft, setOrderNoteDraft] = useState("")

  const [inventory, setInventory] = useState<InventoryItem[]>(staffMockData.inventory)
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false)
  const [inventoryAction, setInventoryAction] = useState<"import" | "export" | "adjust">("import")
  const [inventoryQuantity, setInventoryQuantity] = useState("0")
  const [inventoryNote, setInventoryNote] = useState("")
  const [activeInventorySku, setActiveInventorySku] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>(staffMockData.products)
  const [productSearch, setProductSearch] = useState("")
  const [productCategory, setProductCategory] = useState("all")
  const [productTag, setProductTag] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [productDraft, setProductDraft] = useState({
    price: "",
    shortDescription: "",
    image: "",
    visible: true,
  })

  const [customers, setCustomers] = useState<CustomerRecord[]>(staffMockData.customers)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id ?? null)
  const [customerNoteDraft, setCustomerNoteDraft] = useState("")

  const [tickets, setTickets] = useState<SupportTicket[]>(staffMockData.supportTickets)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id ?? null)
  const [ticketResponse, setTicketResponse] = useState("")
  const [reviews, setReviews] = useState(staffMockData.reviewModeration)

  const [profile, setProfile] = useState(staffMockData.profile)
  const [notificationSettings, setNotificationSettings] = useState(profile.notifications)
  const [profileContact, setProfileContact] = useState({
    email: profile.email,
    phone: profile.phone,
  })
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })

  const [reportRange, setReportRange] = useState<ProductivitySnapshot["range"]>("7d")
  const [chartView, setChartView] = useState<"daily" | "weekly">("daily")

  const [tasks, setTasks] = useState<DashboardTask[]>(
    staffMockData.dashboard.todo.map((task) => ({ ...task, completed: false }))
  )

  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null
  const selectedInventory = inventory.find((item) => item.sku === activeInventorySku) ?? null
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null
  const productivitySnapshot = staffMockData.productivity.find((item) => item.range === reportRange)

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.quantity <= item.reorderPoint),
    [inventory]
  )

  const orderSummary = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += order.total
        acc.byStatus[order.status] += 1
        return acc
      },
      { total: 0, byStatus: { new: 0, processing: 0, delivered: 0, returned: 0 } }
    )
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter
      const keyword = orderSearchTerm.trim().toLowerCase()
      const matchesKeyword =
        keyword.length === 0 ||
        order.id.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        formatDate(order.createdAt).includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [orders, orderStatusFilter, orderSearchTerm])

   useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId(null)
      return
    }

    if (!filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredOrders[0]?.id ?? null)
    }
  }, [filteredOrders, selectedOrderId])

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase()
    return products.filter((product) => {
      const matchesKeyword =
        keyword.length === 0 ||
        product.name.toLowerCase().includes(keyword) ||
        product.id.toLowerCase().includes(keyword)
      const matchesCategory = productCategory === "all" || product.category === productCategory
      const matchesTag = !productTag || product.tags.includes(productTag)
      return matchesKeyword && matchesCategory && matchesTag
    })
  }, [products, productSearch, productCategory, productTag])

  const showToast = (toast: Omit<ToastMessage, "id"> & { id?: string }) => {
    const id = toast.id ?? Math.random().toString(36).slice(2, 10)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleTaskToggle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    )
  }

  const focusSection = (section: SectionKey, options?: { status?: OrderStatus }) => {
    setActiveSection(section)
    if (section === "orders" && options?.status) {
      setOrderStatusFilter(options.status)
    }
  }

  const openOrderDetail = (order: Order, options?: { openDialog?: boolean }) => {
    setSelectedOrderId(order.id)
    setOrderNoteDraft("")
    if (options?.openDialog) {
      setOrderDialogOpen(true)
    }
  }

  const updateOrderStatus = (status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrderId
          ? {
              ...order,
              status,
            }
          : order
      )
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
          : order
      )
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
          : order
      )
    )
    showToast({
      title: "Xử lý hoàn trả",
      description: `Đơn ${selectedOrder.id} đã chuyển sang trạng thái hoàn trả.`,
      type: "success",
    })
  }

  const openInventoryAction = (sku: string, action: "import" | "export" | "adjust") => {
    setInventoryAction(action)
    setInventoryDialogOpen(true)
    setActiveInventorySku(sku)
    setInventoryQuantity("0")
    setInventoryNote("")
  }

  const submitInventoryAction = () => {
    if (!activeInventorySku) return
    const parsedQuantity = Number.parseInt(inventoryQuantity, 10)
    if (Number.isNaN(parsedQuantity) || parsedQuantity === 0) {
      showToast({
        title: "Số lượng không hợp lệ",
        description: "Vui lòng nhập số lượng khác 0.",
        type: "error",
      })
      return
    }

    setInventory((prev) =>
      prev.map((item) => {
        if (item.sku !== activeInventorySku) return item
        const historyEntry = {
          id: `INV-${Date.now()}`,
          type: inventoryAction,
          quantity:
            inventoryAction === "export"
              ? -Math.abs(parsedQuantity)
              : inventoryAction === "import"
                ? Math.abs(parsedQuantity)
                : parsedQuantity,
          note: inventoryNote.trim() || "",
          date: new Date().toISOString(),
        }
        const nextQuantity = (() => {
          if (inventoryAction === "import") return item.quantity + Math.abs(parsedQuantity)
          if (inventoryAction === "export") return Math.max(0, item.quantity - Math.abs(parsedQuantity))
          return Math.max(0, item.quantity + parsedQuantity)
        })()
        return {
          ...item,
          quantity: nextQuantity,
          history: [historyEntry, ...item.history],
        }
      })
    )

    setInventoryDialogOpen(false)
    showToast({
      title: "Cập nhật tồn kho",
      description: "Phiếu điều chỉnh đã được ghi nhận.",
      type: "success",
    })
  }

  const requestInventorySlip = (sku: string, type: "import" | "export") => {
    const item = inventory.find((record) => record.sku === sku)
    showToast({
      title: type === "import" ? "In phiếu nhập" : "In phiếu xuất",
      description: item ? `Đã tạo phiếu cho ${item.name}.` : "Phiếu đã tạo.",
      type: "info",
    })
  }

  const openProductEditor = (product: Product) => {
    setSelectedProduct(product)
    setProductDraft({
      price: product.price.toString(),
      shortDescription: product.shortDescription,
      image: product.image,
      visible: product.visible,
    })
    setProductDialogOpen(true)
  }

  const submitProductEdit = () => {
    if (!selectedProduct) return
    const parsedPrice = Number.parseInt(productDraft.price, 10)
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast({
        title: "Giá không hợp lệ",
        description: "Vui lòng nhập giá lớn hơn 0.",
        type: "error",
      })
      return
    }
    setProducts((prev) =>
      prev.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              price: parsedPrice,
              shortDescription: productDraft.shortDescription.trim(),
              image: productDraft.image.trim() || product.image,
              visible: productDraft.visible,
            }
          : product
      )
    )
    setProductDialogOpen(false)
    showToast({
      title: "Cập nhật sản phẩm",
      description: `${selectedProduct.name} đã được lưu thay đổi.`,
      type: "success",
    })
  }

  const toggleProductVisibility = (product: Product) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              visible: !item.visible,
            }
          : item
      )
    )
    showToast({
      title: "Thay đổi hiển thị",
      description: `${product.name} đã được ${product.visible ? "ẩn" : "hiển thị"}.`,
      type: "info",
    })
  }

  const appendCustomerNote = () => {
    if (!selectedCustomer || !customerNoteDraft.trim()) return
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === selectedCustomer.id
          ? {
              ...customer,
              notes: [customerNoteDraft.trim(), ...customer.notes],
            }
          : customer
      )
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

  const updateTicketStatus = (ticketId: string, status: SupportTicket["status"]) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
            }
          : ticket
      )
    )
    showToast({
      title: "Cập nhật vé hỗ trợ",
      description: `Vé ${ticketId} đã chuyển sang "${ticketStatusLabel[status]}".`,
      type: "success",
    })
  }

  const appendTicketResponse = () => {
    if (!selectedTicket || !ticketResponse.trim()) return
    showToast({
      title: "Đã gửi phản hồi",
      description: `Nội dung đã gửi tới khách ${selectedTicket.customerName}.`,
      type: "success",
    })
    setTicketResponse("")
  }

  const moderateReview = (reviewId: string, action: "approve" | "hide") => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: action === "approve" ? "visible" : "hidden",
            }
          : review
      )
    )
    showToast({
      title: action === "approve" ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá",
      description: "Cập nhật thành công.",
      type: "info",
    })
  }

  const submitNotificationSettings = () => {
    setProfile((prev) => ({
      ...prev,
      notifications: notificationSettings,
    }))
    showToast({
      title: "Lưu thông báo",
      description: "Tùy chọn thông báo đã được cập nhật.",
      type: "success",
    })
  }

  const submitContactUpdate = () => {
    setProfile((prev) => ({
      ...prev,
      email: profileContact.email,
      phone: profileContact.phone,
    }))
    showToast({
      title: "Cập nhật thông tin",
      description: "Thông tin liên hệ đã được lưu.",
      type: "success",
    })
  }

  const submitPasswordChange = () => {
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      showToast({
        title: "Không thể đổi mật khẩu",
        description: "Mật khẩu mới không khớp.",
        type: "error",
      })
      return
    }
    setPasswordForm({ current: "", next: "", confirm: "" })
    showToast({
      title: "Đổi mật khẩu",
      description: "Mật khẩu đã được cập nhật.",
      type: "success",
    })
  }

  const exportReport = (format: "csv" | "pdf") => {
    showToast({
      title: format === "csv" ? "Xuất CSV" : "Xuất PDF",
      description: "Báo cáo đã được chuẩn bị để tải xuống.",
      type: "info",
    })
  }

  const renderSparkline = (values: number[]) => {
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
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Xin chào, {profile.name}</h1>
          <p className="text-sm text-slate-500">Theo dõi nhanh hiệu suất và công việc ưu tiên trong ngày.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => focusSection("orders", { status: "new" })}>
            <PackageCheck className="h-4 w-4" /> Xử lý đơn mới
          </Button>
          {/* <Button variant="outline" className="gap-2" onClick={() => focusSection("inventory")}>
            <Boxes className="h-4 w-4" /> Nhập kho
          </Button> */}
          <Button variant="default" className="gap-2" onClick={() => focusSection("support")}>
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
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                  />
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
                          focusSection(
                            task.relatedSection,
                            task.relatedSection === "orders" ? { status: "new" } : undefined
                          )
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
                <Button size="sm" variant="outline" onClick={() => openInventoryAction(item.sku, "import")}>
                  Gửi yêu cầu nhập kho
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
  const renderOrders = () => (
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
                    "border-transparent bg-[#1f1b16] text-white shadow-[0_12px_30px_rgba(23,20,16,0.25)] hover:bg-[#1f1b16]"
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
                          isSelected ? "bg-[#f7efe1]" : "hover:bg-[#f9f4ea]"
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
                          <Badge className={cn("border", orderStatusBadge[order.status])}>{orderStatusLabel[order.status]}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full border border-transparent bg-[#efe2c6]/60 text-[#1f1b16] hover:bg-[#1f1b16] hover:text-white"
                            onClick={(event) => {
                              event.stopPropagation()
                              openOrderDetail(order, { openDialog: true })
                            }}
                            aria-label={`Mở chi tiết ${order.id}`}
                          >
                            <ChevronRight className="h-4 w-4" />
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

        {selectedOrder ? (
          <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-[#ead7b9] bg-white/80 p-6 shadow-[0_20px_50px_rgba(23,20,16,0.1)]">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b8a47a]">Order #{selectedOrder.id}</p>
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
                      <div
                        key={`${note}-${index}`}
                        className="rounded-2xl border border-[#ead7b9] bg-white/60 p-3"
                      >
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
                onClick={() => openOrderDetail(selectedOrder, { openDialog: true })}
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
  )

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Kho hàng</h2>
          <p className="text-sm text-slate-500">Nhập - xuất kho và đối chiếu tồn theo SKU.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {inventory.map((item) => (
          <Card key={item.sku} className="border border-slate-200">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg border object-cover" />
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>
                    {item.variant} • SKU: <span className="font-mono text-xs">{item.sku}</span>
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                Tồn: {item.quantity}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-2" onClick={() => openInventoryAction(item.sku, "import")}>
                  <ArrowUpRight className="h-4 w-4 -rotate-90" /> Nhập kho
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => openInventoryAction(item.sku, "export")}
                >
                  <ArrowUpRight className="h-4 w-4 rotate-90" /> Xuất kho
                </Button>
                {/* <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => openInventoryAction(item.sku, "adjust")}
                >
                  <Settings className="h-4 w-4" /> Điều chỉnh
                </Button> */}
              </div>
              {/* <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => requestInventorySlip(item.sku, "import")}>
                  <FileDown className="h-4 w-4" /> In phiếu nhập
                </Button>
                <Button size="sm" variant="ghost" onClick={() => requestInventorySlip(item.sku, "export")}>
                  <FileDown className="h-4 w-4" /> In phiếu xuất
                </Button>
              </div> */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Lịch sử gần đây</h4>
                <ul className="mt-2 space-y-2">
                  {item.history.slice(0, 3).map((history) => (
                    <li key={history.id} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {history.type === "import" ? "Nhập kho" : history.type === "export" ? "Xuất kho" : "Điều chỉnh"}
                        </div>
                        <div className="text-xs text-slate-500">{history.note || "Không có ghi chú"}</div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>{formatDate(history.date)}</div>
                        <div className="font-mono text-sm text-slate-900">
                          {history.quantity > 0 ? "+" : ""}
                          {history.quantity}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const categories = Array.from(new Set(["all", ...products.map((product) => product.category)]))
  const allTags = Array.from(new Set(products.flatMap((product) => product.tags)))
  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Danh sách sản phẩm</h2>
          <p className="text-sm text-slate-500">Điều chỉnh thông tin cơ bản và biến thể.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={productCategory} onValueChange={setProductCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "Tất cả danh mục" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            className="w-[220px]"
            placeholder="Tìm tên sản phẩm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTags.map((tagOption) => (
          <Badge
            key={tagOption}
            variant={productTag === tagOption ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setProductTag((prev) => (prev === tagOption ? null : tagOption))}
          >
            #{tagOption}
          </Badge>
        ))}
        {productTag && (
          <Button variant="ghost" size="sm" onClick={() => setProductTag(null)}>
            Bỏ lọc thẻ
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col justify-between border border-slate-200">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={product.image} alt={product.name} className="h-16 w-16 rounded-md border object-cover" />
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    Giá niêm yết: {formatCurrency(product.price)}
                    <br />
                    Tồn kho: {product.stock}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Badge key={variant.name} variant="secondary" className="text-xs">
                    {variant.name}: {variant.options.join(", ")}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{product.shortDescription}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => openProductEditor(product)}>
                  Chi tiết
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleProductVisibility(product)}>
                  {/* {product.visible ? "Ẩn sản phẩm" : "Hiển thị"} */}
                  Feedback
                </Button>
                {/* <Badge variant={product.visible ? "default" : "secondary"}>
                  {product.visible ? "Đang bán" : "Đã ẩn"}
                </Badge> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderCustomers = () => (
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
                    : "border-transparent hover:bg-slate-50"
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
                {/* <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCustomerContact("call")}>
                  <Phone className="h-4 w-4" /> Gọi điện
                </Button> */}
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
  const renderSupport = () => (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Hàng đợi vé hỗ trợ</CardTitle>
            <CardDescription>Lọc theo mức ưu tiên để phản hồi nhanh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  selectedTicketId === ticket.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent hover:bg-slate-50"
                )}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{ticket.subject}</span>
                  <Badge className={cn("border", ticketPriorityBadge[ticket.priority])}>{ticket.priority}</Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {ticket.customerName} • {ticketStatusLabel[ticket.status]}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Đánh giá sản phẩm</CardTitle>
            <CardDescription>Duyệt hoặc ẩn phản hồi không phù hợp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-slate-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{review.productName}</div>
                    <div className="text-xs text-slate-500">
                      {review.rating}⭐ • {review.customerName}
                    </div>
                  </div>
                  <Badge variant={review.status === "pending" ? "secondary" : "outline"}>{review.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => moderateReview(review.id, "approve")}>
                    Duyệt
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moderateReview(review.id, "hide")}>
                    Ẩn phản hồi
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card> */}
      </div>

      {selectedTicket ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTicket.subject}</CardTitle>
            <CardDescription>
              Khách hàng {selectedTicket.customerName}
              {selectedTicket.orderId ? ` • Đơn ${selectedTicket.orderId}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
              {selectedTicket.previewResponse}
            </div>
            <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <div>Mức ưu tiên: {selectedTicket.priority}</div>
              <div>Cập nhật: {formatDateTime(selectedTicket.lastUpdated)}</div>
              <div>Phụ trách: {selectedTicket.assignedTo}</div>
              <div>Trạng thái: {ticketStatusLabel[selectedTicket.status]}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTicket.tags.map((tagItem) => (
                <Badge key={tagItem} variant="outline">
                  #{tagItem}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => updateTicketStatus(selectedTicket.id, "in_progress")}>
                Đang xử lý
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}>
                Đã giải quyết
              </Button>
            </div>
            <div className="space-y-2">
              <Textarea
                value={ticketResponse}
                onChange={(event) => setTicketResponse(event.target.value)}
                placeholder="Soạn phản hồi tới khách hàng..."
              />
              <Button className="self-end" onClick={appendTicketResponse}>
                Gửi phản hồi
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Chọn một vé hỗ trợ để bắt đầu.
        </div>
      )}
    </div>
  )

  const renderProfile = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Quản lý dữ liệu hồ sơ và quyền hạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-600">
              {profile.name.slice(0, 1)}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{profile.name}</div>
              <div className="text-sm text-slate-500">{profile.role}</div>
              <div className="text-xs text-slate-400">{profile.id}</div>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-600">
            <div>Email: {profile.email}</div>
            <div>Số điện thoại: {profile.phone}</div>
            {/* <div>Máy nhánh: {profile.extension}</div> */}
            <div>Ca làm: {profile.preferredShift === "morning" ? "Sáng" : "Chiều"}</div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Quyền được gán</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {profile.permissions.map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {permission}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật liên hệ</CardTitle>
            <CardDescription>Thông tin dùng để điều phối công việc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="profile-email">
              Email
            </label>
            <Input
              id="profile-email"
              value={profileContact.email}
              onChange={(event) => setProfileContact((prev) => ({ ...prev, email: event.target.value }))}
            />
            <label className="text-sm font-medium text-slate-700" htmlFor="profile-phone">
              Số điện thoại
            </label>
            <Input
              id="profile-phone"
              value={profileContact.phone}
              onChange={(event) => setProfileContact((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Button onClick={submitContactUpdate}>Lưu thay đổi</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tùy chọn thông báo</CardTitle>
            <CardDescription>Chọn kênh nhận thông báo nghiệp vụ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <Checkbox
                checked={notificationSettings.email}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    email: Boolean(checked),
                  }))
                }
              />
              Email công việc
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <Checkbox
                checked={notificationSettings.app}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    app: Boolean(checked),
                  }))
                }
              />
              Thông báo trong ứng dụng
            </label>
            <Button variant="outline" className="gap-2" onClick={submitNotificationSettings}>
              <Bell className="h-4 w-4" /> Lưu tùy chọn
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>Bảo vệ tài khoản và phân quyền truy cập.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={passwordForm.current}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
            />
            <Input
              type="password"
              placeholder="Mật khẩu mới"
              value={passwordForm.next}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
            />
            <Input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={passwordForm.confirm}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
            />
            <Button onClick={submitPasswordChange}>Xác nhận</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Báo cáo tác nghiệp</h2>
          <p className="text-sm text-slate-500">Theo dõi hiệu suất cá nhân trong từng giai đoạn.</p>
        </div>
        <Tabs value={reportRange} onValueChange={(value) => setReportRange(value as ProductivitySnapshot["range"]) }>
          <TabsList>
            {(staffMockData.productivity.map((item) => item.range) as ProductivitySnapshot["range"][]).map((range) => (
              <TabsTrigger key={range} value={range}>
                {rangeLabel[range]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {productivitySnapshot ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Chỉ số chính</CardTitle>
              <CardDescription>Hiệu suất xử lý trong {rangeLabel[productivitySnapshot.range]} qua.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Đơn đã xử lý</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.ordersHandled}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Yêu cầu hỗ trợ đã giải quyết</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.ticketsResolved}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Thời gian phản hồi đầu tiên</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.firstResponseSla}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Thời gian hoàn thành yêu cầu</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.resolutionSla}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Yêu cầu điều chỉnh tồn kho</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.inventoryAdjustments}</div>
                </div>
                {/* <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Độ chính xác</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.accuracyScore}%</div>
                </div> */}
              </div>
              {/* <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => exportReport("csv")}>
                  <FileDown className="h-4 w-4" /> Xuất CSV
                </Button>
                <Button variant="default" className="gap-2" onClick={() => exportReport("pdf")}>
                  <FileDown className="h-4 w-4" /> Xuất PDF
                </Button>
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ hiệu suất</CardTitle>
              <CardDescription>Đơn hàng, vé hỗ trợ và độ chính xác theo ngày.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end gap-2">
                {productivitySnapshot.chart.map((item) => {
                  const ordersHeight = Math.max(12, Math.round((item.orders / 20) * 100))
                  const ticketsHeight = Math.max(8, Math.round((item.tickets / 10) * 100))
                  const accuracyHeight = Math.max(10, Math.round(((item.accuracy - 80) / 20) * 100))
                  return (
                    <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end gap-1">
                        <div className="w-2 rounded-full bg-blue-400" style={{ height: `${ordersHeight}%` }} />
                        <div className="w-2 rounded-full bg-emerald-400" style={{ height: `${ticketsHeight}%` }} />
                        <div className="w-2 rounded-full bg-amber-400" style={{ height: `${accuracyHeight}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500">{dateFormatter.format(new Date(item.date))}</div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-400" /> Đơn
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Vé
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Độ chính xác
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Không có dữ liệu báo cáo.
        </div>
      )}
    </div>
  )
  const sectionContent: Record<SectionKey, JSX.Element> = {
    dashboard: renderDashboard(),
    orders: renderOrders(),
    inventory: renderInventory(),
    products: renderProducts(),
    customers: renderCustomers(),
    support: renderSupport(),
    profile: renderProfile(),
    reports: renderReports(),
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] lg:p-4">
      {/* Container chính */}
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-full border-b border-[#2a2620]/30 bg-[#1c1a16] text-stone-200", // Class gốc
            "lg:w-72 lg:min-h-screen lg:border-r lg:border-b-0", // Class gốc cho layout lớn
            "lg:rounded-3xl lg:overflow-hidden" // ---> THÊM CÁC CLASS NÀY <---
          )}
        >
          {/* Header Sidebar */}
          <div className="flex items-center justify-between border-b border-[#2a2620]/50 px-7 py-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#d1c4a7]">ProfitPulse</div>
              <div className="mt-1 text-lg font-semibold text-white">Staff Console</div>
            </div>
            <Badge className="flex items-center gap-1 border-[#f5c162]/40 bg-[#f5c162]/20 text-[#f5c162]">
              <Bell className="h-4 w-4" /> 4
            </Badge>
          </div>
          {/* Navigation */}
          <nav className="space-y-1 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[#efe2c6] text-[#1f1b16] shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                      : "text-stone-300 hover:bg-[#2a2620] hover:text-white"
                  )}
                  onClick={() => setActiveSection(item.key)}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#c87d2f]" : "text-[#d1c4a7]")} /> {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#f4f1ea] p-6 lg:p-10 lg:ml-4">
          <div className="mx-auto max-w-6xl space-y-8">
            <header className="flex flex-col gap-4 rounded-3xl border border-[#ead7b9] bg-[#fdfbf7] p-6 shadow-[0_24px_60px_rgba(23,20,16,0.08)] md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Staff Dashboard</div>
                <h1 className="mt-2 text-3xl font-semibold text-[#1f1b16]">
                  {navItems.find((item) => item.key === activeSection)?.label}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[#6c6252]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <User className="h-4 w-4 text-[#c87d2f]" /> {profile.name}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Mail className="h-4 w-4 text-[#c87d2f]" /> {profile.email}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Phone className="h-4 w-4 text-[#c87d2f]" /> {profile.phone}
                </div>
              </div>
            </header>

            <section className="space-y-8">{sectionContent[activeSection]}</section>
          </div>
        </main>
      </div>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedOrder ? (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Đơn {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Khách hàng {selectedOrder.customerName} • {formatDateTime(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Sản phẩm</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.sku} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                        </div>
                        <div className="text-right text-sm text-slate-700">
                          x{item.quantity} • {formatCurrency(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
                    <div>Địa chỉ giao: {selectedOrder.address}</div>
                    <div>Tổng tiền: {formatCurrency(selectedOrder.total)}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Trạng thái & ghi chú</h3>
                  <Select value={selectedOrder.status} onValueChange={(value) => updateOrderStatus(value as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(orderStatusLabel) as OrderStatus[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {orderStatusLabel[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedOrder.isReturnRequested && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      Khách yêu cầu đổi/hoàn hàng.
                      <Button size="sm" className="mt-2" onClick={acceptReturnRequest}>
                        Tiếp nhận hoàn trả
                      </Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Textarea
                      value={orderNoteDraft}
                      onChange={(event) => setOrderNoteDraft(event.target.value)}
                      placeholder="Ghi chú nội bộ"
                    />
                    <Button size="sm" onClick={appendOrderNote}>
                      Thêm ghi chú
                    </Button>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500">Ghi chú đã lưu</h4>
                    <ul className="mt-2 space-y-2 text-xs">
                      {selectedOrder.notes.map((note, index) => (
                        <li key={index} className="rounded border bg-slate-50 p-2">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">Không tìm thấy đơn hàng.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {inventoryAction === "import" ? "Nhập kho" : inventoryAction === "export" ? "Xuất kho" : "Điều chỉnh tồn"}
            </DialogTitle>
            <DialogDescription>
              {selectedInventory
                ? `${selectedInventory.name} • SKU ${selectedInventory.sku}`
                : "Chọn sản phẩm để cập nhật"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="inventory-quantity">
              Số lượng
            </label>
            <Input
              id="inventory-quantity"
              type="number"
              min={inventoryAction === "export" ? 1 : undefined}
              value={inventoryQuantity}
              onChange={(event) => setInventoryQuantity(event.target.value)}
            />
            <label className="text-sm font-medium text-slate-700" htmlFor="inventory-note">
              Ghi chú
            </label>
            <Textarea
              id="inventory-note"
              value={inventoryNote}
              onChange={(event) => setInventoryNote(event.target.value)}
              placeholder="Lý do điều chỉnh..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInventoryDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitInventoryAction}>Lưu phiếu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent>
          {selectedProduct ? (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle>Cập nhật {selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <label className="text-sm font-medium text-slate-700" htmlFor="product-price">
                Giá niêm yết (VND)
              </label>
              <Input
                id="product-price"
                type="number"
                min={0}
                value={productDraft.price}
                onChange={(event) => setProductDraft((prev) => ({ ...prev, price: event.target.value }))}
              />
              <label className="text-sm font-medium text-slate-700" htmlFor="product-image">
                Ảnh đại diện
              </label>
              <Input
                id="product-image"
                value={productDraft.image}
                onChange={(event) => setProductDraft((prev) => ({ ...prev, image: event.target.value }))}
                placeholder="URL ảnh hoặc mô tả"
              />
              <label className="text-sm font-medium text-slate-700" htmlFor="product-desc">
                Mô tả ngắn
              </label>
              <Textarea
                id="product-desc"
                value={productDraft.shortDescription}
                onChange={(event) =>
                  setProductDraft((prev) => ({ ...prev, shortDescription: event.target.value }))
                }
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox
                  checked={productDraft.visible}
                  onCheckedChange={(checked) =>
                    setProductDraft((prev) => ({ ...prev, visible: Boolean(checked) }))
                  }
                />
                Hiển thị sản phẩm
              </label>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={submitProductEdit}>Lưu thay đổi</Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogDescription>Không tìm thấy sản phẩm.</DialogDescription>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer
        toasts={toasts.map((toast) => ({ ...toast, onClose: removeToast }))}
        onClose={removeToast}
      />
    </div>
  )
}