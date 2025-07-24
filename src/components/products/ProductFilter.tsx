// components/products/ProductFilter.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
// import { categories, brands } from "@/data/products"; // Xóa bỏ dòng này
import { formatPrice } from "@/utils/formatPrice";

// Import các kiểu dữ liệu Category và Brand nếu cần
import type { Category, Brand } from "@/types/productType";


interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  clearFilters: () => void;
  showFilters: boolean;
  // Thêm props cho categories và brands
  availableCategories: Category[]; // Danh sách categories từ API
  availableBrands: Brand[];       // Danh sách brands từ API
}

export function ProductFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  clearFilters,
  // showFilters,
  availableCategories, // Nhận qua props
  availableBrands,     // Nhận qua props
}: ProductFiltersProps) {
  return (
    <Card className="sticky top-24 rounded-lg shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
              Search
            </label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Category
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox
                  id="AllCategories"
                  checked={selectedCategory === "All"}
                  onCheckedChange={() => setSelectedCategory("All")}
                  className="mr-2"
                />
                <label
                  htmlFor="AllCategories"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  All
                </label>
              </div>
              {availableCategories.map((category) => ( // Sử dụng availableCategories
                <div key={category.category_id} className="flex items-center">
                  <Checkbox
                    id={category.name}
                    checked={selectedCategory === category.name}
                    onCheckedChange={() => setSelectedCategory(category.name)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={category.name}
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Brand
            </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem> {/* Thêm option "All" */}
                {availableBrands.map((brand) => ( // Sử dụng availableBrands
                  <SelectItem key={brand.brand_id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Price Range: {formatPrice(priceRange[0])} -{" "}
              {formatPrice(priceRange[1])}
            </label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={2500000} // Cần thay đổi max này nếu có sản phẩm giá cao hơn
              min={0}
              step={50000}
              className="mt-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}