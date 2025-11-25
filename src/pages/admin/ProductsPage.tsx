import { useState } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  ArrowUpDown,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Mock Data (Dữ liệu giả lập để hiển thị giao diện)
const products = [
  {
    id: "PROD-001",
    name: "Áo Polo Nam Cotton Coolmate",
    category: "Áo Nam",
    price: 299000,
    stock: 150,
    status: "in-stock",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=100&h=100",
    variants: 4
  },
  {
    id: "PROD-002",
    name: "Quần Jeans Slimfit Basic",
    category: "Quần Nam",
    price: 450000,
    stock: 24,
    status: "low-stock",
    image: "https://images.unsplash.com/photo-1542272617-08f08630793c?auto=format&fit=crop&q=80&w=100&h=100",
    variants: 5
  },
  {
    id: "PROD-003",
    name: "Váy Hoa Nhí Vintage",
    category: "Váy Nữ",
    price: 320000,
    stock: 0,
    status: "out-of-stock",
    image: "https://images.unsplash.com/photo-1618932260643-ebe43843a647?auto=format&fit=crop&q=80&w=100&h=100",
    variants: 3
  },
  {
    id: "PROD-004",
    name: "Áo Blazer Hàn Quốc",
    category: "Áo Khoác",
    price: 890000,
    stock: 45,
    status: "in-stock",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=100&h=100",
    variants: 2
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Hàm render trạng thái tồn kho đẹp mắt
  const renderStatus = (status: string) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Còn hàng</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Sắp hết</Badge>
      case "out-of-stock":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Hết hàng</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* --- 1. Header & Stats Section --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b16]">Quản lý sản phẩm</h1>
          <p className="text-sm text-[#6c6252]">Theo dõi, thêm mới và chỉnh sửa danh mục sản phẩm của bạn.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#ead7b9] text-[#6c6252] hover:bg-[#f4f1ea] hover:text-[#1f1b16]">
            <Download className="mr-2 h-4 w-4" /> Xuất Excel
          </Button>
          <Button className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]">
            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Stats Cards - Tổng quan nhanh */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tổng sản phẩm", value: "1,234", icon: Package, color: "text-blue-600" },
          { label: "Đang kinh doanh", value: "1,180", icon: Eye, color: "text-green-600" },
          { label: "Hết hàng", value: "54", icon: Package, color: "text-red-600" },
          { label: "Danh mục", value: "12", icon: Filter, color: "text-orange-600" },
        ].map((stat, index) => (
          <div key={index} className="rounded-xl border border-[#ead7b9] bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6c6252]">{stat.label}</p>
                <h3 className="mt-1 text-2xl font-bold text-[#1f1b16]">{stat.value}</h3>
              </div>
              <div className={cn("rounded-full bg-[#f4f1ea] p-2", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. Main Content: Toolbar & Table --- */}
      <div className="rounded-xl border border-[#ead7b9] bg-white shadow-sm">
        
        {/* Toolbar: Search & Filter */}
        <div className="flex flex-col gap-4 border-b border-[#ead7b9]/50 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-[#ead7b9] focus-visible:ring-[#c87d2f]"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px] border-[#ead7b9]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Danh mục" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="ao-nam">Áo Nam</SelectItem>
                <SelectItem value="quan-nam">Quần Nam</SelectItem>
                <SelectItem value="vay-nu">Váy Nữ</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-status">
              <SelectTrigger className="w-[160px] border-[#ead7b9]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Tất cả trạng thái</SelectItem>
                <SelectItem value="in-stock">Còn hàng</SelectItem>
                <SelectItem value="low-stock">Sắp hết</SelectItem>
                <SelectItem value="out-of-stock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="bg-[#f9f8f4] [&_tr]:border-b [&_tr]:border-[#ead7b9]">
              <tr className="border-b transition-colors data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-[#6c6252]">Sản phẩm</th>
                <th className="h-12 px-4 align-middle font-medium text-[#6c6252]">Danh mục</th>
                <th className="h-12 px-4 align-middle font-medium text-[#6c6252]">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#1f1b16]">
                    Giá bán <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="h-12 px-4 align-middle font-medium text-[#6c6252]">Kho</th>
                <th className="h-12 px-4 align-middle font-medium text-[#6c6252]">Trạng thái</th>
                <th className="h-12 px-4 align-middle font-medium text-[#6c6252] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#ead7b9]/30 transition-colors hover:bg-[#f4f1ea]/50"
                >
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg border border-[#ead7b9] object-cover"
                      />
                      <div>
                        <div className="font-medium text-[#1f1b16]">{product.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {product.id} • {product.variants} biến thể</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant="secondary" className="bg-[#f4f1ea] text-[#6c6252] hover:bg-[#efe2c6]">
                      {product.category}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle font-medium text-[#1f1b16]">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="p-4 align-middle text-[#6c6252]">
                    {product.stock}
                  </td>
                  <td className="p-4 align-middle">
                    {renderStatus(product.status)}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#ead7b9]/50">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4 text-[#6c6252]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-[#ead7b9] bg-white">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#ead7b9]/50" />
                        <DropdownMenuItem className="cursor-pointer focus:bg-[#f4f1ea]">
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer focus:bg-[#f4f1ea]">
                          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa sản phẩm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#ead7b9]/50 p-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị <strong>1-4</strong> trong tổng số <strong>1,234</strong> sản phẩm
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="border-[#ead7b9]">Trước</Button>
            <Button variant="outline" size="sm" className="border-[#ead7b9] hover:bg-[#f4f1ea]">Sau</Button>
          </div>
        </div>
      </div>
    </div>
  )
}