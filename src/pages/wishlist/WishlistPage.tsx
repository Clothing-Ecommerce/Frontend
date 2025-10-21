import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useWishlistCount } from "@/hooks/useWishlistCount";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/axios";
import type { WishlistItem, WishlistItemsResponse } from "@/types/wishlistType";
import { Heart, Loader2, Package, ShoppingBag, Trash2 } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

function formatAddedDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { count: wishlistCount, setWishlistCount, refreshWishlistCount } = useWishlistCount();
  const { toasts, toast, removeToast } = useToast();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WishlistItemsResponse>("/wishlist");
      const nextItems = Array.isArray(res.data.items) ? res.data.items : [];
      setItems(nextItems);
      setWishlistCount(nextItems.length);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message =
          typeof err.response?.data?.message === "string"
            ? err.response?.data?.message
            : "Không thể tải wishlist.";
        if (status === 401) {
          setError("Bạn cần đăng nhập để xem wishlist của mình.");
        } else {
          setError(message);
        }
      } else {
        setError("Không thể tải wishlist.");
      }
      setItems([]);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  }, [setWishlistCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setWishlistCount(0);
      setLoading(false);
      return;
    }
    void fetchWishlist();
  }, [fetchWishlist, isAuthenticated, setWishlistCount]);

  const handleRemove = useCallback(
    async (productId: number) => {
      try {
        await api.delete(`/wishlist/${productId}`);
        setItems((prev) => {
          const next = prev.filter((item) => item.productId !== productId);
          setWishlistCount(next.length);
          return next;
        });
        toast.success("Đã xoá khỏi wishlist", "Sản phẩm đã được xoá khỏi danh sách yêu thích của bạn.");
        void refreshWishlistCount();
      } catch (err) {
        console.error("Failed to remove wishlist item", err);
        let message = "Không thể xoá sản phẩm khỏi wishlist.";
        if (axios.isAxiosError(err)) {
          message =
            typeof err.response?.data?.message === "string"
              ? err.response.data.message
              : message;
        }
        toast.error("Thao tác không thành công", message);
      }
    },
    [refreshWishlistCount, setWishlistCount, toast]
  );

  const hasItems = items.length > 0;

  const introSubtitle = useMemo(() => {
    if (!isAuthenticated) {
      return "Đăng nhập để xem và quản lý các sản phẩm yêu thích của bạn.";
    }
    if (!hasItems) {
      return "Danh sách yêu thích của bạn đang trống. Hãy khám phá và thêm những sản phẩm bạn yêu thích!";
    }
    return `Bạn có ${wishlistCount} sản phẩm trong danh sách yêu thích.`;
  }, [hasItems, isAuthenticated, wishlistCount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-3">
                <Heart className="w-8 h-8 text-amber-500" fill="currentColor" />
                Wishlist của bạn
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">{introSubtitle}</p>
            </div>
            {hasItems && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate("/products/all")}
              >
                <ShoppingBag className="w-4 h-4" />
                Tiếp tục mua sắm
              </Button>
            )}
          </div>
        </section>

        {!isAuthenticated ? (
          <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-10 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <Heart className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-2xl font-semibold text-gray-900">Bạn chưa đăng nhập</h2>
              <p className="text-gray-600">
                Hãy đăng nhập để lưu lại những sản phẩm bạn yêu thích và truy cập chúng bất cứ lúc nào.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/auth/login")}>Đăng nhập</Button>
                <Button variant="outline" onClick={() => navigate("/auth/register")}>
                  Đăng ký tài khoản
                </Button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-amber-500" />
            <p>Đang tải danh sách yêu thích của bạn...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
            <p>{error}</p>
          </div>
        ) : !hasItems ? (
          <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-10 text-center">
            <Package className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">Wishlist trống</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Khám phá cửa hàng của chúng tôi và lưu lại những sản phẩm bạn
              muốn theo dõi.
            </p>
            <Button className="mt-6" onClick={() => navigate("/products/all")}>
              <ShoppingBag className="w-4 h-4" />
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const { product } = item;
              const hasDiscount =
                product.effectivePrice > 0 &&
                product.basePrice > 0 &&
                product.effectivePrice < product.basePrice;
              const displayPrice =
                product.effectivePrice > 0 ? product.effectivePrice : product.basePrice;
              const addedDate = formatAddedDate(item.addedAt);

              return (
                <ProductCard
                  key={item.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    brandName: product.brand?.name,
                    price: displayPrice,
                    originalPrice: hasDiscount ? product.basePrice : null,
                    imageUrl: product.image?.url,
                    imageAlt: product.image?.alt ?? product.name,
                    inStock: product.inStock,
                  }}
                  onCardClick={() => navigate(`/products/${product.id}`)}
                  imageClassName="mx-6 mt-0 rounded-xl"
                  contentClassName="mt-4 space-y-3 pt-0 pb-4"
                  overlays={{
                    topRight: (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleRemove(product.id);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm ring-1 ring-black/5 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Xoá khỏi wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ),
                    topLeft: !product.inStock ? (
                      <span className="rounded-full bg-gray-900/80 px-3 py-1 text-xs font-medium text-white">
                        Tạm hết hàng
                      </span>
                    ) : undefined,
                    bottomLeft: addedDate ? (
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-600">
                        Đã thêm: {addedDate}
                      </span>
                    ) : undefined,
                  }}
                />
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <ToastContainer
        toasts={toasts.map((item) => ({ ...item, onClose: removeToast }))}
        onClose={removeToast}
      />
    </div>
  );
}