import { useEffect, useState } from "react"
import {
  Folder,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Loader2,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import api from "@/utils/axios"
import { useToast } from "@/hooks/useToast"

// --- Types khớp với Backend ---
interface CategoryNode {
  id: number
  name: string
  slug: string
  description?: string | null
  productCount: number
  children?: CategoryNode[]
  parentId?: number | null
}

// --- Helper tạo slug ---
const slugify = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-+/g, "-")
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0) // Dùng để trigger reload
  const { toast } = useToast()

  // State cho form chỉnh sửa (Right Panel)
  const [editForm, setEditForm] = useState({ name: "", slug: "", description: "" })
  const [isSaving, setIsSaving] = useState(false)

  // State cho Dialog Tạo mới
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createParentId, setCreateParentId] = useState<number | null>(null)
  const [createForm, setCreateForm] = useState({ name: "", slug: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)

  // === STATE CHO ALERT DIALOG XÓA ===
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<CategoryNode | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- 1. Fetch Data (API GET Tree) ---
  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true)
      try {
        const res = await api.get<CategoryNode[]>("/admin/categories/tree", {
          params: { search: search.trim() || undefined }
        })
        setCategories(res.data)
      } catch (error) {
        console.error(error)
        toast.error("Không thể tải danh sách danh mục")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTree()
  }, [search, refreshKey])

  // Khi chọn 1 danh mục, fill dữ liệu vào form edit
  useEffect(() => {
    if (selectedCategory) {
      setEditForm({
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description || ""
      })
    }
  }, [selectedCategory])

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // --- 2. Update Category (API PATCH) ---
  const handleUpdate = async () => {
    if (!selectedCategory) return
    setIsSaving(true)
    try {
      await api.patch(`/admin/categories/${selectedCategory.id}`, {
        name: editForm.name,
        slug: editForm.slug,
        description: editForm.description
      })
      toast.success("Cập nhật thành công")
      setRefreshKey(k => k + 1) // Reload cây
      // Cập nhật lại state selectedCategory để UI đồng bộ ngay lập tức
      setSelectedCategory(prev => prev ? { ...prev, ...editForm } : null)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi cập nhật"
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  // --- 3. Delete Category Logic ---
  // Hàm 1: Chỉ mở dialog xác nhận
  const confirmDeleteRequest = (node: CategoryNode) => {
    setNodeToDelete(node)
    setDeleteDialogOpen(true)
  }

  // Hàm 2: Thực hiện xóa thật sự khi bấm "Tiếp tục"
  const handleExecuteDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Ngăn đóng dialog mặc định
    if (!nodeToDelete) return

    setIsDeleting(true)
    try {
      await api.delete(`/admin/categories/${nodeToDelete.id}`)
      toast.success("Xóa danh mục thành công")
      if (selectedCategory?.id === nodeToDelete.id) setSelectedCategory(null)
      setRefreshKey(k => k + 1)
      setDeleteDialogOpen(false) // Đóng dialog khi thành công
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể xóa danh mục này"
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // --- 4. Create Category (API POST) ---
  const openCreateDialog = (parentId: number | null = null) => {
    setCreateParentId(parentId)
    setCreateForm({ name: "", slug: "", description: "" })
    setIsCreateOpen(true)
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) return
    setIsCreating(true)
    try {
      await api.post("/admin/categories", {
        ...createForm,
        parentId: createParentId
      })
      toast.success("Tạo danh mục thành công")
      setIsCreateOpen(false)
      setRefreshKey(k => k + 1)
      // Tự động mở rộng cha để thấy con vừa tạo
      if (createParentId) setExpanded(prev => ({ ...prev, [createParentId]: true }))
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi tạo danh mục"
      toast.error(msg)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b16]">Quản lý danh mục</h1>
          <p className="text-sm text-[#6c6252]">Tổ chức cây thư mục sản phẩm và cấu trúc hiển thị.</p>
        </div>
        <Button 
          className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
          onClick={() => openCreateDialog(null)}
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm danh mục gốc
        </Button>
      </div>

      {/* Main Content: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left: Tree View */}
        <Card className="lg:col-span-5 border-[#ead7b9] flex flex-col overflow-hidden bg-white shadow-sm">
          <CardHeader className="border-b border-[#ead7b9]/50 px-4 py-3 bg-[#fdfaf4]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#ead7b9] focus-visible:ring-[#c87d2f] bg-white"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#c87d2f]" /></div>
            ) : categories.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground">Chưa có danh mục nào.</div>
            ) : (
              categories.map(node => (
                <TreeNode 
                  key={node.id} 
                  node={node} 
                  level={0} 
                  selectedId={selectedCategory?.id || null}
                  expanded={expanded}
                  onSelect={setSelectedCategory}
                  onToggle={toggleExpand}
                  onAddChild={(id) => openCreateDialog(id)}
                  onDelete={confirmDeleteRequest}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Right: Detail View */}
        <Card className="lg:col-span-7 border-[#ead7b9] flex flex-col bg-white shadow-sm overflow-hidden">
          {selectedCategory ? (
            <>
              <CardHeader className="border-b border-[#ead7b9]/50 bg-[#fdfaf4] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-[#1f1b16]">Chỉnh sửa</CardTitle>
                    <CardDescription>ID: #{selectedCategory.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedCategory(prev => ({...prev!} as CategoryNode))} 
                      title="Reset form"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]"
                      onClick={handleUpdate}
                      disabled={isSaving}
                    >
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tên danh mục</Label>
                    <Input 
                      value={editForm.name} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Slug</Label>
                      <span 
                        className="text-xs text-blue-600 cursor-pointer hover:underline"
                        onClick={() => setEditForm(prev => ({ ...prev, slug: slugify(prev.name) }))}
                      >
                        Tạo tự động
                      </span>
                    </div>
                    <Input 
                      value={editForm.slug} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="border-[#ead7b9] focus-visible:ring-[#c87d2f] bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea 
                    value={editForm.description} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px] border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                    placeholder="Nhập mô tả..."
                  />
                </div>

                <div className="pt-4 border-t border-[#ead7b9]/50">
                  <p className="mb-3 text-sm font-medium text-[#1f1b16]">Thống kê</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-[#ead7b9] bg-[#f9f8f4] p-3 text-center">
                      <p className="text-2xl font-bold text-[#1f1b16]">{selectedCategory.productCount}</p>
                      <p className="text-xs text-[#6c6252]">Sản phẩm</p>
                    </div>
                    <div className="rounded-lg border border-[#ead7b9] bg-[#f9f8f4] p-3 text-center">
                      <p className="text-2xl font-bold text-[#1f1b16]">{selectedCategory.children?.length || 0}</p>
                      <p className="text-xs text-[#6c6252]">Danh mục con</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-[#6c6252] p-8 text-center bg-[#fdfaf4]/50">
              <div className="w-16 h-16 bg-[#ead7b9]/30 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-[#c87d2f]" />
              </div>
              <h3 className="text-lg font-medium text-[#1f1b16]">Chưa chọn danh mục</h3>
              <p className="text-sm max-w-xs mt-2">Chọn một danh mục từ cây thư mục bên trái để xem chi tiết hoặc chỉnh sửa.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog Tạo mới */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createParentId ? "Thêm danh mục con" : "Thêm danh mục gốc"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho danh mục mới.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tên danh mục</Label>
              <Input 
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ví dụ: Áo thun"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex justify-between">
                Slug (URL)
                <span 
                  className="text-xs text-blue-600 cursor-pointer"
                  onClick={() => setCreateForm(prev => ({ ...prev, slug: slugify(prev.name) }))}
                >
                  Tạo tự động
                </span>
              </Label>
              <Input 
                value={createForm.slug}
                onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="vi-du-ao-thun"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea 
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={isCreating} className="bg-[#1c1a16] text-white">
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG XÓA DANH MỤC */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn hoàn toàn chắc chắn chứ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn danh mục
              {nodeToDelete && (
                <span className="font-medium text-[#1f1b16]"> "{nodeToDelete.name}" </span>
              )}
              và gỡ bỏ dữ liệu khỏi máy chủ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteDelete}
              disabled={isDeleting}
              className="bg-[#1c1a16] text-white hover:bg-[#2a2620]"
            >
               {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

// --- Component đệ quy hiển thị cây ---
interface TreeNodeProps {
  node: CategoryNode
  level: number
  selectedId: number | null
  expanded: Record<number, boolean>
  onSelect: (node: CategoryNode) => void
  onToggle: (id: number) => void
  onAddChild: (id: number) => void
  onDelete: (node: CategoryNode) => void
}

function TreeNode({ node, level, selectedId, expanded, onSelect, onToggle, onAddChild, onDelete }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded[node.id]
  const isSelected = selectedId === node.id

  return (
    <div className="select-none text-sm">
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors group relative",
          isSelected 
            ? "bg-[#1c1a16] text-[#f4f1ea]" 
            : "text-[#4a4337] hover:bg-[#f4f1ea]"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(node)}
      >
        {/* Toggle Icon */}
        <div 
          className="p-1 rounded-sm hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            onToggle(node.id)
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="w-4 h-4" /> 
          )}
        </div>

        {/* Folder Icon */}
        {isExpanded ? (
          <FolderOpen className={cn("h-4 w-4", isSelected ? "text-[#ead7b9]" : "text-[#c87d2f]")} />
        ) : (
          <Folder className={cn("h-4 w-4", isSelected ? "text-[#ead7b9]" : "text-[#c87d2f]")} />
        )}

        <span className="flex-1 font-medium truncate">{node.name}</span>

        <Badge variant="secondary" className={cn(
          "text-[10px] px-1.5 h-5 min-w-[24px] flex justify-center",
          isSelected ? "bg-[#ead7b9] text-[#1f1b16]" : "bg-[#f4f1ea] text-[#6c6252]"
        )}>
          {node.productCount}
        </Badge>

        {/* Action Menu */}
        <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isSelected && "opacity-100")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-white/20">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-[#ead7b9]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddChild(node.id) }}>
                <Plus className="mr-2 h-3 w-3" /> Thêm con
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-700" 
                onClick={(e) => { e.stopPropagation(); onDelete(node) }}
              >
                <Trash2 className="mr-2 h-3 w-3" /> Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-[#ead7b9]/30 ml-[calc(12px+16px)]">
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}