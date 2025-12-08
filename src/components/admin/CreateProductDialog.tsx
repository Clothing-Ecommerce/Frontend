import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { AdminCreateProductRequest } from "@/types/adminType"

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-+/g, "-")

const colorOptions = [
  { value: "Red", hex: "#ef4444" },
  { value: "Blue", hex: "#3b82f6" },
  { value: "Black", hex: "#111827" },
  { value: "White", hex: "#f9fafb" },
  { value: "Be", hex: "#d6b98c" },
  { value: "Gray", hex: "#9ca3af" },
]

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"]

type MediaItem = {
  id: string
  preview: string
  file?: File
  isPrimary: boolean
  sortOrder: number
}

type VariantRow = {
  id: string
  color?: string
  size?: string
  sku: string
  price: string
  stock: string
  imageId?: string
}

type SpecificationRow = { key: string; value: string }

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleCommand = (command: string) => {
    document.execCommand(command)
    onChange(editorRef.current?.innerHTML ?? "")
  }

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML ?? "")
  }

  return (
    <div className="rounded-lg border border-[#ead7b9]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#ead7b9] bg-[#f9f5ee] px-2 py-1">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-[#6c6252]" onClick={() => handleCommand("bold")}>
          <strong>B</strong>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-[#6c6252]" onClick={() => handleCommand("italic")}>
          <em>I</em>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-[#6c6252]"
          onClick={() => handleCommand("insertUnorderedList")}
        >
          ••
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-[#6c6252]" onClick={() => handleCommand("underline")}>
          <span className="underline">U</span>
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[120px] bg-white px-3 py-2 text-sm focus:outline-none"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      {!value && (
        <div className="pointer-events-none -mt-[110px] px-3 py-2 text-sm text-muted-foreground">{placeholder}</div>
      )}
    </div>
  )
}

type CreateProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: { id: number; name: string }[]
  brands: { id: number; name: string }[]
  isSubmitting?: boolean
  onSubmit: (payload: AdminCreateProductRequest) => Promise<void>
}

export default function CreateProductDialog({
  open,
  onOpenChange,
  categories,
  brands,
  onSubmit,
  isSubmitting = false,
}: CreateProductDialogProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [basePrice, setBasePrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [brandId, setBrandId] = useState("")
  const [material, setMaterial] = useState("")
  const [careInstructions, setCareInstructions] = useState("")
  const [description, setDescription] = useState("")

  const [images, setImages] = useState<MediaItem[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [specifications, setSpecifications] = useState<SpecificationRow[]>([
    { key: "", value: "" },
  ])

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview))
    }
  }, [images])

  const handleDrop = (files: FileList | null) => {
    if (!files?.length) return

    const newItems: MediaItem[] = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isPrimary: false,
      sortOrder: images.length + index,
    }))

    setImages((prev) => {
      const merged = [...prev, ...newItems]
      if (!merged.some((item) => item.isPrimary) && merged.length) {
        merged[0].isPrimary = true
      }
      return merged
    })
  }

  const togglePrimary = (id: string) => {
    setImages((prev) => prev.map((image) => ({ ...image, isPrimary: image.id === id })))
  }

  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((image) => image.id !== id)
      if (filtered.length && !filtered.some((image) => image.isPrimary)) {
        filtered[0].isPrimary = true
      }
      return filtered.map((image, index) => ({ ...image, sortOrder: index }))
    })
  }

  const moveImage = (id: string, direction: "up" | "down") => {
    setImages((prev) => {
      const currentIndex = prev.findIndex((item) => item.id === id)
      if (currentIndex === -1) return prev
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const updated = [...prev]
      const [moved] = updated.splice(currentIndex, 1)
      updated.splice(targetIndex, 0, moved)
      return updated.map((item, index) => ({ ...item, sortOrder: index }))
    })
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((item) => item !== color) : [...prev, color],
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]))
  }

  const generateVariants = () => {
    if (!selectedColors.length && !selectedSizes.length) return
    const combos = (selectedColors.length ? selectedColors : [undefined]).flatMap((color) =>
      (selectedSizes.length ? selectedSizes : [undefined]).map((size) => ({ color, size })),
    )

    setVariants(
      combos.map((combo) => {
        const identifier = `${combo.color ?? "Default"}-${combo.size ?? "OneSize"}`
        const baseSku = `${slugify(name || "product")}-${slugify(identifier)}`.toUpperCase()
        return {
          id: `${combo.color ?? "default"}-${combo.size ?? "size"}`,
          color: combo.color,
          size: combo.size,
          sku: baseSku,
          price: basePrice || "0",
          stock: "0",
        }
      }),
    )
  }

  const setVariantField = (id: string, field: keyof VariantRow, value: string) => {
    setVariants((prev) => prev.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant)))
  }

  const autoFillSku = (variant: VariantRow) => {
    const parts = [name || "product", variant.color, variant.size].filter(Boolean).map(slugify)
    return parts.join("-").toUpperCase()
  }

  const handleAddSpecification = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }])
  }

  const handleSpecificationChange = (index: number, field: keyof SpecificationRow, value: string) => {
    setSpecifications((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const handleRemoveSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setActiveTab("general")
    setError(null)
    setName("")
    setSlug("")
    setBasePrice("")
    setCategoryId("")
    setBrandId("")
    setMaterial("")
    setCareInstructions("")
    setDescription("")
    setImages([])
    setVariants([])
    setSelectedColors([])
    setSelectedSizes([])
    setSpecifications([{ key: "", value: "" }])
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedSlug = (slug || slugify(name)).trim()
    const parsedPrice = Number(basePrice)
    const parsedCategoryId = Number(categoryId)
    const parsedBrandId = brandId ? Number(brandId) : undefined

    if (!trimmedName) return setError("Please enter product name")
    if (!trimmedSlug) return setError("Please enter a valid slug")
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return setError("Base price is invalid")
    if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0)
      return setError("Please select a valid category")

    const featurePayload = {
      material: material || undefined,
      careInstructions: careInstructions || undefined,
    }

    const specsPayload = specifications
      .filter((spec) => spec.key.trim())
      .reduce<Record<string, string>>((acc, spec) => {
        acc[spec.key.trim()] = spec.value.trim()
        return acc
      }, {})

    const payload: AdminCreateProductRequest = {
      name: trimmedName,
      slug: trimmedSlug,
      basePrice: parsedPrice,
      categoryId: parsedCategoryId,
      brandId: Number.isFinite(parsedBrandId) ? parsedBrandId : undefined,
      description: description || undefined,
      features: Object.values(featurePayload).some(Boolean) ? featurePayload : undefined,
      specifications: Object.keys(specsPayload).length ? specsPayload : undefined,
      images: images.map((image, index) => ({
        url: image.preview,
        isPrimary: image.isPrimary,
        sortOrder: index,
        alt: `${trimmedName} - ${index + 1}`,
      })),
      variants: variants.map((variant) => ({
        sku: variant.sku || undefined,
        price: Number(variant.price) || parsedPrice,
        stock: Number(variant.stock) || 0,
        colorId: variant.color ? null : undefined,
        sizeId: variant.size ? null : undefined,
      })),
    }

    try {
      await onSubmit(payload)
      resetForm()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create product")
    }
  }

  const orderedImages = useMemo(() => [...images].sort((a, b) => a.sortOrder - b.sortOrder), [images])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Set up full information, images, variants and specifications for your product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="media">Images</TabsTrigger>
              <TabsTrigger value="variants">Variants & Inventory</TabsTrigger>
              <TabsTrigger value="specs">Other Attributes</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Basic t-shirt..."
                    className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="product-slug">Slug</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSlug(slugify(name))}>
                      Generate slug automatically
                    </Button>
                  </div>
                  <Input
                    id="product-slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="basic-t-shirt"
                    className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-price">Listed Price (VND)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min={0}
                    value={basePrice}
                    onChange={(event) => setBasePrice(event.target.value)}
                    placeholder="199000"
                    className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="product-category" className="border-[#ead7b9] focus-visible:ring-[#c87d2f]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-brand">Brand</Label>
                  <Select value={brandId || "none"} onValueChange={(value) => setBrandId(value === "none" ? "" : value)}>
                    <SelectTrigger id="product-brand" className="border-[#ead7b9] focus-visible:ring-[#c87d2f]">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No brand selected</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={String(brand.id)}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Material</Label>
                  <Input
                    value={material}
                    onChange={(event) => setMaterial(event.target.value)}
                    placeholder="100% Cotton, Dry-fit..."
                    className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Care Instructions</Label>
                  <Input
                    value={careInstructions}
                    onChange={(event) => setCareInstructions(event.target.value)}
                    placeholder="Gentle wash, do not tumble dry..."
                    className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Detailed Description</Label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Key highlights, size chart, material information..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-3">
              <div
                className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#ead7b9] bg-[#fdfaf4] text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  handleDrop(event.dataTransfer?.files ?? null)
                }}
              >
                <ImageIcon className="h-10 w-10 text-[#c87d2f]" />
                <div>
                  <p className="text-sm font-medium text-[#1f1b16]">Drag & drop product images</p>
                  <p className="text-xs text-[#6c6252]">Support uploading multiple images at once to create a gallery</p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-[#ead7b9] bg-white px-3 py-1 text-sm font-medium text-[#1f1b16] shadow-sm hover:bg-[#f4f1ea]">
                  Choose images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleDrop(event.target.files)}
                  />
                </label>
              </div>

              {!!orderedImages.length && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {orderedImages.map((image, index) => (
                    <div key={image.id} className="group relative rounded-lg border border-[#ead7b9] bg-white p-2 shadow-sm">
                      <img src={image.preview} alt={name || "Product image"} className="h-36 w-full rounded-md object-cover" />
                      <div className="mt-2 flex items-center justify-between text-xs text-[#6c6252]">
                        <span>
                          Image {index + 1} {image.isPrimary ? "- Main image" : ""}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveImage(image.id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveImage(image.id, "down")}
                            disabled={index === orderedImages.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant={image.isPrimary ? "default" : "outline"}
                          size="sm"
                          className={cn("flex-1 border-[#ead7b9]", image.isPrimary ? "bg-[#1c1a16] text-white" : "")}
                          onClick={() => togglePrimary(image.id)}
                        >
                          Set as main image
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteImage(image.id)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-[#ead7b9] p-3">
                  <p className="text-sm font-medium text-[#1f1b16]">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color.value}
                        type="button"
                        variant={selectedColors.includes(color.value) ? "default" : "outline"}
                        className={cn(
                          "gap-2 border-[#ead7b9] text-sm",
                          selectedColors.includes(color.value) ? "bg-[#1c1a16] text-white" : "bg-white text-[#1f1b16]",
                        )}
                        onClick={() => toggleColor(color.value)}
                      >
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color.hex }} />
                        {color.value}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-[#ead7b9] p-3">
                  <p className="text-sm font-medium text-[#1f1b16]">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={selectedSizes.includes(size) ? "default" : "outline"}
                        className={cn(
                          "border-[#ead7b9] text-sm",
                          selectedSizes.includes(size) ? "bg-[#1c1a16] text-white" : "bg-white text-[#1f1b16]",
                        )}
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="button" className="bg-[#1c1a16] text-white" onClick={generateVariants}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate variants
              </Button>

              {!!variants.length && (
                <div className="overflow-x-auto rounded-lg border border-[#ead7b9]">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#f9f5ee] text-[#1f1b16]">
                      <tr>
                        <th className="px-4 py-3">Variant Name</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Image</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => {
                        const displayName = [name || "Product", variant.color, variant.size].filter(Boolean).join(" - ")
                        return (
                          <tr key={variant.id} className="border-t border-[#ead7b9]">
                            <td className="px-4 py-3 font-medium text-[#1f1b16]">{displayName}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={variant.sku}
                                  onChange={(event) => setVariantField(variant.id, "sku", event.target.value)}
                                  className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                                  placeholder="SKU..."
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-[#ead7b9]"
                                  onClick={() => setVariantField(variant.id, "sku", autoFillSku(variant))}
                                >
                                  Auto
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                value={variant.price}
                                onChange={(event) => setVariantField(variant.id, "price", event.target.value)}
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                value={variant.stock}
                                onChange={(event) => setVariantField(variant.id, "stock", event.target.value)}
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Select
                                value={variant.imageId || "none"}
                                onValueChange={(value) => setVariantField(variant.id, "imageId", value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="w-40 border-[#ead7b9] focus-visible:ring-[#c87d2f]">
                                  <SelectValue placeholder="Select image" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No image assigned</SelectItem>
                                  {orderedImages.map((image, imageIndex) => (
                                    <SelectItem key={image.id} value={image.id}>
                                      Image {imageIndex + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="specs" className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-[#6c6252]">Add specifications as Key - Value pairs.</p>
                {specifications.map((spec, index) => (
                  <div key={`${spec.key}-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-[#ead7b9] bg-white p-3 sm:grid-cols-[1fr,1fr,auto]">
                    <Input
                      placeholder="Specification name (e.g., Material)"
                      value={spec.key}
                      onChange={(event) => handleSpecificationChange(index, "key", event.target.value)}
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                    <Input
                      placeholder="Value (e.g., 100% Cotton)"
                      value={spec.value}
                      onChange={(event) => handleSpecificationChange(index, "value", event.target.value)}
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                    <Button type="button" variant="ghost" className="text-red-600" onClick={() => handleRemoveSpecification(index)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="border-[#ead7b9]" onClick={handleAddSpecification}>
                  <Plus className="mr-2 h-4 w-4" /> Add specification
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-[#ead7b9]"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1c1a16] text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
