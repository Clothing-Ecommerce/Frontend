const msPerDay = 86_400_000;

const daysAgoIso = (days: number) =>
  new Date(Date.now() - days * msPerDay).toISOString();

type OrderStatus = "new" | "processing" | "delivered" | "returned";

type OrderTimelineStep = {
  label: string;
  time: string;
};

export interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  /**
   * ID dạng số trong hệ thống admin, phục vụ gọi API.
   */
  adminId?: number;
  /**
   * Mã hiển thị (code) trả về từ API admin, ví dụ ORD-000000001.
   */
  code?: string;
  /**
   * Trạng thái gốc (chuẩn admin) giúp đồng bộ với backend.
   */
  adminStatus?: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  status: OrderStatus;
  total: number;
  createdAt: string;
  address: string;
  items: OrderItem[];
  notes: string[];
  isReturnRequested?: boolean;
  timeline: OrderTimelineStep[];
}

export interface InventoryAdjustment {
  id: string;
  type: "import" | "export" | "adjust";
  quantity: number;
  note: string;
  date: string;
}

export interface InventoryItem {
  sku: string;
  name: string;
  variant: string;
  quantity: number;
  reorderPoint: number;
  image: string;
  history: InventoryAdjustment[];
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  visible: boolean;
  stock: number;
  category: string;
  tags: string[];
  shortDescription: string;
  variants: ProductVariant[];
  image: string;
}

export interface CustomerOrderSummary {
  id: string;
  total: number;
  status: OrderStatus;
  placedAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultAddress: string;
  notes: string[];
  recentOrders: CustomerOrderSummary[];
  openOrders: string[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "new" | "in_progress" | "resolved";
  customerName: string;
  orderId?: string;
  lastUpdated: string;
  assignedTo: string;
  tags: string[];
  previewResponse: string;
}

export interface ProductReviewModeration {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  status: "visible" | "pending" | "hidden";
  customerName: string;
  submittedAt: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  extension: string;
  notifications: {
    email: boolean;
    app: boolean;
  };
  permissions: string[];
  preferredShift: "morning" | "evening";
}

export interface ProductivitySnapshot {
  range: "7d" | "14d" | "30d";
  ordersHandled: number;
  ticketsResolved: number;
  firstResponseSla: string;
  resolutionSla: string;
  inventoryAdjustments: number;
  accuracyScore: number;
  chart: Array<{
    date: string;
    orders: number;
    tickets: number;
    accuracy: number;
  }>;
}

interface DashboardTaskDefinition {
  id: string;
  title: string;
  relatedSection: "orders" | "inventory" | "support";
  action: string;
  due: string;
}

interface DashboardDefinition {
  todo: DashboardTaskDefinition[];
  miniCharts: {
    daily: { newOrders: number[]; tickets: number[] };
    weekly: { newOrders: number[]; tickets: number[] };
  };
}

export const staffMockData: {
  dashboard: DashboardDefinition;
  orders: Order[];
  inventory: InventoryItem[];
  products: Product[];
  customers: CustomerRecord[];
  supportTickets: SupportTicket[];
  reviewModeration: ProductReviewModeration[];
  profile: StaffProfile;
  productivity: ProductivitySnapshot[];
} = {
  dashboard: {
    todo: [
      {
        id: "task-1",
        title: "Xử lý các đơn mới",
        relatedSection: "orders" as const,
        action: "process_new",
        due: "09:30",
      },
      {
        id: "task-2",
        title: "Kiểm tra tồn kho sản phẩm",
        relatedSection: "inventory" as const,
        action: "inventory_import",
        due: "10:00",
      },
      {
        id: "task-3",
        title: "Trả lời những yêu cầu hỗ trợ",
        relatedSection: "support" as const,
        action: "support_reply",
        due: "10:15",
      },
    ],
    miniCharts: {
      daily: {
        newOrders: [12, 18, 9, 15, 21, 17, 19],
        tickets: [4, 3, 5, 6, 4, 2, 3],
      },
      weekly: {
        newOrders: [96, 102, 88, 110],
        tickets: [22, 19, 18, 24],
      },
    },
  },
  orders: [
    {
      id: "DH-2024-0915",
      customerName: "Nguyễn Văn An",
      status: "new" as const,
      total: 3250000,
      createdAt: daysAgoIso(0),
      address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      notes: ["Khách yêu cầu giao trong giờ hành chính"],
      isReturnRequested: false,
      timeline: [
        { label: "Đặt hàng", time: "08:12" },
        { label: "Đóng gói", time: "--" },
        { label: "Bàn giao vận chuyển", time: "--" },
      ],
      items: [
        {
          name: "Áo sơ mi Oxford",
          sku: "SM-OXF-TRANG-M",
          quantity: 2,
          price: 650000,
        },
        {
          name: "Quần tây slim fit",
          sku: "QT-SLIM-DEN-32",
          quantity: 1,
          price: 950000,
        },
      ],
    },
    {
      id: "DH-2024-0913",
      customerName: "Trần Thị Minh",
      status: "processing" as const,
      total: 2450000,
      createdAt: daysAgoIso(1),
      address: "88 Lý Thường Kiệt, Quận Tân Bình, TP. Hồ Chí Minh",
      notes: ["Đã gọi xác nhận, khách muốn gói quà"],
      timeline: [
        { label: "Đặt hàng", time: "20:45" },
        { label: "Đóng gói", time: "07:30" },
        { label: "Bàn giao vận chuyển", time: "--" },
      ],
      items: [
        {
          name: "Đầm linen",
          sku: "DAM-LINEN-XANH-S",
          quantity: 1,
          price: 1450000,
        },
        {
          name: "Túi tote da",
          sku: "TOTE-DA-NAU",
          quantity: 1,
          price: 1000000,
        },
      ],
    },
    {
      id: "DH-2024-0908",
      customerName: "Phạm Quốc Thái",
      status: "delivered" as const,
      total: 1890000,
      createdAt: daysAgoIso(3),
      address: "22 Pasteur, Quận 3, TP. Hồ Chí Minh",
      notes: ["Khách đánh giá 5⭐"],
      timeline: [
        { label: "Đặt hàng", time: "11:05" },
        { label: "Đóng gói", time: "13:20" },
        { label: "Bàn giao vận chuyển", time: "15:10" },
      ],
      items: [
        {
          name: "Áo thun cổ tròn",
          sku: "AT-CT-DEN-L",
          quantity: 3,
          price: 390000,
        },
      ],
    },
    {
      id: "DH-2024-0906",
      customerName: "Lê Hà My",
      status: "returned" as const,
      total: 1540000,
      createdAt: daysAgoIso(5),
      address: "15 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh",
      notes: ["Khách đổi size áo khoác"],
      isReturnRequested: true,
      timeline: [
        { label: "Đặt hàng", time: "09:15" },
        { label: "Đóng gói", time: "10:00" },
        { label: "Hoàn trả", time: "Đang xử lý" },
      ],
      items: [
        {
          name: "Áo khoác gió",
          sku: "AK-GIO-XAM-M",
          quantity: 1,
          price: 1540000,
        },
      ],
    },
  ],
  inventory: [
    {
      sku: "SM-OXF-TRANG-M",
      name: "Áo sơ mi Oxford",
      variant: "Trắng / Size M",
      quantity: 18,
      reorderPoint: 20,
      image: "/placeholder.svg?height=60&width=60&text=Oxford",
      history: [
        {
          id: "INV-001",
          type: "import",
          quantity: 30,
          note: "Nhập bổ sung đầu tuần",
          date: daysAgoIso(2),
        },
        {
          id: "INV-002",
          type: "export",
          quantity: 12,
          note: "Xuất giao đơn online",
          date: daysAgoIso(1),
        },
      ],
    },
    {
      sku: "QT-SLIM-DEN-32",
      name: "Quần tây slim fit",
      variant: "Đen / Size 32",
      quantity: 9,
      reorderPoint: 12,
      image: "/placeholder.svg?height=60&width=60&text=Slim",
      history: [
        {
          id: "INV-003",
          type: "import",
          quantity: 20,
          note: "Nhập từ nhà cung cấp A",
          date: daysAgoIso(7),
        },
      ],
    },
    {
      sku: "AK-GIO-XAM-M",
      name: "Áo khoác gió",
      variant: "Xám / Size M",
      quantity: 5,
      reorderPoint: 10,
      image: "/placeholder.svg?height=60&width=60&text=Jacket",
      history: [
        {
          id: "INV-004",
          type: "adjust",
          quantity: -2,
          note: "Điều chỉnh do kiểm kê",
          date: daysAgoIso(4),
        },
      ],
    },
  ],
  products: [
    {
      id: "PRD-001",
      name: "Áo sơ mi Oxford",
      price: 650000,
      visible: true,
      stock: 48,
      category: "Nam",
      tags: ["bán chạy", "công sở"],
      shortDescription: "Áo sơ mi cotton mềm mịn, giữ form tốt.",
      variants: [
        { name: "Màu", options: ["Trắng", "Xanh nhạt", "Đen"] },
        { name: "Size", options: ["S", "M", "L", "XL"] },
      ],
      image: "/placeholder.svg?height=80&width=80&text=Oxford",
    },
    {
      id: "PRD-002",
      name: "Đầm linen",
      price: 1450000,
      visible: true,
      stock: 26,
      category: "Nữ",
      tags: ["mùa hè"],
      shortDescription: "Chất liệu thoáng mát, form thoải mái.",
      variants: [
        { name: "Màu", options: ["Xanh", "Vàng"] },
        { name: "Size", options: ["S", "M", "L"] },
      ],
      image: "/placeholder.svg?height=80&width=80&text=Linen",
    },
    {
      id: "PRD-003",
      name: "Áo khoác gió",
      price: 1540000,
      visible: false,
      stock: 12,
      category: "Nam",
      tags: ["thời tiết lạnh"],
      shortDescription: "Chống gió tốt, phù hợp đi du lịch.",
      variants: [
        { name: "Màu", options: ["Xám", "Đen"] },
        { name: "Size", options: ["M", "L"] },
      ],
      image: "/placeholder.svg?height=80&width=80&text=Jacket",
    },
  ],
  customers: [
    {
      id: "CUS-001",
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      phone: "0903 456 789",
      defaultAddress: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      notes: ["Ưu tiên liên hệ qua email"],
      openOrders: ["DH-2024-0915"],
      recentOrders: [
        {
          id: "DH-2024-0915",
          total: 3250000,
          status: "new",
          placedAt: daysAgoIso(0),
        },
        {
          id: "DH-2024-0810",
          total: 2150000,
          status: "delivered",
          placedAt: daysAgoIso(35),
        },
      ],
    },
    {
      id: "CUS-002",
      name: "Trần Thị Minh",
      email: "minh.tran@example.com",
      phone: "0987 654 321",
      defaultAddress: "88 Lý Thường Kiệt, Quận Tân Bình",
      notes: ["Khách thân thiết, thích nhận ưu đãi sớm"],
      openOrders: ["DH-2024-0913"],
      recentOrders: [
        {
          id: "DH-2024-0913",
          total: 2450000,
          status: "processing",
          placedAt: daysAgoIso(1),
        },
        {
          id: "DH-2024-0802",
          total: 1750000,
          status: "delivered",
          placedAt: daysAgoIso(42),
        },
      ],
    },
    {
      id: "CUS-003",
      name: "Lê Hà My",
      email: "my.le@example.com",
      phone: "0912 345 678",
      defaultAddress: "15 Nguyễn Thị Minh Khai, Quận 1",
      notes: ["Đang xử lý đổi size"],
      openOrders: ["DH-2024-0906"],
      recentOrders: [
        {
          id: "DH-2024-0906",
          total: 1540000,
          status: "returned",
          placedAt: daysAgoIso(5),
        },
      ],
    },
  ],
  supportTickets: [
    {
      id: "TIC-1001",
      subject: "Đổi size áo khoác",
      priority: "high",
      status: "in_progress",
      customerName: "Lê Hà My",
      orderId: "DH-2024-0906",
      lastUpdated: daysAgoIso(0),
      assignedTo: "Bạn",
      tags: ["đổi hàng", "ưu tiên"],
      previewResponse:
        "Chúng tôi đã tạo phiếu đổi size, sẽ thu hồi trong hôm nay.",
    },
    {
      id: "TIC-1002",
      subject: "Hỏi tình trạng đơn",
      priority: "medium",
      status: "new",
      customerName: "Nguyễn Văn An",
      orderId: "DH-2024-0915",
      lastUpdated: daysAgoIso(0),
      assignedTo: "Bạn",
      tags: ["tra cứu đơn"],
      previewResponse: "Đơn đang chờ đóng gói, sẽ cập nhật trước 10h.",
    },
    {
      id: "TIC-1003",
      subject: "Góp ý chất lượng",
      priority: "low",
      status: "resolved",
      customerName: "Phạm Quốc Thái",
      lastUpdated: daysAgoIso(2),
      assignedTo: "Hà Linh",
      tags: ["feedback"],
      previewResponse: "Cảm ơn anh đã chia sẻ, chúng tôi đã ghi nhận.",
    },
  ],
  reviewModeration: [
    {
      id: "REV-9001",
      productName: "Áo sơ mi Oxford",
      rating: 5,
      comment: "Chất vải mát, đường may đẹp.",
      status: "visible",
      customerName: "Nguyễn Văn An",
      submittedAt: daysAgoIso(1),
    },
    {
      id: "REV-9002",
      productName: "Áo khoác gió",
      rating: 2,
      comment: "Size hơi nhỏ, muốn đổi size L.",
      status: "pending",
      customerName: "Lê Hà My",
      submittedAt: daysAgoIso(2),
    },
  ],
  profile: {
    id: "STAFF-01",
    name: "Nguyễn Thảo",
    role: "Điều phối vận hành",
    email: "thao.nguyen@company.vn",
    phone: "0902 555 123",
    extension: "#204",
    notifications: {
      email: true,
      app: true,
    },
    permissions: [
      "Quản lý đơn hàng",
      // "Điều chỉnh tồn kho",
      "Trả lời vé hỗ trợ",
      "Chỉnh sửa thông tin sản phẩm cơ bản",
    ],
    preferredShift: "morning" as const,
  },
  productivity: [
    {
      range: "7d",
      ordersHandled: 86,
      ticketsResolved: 38,
      firstResponseSla: "24 phút",
      resolutionSla: "4 giờ 12 phút",
      inventoryAdjustments: 12,
      accuracyScore: 97,
      chart: Array.from({ length: 7 }).map((_, index) => {
        const offset = 6 - index;
        return {
          date: daysAgoIso(offset),
          orders: 8 + Math.round(Math.random() * 6),
          tickets: 3 + Math.round(Math.random() * 3),
          accuracy: 95 + Math.round(Math.random() * 3),
        };
      }),
    },
    {
      range: "14d",
      ordersHandled: 168,
      ticketsResolved: 71,
      firstResponseSla: "27 phút",
      resolutionSla: "4 giờ 45 phút",
      inventoryAdjustments: 26,
      accuracyScore: 96,
      chart: Array.from({ length: 14 }).map((_, index) => {
        const offset = 13 - index;
        return {
          date: daysAgoIso(offset),
          orders: 9 + Math.round(Math.random() * 7),
          tickets: 3 + Math.round(Math.random() * 4),
          accuracy: 94 + Math.round(Math.random() * 4),
        };
      }),
    },
    {
      range: "30d",
      ordersHandled: 358,
      ticketsResolved: 152,
      firstResponseSla: "30 phút",
      resolutionSla: "5 giờ 10 phút",
      inventoryAdjustments: 55,
      accuracyScore: 95,
      chart: Array.from({ length: 30 }).map((_, index) => {
        const offset = 29 - index;
        return {
          date: daysAgoIso(offset),
          orders: 8 + Math.round(Math.random() * 8),
          tickets: 3 + Math.round(Math.random() * 5),
          accuracy: 93 + Math.round(Math.random() * 5),
        };
      }),
    },
  ],
};

export type { OrderStatus };
