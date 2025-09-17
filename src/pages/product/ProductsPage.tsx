import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Filter, Grid, List } from "lucide-react";
import api from "@/utils/axios";
import type { BrandOption, CategoryOption, Product } from "@/types/productType";
import type { ProductListResponse } from "@/types/productType";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/utils/formatPrice";
import CategoryTreeFilter from "@/components/products/CategoryTreeFilter";

// ---------- helpers (URL <-> array) ----------
function readInitialCategories(sp: URLSearchParams): string[] {
  // Ưu tiên categories (mảng), fallback category (đơn)
  const multi = sp.getAll("categories").filter(Boolean);
  if (multi.length) return multi.filter((c) => c !== "all");
  const single = sp.get("category");
  return single && single !== "all" ? [single] : [];
}
function writeCategoriesToParams(sp: URLSearchParams, slugs: string[]) {
  sp.delete("category");
  sp.delete("categories");
  for (const s of slugs) sp.append("categories", s);
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ========== Category (MULTI-SELECT) ==========
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    readInitialCategories(searchParams)
  );

  const isAllCategories = selectedCategories.length === 0;

  // ========== Others ==========
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isNew: false,
    isSale: false,
    isBestSeller: false,
  });

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyNextCategories = (next: string[]) => {
    setSelectedCategories(next);
    const p = new URLSearchParams(searchParams);
    if (next.length === 0) {
      p.delete("category");
      p.delete("categories");
    } else {
      p.delete("category");
      p.delete("categories");
      next.forEach((s) => p.append("categories", s));
    }
    setSearchParams(p, { replace: true });
  };

  // Clear toàn bộ category filters
  const clearCategories = () => {
    setSelectedCategories([]);
    const p = new URLSearchParams(searchParams);
    p.delete("category");
    p.delete("categories");
    setSearchParams(p, { replace: true });
  };

  // Sync state khi URL đổi (ví dụ user click link ở Header)
  useEffect(() => {
    const next = readInitialCategories(searchParams);
    if (
      next.length !== selectedCategories.length ||
      next.some((x, i) => x !== selectedCategories[i])
    ) {
      setSelectedCategories(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch categories + brands
  useEffect(() => {
    const fetchCategoriesAndBrands = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get("/categories/"),
          api.get("/brands/"),
        ]);

        const cats: CategoryOption[] = (categoriesRes.data as any[])
          .map((c) => ({
            slug: c.slug,
            name: c.name,
            count: c.count ?? 0,
          }))
          .filter((c) => c.slug !== "all");
        setCategories(cats);

        const raw = brandsRes.data as any[];
        const mapped: BrandOption[] = raw.map((b: any) =>
          typeof b === "string"
            ? { id: b, name: b }
            : { id: String(b.id), name: b.name }
        );
        setBrands([{ id: "all", name: "All Brands" }, ...mapped]);
      } catch (error) {
        console.error("Error fetching categories or brands:", error);
      }
    };
    fetchCategoriesAndBrands();
  }, []);

  // Fetch products khi filters đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = {
          search: searchQuery || undefined,
          brand: selectedBrand !== "all" ? selectedBrand : undefined,
          sortBy:
            sortBy === "price-low"
              ? "priceAsc"
              : sortBy === "price-high"
              ? "priceDesc"
              : "newest",
          isNew: filters.isNew ? "true" : undefined,
          isSale: filters.isSale ? "true" : undefined,
          isBestSeller: filters.isBestSeller ? "true" : undefined,
        };

        if (priceRange[0] > 0) params.minPrice = priceRange[0];
        if (priceRange[1] < 500) params.maxPrice = priceRange[1];

        // Multi-select: gửi mảng categories nếu có chọn
        if (selectedCategories.length > 0) {
          params.categories = selectedCategories; // axios -> categories[]=a&categories[]=b
        }

        const res = await api.get<ProductListResponse>("/products/", {
          params,
        });

        const productsData: Product[] = res.data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: "",
          basePrice: Number(p.effectivePrice),
          categoryId: p.category?.id ?? 0,
          brandId: p.brand?.id ?? null,
          createdAt: "",
          updatedAt: "",
          category: p.category
            ? { id: p.category.id, name: p.category.name }
            : undefined,
          brand: p.brand ? { id: p.brand.id, name: p.brand.name } : undefined,
          images: p.image
            ? [
                {
                  id: p.image.id,
                  productId: p.id,
                  url: p.image.url,
                  alt: p.image.alt ?? null,
                  isPrimary: true,
                  sortOrder: 0,
                },
              ]
            : [],
          variants: [],
        }));
        setProducts(productsData);
        setTotalProducts(res.data.total);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [
    searchQuery,
    selectedCategories,
    selectedBrand,
    priceRange,
    sortBy,
    filters,
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Products</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div
            className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Search Products
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Categories — giữ giao diện cũ (radio All + 2 tree Men/Women) */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={isAllCategories}
                      onChange={() => clearCategories()}
                      className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <label className="ml-2 text-sm text-gray-600 flex-1 flex justify-between">
                      <span>All Categories</span>
                    </label>
                  </div>

                  {/* Men tree */}
                  <div className="rounded-2xl border p-2">
                    <CategoryTreeFilter
                      root="men"
                      selectedSlugs={selectedCategories}
                      onChange={applyNextCategories}
                      depth={3}
                      showCount={true}
                      initialOpenLevels={1}
                    />
                  </div>

                  {/* Women tree */}
                  <div className="rounded-2xl border p-2">
                    <CategoryTreeFilter
                      root="women"
                      selectedSlugs={selectedCategories}
                      onChange={applyNextCategories}
                      depth={3}
                      showCount={true}
                      initialOpenLevels={1}
                    />
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <Label
                  htmlFor="brand"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Brand
                </Label>
                <Select
                  onValueChange={(val) => setSelectedBrand(val)}
                  value={selectedBrand ?? "all"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands
                      .filter((b) => b.id !== "all")
                      .map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([
                        parseInt(e.target.value) || 0,
                        priceRange[1],
                      ])
                    }
                    className="w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        parseInt(e.target.value) || 500,
                      ])
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Special Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Special
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      checked={filters.isNew}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          isNew: Boolean(checked),
                        }))
                      }
                    />
                    <Label htmlFor="isNew" className="text-sm text-gray-600">
                      New Arrivals
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSale"
                      checked={filters.isSale}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          isSale: Boolean(checked),
                        }))
                      }
                    />
                    <Label htmlFor="isSale" className="text-sm text-gray-600">
                      On Sale
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBestSeller"
                      checked={filters.isBestSeller}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          isBestSeller: Boolean(checked),
                        }))
                      }
                    />
                    <Label
                      htmlFor="isBestSeller"
                      className="text-sm text-gray-600"
                    >
                      Best Sellers
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <p className="text-gray-600">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Loading products...</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={
                      viewMode === "grid"
                        ? "bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        : "bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex"
                    }
                  >
                    <div
                      className={
                        viewMode === "grid"
                          ? "relative"
                          : "relative w-48 flex-shrink-0"
                      }
                    >
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.images[0]?.url || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={400}
                          className={
                            viewMode === "grid"
                              ? "w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                              : "w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                          }
                        />
                      </Link>
                      <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className={viewMode === "grid" ? "p-4" : "p-4 flex-1"}>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-amber-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.brand?.name}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.basePrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    clearCategories(); // xoá toàn bộ lựa chọn danh mục + URL
                    setSelectedBrand("all");
                    setPriceRange([0, 500]);
                    setFilters({
                      isNew: false,
                      isSale: false,
                      isBestSeller: false,
                    });
                  }}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
