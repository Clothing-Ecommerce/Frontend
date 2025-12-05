import { useMemo } from "react"
import { useOutletContext } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { staffMockData } from "@/data/staff"
import type { StaffOutletContext } from "./StaffLayout"
// import { rangeLabel } from "./StaffLayout"

export default function StaffReportsPage() {
  const { reportRange, setReportRange, formatDate } = useOutletContext<StaffOutletContext>()

  const productivitySnapshot = useMemo(
    () => staffMockData.productivity.find((item) => item.range === reportRange) ?? null,
    [reportRange],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Báo cáo tác nghiệp</h2>
          <p className="text-sm text-slate-500">Theo dõi hiệu suất cá nhân trong từng giai đoạn.</p>
        </div>
        <Tabs value={reportRange} onValueChange={(value) => setReportRange(value as typeof reportRange)}>
          <TabsList>
            {(staffMockData.productivity.map((item) => item.range) as typeof reportRange[]).map((range) => (
              <TabsTrigger key={range} value={range}>
                {rangeLabel[range]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {productivitySnapshot ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Chỉ số chính</CardTitle>
              <CardDescription>Hiệu suất xử lý trong {rangeLabel[productivitySnapshot.range]} qua.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Đơn đã xử lý</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.ordersHandled}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Yêu cầu hỗ trợ đã giải quyết</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.ticketsResolved}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Thời gian phản hồi đầu tiên</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.firstResponseSla}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Thời gian hoàn thành yêu cầu</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.resolutionSla}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Yêu cầu điều chỉnh tồn kho</div>
                  <div className="text-lg font-semibold text-slate-900">{productivitySnapshot.inventoryAdjustments}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ hiệu suất</CardTitle>
              <CardDescription>Đơn hàng, vé hỗ trợ và độ chính xác theo ngày.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end gap-2">
                {productivitySnapshot.chart.map((item) => {
                  const ordersHeight = Math.max(12, Math.round((item.orders / 20) * 100))
                  const ticketsHeight = Math.max(8, Math.round((item.tickets / 10) * 100))
                  const accuracyHeight = Math.max(10, Math.round(((item.accuracy - 80) / 20) * 100))
                  return (
                    <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end gap-1">
                        <div className="w-2 rounded-full bg-blue-400" style={{ height: `${ordersHeight}%` }} />
                        <div className="w-2 rounded-full bg-emerald-400" style={{ height: `${ticketsHeight}%` }} />
                        <div className="w-2 rounded-full bg-amber-400" style={{ height: `${accuracyHeight}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-500">{formatDate(item.date)}</div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-400" /> Đơn
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Vé
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Độ chính xác
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Không có dữ liệu báo cáo.
        </div>
      )}
    </div>
  )
}