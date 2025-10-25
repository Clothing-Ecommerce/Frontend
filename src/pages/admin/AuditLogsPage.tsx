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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auditLogs } from "@/data/adminMock"

const modules = ["Sản phẩm", "Đơn hàng", "Kho", "Nội dung", "Thiết lập"]

export default function AuditLogsPage() {
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState<string | "all">("all")

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        search.trim().length === 0 ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase())
      const matchesModule = moduleFilter === "all" || log.module === moduleFilter
      return matchesSearch && matchesModule
    })
  }, [search, moduleFilter])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký hệ thống</CardTitle>
          <CardDescription>
            Ghi nhận mọi thay đổi quan trọng, dấu vết người thao tác và dữ liệu trước/sau
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Tìm theo người dùng hoặc đối tượng"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={moduleFilter} onValueChange={(value) => setModuleFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Mô-đun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mô-đun</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">Xuất log</Button>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thao tác</th>
                  <th className="px-4 py-3">Mô-đun</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Trước/Sau</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500">{log.time}</td>
                    <td className="px-4 py-3">{log.actor}</td>
                    <td className="px-4 py-3">{log.module}</td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <p>Trước: {log.before}</p>
                      <p>Sau: {log.after}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Button size="sm" variant="outline">
              Thiết lập cảnh báo thay đổi nhạy cảm
            </Button>
            <Button size="sm" variant="outline">Lọc nâng cao</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}