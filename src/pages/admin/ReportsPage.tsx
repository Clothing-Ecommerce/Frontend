import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Download,
  Filter
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'

// --- MOCK DATA (Dữ liệu giả lập) ---
const revenueData = [
  { name: 'T2', revenue: 4000000, orders: 24 },
  { name: 'T3', revenue: 3000000, orders: 18 },
  { name: 'T4', revenue: 2000000, orders: 12 },
  { name: 'T5', revenue: 2780000, orders: 30 },
  { name: 'T6', revenue: 1890000, orders: 20 },
  { name: 'T7', revenue: 2390000, orders: 25 },
  { name: 'CN', revenue: 3490000, orders: 40 },
]

const categoryData = [
  { name: 'Áo Nam', value: 400 },
  { name: 'Váy Nữ', value: 300 },
  { name: 'Phụ kiện', value: 300 },
  { name: 'Giày dép', value: 200 },
]

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8'] // Slate color palette

// Helper format tiền tệ VND
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo & Thống kê</h2>
          <p className="text-sm text-slate-500">
            Tổng quan tình hình kinh doanh, tồn kho và khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 giờ qua</SelectItem>
              <SelectItem value="7d">7 ngày qua</SelectItem>
              <SelectItem value="30d">30 ngày qua</SelectItem>
              <SelectItem value="this_month">Tháng này</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* --- TABS --- */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="sales">Doanh thu & Đơn hàng</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm & Tồn kho</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
        </TabsList>

        {/* ================= TAB: TỔNG QUAN ================= */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Tổng doanh thu"
              value="45.231.000₫"
              change="+20.1%"
              trend="up"
              icon={<DollarSign className="h-4 w-4 text-slate-500" />}
            />
            <KPICard
              title="Đơn hàng mới"
              value="+573"
              change="+180"
              trend="up"
              icon={<ShoppingBag className="h-4 w-4 text-slate-500" />}
            />
            <KPICard
              title="Sản phẩm đã bán"
              value="1,203"
              change="-4%"
              trend="down"
              icon={<Package className="h-4 w-4 text-slate-500" />}
            />
            <KPICard
              title="Khách hàng mới"
              value="+20"
              change="+12%"
              trend="up"
              icon={<Users className="h-4 w-4 text-slate-500" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Revenue Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Biểu đồ doanh thu</CardTitle>
                <CardDescription>Doanh thu theo ngày trong tuần qua</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value / 1000000}M`} 
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0f172a" 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories Pie Chart */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Doanh thu theo danh mục</CardTitle>
                <CardDescription>Tỷ trọng doanh thu các nhóm hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Số lượng']} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Inventory Alerts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cảnh báo tồn kho</CardTitle>
                  <CardDescription>Các SKU có số lượng thấp cần nhập thêm</CardDescription>
                </div>
                <Badge variant="destructive" className="flex gap-1 items-center">
                  <AlertTriangle size={12} /> Cần nhập hàng
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">IMG</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Áo Thun Basic - Trắng / L</p>
                          <p className="text-xs text-slate-500">SKU: AT-WH-L</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">Còn 2</p>
                        <p className="text-xs text-slate-500">Đã bán: 150</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Top Locations */}
            <Card>
                <CardHeader>
                    <CardTitle>Khu vực mua hàng nhiều nhất</CardTitle>
                    <CardDescription>Top tỉnh thành có lượng đơn cao</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">1</span>
                                <span className="text-sm font-medium">TP. Hồ Chí Minh</span>
                            </div>
                            <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-slate-800" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">2</span>
                                <span className="text-sm font-medium">Hà Nội</span>
                            </div>
                            <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-slate-800" style={{ width: '60%' }}></div>
                            </div>
                            <span className="text-sm font-medium">30%</span>
                        </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">3</span>
                                <span className="text-sm font-medium">Đà Nẵng</span>
                            </div>
                            <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-slate-800" style={{ width: '20%' }}></div>
                            </div>
                            <span className="text-sm font-medium">10%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================= TAB: DOANH THU & ĐƠN HÀNG ================= */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            {/* Detailed Sales Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Xu hướng dòng tiền</CardTitle>
                <CardDescription>Doanh thu thuần so với số lượng đơn hàng</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000000}M`} />
                        <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            formatter={(value, name) => [name === 'revenue' ? formatCurrency(value as number) : value, name === 'revenue' ? 'Doanh thu' : 'Đơn hàng']}
                        />
                        <Bar yAxisId="left" dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} />
                     </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status & Payments */}
            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Hoàn thành (COMPLETED)', val: 65, color: 'bg-emerald-500' },
                      { label: 'Đang giao (SHIPPED)', val: 20, color: 'bg-blue-500' },
                      { label: 'Đang xử lý (PENDING)', val: 10, color: 'bg-amber-500' },
                      { label: 'Đã huỷ/Hoàn (CANCELLED)', val: 5, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-medium">{item.val}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" /> COD (60%)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full" /> Momo/VNPay (30%)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full" /> Bank (10%)
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB: SẢN PHẨM & TỒN KHO ================= */}
        <TabsContent value="products" className="space-y-4">
          {/* Top Selling */}
          <Card>
            <CardHeader>
              <CardTitle>Top sản phẩm bán chạy</CardTitle>
              <CardDescription>Xếp hạng theo số lượng đã bán trong kỳ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-lg border bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                         {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          Áo Thun Signature - Đen
                        </p>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                          <Badge variant="secondary" className="font-normal">Size L</Badge>
                          <span className="flex items-center">⭐ 4.8 (120 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">1,200 đã bán</p>
                      <p className="text-xs text-emerald-600 font-medium">Doanh thu: 120.000.000₫</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trạng thái kho hàng</CardTitle>
                <CardDescription>Theo dõi biến động và cảnh báo nhập hàng</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-3 w-3"/>
                    Lọc: Sắp hết hàng
                </Button>
                <Button variant="outline" size="sm">Xuất Excel</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full text-sm text-left caption-bottom">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                      <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Sản phẩm / Biến thể</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">SKU</th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-slate-500">Đã bán</th>
                      <th className="h-12 px-4 text-center align-middle font-medium text-slate-500">Tồn kho</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    <tr className="border-b transition-colors hover:bg-slate-100/50">
                      <td className="p-4 align-middle font-medium">Quần Jeans Slimfit - Xanh / 32</td>
                      <td className="p-4 align-middle text-slate-500">JEA-BLU-32</td>
                      <td className="p-4 align-middle text-center">450</td>
                      <td className="p-4 align-middle text-center font-bold text-red-600">3</td>
                      <td className="p-4 align-middle text-right">
                        <Badge variant="destructive">Sắp hết</Badge>
                      </td>
                    </tr>
                    <tr className="border-b transition-colors hover:bg-slate-100/50">
                      <td className="p-4 align-middle font-medium">Áo Khoác Bomber - Xám / XL</td>
                      <td className="p-4 align-middle text-slate-500">JKT-GRY-XL</td>
                      <td className="p-4 align-middle text-center">120</td>
                      <td className="p-4 align-middle text-center font-bold text-slate-900">50</td>
                      <td className="p-4 align-middle text-right">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Có sẵn</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB: KHÁCH HÀNG ================= */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            {/* VIP Customers */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Khách hàng VIP</CardTitle>
                <CardDescription>Top chi tiêu tháng này</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {[
                    { name: "Nguyễn Văn A", mail: "nva@gmail.com", spent: "5.200.000₫", orders: 3 },
                    { name: "Trần Thị B", mail: "ttb@outlook.com", spent: "3.150.000₫", orders: 2 },
                    { name: "Lê C", mail: "lec@yahoo.com", spent: "2.800.000₫", orders: 1 },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{user.mail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{user.spent}</p>
                        <p className="text-xs text-slate-500">{user.orders} đơn</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân bổ địa lý</CardTitle>
                  <CardDescription>Nơi tập trung nhiều đơn hàng nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <div className="w-24 font-medium text-slate-600">Hồ Chí Minh</div>
                      <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800" style={{ width: '60%' }}></div>
                      </div>
                      <div className="w-12 text-right font-bold">60%</div>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-24 font-medium text-slate-600">Hà Nội</div>
                      <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800" style={{ width: '25%' }}></div>
                      </div>
                      <div className="w-12 text-right font-bold">25%</div>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-24 font-medium text-slate-600">Đà Nẵng</div>
                      <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800" style={{ width: '15%' }}></div>
                      </div>
                      <div className="w-12 text-right font-bold">15%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Retention Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-indigo-600">85%</div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Khách cũ quay lại</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-emerald-600">15%</div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Khách hàng mới</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function KPICard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1 flex items-center">
          <span
            className={`flex items-center ${
              trend === "up" ? "text-emerald-600" : "text-red-600"
            } font-medium mr-1`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {change}
          </span>
          so với tháng trước
        </p>
      </CardContent>
    </Card>
  )
}