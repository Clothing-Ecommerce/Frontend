// Định nghĩa các kiểu dữ liệu cho các mối quan hệ (nếu bạn include chúng trong API)
export interface Category {
  category_id: number;
  name: string;
  description: string | null;
  status: "Pending" | "Approved" | "Rejected"; // Sử dụng enum nếu biết trước giá trị
}

export interface Brand {
  brand_id: number;
  name: string;
  logo_url: string | null;
}

export interface Seller {
  user_id: number;
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
