// Định nghĩa các kiểu dữ liệu cho các mối quan hệ (nếu bạn include chúng trong API)
export interface Category {
  category_id: number;
  name: string;
  description: string | null;
  status: 'Pending' | 'Approved' | 'Rejected'; // Sử dụng enum nếu biết trước giá trị
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

// Định nghĩa interface Product chính xác theo dữ liệu từ backend
export interface Product {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: number;
  seller_id: number;
  brand_id: number | null;
  created_at: string; // ISO 8601 string từ DateTime của Prisma
  updated_at: string; // ISO 8601 string từ DateTime của Prisma

  // Các mối quan hệ đã được include trong ProductService
  category?: Category; // Đặt optional nếu có thể null hoặc không luôn được include
  brand?: Brand;       // Đặt optional nếu có thể null hoặc không luôn được include
  seller?: Seller;     // Đặt optional nếu có thể null hoặc không luôn được include

  // // Các trường cũ từ data/products.ts mà bạn cần giữ lại cho các component frontend hiện tại
  // // hoặc bạn sẽ phải thay đổi các component để sử dụng trường từ API trực tiếp
  id: number; // Ánh xạ từ product_id
  image: string; // Ánh xạ từ image_url
  rating: number; // Có thể cần tính toán ở backend hoặc frontend
  reviews: number; // Có thể cần tính toán ở backend hoặc frontend
  isNew: boolean; // Có thể tính toán ở frontend dựa vào created_at
  isSale: boolean; // Có thể cần logic riêng
  originalPrice: number | null; // Cần thêm logic hoặc trường này vào backend nếu muốn hiển thị
}