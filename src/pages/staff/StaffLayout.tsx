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
import type { StaffOrderDisplayStatus } from "@/types/staffType"

type ToastMessage = Omit<ToastProps, "onClose">

export type StaffSectionKey =
  | "dashboard"
  | "orders"
  | "inventory"
  | "products"
  | "customers"
  | "support"
  | "reports"
  | "profile"

export type StaffOutletContext = {
  showToast: (toast: Omit<ToastMessage, "id"> & { id?: string }) => void
  formatDateTime: (iso: string) => string
  formatCurrency: (value: number) => string
}

export const orderStatusLabel: Record<StaffOrderDisplayStatus, string> = {
  new: "Mới",
  processing: "Đang xử lý",
  delivered: "Đã giao",
  returned: "Hoàn trả",
}

export const orderStatusBadge: Record<StaffOrderDisplayStatus, string> = {
  new: "bg-[#dfe7ff] text-[#1b3a7a] border-[#c2d4ff]",
  processing: "bg-[#ffe8c7] text-[#8b4a00] border-[#ffd6a1]",
  delivered: "bg-[#dff6dd] text-[#276749] border-[#b7e4c7]",
  returned: "bg-[#ffe0e0] text-[#b42318] border-[#ffc2c2]",
}

export const orderStatusAccent: Record<StaffOrderDisplayStatus, string> = {
  new: "bg-[#4c6ef5]",
  processing: "bg-[#f59f00]",
  delivered: "bg-[#2f9e44]",
  returned: "bg-[#e03131]",
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

const navItems: Array<{ key: StaffSectionKey; label: string; icon: React.ElementType; to: string }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/staff/dashboard" },
  { key: "orders", label: "Đơn Hàng", icon: ClipboardList, to: "/staff/orders" },
  { key: "inventory", label: "Kho hàng (admin)", icon: Boxes, to: "/staff/inventory" },
  { key: "products", label: "Sản Phẩm", icon: Tag, to: "/staff/products" },
  { key: "customers", label: "Khách Hàng (bỏ)", icon: Users, to: "/staff/customers" },
  { key: "support", label: "Hỗ Trợ (bỏ)", icon: LifeBuoy, to: "/staff/support" },
  { key: "reports", label: "Báo Cáo (bỏ)", icon: BarChart3, to: "/staff/reports" },
  { key: "profile", label: "Hồ Sơ", icon: UserCog, to: "/staff/profile" },
]

export default function StaffLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (toast: Omit<ToastMessage, "id"> & { id?: string }) => {
    const id = toast.id ?? Math.random().toString(36).slice(2, 10)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const currentTitle = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to))
    return found?.label ?? "Staff"
  }, [location.pathname])

  const staffProfile = {
    name: "Nguyễn Thảo",
    email: "thao.nguyen@company.vn",
    phone: "0902 555 123",
  }

  const notificationCount = 0

  const outletContext: StaffOutletContext = {
    showToast,
    formatDateTime,
    formatCurrency,
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
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Staff</div>
                <h2 className="mt-2 text-3xl font-semibold text-[#1f1b16]">{currentTitle}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6c6252]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <User className="h-4 w-4 text-[#c87d2f]" /> {staffProfile.name}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Mail className="h-4 w-4 text-[#c87d2f]" /> {staffProfile.email}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Phone className="h-4 w-4 text-[#c87d2f]" /> {staffProfile.phone}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-[#ead7b9] bg-white/70 text-[#1f1b16] hover:bg-[#efe2c6]"
                  onClick={() => navigate("/")}
                >
                  Trang chủ
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