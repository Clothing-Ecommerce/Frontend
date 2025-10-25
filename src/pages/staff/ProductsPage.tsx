import { useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import type { StaffOutletContext } from "./StaffLayout"

export default function StaffProductsPage() {
  const { products, setProducts, formatCurrency, showToast } = useOutletContext<StaffOutletContext>()

  const [productSearch, setProductSearch] = useState("")
  const [productCategory, setProductCategory] = useState("all")
  const [productTag, setProductTag] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[number] | null>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [productDraft, setProductDraft] = useState({
    price: "",
    shortDescription: "",
    image: "",
    visible: true,
  })

  const categories = useMemo(() => Array.from(new Set(["all", ...products.map((product) => product.category)])), [products])
  const allTags = useMemo(() => Array.from(new Set(products.flatMap((product) => product.tags))), [products])

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

  const openProductEditor = (product: (typeof products)[number]) => {
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
          : product,
      ),
    )
    setProductDialogOpen(false)
    showToast({
      title: "Cập nhật sản phẩm",
      description: `${selectedProduct.name} đã được lưu thay đổi.`,
      type: "success",
    })
  }

  const toggleProductVisibility = (product: (typeof products)[number]) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              visible: !item.visible,
            }
          : item,
      ),
    )
    showToast({
      title: "Thay đổi hiển thị",
      description: `${product.name} đã được ${product.visible ? "ẩn" : "hiển thị"}.`,
      type: "info",
    })
  }

  return (
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
                  {product.visible ? "Ẩn sản phẩm" : "Hiển thị"}
                </Button>
                <Badge variant={product.visible ? "default" : "secondary"}>
                  {product.visible ? "Đang bán" : "Đã ẩn"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                onChange={(event) => setProductDraft((prev) => ({ ...prev, shortDescription: event.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <Checkbox
                  checked={productDraft.visible}
                  onCheckedChange={(checked) => setProductDraft((prev) => ({ ...prev, visible: Boolean(checked) }))}
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
    </div>
  )
}