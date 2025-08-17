// Định nghĩa các kiểu dữ liệu cho các mối quan hệ (nếu bạn include chúng trong API)
export interface Category {
  categoryId: number;
  name: string;
  description: string | null;
  status: "Pending" | "Approved" | "Rejected"; // Sử dụng enum nếu biết trước giá trị
}

export interface Brand {
  brandId: number;
  name: string;
  logoUrl: string | null;
}

export interface Seller {
  userId: number;
  username: string;
  email: string;
}

export interface ColorOption {
  name: string;
  value: string;
}

export interface Specification {
  [key: string]: string;
}

export interface CategoryOption {
  id: string;      // "all" | "<categoryId>"
  name: string;
  count: number;
}

export interface BrandOption {
  brandId: string | number; // "all" | numeric/string id
  name: string;
}

// Định nghĩa interface Product chính xác theo dữ liệu từ backend
export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  isNew: boolean;
  isSale: boolean;

  // isBestSeller: boolean; // sau này triển khai logic sau

  images: string[];
  colors: ColorOption[];
  sizes: string[];
  features: string[];

  specifications: Specification;
  categoryId: number;
  brandId: number;
  sellerId: number;
  createdAt: string;
  updatedAt: string;

  category?: Category;
  brand?: Brand;
  seller?: Seller;
}
