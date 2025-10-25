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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  { key: "orders", label: "Đơn hàng", icon: ClipboardList, to: "/staff/orders" },
  { key: "inventory", label: "Kho hàng (admin)", icon: Boxes, to: "/staff/inventory" },
  { key: "products", label: "Sản phẩm", icon: Tag, to: "/staff/products" },
  { key: "customers", label: "Khách hàng", icon: Users, to: "/staff/customers" },
  { key: "support", label: "Hỗ trợ", icon: LifeBuoy, to: "/staff/support" },
  { key: "reports", label: "Báo cáo", icon: BarChart3, to: "/staff/reports" },
  { key: "profile", label: "Hồ sơ", icon: UserCog, to: "/staff/profile" },
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r bg-white/90 backdrop-blur md:flex md:flex-col">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">HyperCommerce</p>
              <h1 className="text-xl font-bold text-slate-900">Staff Console</h1>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/")}>
              Về trang bán
            </Button>
          </div>
          <Separator />
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive || location.pathname.startsWith(item.to)
                        ? "bg-slate-900 text-white shadow"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Khu vực nhân viên</p>
                <h2 className="text-2xl font-semibold text-slate-900">{currentTitle}</h2>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3 md:max-w-xl">
                <Input placeholder="Tìm kiếm nhanh" className="max-w-sm" />
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-primary" />
                </Button>
                <Button variant="outline" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <section className="space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-10">
            <Outlet context={outletContext} />
          </section>
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