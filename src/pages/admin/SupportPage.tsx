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
import { supportTickets } from "@/data/adminMock"
import { Checkbox } from "@/components/ui/checkbox"

export default function SupportPage() {
  const [tickets, setTickets] = useState(supportTickets)
  const [slaTarget, setSlaTarget] = useState(4)
  const [autoTagging, setAutoTagging] = useState(true)

  const assignTicket = (id: string, assignee: string) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, assignee } : ticket)))
  }

  const updateSla = () => {
    alert(`Đã cập nhật SLA ${slaTarget} giờ cho nhóm hỗ trợ.`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hỗ trợ khách hàng</CardTitle>
          <CardDescription>
            Quản lý hàng đợi vé, SLA theo nhóm, thang ưu tiên và macro trả lời nhanh
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              SLA mục tiêu (giờ)
              <Input
                type="number"
                className="h-8 w-24"
                value={slaTarget}
                onChange={(event) => setSlaTarget(Number(event.target.value))}
              />
            </label>
            <Button variant="outline" onClick={updateSla}>
              Cập nhật SLA
            </Button>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox checked={autoTagging} onCheckedChange={(value) => setAutoTagging(Boolean(value))} />
              Bật rule tự động gắn tag/chuyển tuyến
            </label>
            <Button size="sm" variant="outline">
              Quản lý macro trả lời
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Vé</th>
                  <th className="px-4 py-3">Ưu tiên</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">SLA</th>
                  <th className="px-4 py-3">Phân công</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-sm">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{ticket.id}</p>
                      <p className="text-xs text-slate-500">{ticket.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{ticket.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">{ticket.status}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{ticket.slaDue}</td>
                    <td className="px-4 py-3">
                      <Input
                        value={ticket.assignee}
                        onChange={(event) => assignTicket(ticket.id, event.target.value)}
                        className="h-8 w-40"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          Lịch sử
                        </Button>
                        <Button size="sm" variant="outline">
                          Gửi phản hồi
                        </Button>
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
          <CardTitle>Báo cáo hiệu suất hỗ trợ</CardTitle>
          <CardDescription>
            Theo dõi hiệu suất từng nhân viên/nhóm và tự động điều chỉnh ca trực
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Thời gian phản hồi TB</p>
            <p className="text-2xl font-semibold text-slate-900">38 phút</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Vé trong SLA</p>
            <p className="text-2xl font-semibold text-emerald-600">92%</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">CSAT</p>
            <p className="text-2xl font-semibold text-sky-600">4.7/5</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}