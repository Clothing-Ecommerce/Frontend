import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingBag,
  PackageSearch,
  Layers,
  Warehouse,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  LifeBuoy,
  Megaphone,
  History,
  Bell,
  User,
  Mail,
  Phone,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Products", to: "/admin/products", icon: PackageSearch },
  { label: "Categories", to: "/admin/categories", icon: Layers },
  { label: "Inventory & Shipping (bỏ)", to: "/admin/inventory", icon: Warehouse },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Reports & Analytics (biểu đồ,thống kê năng suất của nhân viên)", to: "/admin/reports", icon: BarChart3 },
  { label: "Users & Roles", to: "/admin/users", icon: ShieldCheck },
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Support (Chỉnh sửa lại)", to: "/admin/support", icon: LifeBuoy },
  { label: "Promotions", to: "/admin/marketing", icon: Megaphone },
  { label: "Audit Logs", to: "/admin/audit", icon: History },
] as const

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentTitle = useMemo(() => {
    const found = navItems.find((item) => location.pathname.startsWith(item.to))
    return found?.label ?? "Admin"
  }, [location.pathname])

  const adminProfile = {
    name: "Quản trị viên",
    email: "admin@hypercommerce.vn",
    phone: "+84 912 345 678",
  }

  const notificationCount = 8

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 text-[#1f1b16]">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={cn(
            "flex w-full flex-col border-b border-[#2a2620]/30 bg-[#1c1a16] text-stone-200",
            "lg:w-72 lg:border-r lg:border-b-0",
            "lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:overflow-hidden",
            "lg:overflow-y-auto",
            "lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden"
          )}
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between border-b border-[#2a2620]/50 px-7 py-6">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#d1c4a7]">HyperCommerce</div>
                <div className="mt-1 text-lg font-semibold text-white">Admin Console</div>
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

              <button className="flex w-full items-center gap-3 rounded-xl px-5 py-4 text-base font-medium text-stone-400 transition hover:bg-red-900/50 hover:text-red-200">
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
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Admin Dashboard</div>
                <h2 className="mt-2 text-3xl font-semibold text-[#1f1b16]">{currentTitle}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6c6252]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <User className="h-4 w-4 text-[#c87d2f]" /> {adminProfile.name}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Mail className="h-4 w-4 text-[#c87d2f]" /> {adminProfile.email}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7b9] bg-white/60 px-4 py-1.5">
                  <Phone className="h-4 w-4 text-[#c87d2f]" /> {adminProfile.phone}
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
              <Outlet />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}