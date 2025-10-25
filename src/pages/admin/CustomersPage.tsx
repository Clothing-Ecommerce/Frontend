import { useMemo, useState } from "react"
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
  customerSegments,
  customers as customerMock,
} from "@/data/adminMock"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CustomersPage() {
  const [customers, setCustomers] = useState(customerMock)
  const [search, setSearch] = useState("")
  const [selectedSegment, setSelectedSegment] = useState<string | "all">("all")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [campaignMessage, setCampaignMessage] = useState("Chào bạn, chúng tôi có ưu đãi mới dành riêng cho bạn!")

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        search.trim().length === 0 ||
        customer.name.toLowerCase().includes(search.toLowerCase())
      const matchesSegment =
        selectedSegment === "all" || customer.tier === selectedSegment
      return matchesSearch && matchesSegment
    })
  }, [customers, search, selectedSegment])

  const toggleSelect = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id
          ? { ...customer, status: customer.status === "active" ? "suspended" : "active" }
          : customer,
      ),
    )
  }

  const assignSegment = (id: string, segment: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, tier: segment } : customer,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Khách hàng & phân khúc</CardTitle>
          <CardDescription>
            Quản lý khách VIP, khách mới, rủi ro churn; gửi chiến dịch và xuất dữ liệu CSKH
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Tìm khách hàng"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={selectedSegment} onValueChange={(value) => setSelectedSegment(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Phân khúc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phân khúc</SelectItem>
                {customerSegments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.name}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Button variant="outline" onClick={bulkExport}>
              Xuất dữ liệu
            </Button> */}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {customerSegments.map((segment) => (
              <div key={segment.id} className="rounded-xl border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">{segment.name}</p>
                <p className="text-2xl font-semibold text-slate-900">{segment.customers}</p>
                <p className="text-xs text-slate-500">{segment.rules}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 px-0 text-xs"
                  onClick={() => setSelectedSegment(segment.name)}
                >
                  Lọc
                </Button>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={
                        selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0
                      }
                      onCheckedChange={(value) =>
                        setSelectedCustomers(value ? filteredCustomers.map((customer) => customer.id) : [])
                      }
                    />
                  </th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Phân khúc</th>
                  <th className="px-4 py-3">Đơn hàng</th>
                  <th className="px-4 py-3">Điểm tích luỹ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-sm">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => toggleSelect(customer.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">Đã mua {customer.totalOrders} đơn</p>
                      <p className="text-xs text-slate-500">Chi tiêu {new Intl.NumberFormat("vi-VN").format(customer.totalSpend)}đ</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={customer.tier}
                        onValueChange={(value) => assignSegment(customer.id, value)}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {customerSegments.map((segment) => (
                            <SelectItem key={segment.id} value={segment.name}>
                              {segment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{customer.totalOrders} đơn</Badge>
                    </td>
                    <td className="px-4 py-3">{customer.points}</td>
                    <td className="px-4 py-3">
                      <Badge className={customer.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                        {customer.status === "active" ? "Đang hoạt động" : "Bị khoá"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(customer.id)}>
                          {customer.status === "active" ? "Khoá" : "Mở"}
                        </Button>
                        {/* <Button size="sm" variant="outline">
                          Gửi email
                        </Button>
                        <Button size="sm" variant="outline">
                          Gán nhãn
                        </Button> */}
                      </div>
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
          <CardTitle>Chiến dịch cá nhân hoá</CardTitle>
          <CardDescription>Gửi chiến dịch thông báo/email cho các nhóm khách hàng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedSegment} onValueChange={(value) => setSelectedSegment(value)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Chọn phân khúc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {customerSegments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.name}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={campaignMessage}
              onChange={(event) => setCampaignMessage(event.target.value)}
              className="flex-1"
            />
            <Button>Gửi chiến dịch</Button>
          </div>
          <p className="text-xs text-slate-500">
            Ghi chú: hệ thống ghi nhận lịch sử gửi và đo lường tỷ lệ mở/nhấp cho mỗi phân khúc.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}