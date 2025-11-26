import { useEffect, useMemo, useState, useRef, type FormEvent } from "react"
import axios from "axios"
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
  Loader2,
  Upload,
  ImagePlus,
  Star,
  X,
  GripVertical,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import api from "@/utils/axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type {
  AdminProductListItem,
  AdminProductListResponse,
  AdminProductStockStatus,
  AdminCreateProductRequest,
  AdminCreateProductResponse,
} from "@/types/adminType"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"

const statusLabel: Record<AdminProductStockStatus, string> = {
  "in-stock": "Còn hàng",
  "low-stock": "Sắp hết",
  "out-of-stock": "Hết hàng",
}

const PAGE_SIZE = 12
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

type MediaItem = {
  id: string
  file: File
  preview: string
  isCover: boolean
  sortOrder: number
}

type VariantAttributes = {
  colors: string[]
  sizes: string[]
}

type VariantDraft = {
  id: string
  color?: string
  size?: string
  sku: string
  price: string
  stock: string
  imageId?: string
}

type SpecificationEntry = {
  id: string
  key: string
  value: string
}

type CreateProductFormState = {
  name: string
  slug: string
  basePrice: string
  categoryId: string
  brandId: string
  description: string
  material: string
  careInstructions: string
  features: string
  specifications: SpecificationEntry[]
  media: MediaItem[]
  variantAttributes: VariantAttributes
  variants: VariantDraft[]
  seoTitle: string
  seoDescription: string
}

const uniqueId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const createInitialFormState = (): CreateProductFormState => ({
  name: "",
  slug: "",
  basePrice: "",
  categoryId: "",
  brandId: "",
  description: "",
  material: "",
  careInstructions: "",
  features: "",
  specifications: [],
  media: [],
  variantAttributes: { colors: [], sizes: [] },
  variants: [],
  seoTitle: "",
  seoDescription: "",
})

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-+/g, "-")

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [pagination, setPagination] =
    useState<AdminProductListResponse["pagination"] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdminProductStockStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all")
  const [availableCategories, setAvailableCategories] = useState<
    { id: number; name: string }[]
  >([])
  const [availableBrands, setAvailableBrands] = useState<{ id: number; name: string }[]>([])
  const [categoryOptions, setCategoryOptions] = useState<
    { id: number; name: string }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateProductFormState>(createInitialFormState)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("general")
  const [colorInput, setColorInput] = useState("")
  const [sizeInput, setSizeInput] = useState("")
  const mediaInputRef = useRef<HTMLInputElement | null>(null)
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 400)

    return () => {
      window.clearTimeout(handle)
    }
  }, [search])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, categoryFilter])

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setError(null)

    api
      .get<AdminProductListResponse>("/admin/products", {
        params: {
          page: currentPage,
          pageSize: PAGE_SIZE,
          search: debouncedSearch.length ? debouncedSearch : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        },
        signal: controller.signal,
      })
      .then((response) => {
        setProducts(response.data.products)
        setPagination(response.data.pagination)

        setAvailableCategories((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]))
          response.data.products.forEach((product) => {
            if (product.category) {
              map.set(product.category.id, product.category)
            }
          })
          return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
        })
      })
      .catch((fetchError) => {
        if (axios.isCancel(fetchError)) return
        const message =
          axios.isAxiosError(fetchError) && fetchError.response?.data?.message
            ? fetchError.response.data.message
            : "Không thể tải danh sách sản phẩm"
        setError(message)
        setProducts([])
        setPagination(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [currentPage, debouncedSearch, statusFilter, categoryFilter, refreshKey])

  useEffect(() => {
    if (!pagination) return
    const maxPage = Math.max(pagination.totalPages, 1)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [currentPage, pagination])

  const renderStatus = (status: AdminProductStockStatus) => {
    const baseClass = "border-[#ead7b9]"
    if (status === "in-stock") {
      return <Badge className={cn(baseClass, "bg-green-100 text-green-700 hover:bg-green-200")}>Còn hàng</Badge>
    }
    if (status === "low-stock") {
      return <Badge className={cn(baseClass, "bg-yellow-100 text-yellow-700 hover:bg-yellow-200")}>Sắp hết</Badge>
    }
    return <Badge className={cn(baseClass, "bg-red-100 text-red-700 hover:bg-red-200")}>Hết hàng</Badge>
  }

  const totalProducts = pagination?.totalItems ?? 0
  const inBusinessCount = useMemo(
    () => products.filter((item) => item.stockStatus !== "out-of-stock").length,
    [products],
  )
  const outOfStockCount = useMemo(
    () => products.filter((item) => item.stockStatus === "out-of-stock").length,
    [products],
  )
  const categoryCount = availableCategories.length

  const displayRangeStart = useMemo(() => {
    if (!pagination || products.length === 0) return 0
    return (pagination.page - 1) * pagination.pageSize + 1
  }, [pagination, products.length])

  const displayRangeEnd = useMemo(() => {
    if (!pagination) return 0
    return (pagination.page - 1) * pagination.pageSize + products.length
  }, [pagination, products.length])

  const handleGenerateSlug = () => {
    setCreateForm((prev) => ({
      ...prev,
      slug: prev.slug || slugify(prev.name),
    }))
  }

  const resetCreateForm = () => {
    setCreateForm((prev) => {
      prev.media.forEach((item) => URL.revokeObjectURL(item.preview))
      return createInitialFormState()
    })
    setCreateError(null)
    setActiveTab("general")
    setColorInput("")
    setSizeInput("")
  }

  useEffect(() => {
    if (!availableCategories.length) return

    setCategoryOptions((prev) => {
      const merged = new Map(prev.map((category) => [category.id, category]))
      availableCategories.forEach((category) => merged.set(category.id, category))
      return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
    })
  }, [availableCategories])

  useEffect(() => {
    const controller = new AbortController()

    const fetchOptions = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          api.get<{ id: number; name: string }[]>("/admin/categories", {
            signal: controller.signal,
          }),
          api.get<{ id: number; name: string }[]>("/brands/", {
            signal: controller.signal,
          }),
        ])

        setCategoryOptions((prev) => {
          const merged = new Map(prev.map((category) => [category.id, category]))
          categoriesResponse.data.forEach((category) => merged.set(category.id, category))
          return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
        })

        setAvailableBrands(
          brandsResponse.data
            .map((brand) => ({ id: Number(brand.id), name: brand.name }))
            .filter((brand) => Number.isFinite(brand.id) && brand.name?.length),
        )
      } catch (fetchError) {
        if (axios.isCancel(fetchError)) return
        console.error("Failed to load category/brand options", fetchError)
      }
    }

    fetchOptions()

    return () => {
      controller.abort()
    }
  }, [])

  const addAttributesValue = (type: keyof VariantAttributes, value: string) => {
    const normalized = value.trim()
    if (!normalized) return

    setCreateForm((prev) => {
      if (prev.variantAttributes[type].includes(normalized)) return prev

      return {
        ...prev,
        variantAttributes: {
          ...prev.variantAttributes,
          [type]: [...prev.variantAttributes[type], normalized],
        },
      }
    })
  }

  const removeAttributesValue = (type: keyof VariantAttributes, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      variantAttributes: {
        ...prev.variantAttributes,
        [type]: prev.variantAttributes[type].filter((item) => item !== value),
      },
    }))
  }

  const handleMediaFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return

    setCreateForm((prev) => {
      const incoming = Array.from(fileList).map((file, index) => ({
        id: uniqueId(),
        file,
        preview: URL.createObjectURL(file),
        isCover: prev.media.length === 0 && index === 0,
        sortOrder: prev.media.length + index,
      }))

      return {
        ...prev,
        media: [...prev.media, ...incoming].map((item, idx) => ({
          ...item,
          sortOrder: idx,
        })),
      }
    })
  }

  const handleRemoveMedia = (id: string) => {
    setCreateForm((prev) => {
      const remaining = prev.media.filter((item) => item.id !== id)
      const removed = prev.media.find((item) => item.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      if (!remaining.length) return { ...prev, media: [] }
      return {
        ...prev,
        media: remaining.map((item, index) => ({
          ...item,
          isCover: index === 0 ? true : item.isCover,
          sortOrder: index,
        })),
      }
    })
  }

  const handleSetCoverMedia = (id: string) => {
    setCreateForm((prev) => ({
      ...prev,
      media: prev.media.map((item) => ({
        ...item,
        isCover: item.id === id,
      })),
    }))
  }

  const handleMoveMedia = (id: string, direction: "up" | "down") => {
    setCreateForm((prev) => {
      const index = prev.media.findIndex((item) => item.id === id)
      if (index === -1) return prev

      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.media.length) return prev

      const updated = [...prev.media]
      const [moved] = updated.splice(index, 1)
      updated.splice(targetIndex, 0, moved)

      return {
        ...prev,
        media: updated.map((item, idx) => ({ ...item, sortOrder: idx })),
      }
    })
  }

  const generateVariants = () => {
    const colors = createForm.variantAttributes.colors.length
      ? createForm.variantAttributes.colors
      : [undefined]
    const sizes = createForm.variantAttributes.sizes.length
      ? createForm.variantAttributes.sizes
      : [undefined]

    const combinations: Array<{ color?: string; size?: string }> = []
    colors.forEach((color) => {
      sizes.forEach((size) => combinations.push({ color, size }))
    })

    setCreateForm((prev) => {
      const nextVariants = combinations.map((combo) => {
        const existing = prev.variants.find(
          (variant) => variant.color === combo.color && variant.size === combo.size,
        )
        return (
          existing ?? {
            id: uniqueId(),
            color: combo.color,
            size: combo.size,
            sku: "",
            price: prev.basePrice,
            stock: "0",
          }
        )
      })

      return { ...prev, variants: nextVariants }
    })
  }

  const handleAutoSku = (variantId: string) => {
    setCreateForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) => {
        if (variant.id !== variantId) return variant

        const parts = [prev.slug || slugify(prev.name)]
        if (variant.color) parts.push(slugify(variant.color))
        if (variant.size) parts.push(slugify(variant.size))

        return { ...variant, sku: parts.filter(Boolean).join("-").toUpperCase() }
      }),
    }))
  }

  const handleSpecificationChange = (id: string, key: keyof SpecificationEntry, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }))
  }

  const addSpecificationRow = () => {
    setCreateForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { id: uniqueId(), key: "", value: "" }],
    }))
  }

  const removeSpecificationRow = (id: string) => {
    setCreateForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((item) => item.id !== id),
    }))
  }

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = createForm.name.trim()
    const slug = createForm.slug.trim() || slugify(createForm.name)
    const basePrice = Number(createForm.basePrice)
    const categoryId = Number(createForm.categoryId)
    const brandId = createForm.brandId.trim()
      ? Number(createForm.brandId)
      : undefined
    const description = createForm.description.trim()
    const features = createForm.features.trim()

    if (!name) return setCreateError("Vui lòng nhập tên sản phẩm")
    if (!slug) return setCreateError("Vui lòng nhập slug sản phẩm")
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return setCreateError("Giá sản phẩm không hợp lệ")
    }
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      return setCreateError("Danh mục không hợp lệ")
    }

    const specificationPayload: Record<string, string> = {}
    createForm.specifications.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specificationPayload[item.key.trim()] = item.value.trim()
      }
    })
    if (createForm.material.trim()) specificationPayload["Chất liệu"] = createForm.material.trim()
    if (createForm.careInstructions.trim())
      specificationPayload["Hướng dẫn bảo quản"] = createForm.careInstructions.trim()
    if (createForm.seoTitle.trim()) specificationPayload["SEO Title"] = createForm.seoTitle.trim()
    if (createForm.seoDescription.trim())
      specificationPayload["SEO Description"] = createForm.seoDescription.trim()

    const imagePayload =
      createForm.media.length > 0
        ? createForm.media.map((item, index) => ({
            url: item.file.name,
            alt: name,
            isPrimary: item.isCover,
            sortOrder: index,
          }))
        : undefined

    const variantPayload =
      createForm.variants.length > 0
        ? createForm.variants.map((variant) => ({
            sku: variant.sku || undefined,
            price: Number(variant.price) || basePrice,
            stock: Number.isFinite(Number(variant.stock)) ? Number(variant.stock) : 0,
            sizeId: undefined,
            colorId: undefined,
            isActive: true,
          }))
        : undefined

    const payload: AdminCreateProductRequest = {
      name,
      slug,
      basePrice,
      categoryId,
      description: description.length ? description : undefined,
      brandId: Number.isFinite(brandId) ? brandId : undefined,
      features: features.length ? features : undefined,
      specifications: Object.keys(specificationPayload).length ? specificationPayload : undefined,
      images: imagePayload,
      variants: variantPayload,
    }

    setIsCreating(true)
    setCreateError(null)

    api
      .post<AdminCreateProductResponse>("/admin/products", payload)
      .then((response) => {
        toast.success("Tạo sản phẩm thành công", response.data.product.name)
        setIsCreateOpen(false)
        resetCreateForm()
        setRefreshKey((prev) => prev + 1)
        setCurrentPage(1)
      })
      .catch((submitError) => {
        if (axios.isCancel(submitError)) return
        const message =
          axios.isAxiosError(submitError) && submitError.response?.data?.message
            ? submitError.response.data.message
            : "Không thể tạo sản phẩm mới"
        setCreateError(message)
        toast.error("Tạo sản phẩm thất bại", message)
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b16]">Quản lý sản phẩm</h1>
          <p className="text-sm text-[#6c6252]">Theo dõi, thêm mới và chỉnh sửa danh mục sản phẩm của bạn.</p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" className="border-[#ead7b9] text-[#6c6252] hover:bg-[#f4f1ea] hover:text-[#1f1b16]">
            <Download className="mr-2 h-4 w-4" /> Xuất Excel
          </Button> */}
          <Button
            className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tổng sản phẩm", value: totalProducts.toLocaleString("vi-VN"), icon: Package, color: "text-blue-600" },
          { label: "Đang kinh doanh", value: inBusinessCount.toLocaleString("vi-VN"), icon: Eye, color: "text-green-600" },
          { label: "Hết hàng", value: outOfStockCount.toLocaleString("vi-VN"), icon: Package, color: "text-red-600" },
          { label: "Danh mục", value: categoryCount.toLocaleString("vi-VN"), icon: Filter, color: "text-orange-600" },
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

      <div className="rounded-xl border border-[#ead7b9] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#ead7b9]/50 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-[#ead7b9] focus-visible:ring-[#c87d2f]"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={categoryFilter === "all" ? "all" : String(categoryFilter)}
              onValueChange={(value) =>
                setCategoryFilter(value === "all" ? "all" : Number(value) || "all")
              }
            >
              <SelectTrigger className="w-[180px] border-[#ead7b9]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Danh mục" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter === "all" ? "all-status" : statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value === "all-status" ? "all" : (value as AdminProductStockStatus),
                )
              }
            >
              <SelectTrigger className="w-[160px] border-[#ead7b9]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Tất cả trạng thái</SelectItem>
                {Object.entries(statusLabel).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#6c6252]">
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      <span>Đang tải danh sách sản phẩm...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#6c6252]">
                    Không có sản phẩm nào phù hợp.
                  </td>
                </tr>
              )}

              {!isLoading && !error &&
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#ead7b9]/30 transition-colors hover:bg-[#f4f1ea]/50"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl ?? "https://placehold.co/80x80?text=No+Image"}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg border border-[#ead7b9] object-cover"
                        />
                        <div>
                          <div className="font-medium text-[#1f1b16]">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {product.id} • {product.variants} biến thể
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="secondary" className="bg-[#f4f1ea] text-[#6c6252] hover:bg-[#efe2c6]">
                        {product.category?.name ?? "Không có danh mục"}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle font-medium text-[#1f1b16]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4 align-middle text-[#6c6252]">
                      {product.totalStock}
                    </td>
                    <td className="p-4 align-middle">
                      {renderStatus(product.stockStatus)}
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

        <div className="flex items-center justify-between border-t border-[#ead7b9]/50 p-4">
          <div className="text-sm text-muted-foreground">
            {pagination && products.length > 0 ? (
              <>
                Hiển thị <strong>{displayRangeStart}</strong> - <strong>{displayRangeEnd}</strong> trong tổng số
                {" "}
                <strong>{pagination.totalItems.toLocaleString("vi-VN")}</strong> sản phẩm
              </>
            ) : (
              "Không có sản phẩm để hiển thị"
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination || pagination.page <= 1 || isLoading}
              className="border-[#ead7b9]"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination || pagination.page >= pagination.totalPages || isLoading}
              className="border-[#ead7b9] hover:bg-[#f4f1ea]"
              onClick={() =>
                setCurrentPage((prev) => (pagination ? Math.min(prev + 1, pagination.totalPages) : prev))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetCreateForm()
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản để tạo sản phẩm trong hệ thống quản trị.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleCreateSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
                <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                <TabsTrigger value="variants">Biến thể & Kho</TabsTrigger>
                <TabsTrigger value="specifications">Thông số khác</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="product-name">Tên sản phẩm</Label>
                    <Input
                      id="product-name"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Áo thun basic..."
                      required
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="product-slug">Slug sản phẩm</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[#6c6252] hover:bg-[#f4f1ea]"
                        onClick={handleGenerateSlug}
                      >
                        Tạo từ tên
                      </Button>
                    </div>
                    <Input
                      id="product-slug"
                      value={createForm.slug}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="ao-thun-basic"
                      required
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="product-brand">Thương hiệu (tuỳ chọn)</Label>
                    <Select
                      value={createForm.brandId || "none"}
                      onValueChange={(value) =>
                        setCreateForm((prev) => ({ ...prev, brandId: value === "none" ? "" : value }))
                      }
                    >
                      <SelectTrigger
                        id="product-brand"
                        className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                      >
                        <SelectValue placeholder="Chọn thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không chọn thương hiệu</SelectItem>
                        {availableBrands.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="product-category">Danh mục</Label>
                    <Select
                      value={createForm.categoryId}
                      onValueChange={(value) =>
                        setCreateForm((prev) => ({ ...prev, categoryId: value }))
                      }
                      required
                    >
                      <SelectTrigger
                        id="product-category"
                        className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                      >
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="product-price">Giá niêm yết (VND)</Label>
                    <Input
                      id="product-price"
                      type="number"
                      min={0}
                      value={createForm.basePrice}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, basePrice: e.target.value }))
                      }
                      placeholder="199000"
                      required
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="product-material">Chất liệu</Label>
                    <Input
                      id="product-material"
                      value={createForm.material}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, material: e.target.value }))
                      }
                      placeholder="100% Cotton mềm mại..."
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
                  <div className="grid gap-2">
                    <Label htmlFor="product-care">Hướng dẫn bảo quản</Label>
                    <Input
                      id="product-care"
                      value={createForm.careInstructions}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, careInstructions: e.target.value }))
                      }
                      placeholder="Giặt tay, phơi nơi thoáng mát..."
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="product-description">Mô tả chi tiết</Label>
                    <Textarea
                      id="product-description"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Mô tả ngắn gọn, có thể chèn bullet, bôi đậm..."
                      className="min-h-[160px] border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div
                  className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#e0caa3] bg-[#fdfaf4] p-6 text-center"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    handleMediaFiles(event.dataTransfer.files)
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => mediaInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") mediaInputRef.current?.click()
                  }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow">
                    <ImagePlus className="h-6 w-6 text-[#c87d2f]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1f1b16]">Kéo & thả ảnh sản phẩm</p>
                    <p className="text-xs text-[#6c6252]">Hỗ trợ chọn nhiều ảnh cùng lúc, tối thiểu 1 ảnh đại diện.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6c6252]">
                    <Upload className="h-4 w-4" />
                    <span>Chấp nhận JPG, PNG, tối đa 5MB</span>
                  </div>
                  <Input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleMediaFiles(event.target.files)}
                  />
                </div>

                {createForm.media.length > 0 && (
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between text-sm text-[#6c6252]">
                      <p>
                        Đã chọn <strong>{createForm.media.length}</strong> ảnh. Chọn 1 ảnh làm đại diện và sắp xếp thứ tự.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {createForm.media.map((item, index) => (
                        <div
                          key={item.id}
                          className="relative overflow-hidden rounded-lg border border-[#ead7b9] bg-white shadow-sm"
                        >
                          <img
                            src={item.preview}
                            alt={`Ảnh ${index + 1}`}
                            className="h-48 w-full object-cover"
                          />
                          {item.isCover && (
                            <div className="absolute left-2 top-2 rounded-full bg-[#1c1a16] px-3 py-1 text-xs font-medium text-white">
                              Ảnh đại diện
                            </div>
                          )}
                          <div className="absolute right-2 top-2 flex flex-col gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 text-[#c87d2f] hover:bg-white"
                              onClick={() => handleSetCoverMedia(item.id)}
                              title="Đặt làm ảnh đại diện"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 text-[#6c6252] hover:bg-white"
                              onClick={() => handleRemoveMedia(item.id)}
                              title="Xoá ảnh"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-xs text-white">
                            <span className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4" />
                              Thứ tự {item.sortOrder + 1}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7 bg-white/80 text-[#1f1b16] hover:bg-white"
                                disabled={index === 0}
                                onClick={() => handleMoveMedia(item.id, "up")}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-7 w-7 bg-white/80 text-[#1f1b16] hover:bg-white"
                                disabled={index === createForm.media.length - 1}
                                onClick={() => handleMoveMedia(item.id, "down")}
                              >
                                ↓
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="variants" className="space-y-4">
                <div className="rounded-lg border border-[#ead7b9] bg-[#fdfaf4] p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between" htmlFor="color-input">
                        Màu sắc
                        <span className="text-xs font-normal text-[#6c6252]">Multi-select</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="color-input"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addAttributesValue("colors", colorInput)
                              setColorInput("")
                            }
                          }}
                          placeholder="Đỏ, Xanh, Đen..."
                          className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                        />
                        <Button
                          type="button"
                          className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
                          onClick={() => {
                            addAttributesValue("colors", colorInput)
                            setColorInput("")
                          }}
                        >
                          Thêm
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {createForm.variantAttributes.colors.map((color) => (
                          <Badge key={color} variant="secondary" className="bg-white text-[#1f1b16]">
                            {color}
                            <button
                              type="button"
                              className="ml-2 text-[#c87d2f]"
                              onClick={() => removeAttributesValue("colors", color)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center justify-between" htmlFor="size-input">
                        Kích thước
                        <span className="text-xs font-normal text-[#6c6252]">Multi-select</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="size-input"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addAttributesValue("sizes", sizeInput)
                              setSizeInput("")
                            }
                          }}
                          placeholder="S, M, L, XL..."
                          className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                        />
                        <Button
                          type="button"
                          className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
                          onClick={() => {
                            addAttributesValue("sizes", sizeInput)
                            setSizeInput("")
                          }}
                        >
                          Thêm
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {createForm.variantAttributes.sizes.map((size) => (
                          <Badge key={size} variant="secondary" className="bg-white text-[#1f1b16]">
                            {size}
                            <button
                              type="button"
                              className="ml-2 text-[#c87d2f]"
                              onClick={() => removeAttributesValue("sizes", size)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-[#ead7b9] bg-white p-3">
                    <div className="text-sm text-[#6c6252]">
                      Hệ thống sẽ tự động tạo ma trận biến thể dựa trên Màu sắc x Kích thước.
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#ead7b9] bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
                      onClick={generateVariants}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Tạo biến thể
                    </Button>
                  </div>
                </div>

                {createForm.variants.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-[#ead7b9]">
                    <div className="grid grid-cols-12 bg-[#fdfaf4] px-3 py-2 text-xs font-medium text-[#6c6252]">
                      <span className="col-span-3">Tên biến thể</span>
                      <span className="col-span-2">SKU</span>
                      <span className="col-span-2">Giá bán</span>
                      <span className="col-span-2">Tồn kho</span>
                      <span className="col-span-3">Ảnh gán</span>
                    </div>
                    <div className="divide-y divide-[#ead7b9]">
                      {createForm.variants.map((variant) => {
                        const displayName = [
                          createForm.name || "Biến thể",
                          variant.color ? `- ${variant.color}` : "",
                          variant.size ? `/ ${variant.size}` : "",
                        ]
                          .join(" ")
                          .trim()

                        return (
                          <div key={variant.id} className="grid grid-cols-12 items-center gap-2 px-3 py-3 text-sm">
                            <div className="col-span-3 font-medium text-[#1f1b16]">{displayName}</div>
                            <div className="col-span-2 flex items-center gap-2">
                              <Input
                                value={variant.sku}
                                onChange={(e) =>
                                  setCreateForm((prev) => ({
                                    ...prev,
                                    variants: prev.variants.map((item) =>
                                      item.id === variant.id ? { ...item, sku: e.target.value } : item,
                                    ),
                                  }))
                                }
                                placeholder="SKU"
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 border-[#ead7b9]"
                                onClick={() => handleAutoSku(variant.id)}
                                title="Tự động tạo SKU"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min={0}
                                value={variant.price}
                                onChange={(e) =>
                                  setCreateForm((prev) => ({
                                    ...prev,
                                    variants: prev.variants.map((item) =>
                                      item.id === variant.id ? { ...item, price: e.target.value } : item,
                                    ),
                                  }))
                                }
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                min={0}
                                value={variant.stock}
                                onChange={(e) =>
                                  setCreateForm((prev) => ({
                                    ...prev,
                                    variants: prev.variants.map((item) =>
                                      item.id === variant.id ? { ...item, stock: e.target.value } : item,
                                    ),
                                  }))
                                }
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                              />
                            </div>
                            <div className="col-span-3">
                              <Select
                                value={variant.imageId || "none"}
                                onValueChange={(value) =>
                                  setCreateForm((prev) => ({
                                    ...prev,
                                    variants: prev.variants.map((item) =>
                                      item.id === variant.id ? { ...item, imageId: value === "none" ? undefined : value } : item,
                                    ),
                                  }))
                                }
                              >
                                <SelectTrigger className="border-[#ead7b9] focus-visible:ring-[#c87d2f]">
                                  <SelectValue placeholder="Chọn ảnh màu" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Không gán ảnh riêng</SelectItem>
                                  {createForm.media.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      Ảnh {item.sortOrder + 1} - {item.file.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1f1b16]">Thông số kỹ thuật</p>
                      <p className="text-xs text-[#6c6252]">Nhập theo dạng cặp Key-Value, ví dụ: [Chất liệu] - [Cotton]</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#ead7b9] bg-[#fdfaf4] hover:bg-[#f4f1ea]"
                      onClick={addSpecificationRow}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Thêm thông số
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {createForm.specifications.length === 0 && (
                      <div className="rounded-md border border-dashed border-[#ead7b9] px-4 py-6 text-center text-sm text-[#6c6252]">
                        Chưa có thông số. Nhấn "Thêm thông số" để bắt đầu.
                      </div>
                    )}
                    {createForm.specifications.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2 rounded-lg border border-[#ead7b9] bg-white p-3 md:grid-cols-[1.2fr_1.8fr_auto]"
                      >
                        <Input
                          value={item.key}
                          onChange={(e) => handleSpecificationChange(item.id, "key", e.target.value)}
                          placeholder="Tên thông số"
                          className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) => handleSpecificationChange(item.id, "value", e.target.value)}
                          placeholder="Giá trị"
                          className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-[#c87d2f] hover:bg-[#fdfaf4]"
                          onClick={() => removeSpecificationRow(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xoá
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {createError && <p className="text-sm text-red-600">{createError}</p>}

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-[#ead7b9]"
                onClick={() => {
                  setIsCreateOpen(false)
                  resetCreateForm()
                }}
                disabled={isCreating}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
                disabled={isCreating}
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo sản phẩm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
    </div>
  )
}