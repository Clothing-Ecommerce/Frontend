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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  alertThresholds,
  analyticsReports,
} from "@/data/adminMock"

const availableMetrics = [
  "Revenue",
  "Orders",
  "Conversion",
  "Return rate",
  "Inventory turnover",
  "Gross profit",
]

const groupByOptions = ["Ngày", "Tuần", "Tháng", "Kênh", "Danh mục"]

export default function ReportsPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["Revenue", "Orders"])
  const [groupBy, setGroupBy] = useState("Ngày")
  const [comparison, setComparison] = useState("Kỳ trước")
  const [schedule, setSchedule] = useState("Hằng ngày 08:00")
  const [exportFormat, setExportFormat] = useState("CSV")

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((item) => item !== metric) : [...prev, metric],
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo & phân tích</CardTitle>
          <CardDescription>
            Tạo báo cáo tuỳ biến, so sánh kỳ trước, đặt lịch gửi email và xuất dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] text-sm">
          <div className="space-y-4">
            <div className="rounded-xl border bg-white">
              <div className="border-b px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Báo cáo đã tạo
              </div>
              <ul className="divide-y">
                {analyticsReports.map((report) => (
                  <li key={report.id} className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{report.name}</p>
                    <p className="text-xs text-slate-500">Chạy gần nhất: {report.lastRun}</p>
                    <p className="text-xs text-slate-500">Lịch: {report.nextSchedule}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.metrics.map((metric) => (
                        <Badge key={metric} variant="secondary">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Ngưỡng cảnh báo</p>
              <p className="text-xs text-slate-500">Đặt trigger khi tồn kho &gt; X ngày hoặc hoàn trả &gt; Y%.</p>
              <ul className="mt-2 space-y-2">
                {alertThresholds.map((threshold) => (
                  <li key={threshold.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{threshold.name}</span>
                    <Badge variant="secondary">{threshold.status}</Badge>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-3" variant="outline">
                Thêm ngưỡng mới
              </Button>
            </div>
          </div>
          <div className="space-y-4 rounded-xl border bg-white p-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-500">Tên báo cáo</label>
              <Input placeholder="VD: Doanh thu theo kênh" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Chỉ số</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {availableMetrics.map((metric) => (
                  <label
                    key={metric}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border bg-slate-50 p-2 text-xs hover:bg-slate-100"
                  >
                    <Checkbox checked={selectedMetrics.includes(metric)} onCheckedChange={() => toggleMetric(metric)} />
                    {metric}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-500">
                Nhóm dữ liệu theo
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groupByOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1 text-xs text-slate-500">
                So sánh với
                <Input value={comparison} onChange={(event) => setComparison(event.target.value)} />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-500">
                Định dạng xuất
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1 text-xs text-slate-500">
                Lịch gửi báo cáo (email)
                <Input value={schedule} onChange={(event) => setSchedule(event.target.value)} />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline">Xem trước</Button>
              <Button variant="outline">Xuất {exportFormat}</Button>
              <Button>Lưu & đặt lịch</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}