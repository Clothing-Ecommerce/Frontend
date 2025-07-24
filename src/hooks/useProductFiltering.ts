// hooks/useProductFiltering.ts
import { useState, useMemo } from "react";
import type { Product } from "@/types/productType"; // Import kiểu Product

// Chỉnh sửa hook để nhận products làm tham số
export const useProductFiltering = (products: Product[]) => { // Nhận products ở đây
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500000]);
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    let currentProducts = [...products]; // Sử dụng products được truyền vào

    // Apply search filter
    if (searchQuery) {
      currentProducts = currentProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      // Đảm bảo rằng bạn đang so sánh với `product.category?.name`
      currentProducts = currentProducts.filter(
        (product) => product.category?.name === selectedCategory
      );
    }

    // Apply brand filter
    if (selectedBrand !== "All") {
      // Đảm bảo rằng bạn đang so sánh với `product.brand?.name`
      currentProducts = currentProducts.filter(
        (product) => product.brand?.name === selectedBrand
      );
    }

    // Apply price range filter
    currentProducts = currentProducts.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        currentProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        currentProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        // `rating` là trường giả định, đảm bảo nó có giá trị khi so sánh
        currentProducts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "newest":
        // Sort by createdAt (most recent first)
        currentProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "featured":
      default:
        // No specific sort, keep original or define a default featured logic
        break;
    }

    return currentProducts;
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]); // Thêm 'products' vào dependency array

  // clearFilters ở đây chỉ reset các state trong hook, không trigger lại fetch API.
  // Hàm handleClearFilters trong ProductsPage sẽ quản lý việc này.
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPriceRange([0, 2500000]);
  };

  return {
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
    clearFilters, // Vẫn export để dùng nếu cần
  };
};