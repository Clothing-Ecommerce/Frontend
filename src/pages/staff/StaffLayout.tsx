import { useMemo, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Tag,
  Users,
  LifeBuoy,
  BarChart3,
  UserCog,
  Bell,
  LogOut,
  Mail,
  Phone,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ToastContainer, type ToastProps } from "@/components/ui/toast"
import {
  staffMockData,
  type CustomerRecord,
  type InventoryItem,
  type Order,
  type OrderStatus,
  type Product,
  type ProductivitySnapshot,
  type StaffProfile,
  type SupportTicket,
} from "@/data/staff"

export type StaffSectionKey =
  | "dashboard"
  | "orders"
  | "inventory"
  | "products"
  | "customers"
  | "support"
  | "reports"
  | "profile"

type DashboardTaskDefinition = (typeof staffMockData.dashboard.todo)[number]
export type DashboardTask = DashboardTaskDefinition & { completed: boolean }

type ToastMessage = Omit<ToastProps, "onClose">

export const orderStatusLabel: Record<OrderStatus, string> = {
  new: "Mới",
  processing: "Đang xử lý",
  delivered: "Đã giao",
  returned: "Hoàn trả",
}

export const orderStatusBadge: Record<OrderStatus, string> = {
  new: "bg-[#dfe7ff] text-[#1b3a7a] border-[#c2d4ff]",
  processing: "bg-[#ffe8c7] text-[#8b4a00] border-[#ffd6a1]",
  delivered: "bg-[#dff6dd] text-[#276749] border-[#b7e4c7]",
  returned: "bg-[#ffe0e0] text-[#b42318] border-[#ffc2c2]",
}

export const orderStatusAccent: Record<OrderStatus, string> = {
  new: "bg-[#4c6ef5]",
  processing: "bg-[#f59f00]",
  delivered: "bg-[#2f9e44]",
  returned: "bg-[#e03131]",
}

export const ticketPriorityBadge: Record<SupportTicket["priority"], string> = {
  high: "bg-[#ffe0e0] text-[#b42318] border-[#ffc2c2]",
  medium: "bg-[#ffe8c7] text-[#8b4a00] border-[#ffd6a1]",
  low: "bg-[#dfe7ff] text-[#1b3a7a] border-[#c2d4ff]",
}

export const ticketStatusLabel: Record<SupportTicket["status"], string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
}

export const rangeLabel: Record<ProductivitySnapshot["range"], string> = {
  "7d": "7 ngày",
  "14d": "14 ngày",
  "30d": "30 ngày",
}

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

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDate(iso: string) {
  try {
    return dateFormatter.format(new Date(iso))
  } catch {
    return iso
  }
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

  return initials || "ST"
}

const navItems: Array<{ key: StaffSectionKey; label: string; icon: React.ElementType; to: string }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/staff/dashboard" },
  { key: "orders", label: "Đơn Hàng", icon: ClipboardList, to: "/staff/orders" },
  { key: "inventory", label: "Kho hàng (admin)", icon: Boxes, to: "/staff/inventory" },
  { key: "products", label: "Sản Phẩm", icon: Tag, to: "/staff/products" },
  { key: "customers", label: "Khách Hàng", icon: Users, to: "/staff/customers" },
  { key: "support", label: "Hỗ Trợ", icon: LifeBuoy, to: "/staff/support" },
  { key: "reports", label: "Báo Cáo", icon: BarChart3, to: "/staff/reports" },
  { key: "profile", label: "Hồ Sơ", icon: UserCog, to: "/staff/profile" },
]

const sectionRoutes: Record<StaffSectionKey, string> = navItems.reduce(
  (acc, item) => ({ ...acc, [item.key]: item.to }),
  {} as Record<StaffSectionKey, string>,
)

export type StaffOutletContext = {
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  orderStatusFilter: OrderStatus | "all"
  setOrderStatusFilter: React.Dispatch<React.SetStateAction<OrderStatus | "all">>
  orderSearchTerm: string
  setOrderSearchTerm: React.Dispatch<React.SetStateAction<string>>
  selectedOrderId: string | null
  setSelectedOrderId: React.Dispatch<React.SetStateAction<string | null>>
  inventory: InventoryItem[]
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  customers: CustomerRecord[]
  setCustomers: React.Dispatch<React.SetStateAction<CustomerRecord[]>>
  tickets: SupportTicket[]
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>
  reviews: typeof staffMockData.reviewModeration
  setReviews: React.Dispatch<React.SetStateAction<typeof staffMockData.reviewModeration>>
  profile: StaffProfile
  setProfile: React.Dispatch<React.SetStateAction<StaffProfile>>
  notificationSettings: StaffProfile["notifications"]
  setNotificationSettings: React.Dispatch<React.SetStateAction<StaffProfile["notifications"]>>
  profileContact: { email: string; phone: string }
  setProfileContact: React.Dispatch<React.SetStateAction<{ email: string; phone: string }>>
  passwordForm: { current: string; next: string; confirm: string }
  setPasswordForm: React.Dispatch<
    React.SetStateAction<{ current: string; next: string; confirm: string }>
  >
  reportRange: ProductivitySnapshot["range"]
  setReportRange: React.Dispatch<React.SetStateAction<ProductivitySnapshot["range"]>>
  chartView: "daily" | "weekly"
  setChartView: React.Dispatch<React.SetStateAction<"daily" | "weekly">>
  tasks: DashboardTask[]
  setTasks: React.Dispatch<React.SetStateAction<DashboardTask[]>>
  showToast: (toast: Omit<ToastMessage, "id"> & { id?: string }) => void
  formatDate: (iso: string) => string
  formatDateTime: (iso: string) => string
  formatCurrency: (value: number) => string
  getInitials: (name: string) => string
  navigateToSection: (section: StaffSectionKey, options?: { status?: OrderStatus }) => void
}

export default function StaffLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>(staffMockData.orders)
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "all">("all")
  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    staffMockData.orders[0]?.id ?? null,
  )

  const [inventory, setInventory] = useState<InventoryItem[]>(staffMockData.inventory)
  const [products, setProducts] = useState<Product[]>(staffMockData.products)
  const [customers, setCustomers] = useState<CustomerRecord[]>(staffMockData.customers)
  const [tickets, setTickets] = useState<SupportTicket[]>(staffMockData.supportTickets)
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
    staffMockData.dashboard.todo.map((task) => ({ ...task, completed: false })),
  )

  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (toast: Omit<ToastMessage, "id"> & { id?: string }) => {
    const id = toast.id ?? Math.random().toString(36).slice(2, 10)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const navigateToSection = (section: StaffSectionKey, options?: { status?: OrderStatus }) => {
    if (section === "orders" && options?.status) {
      setOrderStatusFilter(options.status)
    }
    navigate(sectionRoutes[section])
  }

  const currentTitle = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to))
    return found?.label ?? "Staff"
  }, [location.pathname])

  const pendingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "resolved").length,
    [tickets],
  )

  const pendingNewOrders = useMemo(
    () => orders.filter((order) => order.status === "new").length,
    [orders],
  )

  const notificationCount = pendingTickets + pendingNewOrders

  const outletContext: StaffOutletContext = {
    orders,
    setOrders,
    orderStatusFilter,
    setOrderStatusFilter,
    orderSearchTerm,
    setOrderSearchTerm,
    selectedOrderId,
    setSelectedOrderId,
    inventory,
    setInventory,
    products,
    setProducts,
    customers,
    setCustomers,
    tickets,
    setTickets,
    reviews,
    setReviews,
    profile,
    setProfile,
    notificationSettings,
    setNotificationSettings,
    profileContact,
    setProfileContact,
    passwordForm,
    setPasswordForm,
    reportRange,
    setReportRange,
    chartView,
    setChartView,
    tasks,
    setTasks,
    showToast,
    formatDate,
    formatDateTime,
    formatCurrency,
    getInitials,
    navigateToSection,
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 text-[#1f1b16]">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={cn(
            "flex w-full flex-col border-b border-[#2a2620]/30 bg-[#1c1a16] text-stone-200",
            "lg:w-72 lg:border-r lg:border-b-0",
            "lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:overflow-hidden",
            "lg:overflow-y-auto",
          )}
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between border-b border-[#2a2620]/50 px-7 py-6">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#d1c4a7]">Fashion Store</div>
                <div className="mt-1 text-lg font-semibold text-white">Staff Console</div>
              </div>
              <Badge className="flex items-center gap-1 border-[#f5c162]/40 bg-[#f5c162]/20 text-[#f5c162]">
                <Bell className="h-4 w-4" /> {notificationCount}
              </Badge>
            </div>

            <nav className="flex flex-1 flex-col space-y-1">
              <div className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.to)
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-5 py-4 text-base font-medium transition",
                        isActive
                          ? "bg-[#efe2c6] text-[#1f1b16] shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                          : "text-stone-300 hover:bg-[#2a2620] hover:text-white",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-[#c87d2f]" : "text-[#d1c4a7]")} />
                      <span className="flex-1 truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>

              <hr className="my-4 border-t border-[#2a2620]/50" />

              <button
                className="flex w-full items-center gap-3 rounded-xl px-5 py-4 text-base font-medium text-stone-400 transition hover:bg-red-900/50 hover:text-red-200"
              >
                <LogOut className="h-5 w-5 text-red-300" />
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto bg-[#f4f1ea] p-6 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-8">
            <header className="flex flex-col gap-4 rounded-3xl border border-[#ead7b9] bg-[#fdfbf7] p-6 shadow-[0_24px_60px_rgba(23,20,16,0.08)] md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Staff Dashboard</div>
                <h2 className="mt-2 text-3xl font-semibold text-[#1f1b16]">{currentTitle}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6c6252]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <User className="h-4 w-4 text-[#c87d2f]" /> {profile.name}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Mail className="h-4 w-4 text-[#c87d2f]" /> {profile.email}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Phone className="h-4 w-4 text-[#c87d2f]" /> {profile.phone}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-[#ead7b9] bg-white/70 text-[#1f1b16] hover:bg-[#efe2c6]"
                  onClick={() => navigate("/")}
                >
                  Về trang bán
                </Button>
              </div>
            </header>

            <section className="space-y-8">
              <Outlet context={outletContext} />
            </section>
          </div>
        </main>
      </div>
      <ToastContainer
        toasts={toasts.map((toast) => ({ ...toast, onClose: removeToast }))}
        onClose={removeToast}
      />
    </div>
  )
}

export { formatCurrency, formatDate, formatDateTime, getInitials }