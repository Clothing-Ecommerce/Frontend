import { useState, useEffect, useCallback } from "react";
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
import { Heart, Filter, Grid, List, Loader2 } from "lucide-react";
import axios from "axios";
import api from "@/utils/axios";
import type { BrandOption, Product } from "@/types/productType";
import type { ProductListResponse } from "@/types/productType";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryTreeFilter from "@/components/products/CategoryTreeFilter";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import type {
  WishlistItemsResponse,
  WishlistMutationResponse,
} from "@/types/wishlistType";
import ProductCard from "@/components/products/ProductCard";

// ---------- helpers (URL <-> array) ----------
function readInitialCategories(sp: URLSearchParams): string[] {
  // Ưu tiên categories (mảng), fallback category (đơn)
  const multi = sp.getAll("categories").filter(Boolean);
  if (multi.length) return multi.filter((c) => c !== "all");
  const single = sp.get("category");
  return single && single !== "all" ? [single] : [];
}

function readInitialSearch(sp: URLSearchParams): string {
  return (sp.get("search") ?? "").trim();
}

function readInitialBrand(sp: URLSearchParams): string {
  const brand = sp.get("brand");
  return brand && brand !== "all" ? brand : "all";
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { toasts, toast, removeToast } = useToast();
  const { refreshWishlistCount } = useWishlistCount();

  const [wishlistIds, setWishlistIds] = useState<Set<number>>(() => new Set());
  const [wishlistActionIds, setWishlistActionIds] = useState<Set<number>>(
    () => new Set()
  );

  // ========== Category (MULTI-SELECT) ==========
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    readInitialCategories(searchParams)
  );

  const [searchQuery, setSearchQuery] = useState(() =>
    readInitialSearch(searchParams)
  );

  const [selectedBrand, setSelectedBrand] = useState<string>(() =>
    readInitialBrand(searchParams)
  );

  const isAllCategories = selectedCategories.length === 0;

  // ========== Others ==========
  // const [searchQuery, setSearchQuery] = useState("");
  // const [selectedBrand, setSelectedBrand] = useState<string>("all");
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
    p.delete("search");
    p.delete("category");
    p.delete("categories");
    p.delete("brand");
    setSearchParams(p, { replace: true });
  };

const handleToggleWishlist = useCallback(
  async (productId: number) => {
    if (!isAuthenticated) {
      toast.error(
        "You are not logged in",
        "Please log in to add products to your wishlist."
      );
      return;
    }

    setWishlistActionIds((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });

    const alreadyWishlisted = wishlistIds.has(productId);

    try {
      if (alreadyWishlisted) {
        await api.delete(`/wishlist/${productId}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success(
          "Removed from wishlist",
          "The product has been removed from your wishlist."
        );
      } else {
        await api.post<WishlistMutationResponse>("/wishlist", { productId });
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        toast.success(
          "Added to wishlist",
          "The product has been added to your wishlist."
        );
      }
      void refreshWishlistCount();
    } catch (error) {
      console.error("Failed to toggle wishlist item", error);
      let message = alreadyWishlisted
        ? "Unable to remove the product from the wishlist."
        : "Unable to add the product to the wishlist.";
      if (axios.isAxiosError(error)) {
        const responseMessage = error.response?.data?.message;
        if (typeof responseMessage === "string" && responseMessage.trim()) {
          message = responseMessage;
        }
      }
      toast.error("Action failed", message);
    } finally {
      setWishlistActionIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  },
  [isAuthenticated, refreshWishlistCount, toast, wishlistIds]
);

  // Sync state khi URL đổi (ví dụ user click link ở Header)
  useEffect(() => {
    const next = readInitialCategories(searchParams);
    if (
      next.length !== selectedCategories.length ||
      next.some((x, i) => x !== selectedCategories[i])
    ) {
      setSelectedCategories(next);
    }

    const nextSearch = readInitialSearch(searchParams);
    if (nextSearch !== searchQuery) {
      setSearchQuery(nextSearch);
    }

    const nextBrand = readInitialBrand(searchParams);
    if (nextBrand !== selectedBrand) {
      setSelectedBrand(nextBrand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      setWishlistActionIds(new Set());
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        const res = await api.get<WishlistItemsResponse>("/wishlist");
        if (isCancelled) return;
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        setWishlistIds(new Set(items.map((item) => item.productId)));
      } catch (error) {
        console.error("Failed to fetch wishlist items", error);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const updateBrandParam = (brand: string) => {
    setSelectedBrand(brand);
    const p = new URLSearchParams(searchParams);
    if (!brand || brand === "all") {
      p.delete("brand");
    } else {
      p.set("brand", brand);
    }
    setSearchParams(p, { replace: true });
  };

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const raw = (await api.get("/brands/")).data as any[];
        const mapped: BrandOption[] = raw.map((b: any) =>
          typeof b === "string"
            ? { id: b, name: b }
            : { id: String(b.id), name: b.name }
        );
        setBrands([{ id: "all", name: "All Brands" }, ...mapped]);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
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
          inStock: Boolean(p.inStock),
          totalStock: typeof p.totalStock === "number" ? p.totalStock : 0,
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white/70 backdrop-blur px-4 py-3 border-b border-amber-100">
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
            <div className="bg-white/90 backdrop-blur border border-amber-100 rounded-2xl p-6 shadow-sm sticky top-4">
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
                  <div className="rounded-2xl border border-amber-100 p-2 bg-white/60">
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
                  <div className="rounded-2xl border border-amber-100 p-2 bg-white/60">
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
                  onValueChange={(val) => updateBrandParam(val)}
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

                <div className="flex border border-amber-200 rounded-md overflow-hidden bg-white/80">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none border-l border-amber-200"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <div className="text-center py-12 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />
                Loading products...
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product) => {
                  const isProductWishlisted = wishlistIds.has(product.id);
                  const isWishlistProcessing = wishlistActionIds.has(
                    product.id
                  );
                  const productImage =
                    product.images[0]?.url ?? "/placeholder.svg";
                  const productAlt = product.images[0]?.alt ?? product.name;
                  const brandName = product.brand?.name ?? "";
                  const isInStock =
                    product.inStock ?? ((product.totalStock ?? 0) > 0);

                  if (viewMode === "grid") {
                    return (
                      <ProductCard
                        key={product.id}
                        viewMode="grid"
                        product={{
                          id: product.id,
                          name: product.name,
                          brandName,
                          price: product.basePrice,
                          imageUrl: productImage,
                          imageAlt: productAlt,
                          inStock: isInStock,
                        }}
                        to={`/products/${product.id}`}
                        overlays={{
                          topRight: (
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm ring-1 ring-black/5 transition hover:bg-red-50 hover:text-red-500"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void handleToggleWishlist(product.id);
                              }}
                              disabled={isWishlistProcessing}
                              aria-pressed={isProductWishlisted}
                              aria-label={
                                isProductWishlisted
                                  ? "Remove wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {isWishlistProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Heart
                                  className={`w-4 h-4 ${
                                    isProductWishlisted
                                      ? "fill-current text-red-500"
                                      : "text-gray-600"
                                  }`}
                                />
                              )}
                            </button>
                          ),
                        }}
                      />
                    );
                  }

                  return (
                    <ProductCard
                      key={product.id}
                      viewMode="list"
                      product={{
                        id: product.id,
                        name: product.name,
                        brandName,
                        price: product.basePrice,
                        imageUrl: productImage,
                        imageAlt: productAlt,
                        inStock: isInStock,
                        description: product.description,
                      }}
                      to={`/products/${product.id}`}
                      overlays={{
                        topRight: (
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm ring-1 ring-black/5 transition hover:bg-red-50 hover:text-red-500"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleToggleWishlist(product.id);
                            }}
                            disabled={isWishlistProcessing}
                            aria-pressed={isProductWishlisted}
                            aria-label={
                              isProductWishlisted
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                          >
                            {isWishlistProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart
                                className={`w-4 h-4 ${
                                  isProductWishlisted
                                    ? "fill-current text-red-500"
                                    : "text-gray-600"
                                }`}
                              />
                            )}
                          </button>
                        ),
                      }}
                    />
                  );
                })}
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

      <ToastContainer
        toasts={toasts.map((item) => ({ ...item, onClose: removeToast }))}
        onClose={removeToast}
      />
    </div>
  );
}
