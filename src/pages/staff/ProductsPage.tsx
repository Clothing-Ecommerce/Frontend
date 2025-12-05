import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  Package,
  Boxes,
  RefreshCw,
  AlertTriangle,
  Tag,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

// --- 1. ĐỊNH NGHĨA TYPES (Giữ nguyên cấu trúc chuẩn bị cho API sau này) ---
interface ProductVariant {
  id: number;
  sku: string | null;
  price: number | null;
  stock: number;
  isActive: boolean;
  size?: { name: string };
  color?: { name: string; hex: string };
}

interface ProductDetail {
  id: number;
  name: string;
  category?: { name: string };
  basePrice: number;
  totalStock: number;
  variants: ProductVariant[];
  images?: { url: string }[];
}

interface StaffOutletContext {
  formatCurrency: (value: number) => string;
  showToast: (props: any) => void;
}

// --- 2. DỮ LIỆU GIẢ (MOCK DATA) ---
const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: 101,
    name: "Áo Thun Cotton Basic - Form Rộng",
    category: { name: "Áo Nam" },
    basePrice: 150000,
    totalStock: 85,
    images: [], // Để trống để test icon mặc định
    variants: [
      { id: 1, sku: "AT-01-W-S", price: 150000, stock: 20, isActive: true, size: { name: "S" }, color: { name: "Trắng", hex: "#FFFFFF" } },
      { id: 2, sku: "AT-01-W-M", price: 150000, stock: 45, isActive: true, size: { name: "M" }, color: { name: "Trắng", hex: "#FFFFFF" } },
      { id: 3, sku: "AT-01-B-S", price: 160000, stock: 5, isActive: true, size: { name: "S" }, color: { name: "Đen", hex: "#000000" } }, // Sắp hết
      { id: 4, sku: "AT-01-B-M", price: 160000, stock: 15, isActive: true, size: { name: "M" }, color: { name: "Đen", hex: "#000000" } },
    ]
  },
  {
    id: 102,
    name: "Quần Jeans Slim Fit Rách Gối",
    category: { name: "Quần Nam" },
    basePrice: 450000,
    totalStock: 8, // Tổng thấp -> Cảnh báo vàng
    images: [{ url: "https://placehold.co/100x100/png?text=Jeans" }],
    variants: [
      { id: 5, sku: "QJ-02-29", price: 450000, stock: 0, isActive: true, size: { name: "29" }, color: { name: "Xanh Nhạt", hex: "#87CEEB" } }, // Hết hàng
      { id: 6, sku: "QJ-02-30", price: 450000, stock: 3, isActive: true, size: { name: "30" }, color: { name: "Xanh Nhạt", hex: "#87CEEB" } },
      { id: 7, sku: "QJ-02-31", price: 450000, stock: 5, isActive: true, size: { name: "31" }, color: { name: "Xanh Nhạt", hex: "#87CEEB" } },
    ]
  },
  {
    id: 103,
    name: "Áo Khoác Bomber Kaki - Limited",
    category: { name: "Áo Khoác" },
    basePrice: 650000,
    totalStock: 0, // Hết hàng toàn bộ -> Cảnh báo đỏ
    images: [{ url: "https://placehold.co/100x100/png?text=Jacket" }],
    variants: [
      { id: 8, sku: "JK-03-L", price: 650000, stock: 0, isActive: false, size: { name: "L" }, color: { name: "Rêu", hex: "#556B2F" } },
      { id: 9, sku: "JK-03-XL", price: 650000, stock: 0, isActive: false, size: { name: "XL" }, color: { name: "Rêu", hex: "#556B2F" } },
    ]
  },
  {
    id: 104,
    name: "Sơ Mi Oxford Cổ Trụ",
    category: { name: "Sơ Mi" },
    basePrice: 320000,
    totalStock: 120,
    images: [{ url: "https://placehold.co/100x100/png?text=Shirt" }],
    variants: [
      { id: 10, sku: "SM-04-L", price: 320000, stock: 60, isActive: true, size: { name: "L" }, color: { name: "Xanh Biển", hex: "#4682B4" } },
      { id: 11, sku: "SM-04-XL", price: 320000, stock: 60, isActive: true, size: { name: "XL" }, color: { name: "Xanh Biển", hex: "#4682B4" } },
    ]
  }
];

export default function StaffProductsPage() {
  const { formatCurrency, showToast } = useOutletContext<StaffOutletContext>();

  // --- STATE ---
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // --- ACTIONS (MOCK IMPLEMENTATION) ---

  // 1. Fetch danh sách (Giả lập)
  const fetchProducts = async () => {
    setIsLoadingList(true);
    // Giả lập delay mạng 0.5s để test Loading UI
    setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setIsLoadingList(false);
      
      // Tự động chọn sản phẩm đầu tiên nếu chưa chọn (UX tốt hơn)
      // if (MOCK_PRODUCTS.length > 0 && !selectedProductId) {
      //   handleSelectProduct(MOCK_PRODUCTS[0].id);
      // }
    }, 500); 
  };

  // 2. Fetch chi tiết (Giả lập)
  const fetchProductDetail = async (id: number) => {
    setIsLoadingDetail(true);
    // Giả lập delay mạng 0.3s
    setTimeout(() => {
      const found = MOCK_PRODUCTS.find(p => p.id === id);
      if (found) {
        setSelectedProduct(found);
      } else {
        showToast({ title: "Lỗi", description: "Không tìm thấy sản phẩm", type: "error" });
      }
      setIsLoadingDetail(false);
    }, 300);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectProduct = (id: number) => {
    if (selectedProductId === id) return;
    setSelectedProductId(id);
    fetchProductDetail(id);
  };

  // --- HELPER: Tính toán màu sắc hiển thị ---
  
  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "bg-red-500";
    if (stock < 10) return "bg-yellow-500";
    return "bg-[#1f1b16]"; // Màu đen brand
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive"; // Đỏ
    if (stock < 10) return "secondary"; // Xám/Vàng nhẹ
    return "outline"; // Viền thường
  };

  // --- FILTERING LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Logic
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toString().includes(searchTerm);
      
      // 2. Filter Stock Logic
      let matchFilter = true;
      if (stockFilter === "out") matchFilter = (p.totalStock === 0);
      if (stockFilter === "low") matchFilter = (p.totalStock > 0 && p.totalStock < 10);

      return matchSearch && matchFilter;
    });
  }, [products, searchTerm, stockFilter]);

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* HEADER: Tiêu đề & Bộ lọc nhanh */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Inventory</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#1f1b16]">Kho hàng & Sản phẩm</h2>
            <Button variant="ghost" size="icon" onClick={fetchProducts} disabled={isLoadingList} title="Làm mới">
              <RefreshCw className={cn("h-4 w-4", isLoadingList && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        {/* Quick Filter Buttons */}
        <div className="flex gap-2">
          <Button 
            variant={stockFilter === "all" ? "default" : "outline"} size="sm" 
            className={cn("rounded-full", stockFilter === "all" && "bg-[#1f1b16]")}
            onClick={() => setStockFilter("all")}
          >
            Tất cả
          </Button>
          <Button 
            variant={stockFilter === "low" ? "default" : "outline"} size="sm" 
            className={cn("rounded-full border-yellow-200 hover:bg-yellow-50", stockFilter === "low" && "bg-yellow-500 text-white border-transparent hover:bg-yellow-600")}
            onClick={() => setStockFilter("low")}
          >
            Sắp hết
          </Button>
          <Button 
            variant={stockFilter === "out" ? "default" : "outline"} size="sm" 
            className={cn("rounded-full border-red-200 hover:bg-red-50", stockFilter === "out" && "bg-red-500 text-white border-transparent hover:bg-red-600")}
            onClick={() => setStockFilter("out")}
          >
            Hết hàng
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT: Split View */}
      <div className="grid gap-6 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px] flex-1 min-h-0">
        
        {/* LEFT: PRODUCT LIST */}
        <Card className="flex flex-col border-none shadow-sm h-full overflow-hidden bg-white">
          <CardHeader className="py-4 border-b border-[#f0e4cc]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#c87d2f]" />
              <Input 
                placeholder="Tìm tên sản phẩm, mã SKU..." 
                className="pl-9 border-[#ead7b9] bg-[#fdfbf7] focus-visible:ring-[#c87d2f]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs text-[#7a6f60] flex justify-between px-1 mt-2">
              <span>Hiển thị <strong>{filteredProducts.length}</strong> dòng sản phẩm</span>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-auto flex-1 relative">
            {isLoadingList ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                <LoadingSpinner />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-[#9a8f7f]">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0e4cc]">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductId === product.id;
                  const stock = product.totalStock || 0; 

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-[#fcf9f4]",
                        isSelected ? "bg-[#f7efe1] border-l-4 border-l-[#c87d2f]" : "border-l-4 border-l-transparent"
                      )}
                    >
                      {/* Ảnh Thumbnail */}
                      <div className="h-14 w-14 rounded-lg bg-[#f4f1ea] border border-[#e6decb] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-[#d1c4a7]" />
                        )}
                      </div>

                      {/* Thông tin chính */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm font-medium truncate pr-2", isSelected ? "text-[#c87d2f]" : "text-[#1f1b16]")}>
                            {product.name}
                          </h4>
                          {/* Badge Tồn kho Summary */}
                          <Badge variant={getStockBadgeVariant(stock)} className="ml-auto flex-shrink-0">
                            Kho: {stock}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6c6252]">
                          <span>#{product.id}</span>
                          <span className="w-1 h-1 rounded-full bg-[#d1c4a7]" />
                          <span>{product.category?.name || "Chưa phân loại"}</span>
                          <span className="w-1 h-1 rounded-full bg-[#d1c4a7]" />
                          <span className="font-medium text-[#1f1b16]">{formatCurrency(Number(product.basePrice))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: DETAIL & VARIANTS INVENTORY */}
        <div className="h-full flex flex-col min-h-0">
          {selectedProduct ? (
            <Card className="flex flex-col border-[#ead7b9] bg-[#fdfbf7] shadow-lg h-full overflow-hidden relative">
              {isLoadingDetail && (
                <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}

              {/* Detail Header */}
              <div className="p-6 border-b border-[#f0e4cc] bg-white/50 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#1f1b16] leading-tight">{selectedProduct.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="border-[#b8a47a] text-[#8b7e66]">
                        <Tag className="w-3 h-3 mr-1" /> {selectedProduct.category?.name}
                      </Badge>
                      <Badge variant="outline" className="border-[#b8a47a] text-[#8b7e66]">
                        SKU Gốc: #{selectedProduct.id}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#9a8f7f] uppercase tracking-wider mb-1">Giá bán cơ bản</p>
                    <p className="text-lg font-bold text-[#c87d2f]">{formatCurrency(Number(selectedProduct.basePrice))}</p>
                  </div>
                </div>
              </div>

              {/* Variant Stock Grid - ĐIỂM NHẤN CHÍNH */}
              <div className="flex-1 overflow-y-auto p-6">
                <h4 className="font-semibold text-[#1f1b16] mb-4 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#c87d2f]" /> 
                  Chi tiết tồn kho biến thể
                </h4>

                {(!selectedProduct.variants || selectedProduct.variants.length === 0) ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Sản phẩm này chưa có biến thể nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProduct.variants.map((variant) => {
                      // Logic tính % progress bar: Lấy stock / 100 (hoặc max stock của sản phẩm)
                      const maxStockReference = Math.max(50, selectedProduct.totalStock || 50); 
                      const progressValue = Math.min((variant.stock / maxStockReference) * 100, 100);
                      const statusColor = getStockStatusColor(variant.stock);

                      return (
                        <div key={variant.id} className="bg-white border border-[#f0e4cc] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            {/* Cột trái: Thông tin biến thể */}
                            <div className="flex items-center gap-3">
                              {/* Ô màu */}
                              <div 
                                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" 
                                style={{ backgroundColor: variant.color?.hex || "#eee" }} 
                                title={variant.color?.name}
                              />
                              <div>
                                <p className="font-bold text-[#1f1b16] text-sm">
                                  {variant.size?.name || "Free"} - {variant.color?.name || "Mặc định"}
                                </p>
                                <p className="text-xs text-[#9a8f7f] font-mono">
                                  SKU: {variant.sku || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Cột phải: Con số tồn kho */}
                            <div className="text-right">
                              <span className={cn(
                                "text-lg font-bold", 
                                variant.stock === 0 ? "text-red-500" : "text-[#1f1b16]"
                              )}>
                                {variant.stock}
                              </span>
                              <span className="text-xs text-[#9a8f7f] ml-1">sp</span>
                            </div>
                          </div>

                          {/* Progress Bar trực quan */}
                          <div className="w-full h-1.5 bg-[#f4f1ea] rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500", statusColor)} 
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                          
                          {/* Footer nhỏ của card variant */}
                          <div className="flex justify-between items-center mt-2 text-[10px] text-[#9a8f7f]">
                            <span>Giá: {formatCurrency(Number(variant.price || selectedProduct.basePrice))}</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-medium",
                              variant.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            )}>
                              {variant.isActive ? "Đang bán" : "Ngừng bán"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#9a8f7f] border-2 border-dashed border-[#ead7b9] rounded-xl bg-[#fdfbf7]/50">
              <Layers className="h-16 w-16 mb-4 opacity-20 text-[#c87d2f]" />
              <p className="font-medium">Chọn một sản phẩm để xem tồn kho</p>
              <p className="text-sm mt-1 opacity-70">Dữ liệu biến thể sẽ hiển thị chi tiết tại đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}