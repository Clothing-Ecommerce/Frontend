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
import { promotions as promotionMock } from "@/data/adminMock"
import { Checkbox } from "@/components/ui/checkbox"

export default function MarketingPage() {
  const [promotions, setPromotions] = useState(promotionMock)
  const [newPromotionName, setNewPromotionName] = useState("")
  const [limitChannel, setLimitChannel] = useState(false)
  const [minOrderValue, setMinOrderValue] = useState(500000)

  const createPromotion = () => {
    if (!newPromotionName.trim()) return
    const newPromotion = {
      id: `KM-${Math.floor(Math.random() * 999)}`,
      name: newPromotionName,
      type: "Coupon",
      discount: "10%",
      channel: limitChannel ? "Website" : "Đa kênh",
      status: "Đang lên lịch",
    }
    setPromotions((prev) => [newPromotion, ...prev])
    setNewPromotionName("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Khuyến mãi & chiến dịch</CardTitle>
          <CardDescription>
            Tạo coupon, flash sale, chương trình khách hàng thân thiết và theo dõi ROI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4 items-end">
            <Input
              placeholder="Tên chiến dịch"
              value={newPromotionName}
              onChange={(event) => setNewPromotionName(event.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox checked={limitChannel} onCheckedChange={(value) => setLimitChannel(Boolean(value))} />
              Chỉ áp dụng website
            </label>
            <label className="text-xs text-slate-500">
              Đơn tối thiểu (VND)
              <Input
                type="number"
                className="mt-1"
                value={minOrderValue}
                onChange={(event) => setMinOrderValue(Number(event.target.value))}
              />
            </label>
            <Button onClick={createPromotion}>Tạo chiến dịch</Button>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Giảm giá</th>
                  {/* <th className="px-4 py-3">Kênh</th> */}
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-sm">
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{promotion.id}</td>
                    <td className="px-4 py-3">{promotion.name}</td>
                    <td className="px-4 py-3">{promotion.type}</td>
                    <td className="px-4 py-3">{promotion.discount}</td>
                    {/* <td className="px-4 py-3">{promotion.channel}</td> */}
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{promotion.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Điều kiện áp dụng</CardTitle>
          <CardDescription>
            Thiết lập điều kiện theo danh mục, số lần dùng, đối tượng và giới hạn thời gian
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Điều kiện đơn tối thiểu</p>
            <p className="text-xs text-slate-500">Áp dụng với đơn ≥ {new Intl.NumberFormat("vi-VN").format(minOrderValue)}đ</p>
            <Button size="sm" className="mt-3" variant="outline">
              Chỉnh sửa điều kiện
            </Button>
          </div>
          {/* <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Giới hạn kênh</p>
            <p className="text-xs text-slate-500">{limitChannel ? "Chỉ website" : "Đa kênh"}</p>
            <Button size="sm" className="mt-3" variant="outline">
              Chọn kênh áp dụng
            </Button>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Theo dõi ROI</p>
            <p className="text-xs text-slate-500">ROI dự kiến +35%, đo lường real-time theo nhóm khách hàng.</p>
            <Button size="sm" className="mt-3" variant="outline">
              Xem báo cáo chi tiết
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}