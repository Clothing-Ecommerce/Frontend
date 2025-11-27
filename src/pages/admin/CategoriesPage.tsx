import { useState, useMemo } from "react"
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Save,
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
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// --- Mock Data (Giả lập cấu trúc từ Backend) ---
// Dựa trên prisma schema: Category có id, name, slug, description, parentId
interface CategoryNode {
  id: number
  name: string
  slug: string
  description?: string
  productCount: number
  children?: CategoryNode[]
  parentId?: number | null
}

const initialCategories: CategoryNode[] = [
  {
    id: 1,
    name: "Nam",
    slug: "nam",
    description: "Thời trang cho nam giới",
    productCount: 120,
    children: [
      { id: 11, name: "Áo thun", slug: "ao-thun-nam", productCount: 50, parentId: 1 },
      { id: 12, name: "Quần Jeans", slug: "quan-jeans-nam", productCount: 40, parentId: 1 },
    ]
  },
  {
    id: 2,
    name: "Nữ",
    slug: "nu",
    description: "Thời trang phái đẹp",
    productCount: 200,
    children: [
      { id: 21, name: "Đầm váy", slug: "dam-vay", productCount: 80, parentId: 2 },
      { 
        id: 22, name: "Áo khoác", slug: "ao-khoac-nu", productCount: 30, parentId: 2,
        children: [
             { id: 221, name: "Blazer", slug: "blazer-nu", productCount: 10, parentId: 22 },
        ] 
      },
    ]
  }
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>(initialCategories)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true, 2: true }) // Mặc định mở root

  // Tìm node đang chọn để hiển thị bên phải
  const findNode = (nodes: CategoryNode[], id: number): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const selectedCategory = useMemo(() => 
    selectedId ? findNode(categories, selectedId) : null
  , [selectedId, categories])

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Flatten để search (nếu cần) hoặc xử lý logic hiển thị cây
  // Ở đây giữ logic hiển thị cây đệ quy cho trực quan

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* --- HEADER (Style giống ProductsPage) --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1b16]">Quản lý danh mục</h1>
          <p className="text-sm text-[#6c6252]">Tổ chức cây thư mục sản phẩm và cấu trúc hiển thị.</p>
        </div>
        <div className="flex gap-2">
           {/* Nút thêm mới style dark */}
          <Button className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]">
            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục gốc
          </Button>
        </div>
      </div>

      {/* --- MAIN CONTENT: SPLIT VIEW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* --- LEFT COLUMN: TREE VIEW --- */}
        <Card className="lg:col-span-4 border-[#ead7b9] flex flex-col overflow-hidden bg-white shadow-sm">
          <CardHeader className="border-b border-[#ead7b9]/50 px-4 py-3 bg-[#fdfaf4]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-[#ead7b9] focus-visible:ring-[#c87d2f] bg-white"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
            {categories.map(node => (
              <TreeNode 
                key={node.id} 
                node={node} 
                level={0} 
                selectedId={selectedId}
                expanded={expanded}
                onSelect={setSelectedId}
                onToggle={toggleExpand}
              />
            ))}
          </CardContent>
        </Card>

        {/* --- RIGHT COLUMN: EDIT FORM --- */}
        <Card className="lg:col-span-8 border-[#ead7b9] flex flex-col bg-white shadow-sm overflow-hidden">
          {selectedCategory ? (
            <>
              <CardHeader className="border-b border-[#ead7b9]/50 bg-[#fdfaf4] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-[#1f1b16]">Chỉnh sửa: {selectedCategory.name}</CardTitle>
                        <CardDescription className="text-[#6c6252]">ID: #{selectedCategory.id} • {selectedCategory.slug}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-[#ead7b9] text-red-600 hover:bg-red-50 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" /> Xoá
                        </Button>
                        <Button size="sm" className="bg-[#1c1a16] text-[#f4f1ea] hover:bg-[#2a2620]">
                            <Save className="h-4 w-4 mr-2" /> Lưu thay đổi
                        </Button>
                    </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-6">
                <form className="space-y-6 max-w-2xl">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[#1f1b16]">Tên danh mục</Label>
                            <Input 
                                id="name" 
                                defaultValue={selectedCategory.name} 
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-[#1f1b16]">Slug (URL)</Label>
                            <Input 
                                id="slug" 
                                defaultValue={selectedCategory.slug} 
                                className="border-[#ead7b9] focus-visible:ring-[#c87d2f] bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* <div className="space-y-2">
                        <Label htmlFor="description" className="text-[#1f1b16]">Mô tả</Label>
                        <Textarea 
                            id="description" 
                            defaultValue={selectedCategory.description} 
                            placeholder="Mô tả về danh mục này..."
                            className="min-h-[120px] border-[#ead7b9] focus-visible:ring-[#c87d2f]"
                        />
                    </div> */}

                    <div className="space-y-2">
                        <Label className="text-[#1f1b16]">Thống kê</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border border-[#ead7b9] bg-[#f9f8f4] p-4">
                                <p className="text-sm text-[#6c6252]">Sản phẩm trực thuộc</p>
                                <p className="text-2xl font-bold text-[#1f1b16]">{selectedCategory.productCount}</p>
                            </div>
                            <div className="rounded-lg border border-[#ead7b9] bg-[#f9f8f4] p-4">
                                <p className="text-sm text-[#6c6252]">Danh mục con</p>
                                <p className="text-2xl font-bold text-[#1f1b16]">{selectedCategory.children?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Button thêm danh mục con nhanh */}
                    <div className="pt-4 border-t border-[#ead7b9]/50">
                        <Button variant="outline" type="button" className="w-full border-dashed border-[#ead7b9] text-[#6c6252] hover:bg-[#f9f8f4]">
                            <Plus className="mr-2 h-4 w-4" /> Thêm danh mục con vào "{selectedCategory.name}"
                        </Button>
                    </div>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-[#6c6252] p-8 text-center bg-[#fdfaf4]/50">
                <div className="w-16 h-16 bg-[#ead7b9]/30 rounded-full flex items-center justify-center mb-4">
                    <FolderOpen className="h-8 w-8 text-[#c87d2f]" />
                </div>
                <h3 className="text-lg font-medium text-[#1f1b16]">Chưa chọn danh mục</h3>
                <p className="text-sm max-w-xs mt-2">Vui lòng chọn một danh mục từ cây thư mục bên trái để xem chi tiết hoặc chỉnh sửa.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// --- TREE NODE COMPONENT ---
interface TreeNodeProps {
    node: CategoryNode
    level: number
    selectedId: number | null
    expanded: Record<number, boolean>
    onSelect: (id: number) => void
    onToggle: (id: number) => void
}

function TreeNode({ node, level, selectedId, expanded, onSelect, onToggle }: TreeNodeProps) {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expanded[node.id]
    const isSelected = selectedId === node.id

    return (
        <div className="select-none">
            <div 
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm group",
                    isSelected 
                        ? "bg-[#1c1a16] text-[#f4f1ea]" // Selected Style: Dark bg, light text
                        : "text-[#4a4337] hover:bg-[#f4f1ea]" // Normal Style
                )}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => onSelect(node.id)}
            >
                {/* Expand Toggle */}
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
                        <div className="w-4 h-4" /> // Spacer
                    )}
                </div>

                {/* Icon */}
                {isExpanded ? (
                    <FolderOpen className={cn("h-4 w-4", isSelected ? "text-[#ead7b9]" : "text-[#c87d2f]")} />
                ) : (
                    <Folder className={cn("h-4 w-4", isSelected ? "text-[#ead7b9]" : "text-[#c87d2f]")} />
                )}

                {/* Name */}
                <span className="flex-1 font-medium truncate">{node.name}</span>

                {/* Count Badge */}
                <Badge variant="secondary" className={cn(
                    "text-[10px] px-1.5 h-5 min-w-[24px] flex justify-center",
                    isSelected ? "bg-[#ead7b9] text-[#1f1b16]" : "bg-[#f4f1ea] text-[#6c6252]"
                )}>
                    {node.productCount}
                </Badge>

                {/* Actions Dropdown (chỉ hiện khi hover hoặc selected) */}
                <div className={cn("opacity-0 group-hover:opacity-100", isSelected && "opacity-100")}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-white/20">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-[#ead7b9]">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add logic */ }}>
                                <Plus className="mr-2 h-3 w-3" /> Thêm con
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); /* Del logic */ }}>
                                <Trash2 className="mr-2 h-3 w-3" /> Xoá
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Recursive Children */}
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
                        />
                    ))}
                </div>
            )}
        </div>
    )
}