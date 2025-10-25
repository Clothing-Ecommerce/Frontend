import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { productMock, type ProductItem } from "@/data/adminMock"

const statusOptions: Array<ProductItem["status"]> = ["visible", "hidden"]
const performanceLabels: Record<ProductItem["performance"], string> = {
  hot: "Bán chạy",
  stable: "Ổn định",
  slow: "Chậm",
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(productMock)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProductItem["status"] | "all">("all")
  const [selected, setSelected] = useState<string[]>([])
  const [bulkTag, setBulkTag] = useState("")

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search.trim().length === 0 ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || product.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const updatePrice = (id: string, price: number, field: "price" | "salePrice") => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, [field]: Math.max(price, 0) } : product)),
    )
  }

  const toggleVisibility = (id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status: product.status === "visible" ? "hidden" : "visible",
            }
          : product,
      ),
    )
  }

  const updateStatus = (id: string, status: ProductItem["status"]) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, status } : product)))
  }

  const createProduct = () => {
    const newProduct: ProductItem = {
      id: `SP-${Math.floor(Math.random() * 1000)}`,
      name: "Sản phẩm mới",
      price: 990000,
      status: "hidden",
      performance: "stable",
      inventory: 20,
      variants: [],
      tags: [],
    }
    setProducts((prev) => [newProduct, ...prev])
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
    setSelected((prev) => prev.filter((productId) => productId !== id))
  }

  const applyBulk = (type: "show" | "hide" | "tag") => {
    if (selected.length === 0) return
    setProducts((prev) =>
      prev.map((product) => {
        if (!selected.includes(product.id)) return product
        if (type === "tag" && bulkTag.trim()) {
          return { ...product, tags: Array.from(new Set([...product.tags, bulkTag.trim()])) }
        }
        return {
          ...product,
          status: type === "show" ? "visible" : "hidden",
        }
      }),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Danh mục sản phẩm</CardTitle>
            <CardDescription>
              Quản trị biến thể, giá niêm yết/khuyến mãi, SEO và hiển thị theo điều kiện
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Tìm tên, SKU, ID"
              className="w-56"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductItem["status"] | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "visible" ? "Đang hiển thị" : "Ẩn"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createProduct}>Thêm sản phẩm</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {/* <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Thao tác hàng loạt</p>
            <Button size="sm" variant="outline" onClick={() => applyBulk("show")}>
              Bật hiển thị {selected.length > 0 ? `(${selected.length})` : ""}
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyBulk("hide")}>
              Tắt hiển thị
            </Button>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Thêm nhãn"
                className="h-8 w-32"
                value={bulkTag}
                onChange={(event) => setBulkTag(event.target.value)}
              />
              <Button size="sm" variant="outline" onClick={() => applyBulk("tag")}>
                Áp nhãn
              </Button>
            </div>
          </div> */}
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={selected.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={(value) =>
                        setSelected(value ? filteredProducts.map((product) => product.id) : [])
                      }
                    />
                  </th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hiệu suất</th>
                  <th className="px-4 py-3">Biến thể</th>
                  {/* <th className="px-4 py-3">SEO</th> */}
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="text-sm hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Checkbox checked={selected.includes(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.id} • {product.inventory} tồn kho</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          Giá niêm yết
                          <Input
                            type="number"
                            value={product.price}
                            className="h-8 w-32"
                            onChange={(event) => updatePrice(product.id, Number(event.target.value), "price")}
                          />
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          Giá khuyến mãi
                          <Input
                            type="number"
                            value={product.salePrice ?? ""}
                            className="h-8 w-32"
                            placeholder="--"
                            onChange={(event) => updatePrice(product.id, Number(event.target.value), "salePrice")}
                          />
                        </label>
                        <p className="text-xs text-emerald-600">
                          Doanh thu dự kiến: {currencyFormatter.format((product.salePrice ?? product.price) * 12)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={product.status} onValueChange={(value) => updateStatus(product.id, value as ProductItem["status"]) }>
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue>{product.status === "visible" ? "Đang bán" : "Ẩn"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === "visible" ? "Đang bán" : "Ẩn"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={product.performance === "hot" ? "default" : "secondary"}
                        className={product.performance === "slow" ? "bg-amber-100 text-amber-800" : ""}
                      >
                        {performanceLabels[product.performance]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {product.variants.length > 0 ? (
                        <ul className="space-y-1">
                          {product.variants.map((variant) => (
                            <li key={variant.id}>
                              {variant.color} {variant.size} • SKU {variant.sku} • {variant.inventory} tồn
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Chưa có biến thể</p>
                      )}
                      <Button size="sm" variant="ghost" className="mt-2 px-0 text-xs">
                        Quản lý biến thể
                      </Button>
                    </td>
                    {/* <td className="px-4 py-3 text-xs text-slate-500">
                      <p>Title: {product.name}</p>
                      <p>Slug: {product.id.toLowerCase()}</p>
                      <Button size="sm" variant="ghost" className="mt-2 px-0 text-xs">
                        SEO preview
                      </Button>
                    </td> */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          Chỉnh sửa
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleVisibility(product.id)}>
                          {product.status === "visible" ? "Ẩn" : "Hiển thị"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Tự động hoá hiển thị</CardTitle>
          <CardDescription>
            Quy tắc bật/tắt sản phẩm theo tồn kho, kênh bán và chiến dịch khuyến mãi
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Điều kiện hiển thị</p>
            <p className="text-xs text-slate-500">
              Bật sản phẩm khi tồn kho &gt; 10 và có chiến dịch đang chạy.
            </p>
            <Button size="sm" className="mt-3" variant="outline">
              Cấu hình điều kiện
            </Button>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Đồng bộ marketplace</p>
            <p className="text-xs text-slate-500">
              Đẩy giá và tồn kho lên Shopee/Lazada/Tiktok theo lịch.
            </p>
            <Button size="sm" className="mt-3" variant="outline">
              Cài đặt lịch đồng bộ
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}