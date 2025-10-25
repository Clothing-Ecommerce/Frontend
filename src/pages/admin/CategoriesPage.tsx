import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { categoryTree, type CategoryNode } from "@/data/adminMock"
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditableCategory extends CategoryNode {
  expanded?: boolean
}

function buildInitialTree(tree: CategoryNode[]): EditableCategory[] {
  return tree.map((node) => ({
    ...node,
    expanded: true,
    children: node.children ? buildInitialTree(node.children) : undefined,
  }))
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<EditableCategory[]>(buildInitialTree(categoryTree))
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setCategories((prev) => toggleExpandInTree(prev, id))
  }

  const toggleExpandInTree = (nodes: EditableCategory[], id: string): EditableCategory[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, expanded: !node.expanded }
      }
      if (node.children) {
        return { ...node, children: toggleExpandInTree(node.children, id) }
      }
      return node
    })
  }

  const addChildCategory = (parentId?: string) => {
    if (!newCategoryName.trim()) return
    const newNode: EditableCategory = {
      id: `cat-${Math.floor(Math.random() * 1000)}`,
      name: newCategoryName.trim(),
      productCount: 0,
      expanded: true,
    }
    setCategories((prev) => addToTree(prev, newNode, parentId))
    setNewCategoryName("")
  }

  const addToTree = (
    nodes: EditableCategory[],
    newNode: EditableCategory,
    parentId?: string,
  ): EditableCategory[] => {
    if (!parentId) return [...nodes, newNode]
    return nodes.map((node) => {
      if (node.id === parentId) {
        const children = node.children ? [...node.children, newNode] : [newNode]
        return { ...node, children }
      }
      if (node.children) {
        return { ...node, children: addToTree(node.children, newNode, parentId) }
      }
      return node
    })
  }

  const removeCategory = (id: string) => {
    setCategories((prev) => removeFromTree(prev, id))
  }

  const removeFromTree = (nodes: EditableCategory[], id: string): EditableCategory[] => {
    return nodes
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: node.children ? removeFromTree(node.children, id) : undefined,
      }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Cấu trúc danh mục</CardTitle>
            <CardDescription>
              Quản lý cây danh mục, số sản phẩm, quy tắc hiển thị trang chủ và breadcrumbs
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Tên danh mục mới"
              className="w-56"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
            <Button onClick={() => addChildCategory()}>Thêm danh mục</Button>
            {/* <Button variant="outline" onClick={() => selectedCategory && addChildCategory(selectedCategory)}>
              Thêm vào danh mục đang chọn
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Button size="sm" variant="outline" onClick={() => reorder("up")}>
              Di chuyển lên
            </Button>
            <Button size="sm" variant="outline" onClick={() => reorder("down")}>
              Di chuyển xuống
            </Button>
            <span>Đang chọn: {selectedCategory ?? "--"}</span>
          </div> */}
          <div className="rounded-xl border bg-white">
            <CategoryTree
              nodes={categories}
              onToggle={toggleExpand}
              onSelect={setSelectedCategory}
              onAddChild={addChildCategory}
              onRemove={removeCategory}
              selected={selectedCategory}
            />
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Quy tắc hiển thị</CardTitle>
          <CardDescription>
            Gộp/chia danh mục và điều chỉnh thứ tự xuất hiện trên trang chủ & breadcrumbs
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Danh mục trang chủ</p>
            <p className="text-xs text-slate-500">
              Kéo thả để ưu tiên danh mục bán chạy, tự động ẩn danh mục không có hàng.
            </p>
            <Button size="sm" className="mt-3" variant="outline">
              Quản lý danh mục nổi bật
            </Button>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Breadcrumbs</p>
            <p className="text-xs text-slate-500">
              Thiết lập cấu trúc URL và thứ tự hiển thị theo chiến dịch marketing.
            </p>
            <Button size="sm" className="mt-3" variant="outline">
              Điều chỉnh tuyến đường
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}

interface CategoryTreeProps {
  nodes: EditableCategory[]
  selected: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onAddChild: (parentId: string) => void
  onRemove: (id: string) => void
}

function CategoryTree({ nodes, selected, onToggle, onSelect, onAddChild, onRemove }: CategoryTreeProps) {
  return (
    <ul className="space-y-1 p-4">
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50",
              selected === node.id && "border border-primary bg-primary/5",
            )}
          >
            <div className="flex items-center gap-2">
              <button
                className="rounded border bg-white p-1"
                onClick={() => onToggle(node.id)}
                aria-label="Toggle"
              >
                {node.children ? (
                  node.expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />
                ) : (
                  <GripVertical className="size-4 text-slate-300" />
                )}
              </button>
              <button className="text-left" onClick={() => onSelect(node.id)}>
                <p className="font-medium text-slate-800">{node.name}</p>
                <p className="text-xs text-slate-500">{node.productCount} sản phẩm</p>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => onAddChild(node.id)}>
                <Plus className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onRemove(node.id)}>
                <Trash2 className="size-4 text-rose-500" />
              </Button>
            </div>
          </div>
          {node.children && node.expanded && (
            <div className="border-l border-dashed border-slate-200 pl-4">
              <CategoryTree
                nodes={node.children}
                selected={selected}
                onToggle={onToggle}
                onSelect={onSelect}
                onAddChild={onAddChild}
                onRemove={onRemove}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}