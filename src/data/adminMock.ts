export type TimeRange = "today" | "week" | "month" | "quarter" | "year"

export const dashboardKPIs = {
  today: {
    revenue: 128000000,
    orders: {
      pending: 42,
      processing: 35,
      completed: 198,
      cancelled: 7,
    },
    customers: {
      new: 58,
      returning: 129,
    },
  },
  week: {
    revenue: 789000000,
    orders: {
      pending: 120,
      processing: 210,
      completed: 1320,
      cancelled: 46,
    },
    customers: {
      new: 320,
      returning: 1045,
    },
  },
  month: {
    revenue: 3125000000,
    orders: {
      pending: 340,
      processing: 450,
      completed: 5680,
      cancelled: 128,
    },
    customers: {
      new: 1310,
      returning: 4020,
    },
  },
  quarter: {
    revenue: 9250000000,
    orders: {
      pending: 840,
      processing: 980,
      completed: 16400,
      cancelled: 392,
    },
    customers: {
      new: 4200,
      returning: 12280,
    },
  },
  year: {
    revenue: 36250000000,
    orders: {
      pending: 2140,
      processing: 2430,
      completed: 64200,
      cancelled: 1130,
    },
    customers: {
      new: 15200,
      returning: 48200,
    },
  },
} as const

export const bestSellingProducts = [
  {
    id: "SP-001",
    name: "Sneaker Velocity X",
    category: "Giày thể thao",
    inventory: 42,
    conversion: 4.2,
    revenue: 420000000,
  },
  {
    id: "SP-002",
    name: "Áo khoác TechWind",
    category: "Áo khoác",
    inventory: 18,
    conversion: 3.4,
    revenue: 278000000,
  },
  {
    id: "SP-003",
    name: "Quần jogger FlexFit",
    category: "Quần dài",
    inventory: 64,
    conversion: 2.9,
    revenue: 196000000,
  },
] as const

export const slowProducts = [
  {
    id: "SP-145",
    name: "Áo sơ mi linen mùa hè",
    category: "Áo sơ mi",
    inventory: 310,
    turnoverDays: 86,
  },
  {
    id: "SP-168",
    name: "Váy midi họa tiết",
    category: "Đầm/Váy",
    inventory: 125,
    turnoverDays: 64,
  },
  {
    id: "SP-200",
    name: "Balo chống nước Active",
    category: "Phụ kiện",
    inventory: 92,
    turnoverDays: 72,
  },
] as const

export const alerts = [
  {
    id: "alert-1",
    type: "inventory" as const,
    title: "Tồn kho thấp",
    description: "Kho trung tâm chỉ còn 12 đôi Sneaker Velocity X",
    severity: "high" as const,
  },
  {
    id: "alert-2",
    type: "returns" as const,
    title: "Tỷ lệ hoàn trả tăng",
    description: "Dòng Áo khoác TechWind tăng 12% hoàn trả trong 7 ngày",
    severity: "medium" as const,
  },
  {
    id: "alert-3",
    type: "support" as const,
    title: "Vé hỗ trợ quá SLA",
    description: "Có 8 vé nhóm Vận hành trễ hơn 12 giờ",
    severity: "low" as const,
  },
] as const

export type OrderStatus =
  | "pending"
  | "processing"
  | "packed"
  | "shipping"
  | "completed"
  | "cancelled"
  | "refunded"

export interface OrderItem {
  id: string
  channel: "Website" | "Shopee" | "Lazada" | "Tiktok Shop"
  customer: string
  value: number
  payment: "COD" | "Online"
  status: OrderStatus
  createdAt: string
  sla: {
    fulfillment: number
    return: number
  }
}

export const orderMock: OrderItem[] = [
  {
    id: "DH-1001",
    channel: "Website",
    customer: "Nguyễn Văn A",
    value: 2350000,
    payment: "Online",
    status: "processing",
    createdAt: "2025-03-04T08:30:00Z",
    sla: {
      fulfillment: 18,
      return: 0,
    },
  },
  {
    id: "DH-1002",
    channel: "Shopee",
    customer: "Trần Thu B",
    value: 1480000,
    payment: "COD",
    status: "shipping",
    createdAt: "2025-03-04T09:45:00Z",
    sla: {
      fulfillment: 12,
      return: 0,
    },
  },
  {
    id: "DH-1003",
    channel: "Lazada",
    customer: "Lê Minh C",
    value: 3280000,
    payment: "Online",
    status: "pending",
    createdAt: "2025-03-03T23:10:00Z",
    sla: {
      fulfillment: 26,
      return: 0,
    },
  },
  {
    id: "DH-1004",
    channel: "Website",
    customer: "Đoàn Hà D",
    value: 890000,
    payment: "COD",
    status: "completed",
    createdAt: "2025-03-02T14:25:00Z",
    sla: {
      fulfillment: 9,
      return: 8,
    },
  },
  {
    id: "DH-1005",
    channel: "Tiktok Shop",
    customer: "Phạm Quang E",
    value: 1120000,
    payment: "Online",
    status: "refunded",
    createdAt: "2025-03-01T10:12:00Z",
    sla: {
      fulfillment: 15,
      return: 30,
    },
  },
]

export const slaSummary = {
  delivery: {
    onTime: 92,
    delayed: 8,
    averageHours: 26,
  },
  returns: {
    within: 84,
    overdue: 16,
    averageHours: 42,
  },
}

export interface ProductVariant {
  id: string
  color: string
  size: string
  sku: string
  inventory: number
}

export interface ProductItem {
  id: string
  name: string
  price: number
  salePrice?: number
  status: "visible" | "hidden"
  performance: "hot" | "stable" | "slow"
  inventory: number
  variants: ProductVariant[]
  tags: string[]
}

export const productMock: ProductItem[] = [
  {
    id: "SP-001",
    name: "Sneaker Velocity X",
    price: 1890000,
    salePrice: 1590000,
    status: "visible",
    performance: "hot",
    inventory: 42,
    variants: [
      { id: "SP-001-01", color: "Trắng", size: "39", sku: "VX-39", inventory: 12 },
      { id: "SP-001-02", color: "Đen", size: "41", sku: "VX-41", inventory: 8 },
    ],
    tags: ["new", "sport"],
  },
  {
    id: "SP-045",
    name: "Áo khoác TechWind",
    price: 1290000,
    status: "visible",
    performance: "stable",
    inventory: 118,
    variants: [
      { id: "SP-045-01", color: "Xanh than", size: "M", sku: "TW-M-NV", inventory: 36 },
      { id: "SP-045-02", color: "Xám", size: "L", sku: "TW-L-GR", inventory: 28 },
    ],
    tags: ["outerwear"],
  },
  {
    id: "SP-120",
    name: "Balo chống nước Active",
    price: 890000,
    status: "hidden",
    performance: "slow",
    inventory: 92,
    variants: [
      { id: "SP-120-01", color: "Đen", size: "40L", sku: "BA-40L", inventory: 52 },
      { id: "SP-120-02", color: "Xanh rêu", size: "40L", sku: "BA-40G", inventory: 40 },
    ],
    tags: ["accessory", "waterproof"],
  },
]

export interface CategoryNode {
  id: string
  name: string
  productCount: number
  children?: CategoryNode[]
}

export const categoryTree: CategoryNode[] = [
  {
    id: "cat-1",
    name: "Thời trang nam",
    productCount: 420,
    children: [
      { id: "cat-1-1", name: "Áo", productCount: 210 },
      { id: "cat-1-2", name: "Quần", productCount: 140 },
      { id: "cat-1-3", name: "Phụ kiện", productCount: 70 },
    ],
  },
  {
    id: "cat-2",
    name: "Thời trang nữ",
    productCount: 390,
    children: [
      { id: "cat-2-1", name: "Đầm", productCount: 160 },
      { id: "cat-2-2", name: "Áo", productCount: 150 },
      { id: "cat-2-3", name: "Túi xách", productCount: 80 },
    ],
  },
]

export const cmsContent = {
  pages: [
    { id: "about", title: "Về chúng tôi", status: "published", updatedAt: "2025-03-04" },
    { id: "policy", title: "Chính sách đổi trả", status: "draft", updatedAt: "2025-03-02" },
  ],
  blogs: [
    { id: "blog-1", title: "Xu hướng sneakers 2025", views: 1240, status: "scheduled", publishAt: "2025-03-10" },
    { id: "blog-2", title: "Mẹo phối đồ mùa mưa", views: 830, status: "published", publishAt: "2025-03-01" },
  ],
  banners: [
    { id: "bn-1", title: "Flash Sale 3.3", position: "Hero", variant: "A", ctr: 3.4 },
    { id: "bn-2", title: "Bộ sưu tập Xuân", position: "Hero", variant: "B", ctr: 2.6 },
  ],
}

export const warehouses = [
  {
    id: "wh-1",
    name: "Kho trung tâm",
    address: "Quận 7, TP.HCM",
    capacity: 10000,
    skuCount: 820,
    occupancy: 78,
  },
  {
    id: "wh-2",
    name: "Kho miền Bắc",
    address: "Long Biên, Hà Nội",
    capacity: 6000,
    skuCount: 540,
    occupancy: 64,
  },
]

export const inventoryAlerts = [
  { id: "inv-1", sku: "VX-39", title: "Lệch tồn kho", difference: -12 },
  { id: "inv-2", sku: "TW-M-NV", title: "Âm kho", difference: -4 },
]

export const shipments = [
  {
    id: "SPX-32145",
    carrier: "GHTK",
    order: "DH-1002",
    status: "Đang giao",
    eta: "2025-03-05",
  },
  {
    id: "SPX-32168",
    carrier: "GHN",
    order: "DH-0998",
    status: "Đã giao",
    eta: "2025-03-03",
  },
]

export const customerSegments = [
  { id: "seg-vip", name: "VIP", customers: 126, rules: "Doanh thu > 10 triệu/12 tháng" },
  { id: "seg-new", name: "Khách mới", customers: 820, rules: "Đăng ký < 30 ngày" },
  { id: "seg-risk", name: "Khách hàng rời bỏ", customers: 212, rules: "Không mua lại > 90 ngày" },
]

export const customers = [
  {
    id: "cus-1",
    name: "Nguyễn Văn A",
    tier: "VIP",
    totalOrders: 24,
    totalSpend: 32500000,
    points: 820,
    status: "active",
  },
  {
    id: "cus-2",
    name: "Trần Thu B",
    tier: "Khách mới",
    totalOrders: 2,
    totalSpend: 1980000,
    points: 120,
    status: "active",
  },
  {
    id: "cus-3",
    name: "Phạm Quang E",
    tier: "Khách hàng rời bỏ",
    totalOrders: 5,
    totalSpend: 4950000,
    points: 0,
    status: "suspended",
  },
]

export const analyticsReports = [
  {
    id: "rp-1",
    name: "Doanh thu theo kênh",
    lastRun: "2025-03-04 08:00",
    nextSchedule: "Hằng ngày 08:00",
    metrics: ["Revenue", "Orders", "Conversion"],
  },
  {
    id: "rp-2",
    name: "Hiệu suất kho",
    lastRun: "2025-03-03 18:00",
    nextSchedule: "Thứ 2/4/6 18:00",
    metrics: ["Inventory turnover", "Aging", "Stock-out"],
  },
]

export const systemUsers = [
  {
    id: "user-1",
    name: "Nguyễn Vũ",
    email: "admin@example.com",
    role: "Admin",
    status: "active",
    lastActive: "2025-03-04 10:12",
  },
  {
    id: "user-2",
    name: "Lê Toàn",
    email: "toan@example.com",
    role: "Staff",
    status: "active",
    lastActive: "2025-03-04 09:45",
  },
  {
    id: "user-3",
    name: "Trần Khoa",
    email: "khoa@example.com",
    role: "Staff",
    status: "locked",
    lastActive: "2025-02-28 17:30",
  },
]

export const supportTickets = [
  {
    id: "SUP-001",
    subject: "Đơn DH-1002 chưa nhận được",
    priority: "Cao",
    status: "Đang xử lý",
    slaDue: "2h còn lại",
    assignee: "Lê CSKH",
  },
  {
    id: "SUP-002",
    subject: "Yêu cầu đổi size DH-0998",
    priority: "Trung bình",
    status: "Chờ khách",
    slaDue: "6h còn lại",
    assignee: "Nguyễn Admin",
  },
]

export const promotions = [
  {
    id: "KM-001",
    name: "Flash Sale 3.3",
    type: "Flash sale",
    discount: "30%",
    channel: "Website",
    status: "Đang diễn ra",
  },
  {
    id: "KM-002",
    name: "VIP Loyalty Q1",
    type: "Khách hàng thân thiết",
    discount: "500k",
    channel: "Đa kênh",
    status: "Đang chuẩn bị",
  },
]

export const auditLogs = [
  {
    id: "log-1",
    actor: "Nguyễn Vũ",
    action: "Cập nhật giá",
    module: "Sản phẩm",
    target: "Sneaker Velocity X",
    before: "1.990.000đ",
    after: "1.890.000đ",
    time: "2025-03-04 09:20",
  },
  {
    id: "log-2",
    actor: "Lê Toàn",
    action: "Hoàn tiền đơn",
    module: "Đơn hàng",
    target: "DH-1005",
    before: "Đã thanh toán",
    after: "Đã hoàn 100%",
    time: "2025-03-04 08:45",
  },
]

export const alertThresholds = [
  { id: "al-1", name: "Tồn kho > 60 ngày", channel: "Email", status: "Đang bật" },
  { id: "al-2", name: "Hoàn trả > 8%", channel: "Slack", status: "Đang bật" },
]