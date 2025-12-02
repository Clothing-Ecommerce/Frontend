import { useState, useMemo, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Activity, 
  ArrowRight,
  Database,
  X 
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// Giả lập data - Thực tế bạn sẽ gọi API tương tự OrdersPage
import { auditLogs } from "@/data/adminMock" 

// Định nghĩa lại Type cho Log để chặt chẽ hơn
type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "OTHER";

interface AuditLog {
  id: number;
  time: string; // ISO string
  actor: string;
  role: string;
  module: string;
  action: string;
  actionType: ActionType; 
  description: string;
  ip: string;
  changes?: {
    field: string;
    old: string | number | null;
    new: string | number | null;
  }[];
}

// Map màu sắc cho Badge dựa theo hành động (Consistency với OrdersPage)
const actionBadgeStyles: Record<ActionType, string> = {
  CREATE: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  UPDATE: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  DELETE: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  LOGIN: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
  OTHER: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
}

// Map icon cho từng hành động
const ActionIcon = ({ type }: { type: ActionType }) => {
  switch (type) {
    case "CREATE": return <div className="h-2 w-2 rounded-full bg-emerald-500" />;
    case "UPDATE": return <div className="h-2 w-2 rounded-full bg-blue-500" />;
    case "DELETE": return <div className="h-2 w-2 rounded-full bg-rose-500" />;
    default: return <div className="h-2 w-2 rounded-full bg-slate-400" />;
  }
}

// Format ngày giờ theo chuẩn VN
const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "medium",
  hour12: false,
});

export default function AuditLogsPage() {
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState<string | "all">("all")
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null)

  // Giả lập filter logic (Thực tế logic này nằm ở Backend như OrdersPage)
  const filteredLogs = useMemo(() => {
    return auditLogs.map(log => ({
      ...log,
      actionType: log.action.includes("Thêm") ? "CREATE" : log.action.includes("Xóa") ? "DELETE" : log.action.includes("Sửa") || log.action.includes("Cập nhật") ? "UPDATE" : "OTHER",
      // Giả lập thêm dữ liệu chi tiết nếu mock chưa có
      ip: "192.168.1.1",
      role: "Admin",
      description: `Thực hiện thao tác ${log.action} trên ${log.module}`,
      changes: log.before ? [
        { field: "Dữ liệu", old: log.before, new: log.after }
      ] : []
    } as AuditLog)).filter((log) => {
      const matchesSearch =
        search.trim().length === 0 ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase())
      const matchesModule = moduleFilter === "all" || log.module === moduleFilter
      return matchesSearch && matchesModule
    })
  }, [search, moduleFilter])

  const selectedLog = useMemo(() => 
    filteredLogs.find(l => l.id === selectedLogId), 
  [filteredLogs, selectedLogId])

  const isDetailOpen = !!selectedLogId;

  return (
    <div className="relative space-y-6 overflow-x-hidden p-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Nhật ký hệ thống
            </CardTitle>
            <CardDescription className="text-slate-500">
              Theo dõi và kiểm soát mọi hoạt động diễn ra trong hệ thống
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm user, hành động..."
                className="pl-9 w-full sm:w-[250px] bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Mô-đun" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mô-đun</SelectItem>
                <SelectItem value="Sản phẩm">Sản phẩm</SelectItem>
                <SelectItem value="Đơn hàng">Đơn hàng</SelectItem>
                <SelectItem value="Kho">Kho</SelectItem>
                <SelectItem value="Hệ thống">Hệ thống</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2 text-slate-600 border-slate-200">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Xuất CSV</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
           {/* Layout Split View: Left List - Right Detail */}
           <div
            className={cn(
              "flex flex-col gap-6 lg:grid transition-all duration-500 ease-in-out",
              isDetailOpen 
                ? "lg:grid-cols-[minmax(0,1fr)_450px]" 
                : "lg:grid-cols-[minmax(0,1fr)_0px]"
            )}
          >
            {/* --- LIST VIEW --- */}
            <div className="overflow-hidden border-t border-slate-100">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Người thực hiện</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Mô-đun</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hành động</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLogId(log.id)}
                      className={cn(
                        "group hover:bg-slate-50/80 cursor-pointer transition-colors",
                        selectedLogId === log.id && "bg-blue-50/50 hover:bg-blue-50/60"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm font-medium">{log.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {log.actor.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{log.actor}</div>
                            <div className="text-xs text-slate-500">{log.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-normal bg-white text-slate-600 border-slate-200">
                          {log.module}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                         <Badge 
                            variant="secondary" 
                            className={cn("gap-1.5 px-2.5 py-0.5 shadow-sm transition-colors", actionBadgeStyles[log.actionType])}
                          >
                            <ActionIcon type={log.actionType} />
                            {log.action}
                         </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                          Xem <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- DETAIL PANEL (Slide-over effect) --- */}
            <div className={cn(
               "border-l border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col h-[calc(100vh-200px)] sticky top-0",
               !isDetailOpen && "hidden"
            )}>
              {selectedLog && (
                <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                  {/* Detail Header */}
                  <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">Chi tiết hoạt động</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: #{selectedLog.id} • IP: {selectedLog.ip}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLogId(null)}>
                      <X className="h-4 w-4 text-slate-500" />
                    </Button>
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Actor Info */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                          {selectedLog.actor.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{selectedLog.actor}</div>
                          <div className="text-xs text-slate-500">Đã thực hiện thao tác lúc {selectedLog.time}</div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                        {selectedLog.description}
                      </div>
                    </div>

                    {/* Data Changes (Diff View) */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <Database className="h-3.5 w-3.5" />
                        Dữ liệu thay đổi
                      </h4>
                      
                      {selectedLog.changes && selectedLog.changes.length > 0 ? (
                        <div className="space-y-3">
                          {selectedLog.changes.map((change, index) => (
                            <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-700">
                                Trường: <span className="text-blue-600">{change.field}</span>
                              </div>
                              <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="p-3 bg-red-50/30">
                                  <div className="text-[10px] uppercase text-red-500 font-bold mb-1">Trước</div>
                                  <div className="text-sm text-slate-700 font-mono break-all">
                                    {change.old ? change.old : <span className="text-slate-400 italic">null</span>}
                                  </div>
                                </div>
                                <div className="p-3 bg-emerald-50/30">
                                  <div className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Sau</div>
                                  <div className="text-sm text-slate-900 font-medium font-mono break-all">
                                    {change.new}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center">
                          Không có thay đổi dữ liệu cụ thể (chỉ ghi nhận hành động).
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                     <Button variant="outline" size="sm" className="bg-white">Báo cáo vấn đề</Button>
                     <Button size="sm">Sao chép Log ID</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}