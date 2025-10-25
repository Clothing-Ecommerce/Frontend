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
import { Badge } from "@/components/ui/badge"
import {
  inventoryAlerts,
  shipments as shipmentMock,
  warehouses as warehouseMock,
} from "@/data/adminMock"
import { Checkbox } from "@/components/ui/checkbox"

export default function InventoryPage() {
  const [warehouses, setWarehouses] = useState(warehouseMock)
  const [shipments, setShipments] = useState(shipmentMock)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(warehouses[0]?.id ?? null)
  const [syncEnabled, setSyncEnabled] = useState(true)

  const adjustInventory = (id: string, delta: number) => {
    setWarehouses((prev) =>
      prev.map((warehouse) =>
        warehouse.id === id
          ? { ...warehouse, occupancy: Math.min(100, Math.max(0, warehouse.occupancy + delta)) }
          : warehouse,
      ),
    )
  }

  const addWarehouse = () => {
    const newWarehouse = {
      id: `wh-${Math.floor(Math.random() * 1000)}`,
      name: "Kho mới",
      address: "",
      capacity: 5000,
      skuCount: 0,
      occupancy: 0,
    }
    setWarehouses((prev) => [...prev, newWarehouse])
    setSelectedWarehouse(newWarehouse.id)
  }

  const updateShipmentStatus = (id: string, status: string) => {
    setShipments((prev) => prev.map((shipment) => (shipment.id === id ? { ...shipment, status } : shipment)))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kho & tồn kho</CardTitle>
          <CardDescription>
            Theo dõi tồn kho theo SKU/kho, cảnh báo lệch kho và điều chỉnh nhập/xuất
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Danh sách kho</p>
              <Button size="sm" onClick={addWarehouse}>
                Thêm kho
              </Button>
            </div>
            <ul className="space-y-2 text-sm">
              {warehouses.map((warehouse) => (
                <li key={warehouse.id}>
                  <button
                    className={`w-full rounded-lg border px-3 py-2 text-left ${
                      selectedWarehouse === warehouse.id ? "border-primary bg-primary/5" : "border-slate-200"
                    }`}
                    onClick={() => setSelectedWarehouse(warehouse.id)}
                  >
                    <p className="font-semibold text-slate-800">{warehouse.name}</p>
                    <p className="text-xs text-slate-500">{warehouse.address}</p>
                    <p className="text-xs text-slate-500">{warehouse.skuCount} SKU • {warehouse.capacity} sức chứa</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 rounded-xl border bg-white p-6 text-sm">
            {selectedWarehouse ? (
              (() => {
                const warehouse = warehouses.find((w) => w.id === selectedWarehouse)
                if (!warehouse) return null
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">{warehouse.name}</h3>
                      <Badge variant="secondary">{warehouse.occupancy}% sử dụng</Badge>
                    </div>
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Điều chỉnh tồn kho</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => adjustInventory(warehouse.id, 5)}>
                          +5%
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => adjustInventory(warehouse.id, -5)}>
                          -5%
                        </Button>
                        <Button size="sm" variant="outline">
                          Ghi nhận lý do
                        </Button>
                        <Button size="sm" variant="outline">
                          Nhập file SKU
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Địa điểm & vùng giao</p>
                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-xs text-slate-500">
                          Địa chỉ
                          <Input value={warehouse.address} placeholder="Nhập địa chỉ" readOnly />
                        </label>
                        <label className="space-y-1 text-xs text-slate-500">
                          Sức chứa (SP)
                          <Input type="number" value={warehouse.capacity} readOnly />
                        </label>
                      </div>
                      <Button size="sm" className="mt-3" variant="outline">
                        Thiết lập vùng giao hàng
                      </Button>
                    </div>
                  </div>
                )
              })()
            ) : (
              <p>Chọn kho để xem chi tiết.</p>
            )}
            <div className="rounded-lg border bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-widest text-rose-600">Cảnh báo tồn kho</p>
              <ul className="mt-2 space-y-2">
                {inventoryAlerts.map((alert) => (
                  <li key={alert.id} className="flex items-center justify-between text-xs">
                    <span>
                      SKU {alert.sku} • {alert.title}
                    </span>
                    <Badge variant="secondary" className="bg-white text-rose-600">
                      {alert.difference}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vận chuyển & đồng bộ</CardTitle>
          <CardDescription>
            Cấu hình vùng giao hàng, hãng vận chuyển, phương thức giao nhận và theo dõi vận đơn
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] text-sm">
          <div className="rounded-xl border bg-white">
            <div className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Bảng vận đơn
            </div>
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Hãng</th>
                  <th className="px-4 py-3">Đơn</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{shipment.id}</td>
                    <td className="px-4 py-3">{shipment.carrier}</td>
                    <td className="px-4 py-3">{shipment.order}</td>
                    <td className="px-4 py-3">
                      <Input
                        value={shipment.status}
                        onChange={(event) => updateShipmentStatus(shipment.id, event.target.value)}
                        className="h-8 w-40"
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{shipment.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4 rounded-xl border bg-slate-50 p-4">
            <div>
              <p className="font-semibold text-slate-800">Đồng bộ vận đơn tự động</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Checkbox
                  checked={syncEnabled}
                  onCheckedChange={(value) => setSyncEnabled(Boolean(value))}
                />
                Bật đồng bộ trạng thái với hãng vận chuyển mỗi 15 phút
              </div>
              <Button size="sm" className="mt-3" variant="outline">
                Cấu hình API
              </Button>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Phí ship theo vùng</p>
              <p className="text-xs text-slate-500">
                Thiết lập bảng giá theo tỉnh/thành, hỗ trợ COD, lấy tại cửa hàng.
              </p>
              <Button size="sm" className="mt-3" variant="outline">
                Cài đặt bảng phí
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}