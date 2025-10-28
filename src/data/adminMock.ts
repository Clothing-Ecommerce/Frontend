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

export type OrderTimelineStep = {
  label: string
  time: string
}

export interface OrderLineItem {
  name: string
  sku: string
  quantity: number
  price: number
}

export interface OrderDetail {
  address: string
  items: OrderLineItem[]
  timeline: OrderTimelineStep[]
  notes: string[]
}

export interface OrderItem {
  id: string
  customer: string
  value: number
  payment: "COD" | "Online"
  status: OrderStatus
  createdAt: string
  sla: {
    fulfillment: number
    return: number
  }
  detail: OrderDetail
}

export const orderMock: OrderItem[] = [
  {
    id: "DH-1001",
    customer: "Nguyễn Văn A",
    value: 2350000,
    payment: "Online",
    status: "processing",
    createdAt: "2025-03-04T08:30:00Z",
    sla: {
      fulfillment: 18,
      return: 0,
    },
    detail: {
      address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      items: [
        { name: "Sneaker Velocity X", sku: "VX-39", quantity: 1, price: 1890000 },
        { name: "Vớ thể thao AirFlow", sku: "SOCK-AIRFLOW", quantity: 2, price: 230000 },
      ],
      timeline: [
        { label: "Đặt hàng", time: "08:30" },
        { label: "Đóng gói", time: "10:05" },
        { label: "Bàn giao vận chuyển", time: "--" },
        { label: "Hoàn tất", time: "--" },
      ],
      notes: [
        "Khách yêu cầu giao trong giờ hành chính",
        "Đã xác nhận thanh toán online",
      ],
    },
  },
  {
    id: "DH-1002",
    customer: "Trần Thu B",
    value: 1480000,
    payment: "COD",
    status: "shipping",
    createdAt: "2025-03-04T09:45:00Z",
    sla: {
      fulfillment: 12,
      return: 0,
    },
    detail: {
      address: "45 Nguyễn Oanh, Gò Vấp, TP. Hồ Chí Minh",
      items: [
        { name: "Áo khoác TechWind", sku: "TW-M-NV", quantity: 1, price: 890000 },
        { name: "Quần jogger FlexFit", sku: "JG-FLEXFIT", quantity: 1, price: 590000 },
      ],
      timeline: [
        { label: "Đặt hàng", time: "09:45" },
        { label: "Đóng gói", time: "11:10" },
        { label: "Bàn giao vận chuyển", time: "13:00" },
        { label: "Hoàn tất", time: "--" },
      ],
      notes: [
        "Khách dặn gọi trước khi giao",
        "Đang theo dõi mã vận đơn GHN",
      ],
    },
  },
  {
    id: "DH-1003",
    customer: "Lê Minh C",
    value: 3280000,
    payment: "Online",
    status: "pending",
    createdAt: "2025-03-03T23:10:00Z",
    sla: {
      fulfillment: 26,
      return: 0,
    },
    detail: {
      address: "18 Nguyễn Văn Trỗi, Phú Nhuận, TP. Hồ Chí Minh",
      items: [
        { name: "Áo khoác TechWind", sku: "TW-L-GR", quantity: 1, price: 1290000 },
        { name: "Quần jean Indigo", sku: "JN-INDIGO-32", quantity: 1, price: 990000 },
        { name: "Giày loafers Classic", sku: "LF-CLASSIC-42", quantity: 1, price: 1000000 },
      ],
      timeline: [
        { label: "Đặt hàng", time: "23:10" },
        { label: "Đóng gói", time: "--" },
        { label: "Bàn giao vận chuyển", time: "--" },
        { label: "Hoàn tất", time: "--" },
      ],
      notes: [
        "Khách muốn xuất hoá đơn điện tử",
        "Chờ xác nhận kho còn đủ size",
      ],
    },
  },
  {
    id: "DH-1004",
    customer: "Đoàn Hà D",
    value: 890000,
    payment: "COD",
    status: "completed",
    createdAt: "2025-03-02T14:25:00Z",
    sla: {
      fulfillment: 9,
      return: 8,
    },
    detail: {
      address: "88 Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh",
      items: [
        { name: "Áo thun Everyday", sku: "TS-EVERYDAY-M", quantity: 2, price: 320000 },
        { name: "Thắt lưng da Heritage", sku: "BL-HERITAGE", quantity: 1, price: 250000 },
      ],
      timeline: [
        { label: "Đặt hàng", time: "14:25" },
        { label: "Đóng gói", time: "15:00" },
        { label: "Bàn giao vận chuyển", time: "16:10" },
        { label: "Hoàn tất", time: "09:45" },
      ],
      notes: [
        "Khách đã nhận hàng và đánh giá 5★",
        "Đã gửi mã giảm giá cho đơn kế tiếp",
      ],
    },
  },
  {
    id: "DH-1005",
    customer: "Phạm Quang E",
    value: 1120000,
    payment: "Online",
    status: "refunded",
    createdAt: "2025-03-01T10:12:00Z",
    sla: {
      fulfillment: 15,
      return: 30,
    },
    detail: {
      address: "24 Hoàng Văn Thụ, Tân Bình, TP. Hồ Chí Minh",
      items: [
        { name: "Áo polo Breeze", sku: "PO-BREEZE-L", quantity: 1, price: 620000 },
        { name: "Quần short Active", sku: "SH-ACTIVE", quantity: 1, price: 500000 },
      ],
      timeline: [
        { label: "Đặt hàng", time: "10:12" },
        { label: "Đóng gói", time: "11:00" },
        { label: "Hoàn trả", time: "15:30" },
        { label: "Hoàn tiền", time: "16:45" },
      ],
      notes: [
        "Khách trả hàng do không vừa size",
        "Đã hoàn tiền qua ví điện tử",
      ],
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