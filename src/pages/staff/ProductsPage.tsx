import { useEffect, useRef, useState } from "react";
import axios from "axios"
import { useOutletContext } from "react-router-dom";
import { Search, Package, Boxes, RefreshCw, AlertTriangle, Tag, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import api from "@/utils/axios"
import type {
  AdminProductDetail,
  AdminProductListItem,
  AdminProductListResponse,
  AdminProductStockStatus,
} from "@/types/adminType"
import type { StaffOutletContext } from "./StaffLayout"

export default function StaffProductsPage() {
  const { formatCurrency, showToast } = useOutletContext<StaffOutletContext>();

  // --- STATE ---
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductDetail | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const detailAbortRef = useRef<AbortController | null>(null);

  const mapStockFilterToStatus = (
    filter: "all" | "low" | "out",
  ): AdminProductStockStatus | undefined => {
    if (filter === "low") return "low-stock";
    if (filter === "out") return "out-of-stock";
    return undefined;
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  const fetchProductDetail = async (id: number) => {
    if (!id) return;
    detailAbortRef.current?.abort();

    const controller = new AbortController();
    detailAbortRef.current = controller;

    setIsLoadingDetail(true);

    try {
      const response = await api.get<AdminProductDetail>(`/admin/products/${id}`, {
        signal: controller.signal,
      });
      setSelectedProduct(response.data);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Failed to load product detail", error);
      setSelectedProduct(null);
      showToast({
        title: "Error",
        description:
          (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Unable to load product details",
        type: "error",
      });
    } finally {
      setIsLoadingDetail(false);
      if (detailAbortRef.current === controller) {
        detailAbortRef.current = null;
      }
    }
  };

  const fetchProducts = async (signal?: AbortSignal) => {
    setIsLoadingList(true);

    try {
      const response = await api.get<AdminProductListResponse>("/admin/products", {
        params: {
          page: 1,
          pageSize: 50,
          search: debouncedSearch || undefined,
          status: mapStockFilterToStatus(stockFilter),
        },
        signal,
      });

      const items = response.data.products;
      setProducts(items);

      if (!items.length) {
        setSelectedProduct(null);
        setSelectedProductId(null);
        return;
      }

      // Auto-select the first item if none selected or previous selection no longer exists
      if (!selectedProductId || !items.some((item) => item.id === selectedProductId)) {
        const firstId = items[0].id;
        setSelectedProductId(firstId);
        fetchProductDetail(firstId);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Failed to load product list", error);
      setProducts([]);
      showToast({
        title: "Error",
        description:
          (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Unable to load product list",
        type: "error",
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [debouncedSearch, stockFilter, selectedProductId]);

  const handleSelectProduct = (id: number) => {
    if (selectedProductId === id) return;
    setSelectedProductId(id);
    fetchProductDetail(id);
  };

  useEffect(() => {
    return () => {
      detailAbortRef.current?.abort();
    };
  }, []);

  // --- HELPER: Calculate display colors ---

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "bg-red-500";
    if (stock < 10) return "bg-yellow-500";
    return "bg-[#1f1b16]"; // Brand black color
  };

  const getStockBadgeVariant = (status: AdminProductStockStatus) => {
    if (status === "out-of-stock") return "destructive"; // Red
    if (status === "low-stock") return "secondary"; // Light gray/yellow
    return "outline"; // Default border
  };

  const filteredProducts = products;

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* HEADER: Title & Quick filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b8a47a]">Inventory</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#1f1b16]">Inventory & Products</h2>
            <Button variant="ghost" size="icon" onClick={() => fetchProducts()} disabled={isLoadingList} title="Refresh">
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
            All
          </Button>
          <Button 
            variant={stockFilter === "low" ? "default" : "outline"} size="sm" 
            className={cn("rounded-full border-yellow-200 hover:bg-yellow-50", stockFilter === "low" && "bg-yellow-500 text-white border-transparent hover:bg-yellow-600")}
            onClick={() => setStockFilter("low")}
          >
            Low stock
          </Button>
          <Button 
            variant={stockFilter === "out" ? "default" : "outline"} size="sm" 
            className={cn("rounded-full border-red-200 hover:bg-red-50", stockFilter === "out" && "bg-red-500 text-white border-transparent hover:bg-red-600")}
            onClick={() => setStockFilter("out")}
          >
            Out of stock
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
                placeholder="Search by product name, SKU..." 
                className="pl-9 border-[#ead7b9] bg-[#fdfbf7] focus-visible:ring-[#c87d2f]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs text-[#7a6f60] flex justify-between px-1 mt-2">
              <span>Showing <strong>{filteredProducts.length}</strong> product rows</span>
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
                <p>No products found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f0e4cc]">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductId === product.id;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-[#fcf9f4]",
                        isSelected ? "bg-[#f7efe1] border-l-4 border-l-[#c87d2f]" : "border-l-4 border-l-transparent"
                      )}
                    >
                      {/* Thumbnail image */}
                      <div className="h-14 w-14 rounded-lg bg-[#f4f1ea] border border-[#e6decb] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-[#d1c4a7]" />
                        )}
                      </div>

                      {/* Main information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm font-medium truncate pr-2", isSelected ? "text-[#c87d2f]" : "text-[#1f1b16]")}>
                            {product.name}
                          </h4>
                          {/* Stock summary badge */}
                          <Badge variant={getStockBadgeVariant(product.stockStatus)} className="ml-auto flex-shrink-0">
                            Stock: {product.totalStock}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6c6252]">
                          <span>#{product.id}</span>
                          <span className="w-1 h-1 rounded-full bg-[#d1c4a7]" />
                          <span>{product.category?.name || "Uncategorized"}</span>
                          <span className="w-1 h-1 rounded-full bg-[#d1c4a7]" />
                          <span className="font-medium text-[#1f1b16]">{formatCurrency(Number(product.price))}</span>
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
                        Base SKU: #{selectedProduct.id}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#9a8f7f] uppercase tracking-wider mb-1">Base selling price</p>
                    <p className="text-lg font-bold text-[#c87d2f]">{formatCurrency(Number(selectedProduct.basePrice))}</p>
                  </div>
                </div>
              </div>

              {/* Variant Stock Grid - MAIN HIGHLIGHT */}
              <div className="flex-1 overflow-y-auto p-6">
                <h4 className="font-semibold text-[#1f1b16] mb-4 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#c87d2f]" /> 
                  Variant inventory details
                </h4>

                {(!selectedProduct.variants || selectedProduct.variants.length === 0) ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> This product has no variants yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProduct.variants.map((variant) => {
                      // Progress bar percentage logic: Use stock / 100 (or product's max stock)
                      const maxStockReference = Math.max(50, selectedProduct.totalStock || 50); 
                      const progressValue = Math.min((variant.stock / maxStockReference) * 100, 100);
                      const statusColor = getStockStatusColor(variant.stock);

                      return (
                        <div key={variant.id} className="bg-white border border-[#f0e4cc] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            {/* Left column: Variant information */}
                            <div className="flex items-center gap-3">
                              {/* Color swatch */}
                              <div
                                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: variant.colorHex || "#eee" }}
                                title={variant.colorName ?? undefined}
                              />
                              <div>
                                <p className="font-bold text-[#1f1b16] text-sm">
                                  {variant.sizeName || "Free"} - {variant.colorName || "Default"}
                                </p>
                                <p className="text-xs text-[#9a8f7f] font-mono">
                                  SKU: {variant.sku || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Right column: Inventory number */}
                            <div className="text-right">
                              <span className={cn(
                                "text-lg font-bold", 
                                variant.stock === 0 ? "text-red-500" : "text-[#1f1b16]"
                              )}>
                                {variant.stock}
                              </span>
                              <span className="text-xs text-[#9a8f7f] ml-1">pcs</span>
                            </div>
                          </div>

                          {/* Visual progress bar */}
                          <div className="w-full h-1.5 bg-[#f4f1ea] rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-500", statusColor)} 
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                          
                          {/* Small footer for variant card */}
                          <div className="flex justify-between items-center mt-2 text-[10px] text-[#9a8f7f]">
                            <span>Price: {formatCurrency(Number(variant.price ?? selectedProduct.basePrice))}</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-medium",
                              variant.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            )}>
                              {variant.isActive ? "On sale" : "Stopped selling"}
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
              <p className="font-medium">Select a product to view inventory</p>
              <p className="text-sm mt-1 opacity-70">Variant data will be displayed in detail here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
