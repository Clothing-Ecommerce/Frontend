import { useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { ArrowUpRight, Boxes, FileDown, Package, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import type { StaffOutletContext } from "./StaffLayout"

export default function StaffInventoryPage() {
  const { inventory, setInventory, formatDate, showToast } = useOutletContext<StaffOutletContext>()

  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false)
  const [inventoryAction, setInventoryAction] = useState<"import" | "export" | "adjust">("import")
  const [inventoryQuantity, setInventoryQuantity] = useState("0")
  const [inventoryNote, setInventoryNote] = useState("")
  const [activeInventorySku, setActiveInventorySku] = useState<string | null>(null)

  const inventorySummary = useMemo(() => {
    return inventory.reduce(
      (acc, item) => {
        acc.totalSku += 1
        acc.totalQuantity += item.quantity
        if (item.quantity <= item.reorderPoint) acc.lowStock += 1
        return acc
      },
      { totalSku: 0, totalQuantity: 0, lowStock: 0 },
    )
  }, [inventory])

  const selectedInventory = activeInventorySku
    ? inventory.find((item) => item.sku === activeInventorySku) ?? null
    : null

  const openInventoryAction = (sku: string, action: "import" | "export" | "adjust") => {
    setInventoryAction(action)
    setInventoryDialogOpen(true)
    setActiveInventorySku(sku)
    setInventoryQuantity("0")
    setInventoryNote("")
  }

  const submitInventoryAction = () => {
    if (!activeInventorySku) return
    const parsedQuantity = Number.parseInt(inventoryQuantity, 10)
    if (Number.isNaN(parsedQuantity) || parsedQuantity === 0) {
      showToast({
        title: "Số lượng không hợp lệ",
        description: "Vui lòng nhập số lượng khác 0.",
        type: "error",
      })
      return
    }

    setInventory((prev) =>
      prev.map((item) => {
        if (item.sku !== activeInventorySku) return item
        const historyEntry = {
          id: `INV-${Date.now()}`,
          type: inventoryAction,
          quantity:
            inventoryAction === "export"
              ? -Math.abs(parsedQuantity)
              : inventoryAction === "import"
                ? Math.abs(parsedQuantity)
                : parsedQuantity,
          note: inventoryNote.trim() || "",
          date: new Date().toISOString(),
        }
        const nextQuantity = (() => {
          if (inventoryAction === "import") return item.quantity + Math.abs(parsedQuantity)
          if (inventoryAction === "export") return Math.max(0, item.quantity - Math.abs(parsedQuantity))
          return Math.max(0, item.quantity + parsedQuantity)
        })()
        return {
          ...item,
          quantity: nextQuantity,
          history: [historyEntry, ...item.history],
        }
      }),
    )

    setInventoryDialogOpen(false)
    showToast({
      title: "Cập nhật tồn kho",
      description: "Phiếu điều chỉnh đã được ghi nhận.",
      type: "success",
    })
  }

  const requestInventorySlip = (sku: string, type: "import" | "export") => {
    const item = inventory.find((record) => record.sku === sku)
    showToast({
      title: type === "import" ? "In phiếu nhập" : "In phiếu xuất",
      description: item ? `Đã tạo phiếu cho ${item.name}.` : "Phiếu đã tạo.",
      type: "info",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tình hình kho</h2>
          <p className="text-sm text-slate-500">Theo dõi số lượng thực tế và điều chỉnh nhanh chóng.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default" className="gap-2" onClick={() => setInventoryDialogOpen(true)}>
            <Package className="h-4 w-4" /> Tạo phiếu điều chỉnh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tổng SKU</CardTitle>
            <CardDescription>Số mặt hàng đang theo dõi.</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {inventorySummary.totalSku}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng số lượng</CardTitle>
            <CardDescription>Tất cả kho đang có.</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {inventorySummary.totalQuantity}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo tồn thấp</CardTitle>
            <CardDescription>Mặt hàng cần ưu tiên nhập.</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-600">
            {inventorySummary.lowStock}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {inventory.map((item) => (
          <Card key={item.sku} className="border border-slate-200">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-slate-500" /> {item.name}
                </CardTitle>
                <CardDescription>
                  SKU: {item.sku} • Biến thể: {item.variant}
                </CardDescription>
              </div>
              <Badge variant={item.quantity <= item.reorderPoint ? "destructive" : "secondary"}>
                Còn {item.quantity}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => openInventoryAction(item.sku, "import")}>
                  <ArrowUpRight className="h-4 w-4 -rotate-90" /> Nhập kho
                </Button>
                <Button size="sm" variant="secondary" onClick={() => openInventoryAction(item.sku, "export")}>
                  <ArrowUpRight className="h-4 w-4 rotate-90" /> Xuất kho
                </Button>
                <Button size="sm" variant="outline" onClick={() => openInventoryAction(item.sku, "adjust")}>
                  <Settings className="h-4 w-4" /> Điều chỉnh
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <Button size="sm" variant="ghost" onClick={() => requestInventorySlip(item.sku, "import")}>
                  <FileDown className="h-4 w-4" /> In phiếu nhập
                </Button>
                <Button size="sm" variant="ghost" onClick={() => requestInventorySlip(item.sku, "export")}>
                  <FileDown className="h-4 w-4" /> In phiếu xuất
                </Button>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Lịch sử gần đây</h4>
                <ul className="mt-2 space-y-2">
                  {item.history.slice(0, 3).map((history) => (
                    <li key={history.id} className="flex items-center justify-between rounded border bg-slate-50 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {history.type === "import"
                            ? "Nhập kho"
                            : history.type === "export"
                              ? "Xuất kho"
                              : "Điều chỉnh"}
                        </div>
                        <div className="text-xs text-slate-500">{history.note || "Không có ghi chú"}</div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <div>{formatDate(history.date)}</div>
                        <div className="font-mono text-sm text-slate-900">
                          {history.quantity > 0 ? "+" : ""}
                          {history.quantity}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {inventoryAction === "import"
                ? "Nhập kho"
                : inventoryAction === "export"
                  ? "Xuất kho"
                  : "Điều chỉnh tồn"}
            </DialogTitle>
            <DialogDescription>
              {selectedInventory
                ? `${selectedInventory.name} • SKU ${selectedInventory.sku}`
                : "Chọn sản phẩm để cập nhật"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="inventory-quantity">
              Số lượng
            </label>
            <Input
              id="inventory-quantity"
              type="number"
              min={inventoryAction === "export" ? 1 : undefined}
              value={inventoryQuantity}
              onChange={(event) => setInventoryQuantity(event.target.value)}
            />
            <label className="text-sm font-medium text-slate-700" htmlFor="inventory-note">
              Ghi chú
            </label>
            <Textarea
              id="inventory-note"
              value={inventoryNote}
              onChange={(event) => setInventoryNote(event.target.value)}
              placeholder="Lý do điều chỉnh..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInventoryDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitInventoryAction}>Lưu phiếu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}