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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r bg-white/80 backdrop-blur md:flex md:flex-col">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">HyperCommerce</p>
              <h1 className="text-xl font-bold text-slate-900">Admin Center</h1>
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
                  <Icon className="size-4" />
                  <span className="flex-1 truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
          {/* <div className="space-y-3 border-t px-4 py-4 text-sm text-slate-500">
            <p className="font-medium text-slate-700">Báo cáo nhanh</p>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 text-left text-xs"
                onClick={() => navigate("/admin/reports")}
              >
                📊 Hiệu suất tuần này
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 text-left text-xs"
                onClick={() => navigate("/admin/dashboard?pin=inventory")}
              >
                📌 KPI tồn kho
              </Button>
            </div>
          </div> */}
        </aside>
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Bảng điều khiển</p>
                <h2 className="text-2xl font-semibold text-slate-900">{currentTitle}</h2>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3 md:max-w-xl">
                <Input placeholder="Tìm kiếm nhanh" className="max-w-sm" />
                {/* <Button variant="outline">Báo cáo đã ghim</Button>
                <Button>Tạo mới</Button> */}
              </div>
            </div>
          </header>
          <section className="space-y-6 px-4 pb-10 pt-6 md:px-6 lg:px-10">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}