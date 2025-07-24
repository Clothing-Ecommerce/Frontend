// pages/ProductsPage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/HeaderProductPage";
import { useProductFiltering } from "@/hooks/useProductFiltering";
import { ProductFilters } from "@/components/products/ProductFilter";
import { ProductToolbar } from "@/components/products/ProductToolbar";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductListItem } from "@/components/products/ProductListItem";
import { NoProductsFound } from "@/components/products/NoProductsFound";
import type { Product, Category, Brand } from "@/types/productType";
import api from "@/utils/axios";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset lỗi trước khi fetch mới

        // Sử dụng instance Axios
        const productsResponse = await api.get("/products/all");

        if (productsResponse.status < 200 || productsResponse.status >= 300) {
          throw new Error(`HTTP error! Status: ${productsResponse.status}`);
        }

        // Dữ liệu từ Axios nằm trong `response.data`
        const rawProducts: Product[] = productsResponse.data;

        setProducts(rawProducts);

        // Fetch Categories
        const categoriesResponse = await api.get("/categories/all");
        if (
          categoriesResponse.status < 200 ||
          categoriesResponse.status >= 300
        ) {
          throw new Error(
            `HTTP error fetching categories! Status: ${categoriesResponse.status}`
          );
        }
        setCategories(categoriesResponse.data);

        // Fetch Brands
        const brandsResponse = await api.get("/brands/all");
        if (brandsResponse.status < 200 || brandsResponse.status >= 300) {
          throw new Error(
            `HTTP error fetching brands! Status: ${brandsResponse.status}`
          );
        }
        setBrands(brandsResponse.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error("Error fetching products:", e);
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // [] đảm bảo effect chỉ chạy một lần khi component mount

  // Truyền `products` (dữ liệu đã fetch) vào hook useProductFiltering
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filteredProducts,
    clearFilters,
  } = useProductFiltering(products); // Truyền `products` vào hook

  // const handleClearFilters = () => {
  //   setSearchQuery("");
  //   setSelectedCategory("All");
  //   setSelectedBrand("All");
  //   setPriceRange([0, 2500000]);
  //   // Nếu bạn muốn refetch sản phẩm gốc sau khi clear filters, bạn có thể gọi fetchProducts() ở đây.
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <ProductFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              clearFilters={clearFilters}
              showFilters={showFilters}
              availableCategories={categories}
              availableBrands={brands}
            />
          </motion.div>

          <div className="flex-1">
            <ProductToolbar
              filteredProductCount={filteredProducts.length}
              totalProductCount={products.length}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              setShowFilters={setShowFilters}
              showFilters={showFilters}
            />

            {loading && (
              <div className="text-center py-8">Đang tải sản phẩm...</div>
            )}
            {error && (
              <div className="text-center py-8 text-red-500">Lỗi: {error}</div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <NoProductsFound onClearFilters={clearFilters} />
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "grid grid-cols-1 gap-6"
                }`}
              >
                {filteredProducts.map((product) =>
                  viewMode === "grid" ? (
                    <ProductCard key={product.productId} product={product} /> // key dùng product_id
                  ) : (
                    <ProductListItem
                      key={product.productId}
                      product={product}
                    /> // key dùng product_id
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
