import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User,
  ChevronDown,
  Phone,
  Search,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Input } from "../ui/input";
import api from "@/utils/axios";
import { useCartCount } from "@/hooks/useCartCount";
import { useWishlistCount } from "@/hooks/useWishlistCount";

type HeaderProps = {
  cartCount?: number; // fallback khi chưa fetch kịp
  wishlistCount?: number; // fallback khi chưa fetch kịp
};


export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  children: CategoryNode[];
};

type SuggestProduct = {
  id: number;
  name: string;
  imageUrl?: string | null;
  price?: number | null;
  slug?: string | null;
};

type SuggestCategory = {
  id: number;
  name: string;
  slug: string;
};

type SuggestResponse = {
  products: SuggestProduct[];
  categories: SuggestCategory[];
};

/** ====== small debounce hook ====== */
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Header({
  cartCount: cartCountFallback = 0,
  wishlistCount: wishlistCountFallback = 0,
}: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  // ==== Counts =====
  const { quantity: cartQty, refreshCartCount, setCartQuantity } = useCartCount();

  const {
    count: wishlistCount,
    refreshWishlistCount,
    setWishlistCount,
  } = useWishlistCount();

  // ==== Categories (MEN/WOMEN) =====
  const [menTree, setMenTree] = useState<CategoryNode | null>(null);
  const [womenTree, setWomenTree] = useState<CategoryNode | null>(null);
  const [loadingTrees, setLoadingTrees] = useState(false);

  // ==== Search / Suggest =====
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [suggest, setSuggest] = useState<SuggestResponse | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestRef = useRef<HTMLDivElement | null>(null);

  // Hide suggest on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!suggestRef.current) return;
      if (!suggestRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /** ====== Effects: fetch counts ====== */
  useEffect(() => {
    setCartQuantity(cartCountFallback);
  }, [cartCountFallback, setCartQuantity]);

  useEffect(() => {
    setWishlistCount(wishlistCountFallback);
  }, [setWishlistCount, wishlistCountFallback]);

  useEffect(() => {
    if (isAuthenticated) {
      void Promise.all([refreshCartCount(), refreshWishlistCount()]);
    } else {
      setCartQuantity(0);
      setWishlistCount(0);
    }
  }, [
    isAuthenticated,
    refreshCartCount,
    refreshWishlistCount,
    setCartQuantity,
    setWishlistCount,
  ]);

  /** ====== Effects: fetch category trees ====== */
  useEffect(() => {
    setLoadingTrees(true);
    Promise.allSettled([
      api.get<CategoryNode>("/categories/tree", { params: { root: "men" } }),
      api.get<CategoryNode>("/categories/tree", { params: { root: "women" } }),
    ])
      .then(([menRes, womenRes]) => {
        if (menRes.status === "fulfilled") setMenTree(menRes.value.data);
        if (womenRes.status === "fulfilled") setWomenTree(womenRes.value.data);
      })
      .finally(() => setLoadingTrees(false));
  }, []);

  /** ====== Effects: search suggest (debounced) ====== */
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSuggest(null);
      setShowSuggest(false);
      return;
    }
    (async () => {
      try {
        const res = await api.get<SuggestResponse>("/products/suggest", {
          params: { q },
        });
        setSuggest(res.data);
        setShowSuggest(true);
      } catch {
        setSuggest(null);
        setShowSuggest(false);
      }
    })();
  }, [debouncedQuery]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out", "You have been successfully logged out");
    setIsAccountDropdownOpen(false);
  };

  const accountName = useMemo(() => {
    const rawName = user?.username ?? "";
    const trimmed = rawName.trim();
    return trimmed.length > 0 ? trimmed : "Tài khoản";
  }, [user?.username]);

  const accountInitial = useMemo(() => {
    return accountName.charAt(0).toUpperCase() || "T";
  }, [accountName]);

  const avatarUrl = user?.avatar && user.avatar.trim().length > 0
    ? user.avatar
    : null;

  const managementPath = useMemo(() => {
    const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";
    if (role === "admin") return "/admin/reports";
    if (role === "staff") return "/staff/dashboard";
    return null;
  }, [user?.role]);

  const handleNavigateToManagement = () => {
    if (!managementPath) return;
    navigate(managementPath);
    setIsAccountDropdownOpen(false);
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // Chuyển hướng sang trang listing, BE đọc param `search`
    // navigate(`/products/all?search=${encodeURIComponent(q)}`);
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setShowSuggest(false);
  };

  /** ====== Helpers: flatten category nodes to menu items ====== */
  function toMenuTiles(
    root: CategoryNode | null
  ): { name: string; slug: string }[] {
    if (!root) return [];
    // Ưu tiên hiển thị các "con" của root. Nếu con đó lại có children, ưu tiên children.
    // Lấy tối đa ~8 ô như UI gốc.
    const tiles: { name: string; slug: string }[] = [];
    root.children.forEach((child) => {
      if (child.children && child.children.length > 0) {
        child.children.forEach((n) => {
          if (n.slug) tiles.push({ name: n.name, slug: n.slug });
        });
      } else if (child.slug) {
        tiles.push({ name: child.name, slug: child.slug });
      }
    });
    return tiles.slice(0, 8);
  }

  const menTiles = useMemo(() => toMenuTiles(menTree), [menTree]);
  const womenTiles = useMemo(() => toMenuTiles(womenTree), [womenTree]);

  return (
    <div>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>(123) 456 7890</span>
          </div>
          <div className="flex items-center gap-3" />
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <div
                  className="flex items-center gap-2 text-white text-sm cursor-pointer hover:text-yellow-200 transition-colors"
                  onClick={() =>
                    setIsAccountDropdownOpen(!isAccountDropdownOpen)
                  }
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={accountName}
                      className="w-7 h-7 rounded-full object-cover border border-white/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                      {accountInitial}
                    </div>
                  )}
                  <span className="max-w-[120px] truncate font-medium">
                    {accountName}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isAccountDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                    {managementPath && (
                      <button
                        onClick={handleNavigateToManagement}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Manage
                      </button>
                    )}
                    {managementPath && <hr className="my-1" />}
                    <Link
                      to="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex hover:scale-105 transition-transform duration-200"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex bg-transparent hover:scale-105 transition-transform duration-200"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-4 border-b border-amber-200">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Search Input */}
          <div
            className="max-w-sm w-full justify-self-start relative"
            ref={suggestRef}
          >
            <form onSubmit={handleSubmitSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggest && setShowSuggest(true)}
                  className="pl-10 pr-4 py-2 w-full bg-white/80 border-gray-200 rounded-full focus:bg-white focus:border-amber-300 focus:ring-amber-200 text-sm"
                />
              </div>
            </form>

            {/* Suggest Panel */}
            {showSuggest && suggest && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  {/* Categories */}
                  {suggest.categories?.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-xs uppercase text-gray-400 mb-2">
                        Categories
                      </div>
                      <ul className="space-y-1">
                        {suggest.categories.slice(0, 5).map((c) => (
                          <li key={`c-${c.id}`}>
                            <Link
                              to={`/products?category=${encodeURIComponent(
                                c.slug
                              )}`}
                              className="block px-2 py-1 rounded hover:bg-amber-50"
                              onClick={() => setShowSuggest(false)}
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Products */}
                  {suggest.products?.length > 0 && (
                    <div className="p-3">
                      <div className="text-xs uppercase text-gray-400 mb-2">
                        Products
                      </div>
                      <ul className="space-y-2">
                        {suggest.products.slice(0, 6).map((p) => (
                          <li key={`p-${p.id}`}>
                            <Link
                              // Tuỳ routing chi tiết SP; fallback dùng search
                              to={`/products/all?search=${encodeURIComponent(
                                p.name
                              )}`}
                              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-amber-50"
                              onClick={() => setShowSuggest(false)}
                            >
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded" />
                              )}
                              <div className="text-gray-700 text-sm">
                                {p.name}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* No result */}
                  {!suggest.categories?.length && !suggest.products?.length && (
                    <div className="p-4 text-sm text-gray-500">No results</div>
                  )}
                </div>
                <div className="border-t border-gray-100">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      navigate(
                        `/products?search=${encodeURIComponent(
                          searchQuery.trim()
                        )}`
                      );
                      setShowSuggest(false);
                    }}
                  >
                    Search for “{searchQuery.trim()}”
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logo */}
          <Link to="/" className="justify-self-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-700 tracking-widest">
                  FASHION STORE
                </div>
              </div>
            </div>
          </Link>

          {/* Icons */}
          <div className="flex items-center gap-4 justify-self-end">
            <div className="relative">
              <Link to="/wishlist">
                <Heart className="w-5 h-5 text-gray-600 hover:text-amber-600 cursor-pointer transition-colors" />
              </Link>
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {wishlistCount}
              </span>
            </div>
            <div className="relative">
              <Link to="/cart">
                <ShoppingBag className="w-5 h-5 text-gray-600 hover:text-amber-600 cursor-pointer transition-colors" />
              </Link>
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                {cartQty}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 relative">
        <div className="max-w-7xl mx-auto">
          <ul className="flex items-center justify-center gap-8 text-sm font-medium text-gray-600">
            <li>
              <Link to="/" className="hover:text-gray-900 py-4">
                HOME
              </Link>
            </li>
            <li>
              <Link to="/products/new" className="hover:text-gray-900 py-4">
                NEW ARRIVALS
              </Link>
            </li>
            <li>
              <Link
                to="/products?sale=true"
                className="hover:text-gray-900 py-4"
              >
                SALE
              </Link>
            </li>

            {/* MEN */}
            <li className="relative group">
              <Link
                to="/products?category=men"
                className="hover:text-gray-900 py-4 flex items-center gap-1"
              >
                MEN
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <div className="p-6">
                  {loadingTrees && !menTree ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {(menTiles.length ? menTiles : []).map(
                            (item, idx) => (
                              <Link
                                key={`men-${idx}-${item.slug}`}
                                to={`/products?category=${encodeURIComponent(
                                  item.slug
                                )}`}
                                className="group/item flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200 border border-transparent hover:border-amber-200"
                              >
                                <span className="text-gray-700 group-hover/item:text-amber-700 font-medium text-sm">
                                  {item.name}
                                </span>
                              </Link>
                            )
                          )}
                          {!menTiles.length && (
                            <div className="text-sm text-gray-500">
                              No categories
                            </div>
                          )}
                        </div>
                      </div>
                      {/* <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            to="/products?gender=men&featured=true"
                            className="group/cta flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Crown className="w-4 h-4" />
                            <span className="font-semibold text-sm">
                              View All
                            </span>
                          </Link>
                          <Link
                            to="/products?gender=men&sale=true"
                            className="group/cta flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Zap className="w-4 h-4" />
                            <span className="font-semibold text-sm">Sale</span>
                          </Link>
                        </div>
                      </div> */}
                    </>
                  )}
                </div>
              </div>
            </li>

            {/* WOMEN */}
            <li className="relative group">
              <Link
                to="/products?category=women"
                className="hover:text-gray-900 py-4 flex items-center gap-1"
              >
                WOMEN
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                <div className="p-6">
                  {loadingTrees && !womenTree ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {(womenTiles.length ? womenTiles : []).map(
                            (item, idx) => (
                              <Link
                                key={`women-${idx}-${item.slug}`}
                                to={`/products?category=${encodeURIComponent(
                                  item.slug
                                )}`}
                                className="group/item flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-rose-200"
                              >
                                <span className="text-gray-700 group-hover/item:text-rose-700 font-medium text-sm">
                                  {item.name}
                                </span>
                              </Link>
                            )
                          )}
                          {!womenTiles.length && (
                            <div className="text-sm text-gray-500">
                              No categories
                            </div>
                          )}
                        </div>
                      </div>
                      {/* <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            to="/products?gender=women&featured=true"
                            className="group/cta flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-rose-600 to-pink-500 text-white rounded-xl hover:from-rose-700 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Crown className="w-4 h-4" />
                            <span className="font-semibold text-sm">
                              View All
                            </span>
                          </Link>
                          <Link
                            to="/products?gender=women&sale=true"
                            className="group/cta flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Zap className="w-4 h-4" />
                            <span className="font-semibold text-sm">Sale</span>
                          </Link>
                        </div>
                      </div> */}
                    </>
                  )}
                </div>
              </div>
            </li>

            <li>
              <Link to="/about" className="hover:text-gray-900">
                ABOUT US
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
